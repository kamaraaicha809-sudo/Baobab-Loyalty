"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { prompts as promptsApi } from "@/src/sdk";
import { isDemoMode } from "@/src/lib/demo";

/**
 * Admin Dashboard - Vue d'ensemble
 * Affiche les statistiques simples : nombre de prompts, modèle IA
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    promptsCount: 0,
    model: "openai/gpt-4o-mini",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (isDemoMode) {
        setStats({
          promptsCount: 1,
          model: "openai/gpt-4o-mini",
        });
        setLoading(false);
        return;
      }

      try {
        // Load prompts count
        const promptsList = await promptsApi.list();
        
        // Load model from config
        let model = "openai/gpt-4o-mini";
        try {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          
          if (url && anonKey) {
            const response = await fetch(`${url}/functions/v1/config-get?key=default_model`, {
              headers: { apikey: anonKey },
            });
            const data = await response.json();
            if (data.ok && data.data?.value) {
              model = data.data.value.replace(/"/g, "");
            }
          }
        } catch (err) {
          console.error("Failed to load model:", err);
        }

        setStats({
          promptsCount: promptsList.length,
          model,
        });
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">
          Administration
        </h1>
        <p className="text-slate-500 text-sm">
          Vue d'ensemble de la configuration IA
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs sm:text-sm">Modèle IA actuel</p>
              <p className="text-slate-900 font-semibold text-sm truncate max-w-[200px]">
                {stats.model || "Non configuré"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs sm:text-sm">Prompts enregistrés</p>
              <p className="text-slate-900 font-semibold">
                {stats.promptsCount} prompt{stats.promptsCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Link
          href="/admin/ia"
          className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-primary hover:shadow-lg transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-slate-900 font-semibold mb-1">Configuration IA</h3>
              <p className="text-slate-500 text-sm">
                Gérez le modèle IA et créez des prompts système pour vos automatisations.
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-blue-500">
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
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">À propos des prompts</p>
            <p className="text-blue-700">
              Les prompts système sont utilisés pour personnaliser le comportement de l'IA 
              dans vos automatisations. Vous pouvez créer plusieurs prompts pour différents 
              cas d'usage (génération de contenu, résumé, traduction, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
