import { ImageResponse } from "next/og";
import config from "@/config";

export const runtime = "edge";

const isEurope = config.region === "europe";

export const alt = isEurope
  ? `${config.appName} — Fidélisation client hôtel via WhatsApp`
  : `${config.appName} — Fidélisation client hôtel via WhatsApp en Afrique de l'Ouest`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f1f1c 0%, #1a3028 60%, #0f1f1c 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#EBC161",
          }}
        />

        {/* Brand pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(235,193,97,0.12)",
            border: "1px solid rgba(235,193,97,0.4)",
            borderRadius: "100px",
            padding: "8px 24px",
            marginBottom: "36px",
          }}
        >
          <span style={{ color: "#EBC161", fontWeight: 700, fontSize: 17, letterSpacing: 1 }}>
            {config.appName.toUpperCase()}
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            color: "#ffffff",
            fontSize: 56,
            fontWeight: 700,
            textAlign: "center",
            margin: "0 0 20px 0",
            lineHeight: 1.15,
            maxWidth: 880,
          }}
        >
          Fidélisez vos clients hôtel{" "}
          <span style={{ color: "#EBC161" }}>via WhatsApp</span>
        </h1>

        {/* Subline */}
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 21,
            textAlign: "center",
            margin: "0 0 44px 0",
            maxWidth: 660,
            lineHeight: 1.5,
          }}
        >
          {isEurope ? (
            "La solution IA pour remplir vos chambres vides"
          ) : (
            <>
              La solution IA pour remplir vos chambres vides en{" "}
              <span style={{ color: "rgba(255,255,255,0.9)" }}>
                Côte d&apos;Ivoire, Sénégal et Cameroun
              </span>
            </>
          )}
        </p>

        {/* Market tags — pas de liste de pays validee pour l'Europe */}
        {!isEurope && (
          <div style={{ display: "flex", gap: 12 }}>
            {["Côte d'Ivoire", "Sénégal", "Cameroun", "Ghana"].map((market) => (
              <div
                key={market}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  padding: "7px 16px",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 15,
                }}
              >
                {market}
              </div>
            ))}
          </div>
        )}

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            right: 56,
            color: "rgba(255,255,255,0.2)",
            fontSize: 14,
          }}
        >
          {config.domainName}
        </div>
      </div>
    ),
    { ...size }
  );
}
