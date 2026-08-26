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
  nombre_reservations: number;
  montant_total_depense: number;
  type_chambre_preferee: string | null;
  saison_habituelle: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SegmentFilters {
  minMontantDepense?: number;
  minNombreReservations?: number;
  typeChambreContains?: string;
  saisonContains?: string;
}

/**
 * Filtres combinables (P5) en plus des segments basés sur derniere_visite.
 * Réutilisé côté client (aperçu du nombre de destinataires) et répliqué côté
 * campaign-send (Edge Function Deno, pas d'import cross-runtime possible) —
 * garder les deux synchronisées.
 */
export function matchesAdvancedFilters(
  client: Pick<Client, "montant_total_depense" | "nombre_reservations" | "type_chambre_preferee" | "saison_habituelle">,
  filters: SegmentFilters
): boolean {
  if (filters.minMontantDepense != null && (client.montant_total_depense ?? 0) < filters.minMontantDepense) return false;
  if (filters.minNombreReservations != null && (client.nombre_reservations ?? 0) < filters.minNombreReservations) return false;
  if (filters.typeChambreContains?.trim()) {
    const needle = filters.typeChambreContains.trim().toLowerCase();
    if (!(client.type_chambre_preferee ?? "").toLowerCase().includes(needle)) return false;
  }
  if (filters.saisonContains?.trim()) {
    const needle = filters.saisonContains.trim().toLowerCase();
    if (!(client.saison_habituelle ?? "").toLowerCase().includes(needle)) return false;
  }
  return true;
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
    .select(
      "id, profile_id, nom, email, telephone, whatsapp, derniere_visite, notes, nombre_reservations, montant_total_depense, type_chambre_preferee, saison_habituelle, created_at, updated_at"
    )
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
  nombre_reservations?: number;
  montant_total_depense?: number;
  type_chambre_preferee?: string;
  saison_habituelle?: string;
}

type PhoneIssue = "missing_country_code" | "invalid_characters" | "too_short" | null;

/**
 * Validation stricte au-delà de la simple présence d'un indicatif pays :
 * - "missing_country_code" : pas de "+" ni de "00" au début — passe la
 *   vérification mais échoue silencieusement plus tard à l'envoi WhatsApp
 *   (formatE164 dans campaign-send ne peut pas deviner le pays).
 * - "invalid_characters" : autre chose que des chiffres après l'indicatif
 *   (faute de frappe, texte collé dans la mauvaise colonne).
 * - "too_short" : moins de 8 chiffres, trop court pour un numéro réel.
 */
function getPhoneIssue(phone: string): PhoneIssue {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("+") && !trimmed.startsWith("00")) return "missing_country_code";
  const digitsOnly = trimmed.replace(/^\+/, "").replace(/^00/, "").replace(/[\s.-]/g, "");
  if (!/^\d+$/.test(digitsOnly)) return "invalid_characters";
  if (digitsOnly.length < 8) return "too_short";
  return null;
}

interface ValidRow {
  source: ImportClientRow;
  profile_id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  whatsapp: string | null;
  derniere_visite: string;
  nombre_reservations?: number;
  montant_total_depense?: number;
  type_chambre_preferee?: string;
  saison_habituelle?: string;
}

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicatesInFile: number;
  possibleNameDuplicates: number;
  missingCountryCode: number;
  invalidPhoneFormat: number;
}

/**
 * Valide, nettoie et dédoublonne les lignes d'un CSV — partagé entre
 * `previewImport` (synthèse avant confirmation, aucune écriture en base) et
 * `importClients` (écriture réelle), pour garantir que le résumé affiché à
 * l'hôtelier correspond exactement à ce qui sera importé.
 */
