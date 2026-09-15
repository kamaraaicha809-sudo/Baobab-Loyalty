import { readFileSync } from "node:fs";
import path from "node:path";
import config from "@/config";

// Icone Apple Touch dynamique : meme raisonnement que app/icon.tsx
// (app/apple-icon.png statique ne peut pas etre conditionnel par region).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const file = config.region === "europe" ? "loyavia-icon-180.png" : "baobab-icon-180.png";
  const data = readFileSync(path.join(process.cwd(), "public", "brand", file));
  return new Response(new Uint8Array(data), {
    headers: { "Content-Type": "image/png" },
  });
}
