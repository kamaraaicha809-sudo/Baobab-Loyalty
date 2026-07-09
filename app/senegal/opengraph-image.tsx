import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Baobab Loyalty — Fidélisation hôtelière au Sénégal";
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(235,193,97,0.12)",
            border: "1px solid rgba(235,193,97,0.4)",
            borderRadius: "100px",
            padding: "8px 24px",
            marginBottom: "28px",
          }}
        >
          <span style={{ color: "#EBC161", fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>
            BAOBAB LOYALTY · SÉNÉGAL
          </span>
        </div>

        <h1
          style={{
            color: "#ffffff",
            fontSize: 54,
            fontWeight: 700,
            textAlign: "center",
            margin: "0 0 20px 0",
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          Fidélisez vos clients hôtel à{" "}
          <span style={{ color: "#EBC161" }}>Dakar</span>
          {" "}via WhatsApp
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 20,
            textAlign: "center",
            margin: "0 0 44px 0",
            maxWidth: 640,
            lineHeight: 1.5,
          }}
        >
          Segmentation automatique · Campagnes ciblées · À partir de{" "}
          <span style={{ color: "rgba(255,255,255,0.9)" }}>39 000 FCFA/mois</span>
        </p>

        <div style={{ display: "flex", gap: 16 }}>
          {[
            { value: "90%+", label: "taux d'ouverture WhatsApp" },
            { value: "3×", label: "réservations directes" },
            { value: "10 min", label: "1ère campagne" },
          ].map((stat) => (
            <div
              key={stat.value}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "14px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ color: "#EBC161", fontSize: 26, fontWeight: 700 }}>{stat.value}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 30,
            right: 56,
            color: "rgba(255,255,255,0.2)",
            fontSize: 14,
          }}
        >
          baobabloyalty.com/senegal
        </div>
      </div>
    ),
    { ...size }
  );
}