function validateAndDedupeRows(profileId: string, rows: ImportClientRow[]) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const failedRows: ImportClientRow[] = [];
  const rawValidRows: ValidRow[] = [];
  let missingCountryCode = 0;
  let invalidPhoneFormat = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const missingNom = !row.nom?.trim();
    const missingDate = !row.derniere_visite;
    if (missingNom || missingDate) {
      const reason = missingNom && missingDate ? "nom et date de dernière visite manquants" : missingNom ? "nom manquant" : "date de dernière visite manquante";
      errors.push(`Ligne ${i + 2} : ${reason}`);
      failedRows.push(row);
      continue;
    }

    const contactNumber = row.whatsapp?.trim() || row.telephone?.trim();
    if (contactNumber) {
      const issue = getPhoneIssue(contactNumber);
      if (issue === "missing_country_code") {
        missingCountryCode++;
        warnings.push(`${row.nom} : le numéro "${contactNumber}" ne semble pas avoir d'indicatif pays (ex: +221) — les campagnes WhatsApp échoueront pour ce client.`);
      } else if (issue === "invalid_characters" || issue === "too_short") {
        invalidPhoneFormat++;
        warnings.push(`${row.nom} : le numéro "${contactNumber}" ne ressemble pas à un numéro valide — vérifiez cette ligne.`);
      }
    }

    rawValidRows.push({
      source: row,
      profile_id: profileId,
      nom: row.nom.trim(),
      email: row.email?.trim() || null,
      telephone: row.telephone?.trim() || null,
      whatsapp: row.whatsapp?.trim() || null,
      derniere_visite: row.derniere_visite,
      nombre_reservations: row.nombre_reservations,
      montant_total_depense: row.montant_total_depense,
      type_chambre_preferee: row.type_chambre_preferee?.trim() || undefined,
      saison_habituelle: row.saison_habituelle?.trim() || undefined,
    });
  }

  // Fusionne les lignes internes au fichier qui partagent le même téléphone
  // (garde la dernière occurrence — un ré-export place souvent la ligne la
  // plus à jour en dernier) : sans ça, deux lignes avec le même téléphone
  // dans un même import créaient deux clients distincts au lieu d'un seul.
  const dedupedByPhone = new Map<string, ValidRow>();
  const rowsWithoutPhone: ValidRow[] = [];
  let duplicatesInFile = 0;
  for (const row of rawValidRows) {
    if (!row.telephone) {
      rowsWithoutPhone.push(row);
      continue;
    }
    if (dedupedByPhone.has(row.telephone)) duplicatesInFile++;
    dedupedByPhone.set(row.telephone, row);
  }
  const validRows = [...rowsWithoutPhone, ...dedupedByPhone.values()];
  if (duplicatesInFile > 0) {
    warnings.push(`${duplicatesInFile} ligne(s) en double dans le fichier (même téléphone) ont été fusionnées — seule la dernière a été conservée.`);
  }

  // Même nom, téléphones différents (ou absents) : signalé mais jamais fusionné
  // automatiquement — un nom identique ne prouve pas qu'il s'agit de la même
  // personne (homonymes possibles), c'est à l'hôtelier de vérifier.
  const nomCounts = new Map<string, number>();
  for (const row of validRows) {
    const key = row.nom.trim().toLowerCase();
    nomCounts.set(key, (nomCounts.get(key) || 0) + 1);
  }
  const possibleNameDuplicates = [...nomCounts.values()].filter((count) => count > 1).length;
  if (possibleNameDuplicates > 0) {
    warnings.push(`${possibleNameDuplicates} nom(s) apparaissent plusieurs fois avec des numéros différents — vérifiez qu'il ne s'agit pas du même client mal saisi.`);
  }

  return {
    validRows,
    errors,
    warnings,
    failedRows,
    totalRows: rows.length,
    duplicatesInFile,
    possibleNameDuplicates,
    missingCountryCode,
    invalidPhoneFormat,
  };
}

/**
 * Synthèse d'un import AVANT toute écriture en base — à afficher à
 * l'hôtelier pour confirmation (doublons internes, numéros invalides,
 * lignes rejetées) plutôt que de découvrir les problèmes après coup.
 */
export function previewImport(rows: ImportClientRow[]): ImportPreview {
  // profileId n'est pas nécessaire pour une synthèse en lecture seule ;
  // une valeur factice suffit, elle n'est jamais utilisée avant l'écriture.
  const result = validateAndDedupeRows("preview", rows);
  return {
    totalRows: result.totalRows,
    validRows: result.validRows.length,
    invalidRows: result.failedRows.length,
    duplicatesInFile: result.duplicatesInFile,
    possibleNameDuplicates: result.possibleNameDuplicates,
    missingCountryCode: result.missingCountryCode,
    invalidPhoneFormat: result.invalidPhoneFormat,
  };
}

