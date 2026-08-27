"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { getStoredConsent, setStoredConsent } from "@/src/lib/cookieConsent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStoredConsent() === null) {
      startTransition(() => setVisible(true));
    }
  }, []);

  const accept = () => {
    setStoredConsent("granted");
    setVisible(false);
  };

  const decline = () => {
    setStoredConsent("denied");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 leading-relaxed">
            Nous utilisons des cookies de mesure d&apos;audience uniquement si vous les acceptez.
            Aucun cookie non essentiel n&apos;est déposé tant que vous n&apos;avez pas cliqué sur
            &laquo;&nbsp;Accepter&nbsp;&raquo;.{" "}
            <Link href="/legal/cookies" className="text-primary hover:underline font-medium">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
