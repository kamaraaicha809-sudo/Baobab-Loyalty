"use client";

import { useState, useRef } from "react";
import { createClient } from "@/libs/supabase/client";
import { clients } from "@/src/sdk/clients";
import toast from "react-hot-toast";

interface Props {
  profileId: string;
  onNext: (clientCount: number) => void;
}

interface ParsedPreview {
  count: number;
  columns: string[];
}

export default function Step2ImportClients({ profileId, onNext }: Props) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setCsvFile(file);
    try {
      const text = await file.text();
      const rows = clients.parseClientsCSV(text);
      const firstLine = text.split(/\r?\n/)[0];
      const cols = firstLine.split(/[,;]/).map((h) => h.trim()).filter(Boolean);
      setPreview({ count: rows.length, columns: cols });
    } catch {
      toast.error("Impossible de lire le fichier CSV");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!csvFile || !profileId) return;
    setImporting(true);
    try {
      const text = await csvFile.text();
      const rows = clients.parseClientsCSV(text);
      if (rows.length === 0) {
        toast.error("Aucune ligne valide trouvée dans le CSV");
        setImporting(false);
        return;
      }
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ onboarding_step: 2 })
        .eq("id", profileId);

      const { inserted } = await clients.importClients(profileId, rows);
      onNext(inserted);
    } catch {
      toast.error("Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const handleUseDemo = async () => {
    setImporting(true);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ onboarding_step: 2 })
        .eq("id", profileId);

      const demoRows = [
        { nom: "Moussa Diop", email: "moussa@email.com", telephone: "+221771234567", derniere_visite: "2025-11-10" },
        { nom: "Fatou Ndiaye", email: "fatou@email.com", telephone: "+221782345678", derniere_visite: "2025-10-05" },
        { nom: "Omar Sy", email: "omar@email.com", telephone: "+221763456789", derniere_visite: "2025-09-20" },
        { nom: "Aminata Ba", email: "aminata@email.com", telephone: "+221774567890", derniere_visite: "2025-08-15" },
        { nom: "Ibrahima Sow", email: "ibrahima@email.com", telephone: "+221785678901", derniere_visite: "2025-07-22" },
        { nom: "Aissatou Fall", email: "aissatou@email.com", telephone: "+221766789012", derniere_visite: "2025-06-10" },
        { nom: "Cheikh Mbaye", email: "cheikh@email.com", telephone: "+221777890123", derniere_visite: "2025-05-01" },
        { nom: "Mariama Diouf", email: "mariama@email.com", telephone: "+221788901234", derniere_visite: "2026-01-15" },
        { nom: "Ousmane Kane", email: "ousmane@email.com", telephone: "+221769012345", derniere_visite: "2026-02-01" },
        { nom: "Khady Sarr", email: "khady@email.com", telephone: "+221770123456", derniere_visite: "2026-02-20" },
        { nom: "Mamadou Gueye", email: "mamadou@email.com", telephone: "+221781112233", derniere_visite: "2025-04-10" },
        { nom: "Sokhna Dieng", email: "sokhna@email.com", telephone: "+221762223344", derniere_visite: "2025-03-25" },
      ];

      const { inserted } = await clients.importClients(profileId, demoRows);
      toast.success(`${inserted} clients de démonstration importés`);
      onNext(inserted);
    } catch {
      toast.error("Erreur lors de l'import démo");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-light)] flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-[var(--color-main)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Importez votre base clients
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Chargez votre fichier CSV avec vos clients pour activer la segmentation automatique. Colonnes attendues : <span className="font-medium text-slate-700">nom, email, téléphone, dernière visite</span>.
        </p>
      </div>

      {/* Zone de dépôt CSV */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all text-center
          ${dragOver
            ? "border-[var(--color-main)] bg-[var(--color-light)]/60"
            : csvFile
              ? "border-emerald-300 bg-emerald-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {csvFile && preview ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="font-semibold text-emerald-700">{preview.count} clients détectés</p>
            <p className="text-xs text-slate-500">
              Colonnes : {preview.columns.slice(0, 4).join(", ")}
              {preview.columns.length > 4 ? ` +${preview.columns.length - 4}` : ""}
            </p>
            <p className="text-xs text-slate-400 mt-1">Cliquez pour changer de fichier</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-9 h-9 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium text-slate-600">Glissez votre CSV ici</p>
            <p className="text-xs text-slate-400">ou cliquez pour choisir</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={!csvFile || importing}
          className="w-full py-3 px-6 rounded-xl bg-[var(--color-main)] text-slate-900 font-semibold text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {importing ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              Import en cours...
            </>
          ) : (
            <>
              Importer et continuer
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleUseDemo}
          disabled={importing}
          className="w-full py-2.5 px-6 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Utiliser 12 clients de démonstration pour commencer
        </button>
      </div>
    </div>
  );
}
