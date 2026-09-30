"use client";

import { useEffect, useRef } from "react";
import config from "@/config";
import { createClient } from "@/libs/supabase/client";
import { user as userSdk } from "@/src/sdk/user";
import { isDemoMode } from "@/src/lib/demo";
import { isRecoveredReservation, type ReservationChange } from "@/src/lib/recovered-reservation";
import {
  isReservationSoundEnabled,
  playReservationSound,
  unlockReservationSoundOnFirstGesture,
} from "@/src/lib/reservation-sound";
import { showRecoveredReservationToast } from "@/components/dashboard/RecoveredReservationToast";

/**
 * Écoute en direct les réservations de l'hôtel et signale, sur toutes les
 * pages du dashboard, chaque réservation récupérée grâce à une campagne (carte
 * + son discret si activé). Rien n'est rejoué au chargement de la page : seuls
 * les changements survenus pendant que le dashboard est ouvert comptent.
 * Afrique uniquement ; jamais actif en mode démo (voir le bouton de test dans
 * la page Configuration).
 */
export default function RecoveredReservationNotifier() {
  const notifiedIds = useRef(new Set<string>());

  useEffect(() => {
    if (isDemoMode || !config.notifications.recoveredReservation.enabled) return;

    const removeUnlock = unlockReservationSoundOnFirstGesture();
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const handleChange = (row: ReservationChange) => {
      if (!row.id || !isRecoveredReservation(row) || notifiedIds.current.has(row.id)) return;
      notifiedIds.current.add(row.id);
      showRecoveredReservationToast(row.id);
      if (isReservationSoundEnabled()) void playReservationSound();
    };

    userSdk
      .getProfile()
      .then((profile) => {
        if (cancelled || !profile?.id) return;
        channel = supabase
          .channel("recovered-reservations")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "reservations", filter: `profile_id=eq.${profile.id}` },
            (payload) => handleChange(payload.new as ReservationChange)
          )
          .subscribe();
      })
      .catch(() => {
        // Profil illisible : pas de notification, le dashboard reste utilisable.
      });

    return () => {
      cancelled = true;
      removeUnlock();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
