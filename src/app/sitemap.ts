import type { MetadataRoute } from "next";
import { NORTHWIND_SKILLS } from "@/lib/seed/skills";
import { NORTHWIND_DOCS } from "@/lib/seed/northwind";

const BASE = "https://skforge.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, priority: 1 },
    { url: `${BASE}/demo`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/forge`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/skills`, lastModified: now, priority: 0.8 },
    { url: `${BASE}/sources`, lastModified: now, priority: 0.7 },
    { url: `${BASE}/manifesto`, lastModified: now, priority: 0.7 },
    { url: `${BASE}/pricing`, lastModified: now, priority: 0.7 },
    { url: `${BASE}/about`, lastModified: now, priority: 0.7 },
  ];
  const skillEntries: MetadataRoute.Sitemap = NORTHWIND_SKILLS.map((s) => ({
    url: `${BASE}/skills/${s.name}`,
    lastModified: new Date(s.lastUpdatedAt),
    priority: 0.6,
  }));
  const sourceEntries: MetadataRoute.Sitemap = NORTHWIND_DOCS.map((d) => ({
    url: `${BASE}/sources/${d.id}`,
    lastModified: new Date(d.updatedAt),
    priority: 0.5,
  }));
  return [...staticEntries, ...skillEntries, ...sourceEntries];
}