/**
 * Importe des clients depuis des lignes CSV parsées
 * Format attendu : nom, email, telephone, whatsapp?, derniere_visite (YYYY-MM-DD)
 *
 * Dédoublonne par téléphone au sein d'un même hôtel (un ré-import du même
 * fichier met à jour les clients existants au lieu de les dupliquer) ET au
 * sein d'un même fichier (deux lignes avec le même téléphone dans un seul
 * import sont fusionnées). Les lignes qui échouent sont renvoyées telles
 * quelles dans failedRows, pour permettre de les corriger et de ré-importer
 * seulement celles-là au lieu de tout recommencer.
 */
export async function importClients(
  profileId: string,
  rows: ImportClientRow[]
): Promise<{ inserted: number; errors: string[]; warnings: string[]; failedRows: ImportClientRow[] }> {
  const supabase = createClient();
  const { validRows, errors, warnings, failedRows } = validateAndDedupeRows(profileId, rows);

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
    // Les champs optionnels absents du CSV restent `undefined` et sont donc
    // ignorés par .update() : un ré-import sans colonne "montant depense" ne
    // doit pas écraser une valeur déjà mise à jour automatiquement par
    // reservations-confirm.
    const { error } = await supabase
      .from("clients")
      .update({
        nom: row.nom,
        email: row.email,
        whatsapp: row.whatsapp,
        derniere_visite: row.derniere_visite,
        nombre_reservations: row.nombre_reservations,
        montant_total_depense: row.montant_total_depense,
        type_chambre_preferee: row.type_chambre_preferee,
        saison_habituelle: row.saison_habituelle,
      })
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
export function parseClientsCSV(csvText: string): ImportClientRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
  const rows: ImportClientRow[] = [];

  const colNom = headers.findIndex((h) => /^(nom|name|client|prénom|prenom)$/i.test(h));
  const colEmail = headers.findIndex((h) => /^email$/i.test(h));
  const colTel = headers.findIndex((h) => /^(tel|telephone|phone|téléphone)$/i.test(h));
  const colWhatsapp = headers.findIndex((h) => /^whatsapp$/i.test(h));
  // Non ancré (contrairement aux autres colonnes) : "derniere_visite" est le
  // nom de la colonne interne (voir migrations), un hôtelier ou un export
  // Baobab a de bonnes chances de nommer sa colonne CSV ainsi. Un match
  // ancré strict comme les autres colonnes le manquerait (ne matche que
  // "derniere" seul) et ferait retomber silencieusement sur la dernière
  // colonne du fichier — devenu plus probable après l'ajout des colonnes
  // de segmentation P5 en fin de CSV.
  const colDate = headers.findIndex((h) =>
    /derniere|dernière|visite|date|last|sejour|séjour/i.test(h)
  );
  const colNbReservations = headers.findIndex((h) =>
    /^(nombre[_ ]?reservations?|nb[_ ]?reservations?|reservations?)$/i.test(h)
  );
  const colMontant = headers.findIndex((h) =>
    /^(montant[_ ]?total[_ ]?depense|montant[_ ]?depense|total[_ ]?depense|montant)$/i.test(h)
  );
  const colChambre = headers.findIndex((h) =>
    /^(type[_ ]?chambre[_ ]?preferee|type[_ ]?chambre|chambre[_ ]?preferee|room[_ ]?type)$/i.test(h)
  );
  const colSaison = headers.findIndex((h) => /^(saison[_ ]?habituelle|saison|season)$/i.test(h));

  const fallbackNom = colNom < 0 ? 0 : colNom;
  const fallbackDate = colDate < 0 ? headers.length - 1 : colDate;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/[,;]/).map((p) => p.trim());
    const nom = (colNom >= 0 ? parts[colNom] : parts[fallbackNom]) || "";
    const email = colEmail >= 0 ? parts[colEmail] : undefined;
    const telephone = colTel >= 0 ? parts[colTel] : undefined;
    const whatsapp = colWhatsapp >= 0 ? parts[colWhatsapp] : undefined;
    const derniere_visite = (colDate >= 0 ? parts[colDate] : parts[fallbackDate]) || "";
    const nbReservationsRaw = colNbReservations >= 0 ? parts[colNbReservations] : undefined;
    const montantRaw = colMontant >= 0 ? parts[colMontant] : undefined;
    const typeChambre = colChambre >= 0 ? parts[colChambre] : undefined;
    const saison = colSaison >= 0 ? parts[colSaison] : undefined;

    const nbReservations = nbReservationsRaw ? parseInt(nbReservationsRaw.replace(/[^\d-]/g, ""), 10) : NaN;
    const montant = montantRaw ? parseInt(montantRaw.replace(/[^\d-]/g, ""), 10) : NaN;

    // Nom et date manquants sont laissés tels quels (chaîne vide) plutôt que
    // filtrés ou complétés silencieusement ici : importClients() les rejette
    // explicitement avec une raison affichée à l'hôtelier, plutôt que de les
    // ignorer sans trace ou de leur assigner une date du jour trompeuse.
    rows.push({
      nom,
      email: email || undefined,
      telephone: telephone || undefined,
      whatsapp: whatsapp || undefined,
      derniere_visite: derniere_visite ? parseDate(derniere_visite) : "",
      nombre_reservations: Number.isFinite(nbReservations) ? nbReservations : undefined,
      montant_total_depense: Number.isFinite(montant) ? montant : undefined,
      type_chambre_preferee: typeChambre || undefined,
      saison_habituelle: saison || undefined,
    });
  }

  return rows;
}

