"use client";

import { useState } from "react";
import { Icons } from "@/components/common/Icons";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: "email" | "whatsapp";
  onSend: (data: { subject?: string; message: string; recipients: string }) => Promise<void>;
}

export default function OfferModal({ isOpen, onClose, channel, onSend }: OfferModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!message.trim()) {
      setError("Le message est obligatoire.");
      return;
    }
    if (channel === "email" && !subject.trim()) {
      setError("Le sujet est obligatoire pour l'email.");
      return;
    }
    if (!recipients.trim()) {
      setError("Indiquez au moins un destinataire.");
      return;
    }

    setLoading(true);
    try {
      await onSend({
        subject: channel === "email" ? subject : undefined,
        message,
        recipients,
      });
      setSubject("");
      setMessage("");
      setRecipients("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEmail = channel === "email";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {isEmail ? <Icons.Mail /> : <Icons.Whatsapp />}
            {isEmail ? "Envoyer une offre par email" : "Envoyer une offre par WhatsApp"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icons.Close />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEmail && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sujet de l&apos;offre
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Offre spéciale -20% ce week-end"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Message de l&apos;offre
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isEmail
                  ? "Décrivez votre offre promotionnelle..."
                  : "Votre message WhatsApp..."
              }
              rows={5}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Destinataires
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder={
                isEmail
                  ? "email1@exemple.com, email2@exemple.com"
                  : "+221771234567, +221776543210"
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="mt-1 text-xs text-slate-500">
              Séparez les adresses par des virgules
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                channel === "whatsapp"
                  ? "bg-[#25D366] hover:bg-[#20bd5a]"
                  : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  {channel === "whatsapp" ? <Icons.Whatsapp /> : <Icons.Mail />}
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
