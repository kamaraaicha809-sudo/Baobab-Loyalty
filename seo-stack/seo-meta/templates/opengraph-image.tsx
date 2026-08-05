// app/opengraph-image.tsx — Génération dynamique de l'image OG (1200×630)
// Next.js détecte ce fichier automatiquement et l'utilise comme og:image par défaut.
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Baobab Loyalty — Programme de fidélité B2B";
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
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0F4C3A 0%, #1A7A5C 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 32, opacity: 0.85, marginBottom: 24 }}>
          baobabloyalty.com
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>
          Le programme de fidélité B2B simple et puissant
        </div>
        <div style={{ fontSize: 32, opacity: 0.9, marginTop: 32, maxWidth: 900 }}>
          +250 enseignes nous font confiance · Lancement en 7 jours
        </div>
      </div>
    ),
    { ...size }
  );
}

// Variante par page : créer `app/blog/[slug]/opengraph-image.tsx` avec la même structure
// pour générer une image OG personnalisée par article.
