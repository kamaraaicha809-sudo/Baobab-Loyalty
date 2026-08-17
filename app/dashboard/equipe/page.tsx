"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { team, SdkError } from "@/src/sdk";
import type { TeamListResponse } from "@/src/sdk";
import { usePremiumAccess } from "@/src/hooks/usePremiumAccess";
import { isDemoMode, demoTeam } from "@/src/lib/demo";

function TeamPremiumUpsell() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-xl border border-slate-200">
      <div className="w-14 h-14 rounded-full bg-[var(--color-light)] flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-[var(--color-main)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-2">Fonctionnalité réservée au plan Premium</h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        L&apos;accès multi-utilisateurs (jusqu&apos;à 2 membres invités) est disponible uniquement avec le plan Premium.
      </p>
      <Link
        href="/dashboard/abonnement"
        className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
      >
        Voir les plans
      </Link>
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  member: "Membre",
};

export default function EquipePage() {
  const isPremium = usePremiumAccess();
  const [data, setData] = useState<TeamListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    if (isDemoMode) {
      startTransition(() => {
        setData(demoTeam);
        setLoading(false);
      });
      return;
    }
    startTransition(() => setLoading(true));
    try {
      const result = await team.list();
      setData(result);
    } catch {
      // Silencieux — l'upsell/erreur générique suffit ici
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPremium) startTransition(() => loadTeam());
  }, [isPremium, loadTeam]);

  const canManage = data?.callerRole === "owner" || data?.callerRole === "admin";
  const totalUsed = (data?.members.length || 0) + (data?.invitations.length || 0);
  const atLimit = data ? totalUsed >= data.maxMembers : false;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (isDemoMode) {
      toast.success("Invitation envoyée (démo)");
      setEmail("");
      return;
    }

    setInviting(true);
    try {
      await team.invite({ email: email.trim(), teamRole: inviteRole });
      toast.success("Invitation envoyée");
      setEmail("");
      loadTeam();
    } catch (err) {
      toast.error(err instanceof SdkError ? err.message : "Erreur lors de l'invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (isDemoMode) {
      toast.success("Membre retiré (démo)");
      return;
    }
    setRemovingId(memberId);
    try {
      await team.removeMember(memberId);
      toast.success("Membre retiré");
      loadTeam();
    } catch (err) {
      toast.error(err instanceof SdkError ? err.message : "Erreur lors de la suppression");
    } finally {
      setRemovingId(null);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (isDemoMode) {
      toast.success("Invitation annulée (démo)");
      return;
    }
    setRemovingId(invitationId);
    try {
      await team.revokeInvitation(invitationId);
      toast.success("Invitation annulée");
      loadTeam();
    } catch (err) {
      toast.error(err instanceof SdkError ? err.message : "Erreur lors de l'annulation");
    } finally {
      setRemovingId(null);
    }
  };

  if (isPremium === null || (isPremium && loading)) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Équipe</h1>
          <p className="text-slate-600">Invitez des collaborateurs à accéder à votre espace Baobab Loyalty.</p>
        </header>
        <TeamPremiumUpsell />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Équipe</h1>
        <p className="text-slate-600">
          Invitez jusqu&apos;à {data?.maxMembers ?? 2} collaborateurs à accéder à votre espace Baobab Loyalty.
        </p>
      </header>

      {canManage && (
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Inviter un membre</h2>
          <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px]">
              <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collegue@monhotel.com"
                disabled={atLimit}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="invite-role" className="block text-sm font-medium text-slate-700 mb-1">
                Rôle
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                disabled={atLimit}
                className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm disabled:opacity-60"
              >
                <option value="member">Membre</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={inviting || atLimit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-slate-900 font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {inviting ? "Envoi…" : "Inviter"}
            </button>
          </form>
          {atLimit && (
            <p className="text-xs text-amber-600 mt-3">
              Limite de {data?.maxMembers ?? 2} membres atteinte. Retirez un membre ou annulez une invitation pour en inviter un nouveau.
            </p>
          )}
        </section>
      )}

      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Membres de l&apos;équipe</h2>
        <ul className="divide-y divide-slate-100">
          <li className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Vous (propriétaire)</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{ROLE_LABELS.owner}</span>
          </li>
          {data?.members.map((m) => (
            <li key={m.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{m.email || m.user_id}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">{ROLE_LABELS[m.team_role]}</span>
                {canManage && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    disabled={removingId === m.id}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                  >
                    {removingId === m.id ? "…" : "Retirer"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {(data?.members.length ?? 0) === 0 && (
          <p className="text-sm text-slate-500 mt-2">Aucun membre invité pour l&apos;instant.</p>
        )}
      </section>

      {(data?.invitations.length ?? 0) > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Invitations en attente</h2>
          <ul className="divide-y divide-slate-100">
            {data?.invitations.map((inv) => (
              <li key={inv.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{inv.email}</p>
                  <p className="text-xs text-slate-400">
                    Expire le {new Date(inv.expires_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">{ROLE_LABELS[inv.team_role]}</span>
                  {canManage && (
                    <button
                      onClick={() => handleRevokeInvitation(inv.id)}
                      disabled={removingId === inv.id}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      {removingId === inv.id ? "…" : "Annuler"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
