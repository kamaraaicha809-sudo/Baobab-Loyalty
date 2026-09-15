import { readFileSync } from "node:fs";
import path from "node:path";
import config from "@/config";

// Favicon dynamique : app/icon.png (statique) ne peut pas etre conditionnel
// par region. Afrique lit le fichier historique (deplace tel quel dans
// public/brand/baobab-icon-128.png, contenu inchange) ; Europe lit
// l'embleme Loyavia officiel (public/brand/loyavia-icon-128.png).
export const size = { width: 128, height: 128 };
export const contentType = "image/png";

export default function Icon() {
  const file = config.region === "europe" ? "loyavia-icon-128.png" : "baobab-icon-128.png";
  const data = readFileSync(path.join(process.cwd(), "public", "brand", file));
  return new Response(new Uint8Array(data), {
    headers: { "Content-Type": "image/png" },
  });
}
