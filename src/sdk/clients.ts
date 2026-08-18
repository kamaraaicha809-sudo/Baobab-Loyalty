/**
 * Base clients — import, segmentation par tranches, tous
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
  "3-6mois": number;
  "6-9mois": number;
  "9-12mois": number;
  "1an+": number;
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
  return (data ?? { "3-6mois": 0, "6-9mois": 0, "9-12mois": 0, "1an+": 0, tous: 0 }) as SegmentCounts;
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

export interface ImportClientRow {
  nom: string;
  email?: string;
  telephone?: string;
  whatsapp?: string;
  derniere_visite: string;
}

/**
 * Un numéro sans indicatif pays (pas de "+" ni de "00" au début) passe cette
 * vérification mais échoue silencieusement plus tard à l'envoi WhatsApp
 * (formatE164 dans campaign-send ne peut pas deviner le pays). On le
 * signale donc dès l'import plutôt qu'au moment de l'envoi.
 */
function looksLikeMissingCountryCode(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  return !trimmed.startsWith("+") && !trimmed.startsWith("00");
}

/**
 * Importe des clients depuis des lignes CSV parsées
 * Format attendu : nom, email, telephone, whatsapp?, derniere_visite (YYYY-MM-DD)
 *
 * Dédoublonne par téléphone au sein d'un même hôtel (un ré-import du même
 * fichier met à jour les clients existants au lieu de les dupliquer).
 * Les lignes qui échouent sont renvoyées telles quelles dans failedRows,
 * pour permettre de les corriger et de ré-importer seulement celles-là au
 * lieu de tout recommencer.
 */
export async function importClients(
  profileId: string,
  rows: ImportClientRow[]
): Promise<{ inserted: number; errors: string[]; warnings: string[]; failedRows: ImportClientRow[] }> {
  const supabase = createClient();
  const errors: string[] = [];
  const warnings: string[] = [];
  const failedRows: ImportClientRow[] = [];

  interface ValidRow {
    source: ImportClientRow;
    profile_id: string;
    nom: string;
    email: string | null;
    telephone: string | null;
    whatsapp: string | null;
    derniere_visite: string;
  }

  const validRows: ValidRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.nom?.trim() || !row.derniere_visite) {
      errors.push(`Ligne ${i + 2} : nom et dernière visite requis`);
      failedRows.push(row);
      continue;
    }

    const contactNumber = row.whatsapp?.trim() || row.telephone?.trim();
    if (contactNumber && looksLikeMissingCountryCode(contactNumber)) {
      warnings.push(`${row.nom} : le numéro "${contactNumber}" ne semble pas avoir d'indicatif pays (ex: +221) — les campagnes WhatsApp échoueront pour ce client.`);
    }

    validRows.push({
      source: row,
      profile_id: profileId,
      nom: row.nom.trim(),
      email: row.email?.trim() || null,
      telephone: row.telephone?.trim() || null,
      whatsapp: row.whatsapp?.trim() || null,
      derniere_visite: row.derniere_visite,
    });
  }

  const phones = [...new Set(validRows.map((r) => r.telephone).filter((t): t is string => !!t))];
  const existingByPhone = new Map<string, string>();

  if (phones.length > 0) {
    const { data: existing } = await supabase
      .from("clients")
      .select("id, telephone")
      .eq("profile_id", profileId)
      .in("telephone", phones);
    for (const c of existing ?? []) {
      if (c.telephone) existingByPhone.set(c.telephone, c.id);
    }
  }

  const toInsert: ValidRow[] = [];
  const toUpdate: { id: string; row: ValidRow }[] = [];

  for (const row of validRows) {
    const existingId = row.telephone ? existingByPhone.get(row.telephone) : undefined;
    if (existingId) toUpdate.push({ id: existingId, row });
    else toInsert.push(row);
  }

  const BATCH = 100;
  let inserted = 0;

  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from("clients")
      .insert(batch.map(({ source: _source, ...r }) => r))
      .select("id");

    if (error) {
      errors.push(`Lot ${Math.floor(i / BATCH) + 1} : ${error.message}`);
      failedRows.push(...batch.map((r) => r.source));
    } else {
      inserted += data?.length ?? 0;
    }
  }

  for (const { id, row } of toUpdate) {
    const { error } = await supabase
      .from("clients")
      .update({ nom: row.nom, email: row.email, whatsapp: row.whatsapp, derniere_visite: row.derniere_visite })
      .eq("id", id);
    if (error) {
      errors.push(`${row.nom} : ${error.message}`);
      failedRows.push(row.source);
    } else {
      inserted++;
    }
  }

  return { inserted, errors, warnings, failedRows };
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
