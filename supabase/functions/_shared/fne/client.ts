/**
 * Client HTTP vers l'API FNE (DGI Cote d'Ivoire).
 *
 * D1 de la spec : l'API FNE n'expose aucune cle d'idempotence. Un POST /sign qui part
 * et dont la reponse se perd laisse le systeme dans un etat indetermine (la facture est
 * peut-etre certifiee cote DGI, peut-etre pas). Ce client ne retente donc JAMAIS lui-meme
 * une requete deja partie : il classe l'echec et remonte, le retry (ou non) est decide
 * par l'appelant (fne-worker) selon la classification retournee.
 */

import type { ErrorClass } from "./types.ts";

/** echec avant reception des en-tetes (DNS, connexion refusee, reseau indisponible). */
export const CONNECT_TIMEOUT_MS = 5_000;
/** echec apres reception des en-tetes mais avant la fin du corps : etat indetermine. */
export const READ_TIMEOUT_MS = 30_000;

export type FneErrorClassCode =
  | "connect_timeout"
  | "connection_error"
  | "read_timeout"
  | "http_400"
  | "http_401"
  | "http_500"
  | "http_other";

export type FneCallResult =
  | { outcome: "success"; status: 200 | 201; body: unknown }
  | { outcome: ErrorClass; errorClass: FneErrorClassCode; status: number | null; body: unknown };

/**
 * Classification d'un statut HTTP recu de la DGI (tableau §6 de la spec).
 * Le 401 est classe "retryable" ici : la nuance "une seule fois puis permanent"
 * est une politique de tentative (attempt count), geree par le worker, pas par
 * cette fonction qui ne voit qu'une reponse a la fois.
 */
export function classifyHttpStatus(status: number): { classification: ErrorClass; errorClass: FneErrorClassCode } {
  if (status === 400) return { classification: "permanent", errorClass: "http_400" };
  if (status === 401) return { classification: "retryable", errorClass: "http_401" };
  if (status >= 500) return { classification: "retryable", errorClass: "http_500" };
  return { classification: "permanent", errorClass: "http_other" };
}

export interface FneTimeoutOverrides {
  connectTimeoutMs?: number;
  readTimeoutMs?: number;
}

export async function callFne(
  url: string,
  apiKey: string,
  payload: unknown,
  timeouts: FneTimeoutOverrides = {}
): Promise<FneCallResult> {
  const connectTimeoutMs = timeouts.connectTimeoutMs ?? CONNECT_TIMEOUT_MS;
  const readTimeoutMs = timeouts.readTimeoutMs ?? READ_TIMEOUT_MS;

  // Un seul AbortController pour toute la duree de la requete : fetch() n'accepte
  // qu'un seul signal. On isole quand meme deux fenetres de timeout distinctes en
  // relancant un nouveau minuteur une fois les en-tetes recus (voir plus bas).
  const controller = new AbortController();
  const connectTimer = setTimeout(() => controller.abort(), connectTimeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(connectTimer);
    if (err instanceof DOMException && err.name === "AbortError") {
      // Rien n'a ete recu : la requete n'est jamais partie -> retry autorise.
      return { outcome: "retryable", errorClass: "connect_timeout", status: null, body: null };
    }
    // DNS / connexion refusee / reseau indisponible avant tout octet recu -> retry autorise.
    return { outcome: "retryable", errorClass: "connection_error", status: null, body: null };
  }
  clearTimeout(connectTimer);

  // En-tetes recus : la requete a ete traitee au moins jusqu'a la plateforme.
  const readTimer = setTimeout(() => controller.abort(), readTimeoutMs);
  let bodyText: string;
  try {
    bodyText = await res.text();
  } catch {
    clearTimeout(readTimer);
    // La reponse s'est perdue en cours de lecture : on ne sait pas si la DGI a
    // traite la facture -> etat indetermine, JAMAIS de retry automatique (D1).
    return { outcome: "indeterminate", errorClass: "read_timeout", status: res.status, body: null };
  }
  clearTimeout(readTimer);

  let body: unknown = null;
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = bodyText;
    }
  }

  if (res.status === 200 || res.status === 201) {
    return { outcome: "success", status: res.status, body };
  }

  const { classification, errorClass } = classifyHttpStatus(res.status);
  return { outcome: classification, errorClass, status: res.status, body };
}
