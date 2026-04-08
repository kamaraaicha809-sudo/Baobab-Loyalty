"use client";

import { useEffect, useState } from "react";
import { ai } from "@/src/sdk/ai";

interface Props {
  hotelName: string;
  clientCount: number;
  onComplete: () => void;
}

const FALLBACK_MESSAGE = (hotelName: string) =>
  `Bonjour {nom}, vous nous manquez ! L'${hotelName} vous réserve une surprise : bénéficiez d'une remise exclusive de 20% sur votre prochain séjour. Réservez avant la fin du mois et profitez-en directement à votre arrivée.`;

export default function Step3WawMoment({ hotelName, clientCount, onComplete }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const generate = async () => {
      try {
        const systemPrompt = `Tu es un expert en marketing hôtelier WhatsApp pour l'Afrique francophone. Rédige des messages de fidélisation courts, chaleureux et percutants. RÈGLES : 2 à 3 phrases maximum. Inclure {nom} au début. Ton chaleureux et personnel. Langue française. Produire UNIQUEMENT le texte du message.`;

        const result = await ai.generate({
          prompt: `Rédige un message WhatsApp de relance pour l'hôtel "${hotelName}". Clients cibles : inactifs depuis plus de 3 mois. Offre : remise de 20% sur le prochain séjour. Segment : clients fidèles.`,
          system: systemPrompt,
          maxTokens: 150,
          temperature: 0.7,
        });

        setMessage(result.content);
      } catch {
        setMessage(FALLBACK_MESSAGE(hotelName));
      } finally {
        setGenerating(false);
      }
    };

    generate();
  }, [hotelName]);

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Votre premier message est prêt
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          L&apos;IA a généré un message de relance personnalisé pour votre hôtel. Vous pourrez l&apos;envoyer à vos clients depuis le dashboard.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-slate-900">{clientCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">clients importés</p>
        </div>
        <div className="bg-[var(--color-light)] rounded-xl p-4 border border-[var(--color-main)]/20">
          <p className="text-2xl font-bold text-slate-900">
            {Math.round(clientCount * 0.28)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">clients à relancer (3 mois)</p>
        </div>
      </div>

      {/* Message WhatsApp */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Message généré par l&apos;IA
        </p>
        <div className="bg-[#ECF4DC] rounded-2xl rounded-tl-sm p-4 shadow-sm relative min-h-[100px]">
          {generating ? (
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm text-slate-500">L&apos;IA rédige votre message...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{message}</p>
              <div className="flex justify-end mt-2">
                <span className="text-[10px] text-slate-400">Baobab Loyalty · IA</span>
              </div>
            </>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          La variable <span className="font-mono bg-slate-100 px-1 rounded">{`{nom}`}</span> sera remplacée par le prénom de chaque client lors de l&apos;envoi.
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onComplete}
        disabled={generating}
        className="w-full py-3 px-6 rounded-xl bg-slate-900 text-white font-semibold text-base hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            Accéder à mon dashboard
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
