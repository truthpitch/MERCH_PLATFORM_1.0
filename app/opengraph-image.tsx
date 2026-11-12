import { ImageResponse } from "next/og";

export const alt = "TruthPitch — Say it straight.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B2545",
          color: "#FFFFFF",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 6, color: "#D9C3A5", textTransform: "uppercase" }}>
          <span>Say it straight</span>
          <span>truthpitch.com</span>
        </div>
        <div style={{ display: "flex", fontSize: 200, fontWeight: 800, letterSpacing: -12, lineHeight: 1 }}>
          <span>Truth</span>
          <span style={{ color: "#D9C3A5" }}>Pitch</span>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "rgba(255,255,255,0.8)" }}>Heavyweight goods for people who mean what they say.</div>
      </div>
    ),
    size,
  );
}
