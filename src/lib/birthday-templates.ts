/**
 * Textes des 3 templates d'anniversaire (V1) — miroir frontend de
 * supabase/functions/_shared/birthday-templates.ts. Duplique volontairement
 * le contenu : pas d'import cross-runtime possible entre Next.js et une
 * Edge Function Deno (même convention que consent-policy.ts). Garder les
 * deux fichiers synchronisés si les textes changent.
 */

export type BirthdayTemplateKey = "chaleureux" | "court" | "fidelisation";

export interface BirthdayTemplate {
  key: BirthdayTemplateKey;
  name: string;
  message: string;
}

export const BIRTHDAY_TEMPLATES: BirthdayTemplate[] = [
  {
    key: "chaleureux",
    name: "Chaleureux et élégant",
    message:
      "🎂 Bonjour {{prenom}} !\n\nToute l'équipe de {{hotel}} vous souhaite un très joyeux anniversaire ! 🥳\n\nNous vous souhaitons beaucoup de bonheur et une magnifique journée. Au plaisir de vous revoir très bientôt chez nous. ❤️",
  },
  {
    key: "court",
    name: "Court et convivial",
    message:
      "🎉 Joyeux anniversaire {{prenom}} !\n\nToute l'équipe de {{hotel}} pense à vous en ce jour spécial. 🎂✨\n\nNous vous souhaitons une excellente journée et espérons vous accueillir à nouveau très bientôt !\n\nÀ très bientôt chez {{hotel}} ❤️",
  },
  {
    key: "fidelisation",
    name: "Orienté fidélisation",
    message:
      "🎂 Joyeux anniversaire {{prenom}} ! 🥳\n\nEn cette journée spéciale, toute l'équipe de {{hotel}} vous adresse ses meilleurs vœux.\n\nNous serions ravis de vous retrouver prochainement pour un nouveau moment parmi nous. ❤️\n\nÀ bientôt chez {{hotel}} !",
  },
];

export function renderBirthdayMessage(key: string, prenom: string, hotel: string): string {
  const template = BIRTHDAY_TEMPLATES.find((t) => t.key === key) ?? BIRTHDAY_TEMPLATES[0];
  return template.message.replaceAll("{{prenom}}", prenom).replaceAll("{{hotel}}", hotel);
}
