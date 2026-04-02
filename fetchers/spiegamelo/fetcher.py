#!/usr/bin/env python3

"""
Fetcher that reads approved content from the Spiegamelo Facile content engine DB.
Read-only: never writes to the source database.

Contract:
- Create a project folder under `projects/<project_id>`
- Write:
  - `generation.json`
  - `input/article.json`
- Print a line with: `Created project: <project_id>`
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sqlite3
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

DB_PATH = "/root/youtube-to-gumroad/data/content_engine.db"
PEXELS_API_KEY = "ClZVFW2SZjwg6LgB6GEOiIDgoanvOS4EqDQfU5tRGrr0fm4W9LnUc6Kf"


class FetcherError(Exception):
    pass


def fetch_pexels_images(query: str, count: int = 6, orientation: str = "portrait") -> list[dict]:
    """Fetch images from Pexels API for video backgrounds."""
    # Use only ASCII-safe query terms for Pexels
    q_ascii = re.sub(r"[^a-zA-Z0-9\s]", "", query).strip()
    if not q_ascii:
        q_ascii = "business workspace"
    q_encoded = quote(q_ascii[:80])
    url = (
        f"https://api.pexels.com/v1/search?query={q_encoded}"
        f"&per_page={count}&orientation={orientation}&size=large"
    )
    req = urllib.request.Request(url, headers={
        "Authorization": PEXELS_API_KEY,
        "User-Agent": "VideofyMinimal/1.0",
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        photos = data.get("photos", [])
        return [
            {
                "url": p["src"].get("large2x") or p["src"]["large"],
                "width": p["width"],
                "height": p["height"],
                "caption": p.get("alt", query),
                "credit": f"Photo by {p.get('photographer', 'Unknown')} on Pexels",
            }
            for p in photos
        ]
    except Exception as e:
        print(f"[warn] Pexels search failed for '{query}': {e}", file=sys.stderr)
        return []


def extract_image_queries(title: str, text: str) -> list[str]:
    """Extract search queries from content for finding relevant images."""
    queries = []
    # Use a generic business query based on title keywords (English for Pexels)
    queries.append("business professional workspace")

    # Extract key concepts from text (first 500 chars)
    snippet = text[:500]
    concept_patterns = [
        r"(?:abbonament|subscription|tool|strument)",
        r"(?:fattur|revenue|reddito|income|guadagn)",
        r"(?:freelanc|imprendit|business|lavoro)",
        r"(?:cost|spesa|prezzo|budget)",
        r"(?:tecnolog|digital|computer|software)",
    ]
    for pattern in concept_patterns:
        if re.search(pattern, snippet, re.IGNORECASE):
            # Map Italian concepts to English search terms (Pexels works better in English)
            concept_map = {
                "abbonament": "subscription services laptop",
                "subscription": "subscription services laptop",
                "tool": "digital tools workspace",
                "strument": "digital tools workspace",
                "fattur": "business finance calculator",
                "revenue": "business revenue growth",
                "reddito": "income money calculator",
                "income": "income money calculator",
                "guadagn": "earnings profit business",
                "freelanc": "freelancer working laptop",
                "imprendit": "entrepreneur startup office",
                "business": "business professional",
                "lavoro": "working professional desk",
                "cost": "costs expenses budget",
                "spesa": "expenses budget planning",
                "prezzo": "pricing money",
                "budget": "budget planning calculator",
                "tecnolog": "technology modern workspace",
                "digital": "digital technology screen",
                "computer": "computer workspace modern",
                "software": "software developer screen",
            }
            for key, search_term in concept_map.items():
                if re.search(key, snippet, re.IGNORECASE):
                    queries.append(search_term)
                    break

    # Deduplicate and limit
    seen = set()
    unique = []
    for q in queries:
        if q.lower() not in seen:
            seen.add(q.lower())
            unique.append(q)
    return unique[:4]


def _split_post_into_script_lines(text: str) -> list[str]:
    """Split a LinkedIn post into natural spoken segments for video voiceover.

    Groups short paragraphs together so each segment is roughly 4-6 seconds
    of speech (~20-30 words). Target: 8-12 segments for a 30-60s video.
    """
    # Split by double newline (paragraph breaks) and clean
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]

    # Remove separators, PS lines, and very short noise
    paragraphs = [
        p for p in paragraphs
        if p not in ("---", "—", "***", "___")
        and not p.startswith("PS:")
        and not p.startswith("PS ")
        and len(p) > 3
    ]

    # Group paragraphs into segments of ~20-30 words
    segments: list[str] = []
    current_segment: list[str] = []
    current_word_count = 0

    for para in paragraphs:
        # Clean internal line breaks
        para_clean = re.sub(r"\s+", " ", para).strip()
        para_words = len(para_clean.split())

        # If this paragraph alone is very long, it's its own segment
        if para_words >= 25:
            if current_segment:
                segments.append(" ".join(current_segment))
                current_segment = []
                current_word_count = 0
            segments.append(para_clean)
        else:
            current_segment.append(para_clean)
            current_word_count += para_words
            if current_word_count >= 20:
                segments.append(" ".join(current_segment))
                current_segment = []
                current_word_count = 0

    # Flush remaining
    if current_segment:
        segments.append(" ".join(current_segment))

    # Filter out empty segments
    segments = [s for s in segments if s and len(s.split()) >= 3]

    return segments


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sanitize_project_id(raw: str) -> str:
    candidate = re.sub(r"[^A-Za-z0-9._-]+", "-", raw).strip("-._")
    if not candidate:
        raise FetcherError("Could not derive a valid project id")
    if not candidate[0].isalnum():
        candidate = f"p-{candidate}"
    return candidate


def derive_project_id(idea_id: str, project_id: str | None) -> str:
    if project_id:
        return sanitize_project_id(project_id)
    return sanitize_project_id(f"spiegamelo-{idea_id}")


def create_project_layout(project_dir: Path, force: bool) -> None:
    if project_dir.exists() and any(project_dir.iterdir()):
        if not force:
            raise FetcherError(
                f"Project directory already exists and is non-empty: {project_dir}. "
                "Use --force to replace it."
            )
        shutil.rmtree(project_dir)

    for rel in ("input/images", "input/videos", "working/uploads", "working/audio", "output"):
        (project_dir / rel).mkdir(parents=True, exist_ok=True)


def build_generation_manifest(project_id: str) -> dict[str, object]:
    now = utc_now_iso()
    return {
        "projectId": project_id,
        "brandId": "spiegamelo",
        "promptPack": "spiegamelo",
        "voicePack": "spiegamelo",
        "options": {
            "orientationDefault": "vertical",
            "segmentPauseSeconds": 0.3,
        },
        "createdAt": now,
        "updatedAt": now,
    }


def fetch_idea(idea_id: str) -> dict[str, object]:
    """Read an idea and its publication content from the DB (read-only)."""
    if not Path(DB_PATH).exists():
        raise FetcherError(f"Database not found: {DB_PATH}")

    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT i.id, i.title, i.title_it, i.description, i.source_url,
               i.extracted_content, i.score, i.score_factors, i.angle, i.why,
               i.engine, i.status
        FROM ideas i
        WHERE i.id = ?
        """,
        (idea_id,),
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise FetcherError(f"Idea {idea_id} not found in database")

    # Get publication content if available
    # Prefer X/Twitter content (shorter, better for Reels), fall back to LinkedIn
    cursor.execute(
        """
        SELECT content, platform
        FROM publications
        WHERE idea_id = ? AND platform = 'x' AND content IS NOT NULL AND content != ''
        LIMIT 1
        """,
        (idea_id,),
    )
    pub_row = cursor.fetchone()
    if not pub_row:
        # Fall back to LinkedIn if no X content
        cursor.execute(
            """
            SELECT content, platform
            FROM publications
            WHERE idea_id = ? AND platform = 'linkedin' AND content IS NOT NULL AND content != ''
            LIMIT 1
            """,
            (idea_id,),
        )
        pub_row = cursor.fetchone()
    if not pub_row:
        # Last resort: longest content from any platform
        cursor.execute(
            """
            SELECT content, platform
            FROM publications
            WHERE idea_id = ? AND content IS NOT NULL AND content != ''
            ORDER BY LENGTH(content) DESC
            LIMIT 1
            """,
            (idea_id,),
        )
        pub_row = cursor.fetchone()
    conn.close()

    title = row["title_it"] or row["title"] or "Untitled"
    # Prefer Italian publication content over English extracted_content
    summary = ""
    if pub_row:
        summary = pub_row["content"] or ""
    body = summary or row["extracted_content"] or row["description"] or ""

    score_factors = {}
    if row["score_factors"]:
        try:
            score_factors = json.loads(row["score_factors"])
        except json.JSONDecodeError:
            pass

    # Split post first to know how many images we need
    script_lines_preview = _split_post_into_script_lines(body) if body else []
    needed_images = max(len(script_lines_preview), 6)

    # Fetch background images from Pexels
    image_queries = extract_image_queries(title, body or summary or title)
    all_images = []
    for query in image_queries:
        imgs = fetch_pexels_images(query, count=5, orientation="portrait")
        all_images.extend(imgs)
    # Deduplicate by URL and limit to needed count
    seen_urls: set[str] = set()
    unique_images = []
    for img in all_images:
        if img["url"] not in seen_urls:
            seen_urls.add(img["url"])
            unique_images.append(img)
        if len(unique_images) >= needed_images:
            break

    # Split the Italian post into script lines for direct voiceover
    # Group short paragraphs into natural spoken segments (5-8s each)
    script_lines = _split_post_into_script_lines(body) if body else None

    return {
        "title": title,
        "byline": "Spiegamelo Facile",
        "pubdate": utc_now_iso(),
        "text": body if body else title,
        "summary": summary,
        "script_lines": script_lines,
        "images": unique_images,
        "videos": [],
        "metadata": {
            "idea_id": row["id"],
            "score": row["score"],
            "engine": row["engine"],
            "status": row["status"],
            "angle": row["angle"],
            "why": row["why"],
            "tool_name": score_factors.get("tool_name", ""),
            "source_url": row["source_url"] or "",
        },
    }


