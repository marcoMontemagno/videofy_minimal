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
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = "/root/youtube-to-gumroad/data/content_engine.db"


class FetcherError(Exception):
    pass


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
    cursor.execute(
        """
        SELECT content, platform
        FROM publications
        WHERE idea_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (idea_id,),
    )
    pub_row = cursor.fetchone()
    conn.close()

    title = row["title_it"] or row["title"] or "Untitled"
    body = row["extracted_content"] or row["description"] or ""
    summary = ""
    if pub_row:
        summary = pub_row["content"] or ""

    score_factors = {}
    if row["score_factors"]:
        try:
            score_factors = json.loads(row["score_factors"])
        except json.JSONDecodeError:
            pass

    return {
        "title": title,
        "byline": "Spiegamelo Facile",
        "pubdate": utc_now_iso(),
        "text": body if body else title,
        "summary": summary,
        "images": [],
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

    # article.json follows the Videofy contract
    article_payload = {
        "title": idea_data["title"],
        "byline": idea_data["byline"],
        "pubdate": idea_data["pubdate"],
        "text": idea_data["text"],
        "images": idea_data["images"],
        "videos": idea_data["videos"],
    }

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
