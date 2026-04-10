"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import config from "@/config";
import ButtonCheckout from "@/components/ui/ButtonCheckout";

const planSlugs: Record<string, string> = {
  Starter: "starter",
  Pro: "pro",
  Premium: "premium",
};

const Pricing = () => {
  const plans = config.stripe.plans;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import("@/libs/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <section id="tarifs" className="py-16 sm:py-24 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#EBC161] text-center mb-4">
          Des tarifs adaptés à votre hôtel
        </h2>
        <p className="text-slate-400 text-center mb-12 text-base">
          Sans engagement — résiliable à tout moment
        </p>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => {
            const slug = planSlugs[plan.name] || plan.name.toLowerCase();
            const isFeatured = plan.isFeatured;
            return (
              <div
                key={i}
                className={`relative rounded-2xl p-6 sm:p-8 bg-[#252525] border-2 transition-all ${
                  isFeatured
                    ? "border-[#EBC161] shadow-lg shadow-[#EBC161]/20"
                    : "border-[#333]"
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#EBC161] text-[#1a1a1a] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                      Recommandé
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className={`text-3xl sm:text-4xl font-bold ${isFeatured ? "text-[#EBC161]" : "text-white"}`}>
                    {plan.price.toLocaleString("fr-FR")} {config.stripe.currency}
                  </span>
                  <span className="text-slate-400 text-sm ml-1">/mois</span>
                </div>
                <ul className="space-y-3 mb-8 text-slate-300 text-sm">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <svg className={`w-4 h-4 flex-shrink-0 ${isFeatured ? "text-[#EBC161]" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f.name}
                    </li>
                  ))}
                </ul>
                <div>
                  {loading ? (
                    <div className="block w-full py-3 rounded-lg text-center font-medium animate-pulse bg-slate-700">
                      Chargement...
                    </div>
                  ) : isLoggedIn ? (
                    <ButtonCheckout
                      planSlug={slug}
                      amount={plan.price}
                      planName={plan.name}
                      extraStyle={`block w-full py-3 rounded-lg text-center font-medium transition-colors ${
                        isFeatured
                          ? "bg-[#EBC161] text-[#1a1a1a] hover:bg-[#c9a84d]"
                          : "bg-white text-[#1a1a1a] hover:bg-slate-100"
                      }`}
                    >
                      Choisir ce plan
                    </ButtonCheckout>
                  ) : (
                    <Link
                      href={`/signup?plan=${slug}`}
                      className={`block w-full py-3 rounded-lg text-center font-medium transition-colors ${
                        isFeatured
                          ? "bg-[#EBC161] text-[#1a1a1a] hover:bg-[#c9a84d]"
                          : "bg-white text-[#1a1a1a] hover:bg-slate-100"
                      }`}
                    >
                      Choisir ce plan
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#EBC161] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Toutes tes données clients sont stockées sur des serveurs sécurisés (chiffrement SSL)
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#EBC161] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Tu restes propriétaire de ta base clients — nous ne la partageons jamais
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