def import_idea(
    idea_id: str, project_id: str | None, projects_root: Path, force: bool
) -> Path:
    canonical_project_id = derive_project_id(idea_id, project_id)
    project_dir = (projects_root / canonical_project_id).resolve()
    if not str(project_dir).startswith(str(projects_root.resolve())):
        raise FetcherError(f"Unsafe project path resolved: {project_dir}")

    idea_data = fetch_idea(idea_id)

    create_project_layout(project_dir, force=force)

    # Download images to input/images/
    downloaded_images = []
    images_dir = project_dir / "input" / "images"
    for i, img in enumerate(idea_data["images"]):
        img_filename = f"pexels_{i + 1}.jpg"
        img_path = images_dir / img_filename
        try:
            req = urllib.request.Request(img["url"], headers={"User-Agent": "VideofyMinimal/1.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                img_path.write_bytes(resp.read())
            downloaded_images.append({
                "path": f"input/images/{img_filename}",
                "byline": img.get("credit", "Pexels"),
            })
            print(f"  Downloaded image {i + 1}: {img_filename}")
        except Exception as e:
            print(f"  [warn] Failed to download image {i + 1}: {e}", file=sys.stderr)

    # article.json follows the Videofy contract
    article_payload: dict[str, object] = {
        "title": idea_data["title"],
        "byline": idea_data["byline"],
        "pubdate": idea_data["pubdate"],
        "text": idea_data["text"],
        "images": downloaded_images,
        "videos": idea_data["videos"],
    }
    if idea_data.get("script_lines"):
        article_payload["script_lines"] = idea_data["script_lines"]

    (project_dir / "generation.json").write_text(
        json.dumps(build_generation_manifest(canonical_project_id), indent=2, ensure_ascii=False)
        + "\n",
        encoding="utf-8",
    )
    (project_dir / "input" / "article.json").write_text(
        json.dumps(article_payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    # Save extra metadata for reference (not part of Videofy contract)
    (project_dir / "working" / "spiegamelo_metadata.json").write_text(
        json.dumps(idea_data["metadata"], indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(f"Created project: {canonical_project_id}")
    print(f"Path: {project_dir}")
    print(f"Idea: {idea_data['title']}")
    print(f"Score: {idea_data['metadata']['score']}")
    return project_dir


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch content from Spiegamelo Facile content engine"
    )
    parser.add_argument("idea_id", help="Idea ID from the content engine database")
    parser.add_argument("--project-id", dest="project_id", default=None)
    parser.add_argument("--projects-root", dest="projects_root", default="projects")
    parser.add_argument("--force", action="store_true")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    try:
        import_idea(
            idea_id=args.idea_id,
            project_id=args.project_id,
            projects_root=Path(args.projects_root),
            force=args.force,
        )
    except FetcherError as exc:
        print(f"[error] {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
