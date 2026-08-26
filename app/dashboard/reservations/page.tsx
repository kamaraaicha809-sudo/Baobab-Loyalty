"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { user } from "@/src/sdk";
import { reservations, type PendingReservation } from "@/src/sdk/reservations";
import { isDemoMode, demoUser, demoPendingReservations } from "@/src/lib/demo";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return value;
  }
}

export default function ReservationsPage() {
  const [profileId, setProfileId] = useState<string | null>(isDemoMode ? demoUser.id : null);
  const [loading, setLoading] = useState(!isDemoMode);
  const [items, setItems] = useState<PendingReservation[]>(isDemoMode ? demoPendingReservations : []);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [montantInput, setMontantInput] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (pid: string) => {
    try {
      const rows = await reservations.getPendingReservations(pid);
      setItems(rows);
    } catch {
      toast.error("Impossible de charger les réservations en attente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) return;
    const init = async () => {
      try {
        const profile = await user.getProfile();
        if (profile?.id) {
          setProfileId(profile.id);
          await load(profile.id);
        } else {
          setLoading(false);
        }
      } catch {
        toast.error("Impossible de charger votre profil.");
        setLoading(false);
      }
    };
    init();
  }, [load]);

  const openConfirm = (id: string) => {
    setConfirmingId(id);
    setMontantInput("");
  };

  const handleConfirm = async (id: string) => {
    const montant = Number(montantInput);
    if (!montantInput || !Number.isFinite(montant) || montant < 0) {
      toast.error("Indiquez un montant valide en FCFA.");
      return;
    }
    if (isDemoMode) {
      toast.success("Réservation confirmée (mode démo — non enregistré).");
      setItems((prev) => prev.filter((r) => r.id !== id));
      setConfirmingId(null);
      return;
    }
    setBusyId(id);
    try {
      await reservations.confirmReservation(id, montant);
      toast.success("Réservation confirmée.");
      setItems((prev) => prev.filter((r) => r.id !== id));
      setConfirmingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la confirmation.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (isDemoMode) {
      toast.success("Réservation annulée (mode démo — non enregistré).");
      setItems((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    setBusyId(id);
    try {
      await reservations.cancelReservation(id);
      toast.success("Réservation annulée.");
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'annulation.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Réservations à confirmer</h1>
        <p className="text-sm text-slate-500 mt-1">
          Demandes reçues via le lien WhatsApp. Confirmez après avoir vérifié la disponibilité,
          en indiquant le montant réel — c&apos;est ce montant qui alimente le chiffre d&apos;affaires
          affiché sur votre tableau de bord.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-500 text-sm">Aucune réservation en attente pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{r.client_name || "Client sans nom"}</p>
                  <p className="text-sm text-slate-500">{r.client_phone || "Téléphone non renseigné"}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Arrivée {formatDate(r.check_in_date)} · {r.nights || 1} nuit{(r.nights || 1) > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCancel(r.id)}
                    disabled={busyId === r.id}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => openConfirm(r.id)}
                    disabled={busyId === r.id}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  >
                    Confirmer
                  </button>
                </div>
              </div>

              {confirmingId === r.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 shrink-0">Montant réel (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    value={montantInput}
                    onChange={(e) => setMontantInput(e.target.value)}
                    placeholder="Ex : 75000"
                    className="w-full sm:w-40 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirm(r.id)}
                      disabled={busyId === r.id}
                      className="px-4 py-2 rounded-lg bg-primary text-slate-900 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="px-4 py-2 rounded-lg text-slate-500 text-sm hover:text-slate-700"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!profileId && !loading && !isDemoMode && (
        <p className="text-sm text-red-600">Impossible de déterminer votre hôtel. Réessayez ou contactez le support.</p>
      )}
    </div>
  );
}
