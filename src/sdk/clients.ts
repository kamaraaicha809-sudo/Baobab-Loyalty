/**
 * Base clients — import, segmentation 3/6/9 mois, tous
 */

import { createClient } from "@/libs/supabase/client";

export interface Client {
  id: string;
  profile_id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  derniere_visite: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SegmentCounts extends Record<string, number> {
  "3mois": number;
  "6mois": number;
  "9mois": number;
  tous: number;
}

/**
 * Compte les clients par segment (3, 6, 9 mois, tous)
 * basé sur derniere_visite par rapport à aujourd'hui
 */
export async function getSegmentCounts(profileId: string): Promise<SegmentCounts> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: clients, error } = await supabase
    .from("clients")
    .select("derniere_visite")
    .eq("profile_id", profileId);

  if (error) throw error;

  const counts: SegmentCounts = { "3mois": 0, "6mois": 0, "9mois": 0, tous: 0 };
  const all = (clients || []).length;
  counts.tous = all;

  const todayDate = new Date(today);

  (clients || []).forEach((c) => {
    const dv = new Date(c.derniere_visite + "T12:00:00");
    const diffMs = todayDate.getTime() - dv.getTime();
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

    if (diffMonths >= 9) counts["9mois"]++;
    if (diffMonths >= 6) counts["6mois"]++;
    if (diffMonths >= 3) counts["3mois"]++;
  });

  return counts;
}

/**
 * Récupère la liste des clients
 */
export async function getClients(profileId: string, limit = 1000): Promise<Client[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("profile_id", profileId)
    .order("derniere_visite", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Client[];
}

/**
 * Importe des clients depuis des lignes CSV parsées
 * Format attendu : nom, email, telephone, derniere_visite (YYYY-MM-DD)
 */
export async function importClients(
  profileId: string,
  rows: { nom: string; email?: string; telephone?: string; derniere_visite: string }[]
): Promise<{ inserted: number; errors: string[] }> {
  const supabase = createClient();
  const errors: string[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.nom?.trim() || !row.derniere_visite) {
      errors.push(`Ligne ${i + 2} : nom et dernière visite requis`);
      continue;
    }

    const { error } = await supabase.from("clients").insert({
      profile_id: profileId,
      nom: row.nom.trim(),
      email: row.email?.trim() || null,
      telephone: row.telephone?.trim() || null,
      derniere_visite: row.derniere_visite,
    });

    if (error) {
      errors.push(`Ligne ${i + 2} : ${error.message}`);
    } else {
      inserted++;
    }
  }

  return { inserted, errors };
}

/**
 * Parse une chaîne CSV en lignes avec colonnes nom, email, telephone, derniere_visite
 * Gère plusieurs formats de colonnes (nom/prénom, email, tél, date)
 */
export function parseClientsCSV(csvText: string): { nom: string; email?: string; telephone?: string; derniere_visite: string }[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
  const rows: { nom: string; email?: string; telephone?: string; derniere_visite: string }[] = [];

  const colNom = headers.findIndex((h) => /^(nom|name|client|prénom|prenom)$/i.test(h));
  const colEmail = headers.findIndex((h) => /^email$/i.test(h));
  const colTel = headers.findIndex((h) => /^(tel|telephone|phone|téléphone)$/i.test(h));
  const colDate = headers.findIndex((h) =>
    /^(derniere|dernière|date|visite|last|sejour|séjour)$/i.test(h)
  );

  const fallbackNom = colNom < 0 ? 0 : colNom;
  const fallbackDate = colDate < 0 ? headers.length - 1 : colDate;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/[,;]/).map((p) => p.trim());
    const nom = (colNom >= 0 ? parts[colNom] : parts[fallbackNom]) || "";
    const email = colEmail >= 0 ? parts[colEmail] : undefined;
    const telephone = colTel >= 0 ? parts[colTel] : undefined;
    const derniere_visite = (colDate >= 0 ? parts[colDate] : parts[fallbackDate]) || "";

    if (!nom) continue;

    const parsed = parseDate(derniere_visite);
    rows.push({
      nom,
      email: email || undefined,
      telephone: telephone || undefined,
      derniere_visite: parsed,
    });
  }

  return rows;
}

function parseDate(input: string): string {
  if (!input || !input.trim()) return new Date().toISOString().split("T")[0];
  const trimmed = input.trim();
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  const fr = trimmed.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (fr) {
    const year = fr[3].length === 2 ? 2000 + parseInt(fr[3], 10) : parseInt(fr[3], 10);
    const month = parseInt(fr[2], 10) - 1;
    const day = parseInt(fr[1], 10);
    const d2 = new Date(year, month, day);
    if (!isNaN(d2.getTime())) return d2.toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
}

export const clients = {
  getSegmentCounts,
  getClients,
  importClients,
  parseClientsCSV,
};
