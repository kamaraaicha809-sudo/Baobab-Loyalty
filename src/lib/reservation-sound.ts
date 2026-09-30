/**
 * Son des réservations récupérées : deux notes douces (la, puis mi une quinte
 * au-dessus), moins d'une seconde, volume bas. Produit par le navigateur
 * (Web Audio), sans fichier son à héberger.
 *
 * Le réglage activé / désactivé est gardé sur l'appareil (localStorage) : la
 * réception peut couper le son sans le couper sur le téléphone du gérant.
 */

const PREFERENCE_KEY = "baobab-reservation-sound";

const CHIME_NOTES = [
  { frequency: 880, delay: 0, duration: 0.45 },
  { frequency: 1318.51, delay: 0.13, duration: 0.6 },
];
const PEAK_GAIN = 0.12;
const RESUME_TIMEOUT_MS = 300;

let audioContext: AudioContext | null = null;

export function isReservationSoundEnabled(): boolean {
  try {
    return window.localStorage.getItem(PREFERENCE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setReservationSoundEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, enabled ? "on" : "off");
  } catch {
    // Stockage indisponible (navigation privée) : le réglage ne sera pas retenu.
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;
  const AudioContextClass =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext = new AudioContextClass();
  return audioContext;
}

/**
 * Les navigateurs n'autorisent le son qu'après une action de l'utilisateur :
 * le lecteur est préparé au premier clic ou à la première touche. Retourne la
 * fonction qui retire l'écoute.
 */
export function unlockReservationSoundOnFirstGesture(): () => void {
  const remove = () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  function unlock() {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") void ctx.resume();
    remove();
  }
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  return remove;
}

/**
 * Joue le son. Retourne false si le navigateur le bloque (aucune action de
 * l'utilisateur depuis l'ouverture de la page) : le son n'est alors jamais
 * rejoué en retard.
 */
export async function playReservationSound(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;
  if (ctx.state === "suspended") {
    // resume() peut rester en attente indéfiniment sans action de
    // l'utilisateur : on n'attend pas plus de quelques centaines de ms.
    await Promise.race([
      ctx.resume().catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, RESUME_TIMEOUT_MS)),
    ]);
  }
  if (ctx.state !== "running") return false;

  const start = ctx.currentTime + 0.02;
  for (const note of CHIME_NOTES) {
    const noteStart = start + note.delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note.frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, noteStart + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + note.duration + 0.05);
  }
  return true;
}
