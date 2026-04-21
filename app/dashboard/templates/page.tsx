"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Icons } from "@/components/common/Icons";
import toast from "react-hot-toast";
import config from "@/config";
import { linkedin, ai } from "@/src/sdk";
import {
  demoGeneratedTemplate,
  demoLinkedinPost,
  demoLinkedInPostGenerated,
  demoMessageTemplates,
  demoProfile,
} from "@/src/lib/demo";
import type { MessageTemplate } from "@/src/sdk/linkedin";

const SEGMENT_NAMES: Record<string, string> = {
  "3mois": "Clients - 3 mois",
  "6mois": "Clients - 6 mois",
  "9mois": "Clients - 9 mois",
  tous: "Tous les clients",
};

const TEMPLATES = [
  {
    id: "remise",
    name: "Remise Exceptionnelle",
    description: "20% de réduction sur votre chambre",
    icon: "tag",
    message: "Offre exceptionnelle ! Bénéficiez de 20% de réduction sur votre prochaine chambre. Valable 7 jours.",
  },
  {
    id: "surclassement",
    name: "Surclassement Offert",
    description: "Un surclassement gratuit en Suite Junior",
    icon: "star",
    message: "Surprise ! Nous vous offrons un surclassement gratuit en Suite Junior pour votre prochain séjour.",
  },
  {
    id: "cocktail",
    name: "Cocktail de Bienvenue",
    description: "Deux cocktails signature offerts à votre arrivée",
    icon: "cocktail",
    message: "Bienvenue ! Deux cocktails signature vous sont offerts à votre arrivée. À très bientôt !",
  },
  {
    id: "famille",
    name: "Offre Famille",
    description: "-25% sur la deuxième chambre communicante",
    icon: "users",
    message: "Offre famille ! -25% sur la deuxième chambre communicante. Parfait pour vos vacances en famille.",
  },
  {
    id: "evenements",
    name: "Événements Spéciaux",
    description: "Une surprise vous attend pour votre séjour",
    icon: "calendar",
    message: "Un séjour spécial vous attend ! Une surprise vous sera réservée. Réservez dès maintenant.",
    defaultIntro: "Célébrons ensemble cet événement spécial ! Profitez de notre offre exclusive :",
    fetes: [
      { id: "ramadan", name: "Ramadan", intro: "Ramadan Kareem ! Pour ce mois sacré, nous vous proposons :", avantage: "IFTAR offert et tarif spécial sur les chambres" },
      { id: "paques", name: "Pâques", intro: "Joyeuses Pâques ! Profitez d'un week-end chocolaté :", avantage: "Chasse aux œufs et brunch de Pâques inclus" },
      { id: "saint-valentin", name: "Saint-Valentin", intro: "L'amour est dans l'air. Pour la Saint Valentin, profitez de :", avantage: "Dîner aux chandelles et décoration romantique offerte" },
      { id: "tabaski", name: "Tabaski", intro: "Aïd el-Kebir Mubarak ! Célébrez la Tabaski avec nous :", avantage: "Déjeuner traditionnel offert pour toute la famille" },
      { id: "saint-sylvestre", name: "Saint-Sylvestre", intro: "Terminez l'année en beauté ! Pour le réveillon de la Saint Sylvestre, nous vous proposons :", avantage: "Soirée de gala, champagne et brunch du nouvel an" },
    ],
  },
  {
    id: "vide",
    name: "Template Vide",
    description: "Rédigez votre propre message personnalisé",
    icon: "file",
    message: "",
  },
];

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ICON_MAP = {
  tag: Icons.Tag,
  star: Icons.Star,
  cocktail: Icons.Cocktail,
  users: Icons.Users,
  calendar: Icons.Calendar,
  file: FileIcon,
};

type Fete = { id: string; name: string; intro: string; avantage: string };

