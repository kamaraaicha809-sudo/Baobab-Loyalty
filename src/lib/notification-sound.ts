/**
 * Son de notification "nouvelle réservation" : deux notes douces (carillon
 * discret), générées par le navigateur (Web Audio API) -- aucun fichier
 * audio à charger. Durée totale ~1,2 s, volume volontairement bas.
 *
 * La préférence (activé / désactivé) est propre à l'appareil : un son est un
 * réglage de poste de travail (ordinateur de la réception), pas du compte.
 * Activé par défaut.
 */

const STORAGE_KEY = "reservation-sound-enabled";
const PEAK_GAIN = 0.12;

// Mi5 puis La5 : intervalle de quarte, clair mais sans effet "jeu".
const NOTES: { frequency: number; start: number; duration: number }[] = [
  { frequency: 659.25, start: 0, duration: 0.55 },
  { frequency: 880, start: 0.16, duration: 1.0 },
];

type AudioContextConstructor = typeof AudioContext;

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor: AudioContextConstructor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
  if (!Ctor) return null;
  sharedContext = sharedContext ?? new Ctor();
  return sharedContext;
}

export function isReservationSoundEnabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

const CHANGE_EVENT = "reservation-sound-change";

export function setReservationSoundEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Stockage indisponible (navigation privée) : le réglage ne persiste pas.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Abonnement au réglage (cet onglet et les autres onglets ouverts). */
export function subscribeReservationSound(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Joue le carillon. Renvoie false si le navigateur l'a bloqué (aucune
 * interaction préalable avec la page, ou Web Audio indisponible).
 */
export async function playReservationSound(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === "suspended") await ctx.resume();
    if (ctx.state !== "running") return false;
  } catch {
    return false;
  }

  const now = ctx.currentTime;
  for (const note of NOTES) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(note.frequency, now + note.start);
    gain.gain.setValueAtTime(0.0001, now + note.start);
    gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, now + note.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + note.start);
    osc.stop(now + note.start + note.duration + 0.05);
  }
  return true;
}
