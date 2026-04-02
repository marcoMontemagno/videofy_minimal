import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, Img, staticFile, interpolate, spring, Easing } from "remotion";
import type { FC } from "react";
import { IntroScene } from "./scenes/IntroScene";
import { StatsScene } from "./scenes/StatsScene";
import { ActivitiesScene } from "./scenes/ActivitiesScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { BlogScene } from "./scenes/BlogScene";
import { CostScene } from "./scenes/CostScene";
import { ProgressScene } from "./scenes/ProgressScene";
import { OutroScene } from "./scenes/OutroScene";

// 120 seconds @ 30fps = 3600 frames
// Scene timings (in frames at 30fps)
const SCENES = {
  intro: { from: 0, duration: 150 },          // 0-5s
  stats: { from: 150, duration: 240 },         // 5-13s
  activities: { from: 390, duration: 1110 },    // 13-50s
  dashboard: { from: 1500, duration: 450 },     // 50-65s
  blog: { from: 1950, duration: 300 },          // 65-75s
  cost: { from: 2250, duration: 600 },          // 75-95s
  progress: { from: 2850, duration: 450 },      // 95-110s
  outro: { from: 3300, duration: 300 },         // 110-120s
};

export const RECAP_DATA = {
  period: "12-27 Marzo 2026",
  totalCommits: 65,
  linesAdded: 57000,
  linesRemoved: 480000,
  activeDays: 15,
  projects: 6,
  estimatedHumanHours: 240,
  humanCostPerHour: 95,
  activities: [
    { icon: "🚀", title: "Content Engine v1", desc: "Sistema autonomo di creazione contenuti" },
    { icon: "🎨", title: "Dashboard Redesign", desc: "Tema indigo, sidebar gradiente, palette moderna" },
    { icon: "📸", title: "Instagram Carousel", desc: "Pipeline automatica generazione caroselli" },
    { icon: "🔄", title: "Postiz → Zernio", desc: "Migrazione completa publishing social" },
    { icon: "📝", title: "Blog con GEO", desc: "11 articoli SEO-ottimizzati, scheduling" },
    { icon: "📰", title: "Newsletter System", desc: "Template, branding, analytics integrati" },
    { icon: "🛡️", title: "Disaster Recovery", desc: "Backup, restore, bootstrap automatici" },
    { icon: "🔒", title: "Security Hardening", desc: "Audit completo, XSS fix, property tests" },
    { icon: "📅", title: "Calendar v3", desc: "Griglia oraria, drag & drop, anteprime" },
    { icon: "📚", title: "Style Bank AI", desc: "Integrazione libri Montemagno + 5 modelli editoriali" },
    { icon: "📊", title: "Analytics Redesign", desc: "Metriche real-time, costi API, revenue tracking" },
    { icon: "🔬", title: "Research Pipeline v2", desc: "54 moduli, quality gates, dedup, enrichment" },
  ],
};

export const RecapVideo: FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <Sequence from={SCENES.intro.from} durationInFrames={SCENES.intro.duration}>
        <IntroScene />
      </Sequence>
      <Sequence from={SCENES.stats.from} durationInFrames={SCENES.stats.duration}>
        <StatsScene />
      </Sequence>
      <Sequence from={SCENES.activities.from} durationInFrames={SCENES.activities.duration}>
        <ActivitiesScene />
      </Sequence>
      <Sequence from={SCENES.dashboard.from} durationInFrames={SCENES.dashboard.duration}>
        <DashboardScene />
      </Sequence>
      <Sequence from={SCENES.blog.from} durationInFrames={SCENES.blog.duration}>
        <BlogScene />
      </Sequence>
      <Sequence from={SCENES.cost.from} durationInFrames={SCENES.cost.duration}>
        <CostScene />
      </Sequence>
      <Sequence from={SCENES.progress.from} durationInFrames={SCENES.progress.duration}>
        <ProgressScene />
      </Sequence>
      <Sequence from={SCENES.outro.from} durationInFrames={SCENES.outro.duration}>
        <OutroScene />
      </Sequence>
      {/* Global ambient particles */}
      <AmbientParticles />
    </AbsoluteFill>
  );
};

const AmbientParticles: FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 137.5) % 100,
    y: ((i * 73.1) + frame * 0.02 * (i % 3 + 1)) % 110 - 5,
    size: 2 + (i % 3),
    opacity: 0.1 + (i % 5) * 0.04,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `rgba(255, 200, 0, ${p.opacity})`,
            filter: "blur(1px)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