// ============================================================
// ONGLET 1 : Offres standards (contenu original)
// ============================================================
function OffresTab({ segmentId, segmentName }: { segmentId: string; segmentName: string }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFete, setSelectedFete] = useState<Fete | null>(null);
  const [avantage, setAvantage] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [hotelName, setHotelName] = useState(config.isDemoMode ? demoProfile.hotel_name : "");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = TEMPLATES.find((t) => t.id === selectedId);
  const SelectedIcon = selected ? ICON_MAP[selected.icon as keyof typeof ICON_MAP] : null;
  const fetes = selected?.id === "evenements" && "fetes" in selected ? (selected.fetes as Fete[]) : null;

  useEffect(() => {
    if (config.isDemoMode) return;
    const loadProfile = async () => {
      try {
        const { createClient } = await import("@/libs/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("hotel_name")
          .eq("id", user.id)
          .single();
        if (profile?.hotel_name) setHotelName(profile.hotel_name);
      } catch {
        // silent
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    setGeneratedMessage(null);
    if (selected?.id === "evenements" && selectedFete) {
      setAvantage(selectedFete.avantage);
    } else if (selected) {
      setAvantage(selected.description);
    } else {
      setAvantage("");
    }
  }, [selected?.id, selected?.description, selectedFete?.id, selectedFete?.avantage]);

  const handleSelectTemplate = (id: string) => {
    setSelectedId(id);
    setSelectedFete(null);
    setGeneratedMessage(null);
  };

  const handleGenerateAI = async () => {
    if (!selected || !avantage.trim()) {
      toast.error("Sélectionnez une offre et renseignez l'avantage d'abord.");
      return;
    }

    setGenerating(true);
    setGeneratedMessage(null);

    try {
      if (config.isDemoMode) {
        await new Promise((r) => setTimeout(r, 1300));
        const demoMessages: Record<string, string> = {
          "3mois": `Bonjour {{nom}}, cela fait un moment que vous n'êtes pas venus nous voir ! Pour votre prochain séjour, nous vous réservons : ${avantage}. Réservez avant la fin du mois pour en profiter.`,
          "6mois": `{{nom}}, vous nous manquez vraiment ! Pour fêter votre retour à ${hotelName || "l'hôtel"}, nous vous offrons : ${avantage}. Cette offre vous est réservée jusqu'à la fin du mois — profitez-en.`,
          "9mois": `Cher {{nom}}, cela fait longtemps et on pense à vous ! Nous avons une surprise : ${avantage}, rien que pour vous. Répondez simplement OUI et on s'occupe du reste.`,
          "tous": `Bonjour {{nom}}, l'équipe de ${hotelName || "notre hôtel"} pense à vous ! Pour votre prochaine visite, profitez de : ${avantage}. Réservez dès maintenant.`,
        };
        setGeneratedMessage(demoMessages[segmentId] || demoMessages["tous"]);
        toast.success("Message généré avec succès !");
      } else {
        const result = await ai.generateCampaignMessage({
          typeOffre: selected.name,
          avantage: avantage.trim(),
          segment: segmentId as "3mois" | "6mois" | "9mois" | "tous",
          hotelName: hotelName || undefined,
        });
        setGeneratedMessage(result.content);
        toast.success("Message généré avec succès !");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la génération.";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleValiderEnvoyer = async () => {
    if (!selected || !avantage.trim()) {
      toast.error("Renseignez l'avantage et sélectionnez une offre.");
      return;
    }

    if (attachedFile && attachedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem("campaign_image", reader.result as string);
        navigateToConfirm();
      };
      reader.readAsDataURL(attachedFile);
    } else {
      sessionStorage.removeItem("campaign_image");
      navigateToConfirm();
    }

    function navigateToConfirm() {
      const params = new URLSearchParams();
      if (segmentId) params.set("segment", segmentId);
      params.set("template", selected!.id);
      params.set("avantage", avantage.trim());
      if (selectedFete) params.set("fete", selectedFete.name);
      if (selected!.id === "vide") {
        params.set("message", avantage.trim());
      } else if (generatedMessage) {
        params.set("message", generatedMessage);
      }
      router.push(`/dashboard/campaign/confirm?${params.toString()}`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Colonne gauche : Liste des templates */}
      <div className="lg:w-[380px] shrink-0 space-y-3">
        {TEMPLATES.map((template) => {
          const IconComponent = ICON_MAP[template.icon as keyof typeof ICON_MAP];
          const isSelected = selectedId === template.id;
          return (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-white border-primary/40 shadow-md"
                  : "bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected && template.id === "evenements" ? "bg-primary/20 text-primary" : "bg-slate-200/80 text-slate-500"}`}>
                  {IconComponent && <IconComponent />}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{template.description}</p>
                </div>
                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Colonne droite : Personnalisation */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[320px]">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Icons.Menu />
            Personnalisation rapide
          </h3>

          {selected ? (
            <div className="space-y-5">
              {selected.id === "vide" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Votre message personnalisé
                  </label>
                  <textarea
                    value={avantage}
                    onChange={(e) => setAvantage(e.target.value)}
                    placeholder="Rédigez votre message WhatsApp ici... Ex : Bonjour {{nom}}, nous avons une offre spéciale pour vous !"
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    Utilisez <span className="font-mono bg-slate-100 px-1 rounded">{"{{nom}}"}</span> pour personnaliser avec le prénom du client.
                  </p>
                </div>
              ) : (
                <>
                  {fetes ? (
                    <>
                      <p className="text-sm font-medium text-slate-700">Choisissez une fête :</p>
                      <div className="flex flex-wrap gap-2">
                        {fetes.map((fete) => (
                          <button
                            key={fete.id}
                            onClick={() => setSelectedFete(fete)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedFete?.id === fete.id
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {fete.name}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Modifier l&apos;avantage (1-2 lignes)
                    </label>
                    <textarea
                      value={avantage}
                      onChange={(e) => setAvantage(e.target.value)}
                      placeholder="Ex : Un surclassement gratuit en Suite Junior"
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <button
                    onClick={handleGenerateAI}
                    disabled={generating || !avantage.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-primary/40 bg-primary/5 text-primary font-semibold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {generating ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Générer avec l&apos;IA
                      </>
                    )}
                  </button>

                  {generatedMessage !== null && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Message généré
                      </label>
                      <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-100/80 border border-slate-200 max-w-md">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{generatedMessage}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">
                        Vous pouvez modifier l&apos;avantage et regénérer si besoin.
                      </p>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={handleValiderEnvoyer}
                disabled={!avantage.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Valider et envoyer
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Icons.Cursor />
              <p className="mt-4 text-slate-400 text-sm max-w-[260px]">
                Sélectionnez une offre à gauche pour commencer la personnalisation.
              </p>
            </div>
          )}

          {/* Ajouter un fichier — toujours visible */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Pièce jointe (optionnel)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setAttachedFile(file);
              }}
            />
            {attachedFile ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm text-slate-700 truncate flex-1">{attachedFile.name}</span>
                <button
                  onClick={() => {
                    setAttachedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  title="Supprimer le fichier"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium hover:bg-slate-100 hover:border-slate-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Ajouter un fichier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ONGLET 2 : Générer depuis LinkedIn
// ============================================================
function LinkedInTab() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [postPreview, setPostPreview] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [variablesFound, setVariablesFound] = useState<string[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<MessageTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const profileId = config.isDemoMode ? "demo-user-id" : demoProfile.id;

  // Charger les templates sauvegardés
  useEffect(() => {
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      try {
        if (config.isDemoMode) {
          setSavedTemplates(demoMessageTemplates as MessageTemplate[]);
        } else {
          const templates = await linkedin.getTemplates(profileId);
          setSavedTemplates(templates);
        }
      } catch {
        // Silencieux si l'utilisateur n'est pas encore connecté
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, [profileId]);

  const handleGenerate = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error("Collez l'URL d'un post LinkedIn.");
      return;
    }
    if (!trimmedUrl.includes("linkedin.com")) {
      toast.error("L'URL doit être un lien LinkedIn valide.");
      return;
    }

    setLoading(true);
    setPostPreview(null);
    setGeneratedContent(null);
    setVariablesFound([]);

    try {
      if (config.isDemoMode) {
        // Simulation en mode démo
        await new Promise((r) => setTimeout(r, 1200));
        setPostPreview(demoLinkedinPost.preview);
        setGeneratedContent(demoGeneratedTemplate.content);
        setVariablesFound(demoGeneratedTemplate.variables_found);
        toast.success("Template généré avec succès !");
      } else {
        const result = await linkedin.generateTemplate({ url: trimmedUrl });
        setPostPreview(result.post_preview);
        setGeneratedContent(result.content);
        setVariablesFound(result.variables_found);
        toast.success("Template généré avec succès !");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la génération.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent || !templateName.trim()) {
      toast.error("Donnez un nom à votre template avant de sauvegarder.");
      return;
    }

    setSaving(true);
    try {
      if (config.isDemoMode) {
        await new Promise((r) => setTimeout(r, 600));
        const newTemplate: MessageTemplate = {
          id: `tpl-${Date.now()}`,
          profile_id: "demo-user-id",
          name: templateName.trim(),
          content: generatedContent,
          variables: variablesFound,
          source: "linkedin",
          linkedin_url: url.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setSavedTemplates((prev) => [newTemplate, ...prev]);
        toast.success("Template sauvegardé !");
      } else {
        const saved = await linkedin.saveTemplate({
          profileId,
          name: templateName.trim(),
          content: generatedContent,
          variables: variablesFound,
          linkedinUrl: url.trim() || undefined,
        });
        setSavedTemplates((prev) => [saved, ...prev]);
        toast.success("Template sauvegardé !");
      }
      setTemplateName("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!config.isDemoMode) {
        await linkedin.deleteTemplate(id);
      }
      setSavedTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copié dans le presse-papiers !");
  };

  return (
    <div className="space-y-6">
      {config.isDemoMode && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Mode démo — les appels Unipile et LinkedIn sont simulés.
        </div>
      )}

      {/* Champ URL + bouton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-1">URL du post LinkedIn</h3>
        <p className="text-sm text-slate-500 mb-4">
          Collez l&apos;URL d&apos;un post LinkedIn pour le convertir en template WhatsApp.
        </p>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.linkedin.com/posts/..."
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Génération...
              </>
            ) : (
              <>Générer</>
            )}
          </button>
        </div>
      </div>

      {/* Résultat : aperçu + template généré */}
      {(postPreview || generatedContent) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Aperçu du post */}
          {postPreview && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Contenu du post LinkedIn
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">{postPreview}</p>
            </div>
          )}

          {/* Template généré */}
          {generatedContent && (
            <div className="bg-white rounded-xl border border-primary/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Template WhatsApp généré
                </h4>
                <button
                  onClick={() => handleCopy(generatedContent)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copier
                </button>
              </div>

              <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-100/80 border border-slate-200 mb-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {generatedContent}
                </p>
              </div>

              {/* Variables détectées */}
              {variablesFound.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Variables détectées
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {variablesFound.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-medium"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sauvegarder */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Nom du template (ex : Offre fidélité printemps)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
                <button
                  onClick={handleSave}
                  disabled={saving || !templateName.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Sauvegarder comme template
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Liste des templates sauvegardés */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">
          Templates LinkedIn sauvegardés
          {savedTemplates.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({savedTemplates.length})
            </span>
          )}
        </h3>

        {loadingTemplates ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : savedTemplates.length === 0 ? (
          <div className="py-10 text-center rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
            Aucun template LinkedIn sauvegardé pour l&apos;instant.
          </div>
        ) : (
          <div className="space-y-3">
            {savedTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 text-sm">{tpl.name}</h4>
                      {tpl.source === "linkedin" && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                          LinkedIn
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {tpl.content}
                    </p>
                    {tpl.variables && tpl.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tpl.variables.map((v: string) => (
                          <span
                            key={v}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-mono"
                          >
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(tpl.content)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Copier le template"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ONGLET 3 : Générer un post LinkedIn
// ============================================================
type LinkedInTone = "professionnel" | "chaleureux" | "inspirant";

const TONES: { id: LinkedInTone; label: string; description: string }[] = [
  { id: "professionnel", label: "Professionnel", description: "Factuel, structuré, axé sur les résultats" },
  { id: "chaleureux", label: "Chaleureux", description: "Humain, proche, émotionnel" },
  { id: "inspirant", label: "Inspirant", description: "Vision, valeurs, impact positif" },
];

function LinkedInPostTab() {
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState<LinkedInTone>("professionnel");
  const [loading, setLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const hotelName = demoProfile.hotel_name || "";
  const charCount = generatedPost?.length ?? 0;

  const handleGenerate = async () => {
    if (!subject.trim()) {
      toast.error("Entrez un sujet pour votre post LinkedIn.");
      return;
    }

    setLoading(true);
    setGeneratedPost(null);

    try {
      if (config.isDemoMode) {
        await new Promise((r) => setTimeout(r, 1400));
        setGeneratedPost(demoLinkedInPostGenerated.content);
        toast.success("Post généré avec succès !");
      } else {
        const result = await ai.generateLinkedInPost({
          subject: subject.trim(),
          hotelName: hotelName || undefined,
          tone,
        });
        setGeneratedPost(result.content);
        toast.success("Post généré avec succès !");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la génération.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    toast.success("Copié dans le presse-papiers !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {config.isDemoMode && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Mode démo — la génération est simulée sans appel à l&apos;IA.
        </div>
      )}

      {/* Formulaire */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">Générer un post LinkedIn</h3>
          <p className="text-sm text-slate-500">
            Décrivez votre sujet et choisissez un ton. L&apos;IA rédige un post prêt à publier.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Sujet du post *
          </label>
          <textarea
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex : Comment nous avons augmenté notre taux de retour client de 30% en 3 mois"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Ton du post
          </label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                title={t.description}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tone === t.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {TONES.find((t) => t.id === tone)?.description}
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !subject.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Génération en cours...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Générer le post
            </>
          )}
        </button>
      </div>

      {/* Résultat */}
      {generatedPost && (
        <div className="bg-white rounded-xl border border-primary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-slate-900">Post LinkedIn généré</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {charCount} caractères
                {charCount > 1500 && (
                  <span className="text-amber-600 ml-1">(LinkedIn recommande moins de 1 500 caractères)</span>
                )}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copié !
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copier
                </>
              )}
            </button>
          </div>
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
              {generatedPost}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
function TemplatesContent() {
  const searchParams = useSearchParams();
  const segmentId = searchParams.get("segment") || "";
  const segmentName = SEGMENT_NAMES[segmentId] || "un segment";
  const [activeTab, setActiveTab] = useState<"offres" | "linkedin" | "linkedin-post">("offres");

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Dashboard
          </Link>
          <span className="text-slate-400">/</span>
          <Link
            href="/dashboard/segments"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Segments
          </Link>
          {segmentId && (
            <>
              <span className="text-slate-400">/</span>
              <span className="text-sm text-slate-700 font-medium">{segmentName}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Templates de messages
        </h1>
        <p className="text-slate-600 text-base">
          {segmentId
            ? `Vous ciblez « ${segmentName} ». Choisissez un template ou générez-en un depuis LinkedIn.`
            : "Choisissez un template prêt à l'emploi ou générez-en un depuis un post LinkedIn."}
        </p>
      </header>

      {/* Onglets */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("offres")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "offres"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Offres standards
        </button>
        <button
          onClick={() => setActiveTab("linkedin")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "linkedin"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Depuis LinkedIn
        </button>
        <button
          onClick={() => setActiveTab("linkedin-post")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "linkedin-post"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Post LinkedIn IA
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "offres" && (
        <OffresTab segmentId={segmentId} segmentName={segmentName} />
      )}
      {activeTab === "linkedin" && <LinkedInTab />}
      {activeTab === "linkedin-post" && <LinkedInPostTab />}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
      }
    >
      <TemplatesContent />
    </Suspense>
  );
}
