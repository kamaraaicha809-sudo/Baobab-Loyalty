"use client";

import { useState, useEffect } from "react";
import { ai } from "@/src/sdk";

const TONES = [
  { value: "professionnel", label: "Professionnel", desc: "Sobre, orienté résultats" },
  { value: "chaleureux", label: "Chaleureux", desc: "Humain, proche, émotionnel" },
  { value: "inspirant", label: "Inspirant", desc: "Vision, leadership, ambition" },
];

export default function LinkedInPage() {
  const [hotelName, setHotelName] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [offer, setOffer] = useState("");
  const [generatedPost, setGeneratedPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(generatedPost.length);
  }, [generatedPost]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Renseigne le sujet du post.");
      return;
    }
    setError(null);
    setLoading(true);
    setGeneratedPost("");

    try {
      const result = await ai.generateLinkedInPost({
        subject: topic,
        hotelName: hotelName || undefined,
        tone: tone as "professionnel" | "chaleureux" | "inspirant",
        offer: offer || undefined,
      });
      setGeneratedPost(result.content);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0A66C2" className="w-7 h-7 shrink-0">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          Générateur de posts LinkedIn
        </h1>
        <p className="text-slate-500 text-sm">
          Crée des posts LinkedIn percutants pour valoriser ton hôtel en quelques secondes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Paramètres du post</h2>

          {/* Nom de l'hôtel */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nom de l&apos;hôtel <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              placeholder="ex. Hôtel Terrou-Bi, Radisson Blu Dakar..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Sujet */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Sujet du post <span className="text-red-500">*</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ex. Notre programme de fidélité vient d'atteindre 500 membres, lancement d'un package weekend romantique, retour sur la saison haute..."
              rows={3}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Offre à mettre en avant */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Offre à valoriser <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="ex. -20% sur les séjours de 3 nuits en mars"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Ton */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ton</label>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors text-left ${
                    tone === t.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-semibold">{t.label}</div>
                  <div className={`mt-0.5 font-normal ${tone === t.value ? "text-primary/70" : "text-slate-400"}`}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-3 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                Générer le post
              </>
            )}
          </button>
        </div>

        {/* Résultat */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Post généré</h2>
            {generatedPost && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                charCount > 3000
                  ? "bg-red-50 text-red-600"
                  : charCount > 2000
                  ? "bg-amber-50 text-amber-600"
                  : "bg-green-50 text-green-600"
              }`}>
                {charCount} caractères
              </span>
            )}
          </div>

          {!generatedPost && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mb-3 text-slate-200">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p className="text-sm">Remplis le formulaire et clique sur<br /><strong className="text-slate-500">Générer le post</strong></p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">L&apos;IA rédige votre post...</p>
              </div>
            </div>
          )}

          {generatedPost && !loading && (
            <div className="flex-1 flex flex-col gap-4">
              {/* Preview card style LinkedIn */}
              <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-100">
                {/* LinkedIn header mock */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {hotelName ? hotelName.charAt(0).toUpperCase() : "H"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{hotelName || "Votre Hôtel"}</p>
                    <p className="text-xs text-slate-500">Directeur · Hôtellerie</p>
                  </div>
                </div>
                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {generatedPost}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Copié !
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                      </svg>
                      Copier le post
                    </>
                  )}
                </button>
                <button
                  onClick={handleGenerate}
                  className="py-2.5 px-4 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Régénérer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conseil */}
      <div className="bg-[var(--color-light)] border border-[var(--color-main)]/30 rounded-xl p-4 text-sm text-slate-700 flex gap-3 items-start">
        <svg className="w-4 h-4 text-[var(--color-main)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
        <p><strong className="text-slate-900">Conseil :</strong> Les posts LinkedIn avec 150-300 mots et une question en fin génèrent en moyenne 3x plus de commentaires. Personnalise le post avec des chiffres réels de ton hôtel avant de publier.</p>
      </div>
    </div>
  );
}