/**
 * Construit un CSV de sauvegarde à partir de la base clients complète —
 * mêmes colonnes que l'import (voir parseClientsCSV), pour qu'un fichier
 * exporté ici puisse être ré-importé tel quel si besoin. Fonction pure
 * (aucun accès réseau) : le déclenchement du téléchargement reste côté UI.
 */
export function buildClientsCSV(clientsList: Client[]): string {
  const header = "nom,email,telephone,whatsapp,derniere_visite,nombre_reservations,montant_total_depense,type_chambre_preferee,saison_habituelle";
  const escape = (v: string): string =>
    /[,"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  const lines = clientsList.map((c) =>
    [
      escape(c.nom || ""),
      escape(c.email || ""),
      escape(c.telephone || ""),
      escape(c.whatsapp || ""),
      c.derniere_visite || "",
      c.nombre_reservations ?? "",
      c.montant_total_depense ?? "",
      escape(c.type_chambre_preferee || ""),
      escape(c.saison_habituelle || ""),
    ].join(",")
  );
  return [header, ...lines].join("\n");
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

// 5 Mo est très large pour un fichier clients (largement plus que les
// quelques milliers de lignes qu'un hôtel indépendant importe) : au-delà,
// on bloque avant même de lire le fichier pour éviter de figer l'onglet du
// navigateur en essayant de parser un fichier trop volumineux.
export const MAX_CSV_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Lit un fichier CSV en détectant automatiquement son encodage.
 *
 * `File.text()` décode toujours en UTF-8 : un CSV exporté depuis Excel sous
 * Windows via "Enregistrer sous > CSV (séparateur : point-virgule)" (plutôt
 * que "CSV UTF-8") est encodé en Windows-1252, ce qui transforme silencieusement
 * les accents (é, è, ê, à, ç, ô, ù) en caractères illisibles. On tente d'abord
 * un décodage UTF-8 strict ; s'il échoue (séquence d'octets invalide en UTF-8,
 * ce que produit presque toujours un CSV Windows-1252 accentué), on retombe
 * sur Windows-1252. Le BOM UTF-8 (EF BB BF), ajouté par Excel sur macOS et qui
 * ferait échouer la détection de la colonne "nom" sur la première ligne, est
 * retiré avant décodage.
 */
export async function readCsvFileSmart(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const hasUtf8Bom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  const contentBytes = hasUtf8Bom ? bytes.slice(3) : bytes;

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(contentBytes);
  } catch {
    return new TextDecoder("windows-1252").decode(contentBytes);
  }
}

export const clients = {
  getSegmentCounts,
  getClients,
  importClients,
  previewImport,
  parseClientsCSV,
  readCsvFileSmart,
  matchesAdvancedFilters,
  buildClientsCSV,
};
