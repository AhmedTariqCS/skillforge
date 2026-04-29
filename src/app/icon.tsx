import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="ico-grad" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path d="M6 4 L26 4 L26 14 L18 14 L18 28 L6 28 Z" fill="url(#ico-grad)" />
          <path
            d="M22 18 L26 18 L26 28 L22 28 Z"
            fill="url(#ico-grad)"
            opacity="0.6"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
