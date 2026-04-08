"use client";

import { useState } from "react";
import { createClient } from "@/libs/supabase/client";
import toast from "react-hot-toast";

interface Props {
  profileId: string;
  onNext: (hotelName: string) => void;
}

export default function Step1HotelName({ profileId, onNext }: Props) {
  const [hotelName, setHotelName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName.trim()) {
      toast.error("Veuillez renseigner le nom de votre hôtel");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          hotel_name: hotelName.trim(),
          onboarding_step: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (error) throw error;
      onNext(hotelName.trim());
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-light)] flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-[var(--color-main)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Comment s&apos;appelle votre hôtel ?
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Ce nom apparaîtra dans tous vos messages WhatsApp. Vous pourrez le modifier plus tard dans les paramètres.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="hotel_name" className="block text-sm font-medium text-slate-700 mb-2">
            Nom de l&apos;hôtel ou établissement <span className="text-red-400">*</span>
          </label>
          <input
            id="hotel_name"
            type="text"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            placeholder="Ex. Hôtel Le Baobab"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--color-main)]/40 focus:border-[var(--color-main)] text-slate-900 text-base outline-none transition-all placeholder:text-slate-400"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={saving || !hotelName.trim()}
          className="w-full py-3 px-6 rounded-xl bg-[var(--color-main)] text-slate-900 font-semibold text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              Continuer
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
