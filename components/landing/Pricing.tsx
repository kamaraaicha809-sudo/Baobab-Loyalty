"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import config from "@/config";
import ButtonCheckout from "@/components/ui/ButtonCheckout";

const planSlugs: Record<string, string> = {
  Essentiel: "essentiel",
  Croissance: "croissance",
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
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#EBC161] text-center mb-12">
          Des tarifs adaptés à votre hôtel
        </h2>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 sm:p-8 ${
                plan.isFeatured
                  ? "bg-[#252525] border-2 border-primary"
                  : "bg-[#252525] border border-[#333]"
              }`}
            >
              {plan.isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-primary text-white text-xs font-medium uppercase">
                    POPULAIRE
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {plan.price.toLocaleString("fr-FR")} {config.stripe.currency}
                </span>
                <span className="text-slate-400 text-sm ml-1">/mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-slate-300 text-sm">
                {plan.features.map((f, j) => (
                  <li key={j}>{f.name}</li>
                ))}
              </ul>
              <div>
              {loading ? (
                <div
                  className={`block w-full py-3 rounded-lg text-center font-medium animate-pulse ${
                    plan.isFeatured ? "bg-primary/50" : "bg-slate-700"
                  }`}
                >
                  Chargement...
                </div>
              ) : isLoggedIn ? (
                <>
                  <ButtonCheckout
                    priceId={plan.priceId}
                    mode="subscription"
                    extraStyle={`block w-full py-3 rounded-lg text-center font-medium transition-colors ${
                      plan.isFeatured
                        ? "bg-primary text-[#1a1a1a] hover:bg-[#c9a84d]"
                        : "bg-transparent border border-slate-500 text-white hover:border-slate-400"
                    }`}
                  >
                    Choisir ce plan
                  </ButtonCheckout>
                  <ButtonCheckout
                    priceId={plan.priceId}
                    mode="subscription"
                    extraStyle="block w-full text-center text-primary/90 text-xs mt-2 bg-transparent border-0 hover:underline cursor-pointer p-0 min-h-0 font-normal"
                  >
                    Économisez 20% sur le paiement annuel
                  </ButtonCheckout>
                </>
              ) : (
                <>
                  <Link
                    href={`/signup?plan=${planSlugs[plan.name] || "essentiel"}`}
                    className={`block w-full py-3 rounded-lg text-center font-medium transition-colors ${
                      plan.isFeatured
                        ? "bg-primary text-[#1a1a1a] hover:bg-[#c9a84d]"
                        : "bg-transparent border border-slate-500 text-white hover:border-slate-400"
                    }`}
                  >
                    Choisir ce plan
                  </Link>
                  <Link
                    href={`/signup?plan=${planSlugs[plan.name] || "essentiel"}`}
                    className="block text-center text-primary/90 text-xs mt-2 hover:underline cursor-pointer"
                  >
                    Économisez 20% sur le paiement annuel
                  </Link>
                </>
              )}
            </div>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 text-sm sm:text-base mt-10">
          Le prix d&apos;installation et de configuration est de 39 000 FCFA, une seule fois.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
