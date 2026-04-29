"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix?: string;
  label: string;
  detail: string;
}

const STATS: Stat[] = [
  {
    value: 19,
    label: "Source documents",
    detail: "ingested across 4 platforms",
  },
  {
    value: 18,
    label: "Structured facts",
    detail: "with provenance and confidence",
  },
  {
    value: 7,
    label: "Executable skills",
    detail: "in Claude Agent Skills format",
  },
  {
    value: 5,
    suffix: " days",
    label: "From idea to live demo",
    detail: "built solo, end to end",
  },
];

export function StatsBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border bg-border"
    >
      {STATS.map((s, i) => (
        <Stat key={s.label} stat={s} active={active} delay={i * 120} />
      ))}
    </div>
  );
}

function Stat({
  stat,
  active,
  delay,
}: {
  stat: Stat;
  active: boolean;
  delay: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const duration = 1000;
    const startTimer = setTimeout(() => {
      let raf = 0;
      const tick = (now: number) => {
        const elapsed = now - start - delay;
        if (elapsed < 0) {
          raf = requestAnimationFrame(tick);
          return;
        }
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setN(Math.round(stat.value * eased));
        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setN(stat.value);
        }
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(startTimer);
  }, [active, delay, stat.value]);

  return (
    <div className="bg-background p-6 md:p-7 flex flex-col">
      <p className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {n}
        {stat.suffix && <span className="text-muted-foreground">{stat.suffix}</span>}
      </p>
      <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-snug">
        {stat.detail}
      </p>
    </div>
  );
}
