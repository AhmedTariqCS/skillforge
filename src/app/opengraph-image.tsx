import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Skillforge — The company brain for AI agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#fafafa",
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(74, 222, 128, 0.18), transparent), linear-gradient(to right, rgba(64, 64, 64, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(64, 64, 64, 0.4) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 64px 64px, 64px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "auto",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="og-grad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path d="M6 4 L26 4 L26 14 L18 14 L18 28 L6 28 Z" fill="url(#og-grad)" />
            <path
              d="M22 18 L26 18 L26 28 L22 28 Z"
              fill="url(#og-grad)"
              opacity="0.6"
            />
          </svg>
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Skillforge
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: "#86efac",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            The company brain for AI agents
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: "1000px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ color: "#fafafa" }}>Your agents got smart.</span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, #a7f3d0, #10b981, #34d399)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Your company didn&apos;t.
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              maxWidth: "1000px",
              lineHeight: 1.4,
              marginTop: "12px",
            }}
          >
            We compile scattered company knowledge into executable skills your
            AI agents can actually run.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "48px",
            color: "#71717a",
            fontSize: 22,
          }}
        >
          <span style={{ color: "#10b981", fontWeight: 600 }}>
            Y Combinator S26
          </span>
          <span>·</span>
          <span>skforge.dev</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
