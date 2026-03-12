"use client";

import { useState, useEffect } from "react";
import { prompts as promptsApi } from "@/src/sdk";
import toast from "react-hot-toast";
import { isDemoMode } from "@/src/lib/demo";

/**
 * AI Configuration Page
 * - Model selection (free text field for OpenRouter)
 * - Prompts CRUD management
 */
export default function IAConfigPage() {
  // Model state
  const [model, setModel] = useState("openai/gpt-4o-mini");
  const [savingModel, setSavingModel] = useState(false);

  // Prompts state
  const [promptsList, setPromptsList] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  // Load prompts on mount
  useEffect(() => {
    loadPrompts();
    loadModel();
  }, []);

  const loadModel = async () => {
    if (isDemoMode) {
      setModel("openai/gpt-4o-mini");
      return;
    }

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !anonKey) return;

      const response = await fetch(`${url}/functions/v1/config-get?key=default_model`, {
        headers: { apikey: anonKey },
      });
      const data = await response.json();
      if (data.ok && data.data?.value) {
        setModel(data.data.value.replace(/"/g, ""));
      }
    } catch (err) {
      // Erreur silencieuse - le modèle par défaut sera utilisé
    }
  };

  const loadPrompts = async () => {
    if (isDemoMode) {
      setPromptsList([
        {
          id: "demo-1",
          name: "system",
          description: "Prompt système principal",
          content: "Tu es un assistant IA utile et professionnel.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setLoadingPrompts(false);
      return;
    }

    try {
      const data = await promptsApi.list();
      setPromptsList(data);
    } catch (err) {
      toast.error("Impossible de charger les prompts");
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleSaveModel = async () => {
    if (isDemoMode) {
      toast.success("Modèle sauvegardé (démo)");
      return;
    }

    setSavingModel(true);
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const { createClient } = await import("@/libs/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Non authentifié");
        return;
      }

      const response = await fetch(`${url}/functions/v1/config-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ key: "default_model", value: model }),
      });

      const data = await response.json();
      if (data.ok) {
        toast.success("Modèle sauvegardé");
      } else {
        throw new Error(data.error?.message || "Erreur");
      }
    } catch (err) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSavingModel(false);
    }
  };

  const handleAddPrompt = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Nom et contenu requis");
      return;
    }

    if (isDemoMode) {
      const newPrompt = {
        id: `demo-${Date.now()}`,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPromptsList([newPrompt, ...promptsList]);
      setFormData({ name: "", description: "", content: "" });
      setShowAddForm(false);
      toast.success("Prompt ajouté (démo)");
      return;
    }

    setSaving(true);
    try {
      const newPrompt = await promptsApi.create({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        content: formData.content.trim(),
      });
      setPromptsList([newPrompt, ...promptsList]);
      setFormData({ name: "", description: "", content: "" });
      setShowAddForm(false);
      toast.success("Prompt créé");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePrompt = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Nom et contenu requis");
      return;
    }

    if (isDemoMode) {
      setPromptsList(
        promptsList.map((p) =>
          p.id === editingPrompt.id
            ? { ...p, ...formData, updated_at: new Date().toISOString() }
            : p
        )
      );
      setEditingPrompt(null);
      setFormData({ name: "", description: "", content: "" });
      toast.success("Prompt mis à jour (démo)");
      return;
    }

    setSaving(true);
    try {
      const updated = await promptsApi.update({
        id: editingPrompt.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        content: formData.content.trim(),
      });
      setPromptsList(promptsList.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPrompt(null);
      setFormData({ name: "", description: "", content: "" });
      toast.success("Prompt mis à jour");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrompt = async (prompt) => {
    if (!confirm(`Supprimer le prompt "${prompt.name}" ?`)) return;

    if (isDemoMode) {
      setPromptsList(promptsList.filter((p) => p.id !== prompt.id));
      toast.success("Prompt supprimé (démo)");
      return;
    }

    try {
      await promptsApi.delete(prompt.id);
      setPromptsList(promptsList.filter((p) => p.id !== prompt.id));
      toast.success("Prompt supprimé");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression");
    }
  };

  const startEditing = (prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name,
      description: prompt.description || "",
      content: prompt.content,
    });
    setShowAddForm(false);
  };

  const cancelForm = () => {
    setEditingPrompt(null);
    setShowAddForm(false);
    setFormData({ name: "", description: "", content: "" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
          Configuration IA
        </h1>
        <p className="text-slate-500 text-sm">
          Gérez le modèle IA et les prompts système
        </p>
      </header>

      {/* Model Section */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🤖</span>
          Modèle IA
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          Entrez le nom du modèle OpenRouter (ex: openai/gpt-4o-mini, anthropic/claude-3-haiku)
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="openai/gpt-4o-mini"
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleSaveModel}
            disabled={savingModel}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {savingModel ? "..." : "Sauvegarder"}
          </button>
        </div>
        <p className="text-slate-400 text-xs mt-3">
          Consultez{" "}
          <a
            href="https://openrouter.ai/models"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            openrouter.ai/models
          </a>{" "}
          pour la liste des modèles disponibles.
        </p>
      </section>

      {/* Prompts Section */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-xl">💬</span>
              Prompts Système
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Créez des prompts pour automatiser vos workflows IA
            </p>
          </div>
          {!showAddForm && !editingPrompt && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Ajouter
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingPrompt) && (
          <form
            onSubmit={editingPrompt ? handleUpdatePrompt : handleAddPrompt}
            className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200"
          >
            <h3 className="font-medium text-slate-900 mb-4">
              {editingPrompt ? "Modifier le prompt" : "Nouveau prompt"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: system, assistant, summarize..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez l'usage de ce prompt..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contenu *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tu es un assistant..."
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {saving ? "..." : editingPrompt ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        )}

        {/* Prompts List */}
        {loadingPrompts ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : promptsList.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-medium">Aucun prompt</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter" pour créer votre premier prompt.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promptsList.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{prompt.name}</h4>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">
                        prompt
                      </span>
                    </div>
                    {prompt.description && (
                      <p className="text-slate-500 text-sm mb-2">{prompt.description}</p>
                    )}
                    <p className="text-slate-600 text-sm font-mono bg-white px-3 py-2 rounded-lg border border-slate-100 line-clamp-2">
                      {prompt.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEditing(prompt)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
