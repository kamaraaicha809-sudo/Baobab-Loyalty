"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import config from "@/config";
import { billing } from "@/src/sdk";
import toast from "react-hot-toast";

const PLAN_SLUGS = ["starter", "pro", "premium"] as const;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading");

  useEffect(() => {
    const planSlug = searchParams.get("plan")?.toLowerCase();
    if (!planSlug || !PLAN_SLUGS.includes(planSlug as (typeof PLAN_SLUGS)[number])) {
      toast.error("Plan invalide");
      router.replace("/#tarifs");
      return;
    }

    const planIndex = PLAN_SLUGS.indexOf(planSlug as (typeof PLAN_SLUGS)[number]);
    const plan = config.stripe.plans[planIndex];
    if (!plan) {
      toast.error("Plan introuvable");
      router.replace("/#tarifs");
      return;
    }

    const runCheckout = async () => {
      try {
        setStatus("redirecting");
        const { url } = await billing.createCheckout({
          planSlug,
          amount: plan.price,
          planName: plan.name,
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/#tarifs`,
        });
        if (url) window.location.href = url;
      } catch (err) {
        setStatus("error");
        const msg = err instanceof Error ? err.message : "Erreur lors du paiement";
        if (msg.includes("reconnecter") || msg.includes("UNAUTHORIZED")) {
          router.push(`/signin?plan=${planSlug}&redirect=/checkout?plan=${planSlug}`);
        } else {
          toast.error(msg);
          router.replace("/#tarifs");
        }
      }
    };

    runCheckout();
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <p className="text-slate-600">Redirection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-slate-600 font-medium">
        {status === "redirecting" ? "Redirection vers le paiement..." : "Préparation du paiement..."}
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
