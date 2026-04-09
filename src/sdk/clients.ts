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
  whatsapp: string | null; // Numéro WhatsApp dédié (ex. +221...)
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

  const { data, error: rpcError } = await supabase.rpc("get_segment_counts", {
    p_profile_id: profileId,
  });
  if (rpcError) throw rpcError;
  return (data ?? { "3mois": 0, "6mois": 0, "9mois": 0, tous: 0 }) as SegmentCounts;
}

/**
 * Récupère la liste des clients
 */
export async function getClients(profileId: string, limit = 1000): Promise<Client[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("id, profile_id, nom, email, telephone, whatsapp, derniere_visite, notes, created_at, updated_at")
    .eq("profile_id", profileId)
    .order("derniere_visite", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Client[];
}

/**
 * Importe des clients depuis des lignes CSV parsées
 * Format attendu : nom, email, telephone, whatsapp?, derniere_visite (YYYY-MM-DD)
 * Bulk insert optimisé (batch de 100)
 */
export async function importClients(
  profileId: string,
  rows: { nom: string; email?: string; telephone?: string; whatsapp?: string; derniere_visite: string }[]
): Promise<{ inserted: number; errors: string[] }> {
  const supabase = createClient();
  const errors: string[] = [];
  const validRows: { profile_id: string; nom: string; email: string | null; telephone: string | null; whatsapp: string | null; derniere_visite: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.nom?.trim() || !row.derniere_visite) {
      errors.push(`Ligne ${i + 2} : nom et dernière visite requis`);
      continue;
    }
    validRows.push({
      profile_id: profileId,
      nom: row.nom.trim(),
      email: row.email?.trim() || null,
      telephone: row.telephone?.trim() || null,
      whatsapp: row.whatsapp?.trim() || null,
      derniere_visite: row.derniere_visite,
    });
  }

  const BATCH = 100;
  let inserted = 0;

  for (let i = 0; i < validRows.length; i += BATCH) {
    const batch = validRows.slice(i, i + BATCH);
    const { data, error } = await supabase.from("clients").insert(batch).select("id");

    if (error) {
      errors.push(`Lot ${Math.floor(i / BATCH) + 1} : ${error.message}`);
    } else {
      inserted += data?.length ?? 0;
    }
  }

  return { inserted, errors };
}

/**
 * Parse une chaîne CSV en lignes avec colonnes nom, email, telephone, whatsapp?, derniere_visite
 * Gère plusieurs formats de colonnes (nom/prénom, email, tél, whatsapp, date)
 */
export function parseClientsCSV(csvText: string): { nom: string; email?: string; telephone?: string; whatsapp?: string; derniere_visite: string }[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
  const rows: { nom: string; email?: string; telephone?: string; whatsapp?: string; derniere_visite: string }[] = [];

  const colNom = headers.findIndex((h) => /^(nom|name|client|prénom|prenom)$/i.test(h));
  const colEmail = headers.findIndex((h) => /^email$/i.test(h));
  const colTel = headers.findIndex((h) => /^(tel|telephone|phone|téléphone)$/i.test(h));
  const colWhatsapp = headers.findIndex((h) => /^whatsapp$/i.test(h));
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
    const whatsapp = colWhatsapp >= 0 ? parts[colWhatsapp] : undefined;
    const derniere_visite = (colDate >= 0 ? parts[colDate] : parts[fallbackDate]) || "";

    if (!nom) continue;

    const parsed = parseDate(derniere_visite);
    rows.push({
      nom,
      email: email || undefined,
      telephone: telephone || undefined,
      whatsapp: whatsapp || undefined,
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
