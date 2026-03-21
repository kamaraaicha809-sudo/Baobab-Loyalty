import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Baobab Loyalty — Remplissez vos chambres vides avec l'IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a1a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "#2C2C2C",
            border: "2px solid #EBC161",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <span style={{ color: "#EBC161", fontSize: 44, fontWeight: 700 }}>B</span>
        </div>

        {/* Title */}
        <h1
          style={{
            color: "#EBC161",
            fontSize: 56,
            fontWeight: 700,
            textAlign: "center",
            margin: 0,
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          Baobab Loyalty
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: "#ffffff",
            fontSize: 26,
            textAlign: "center",
            margin: 0,
            marginBottom: 40,
            opacity: 0.85,
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Remplissez vos chambres vides grâce à l&apos;IA et WhatsApp en 2 minutes
        </p>

        {/* Tags */}
        <div style={{ display: "flex", gap: 16 }}>
          {["IA", "WhatsApp", "FCFA"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "#252525",
                border: "1px solid #EBC161",
                borderRadius: 8,
                padding: "8px 20px",
                color: "#EBC161",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
