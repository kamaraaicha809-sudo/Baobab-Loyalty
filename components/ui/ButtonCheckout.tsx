"use client";

import { useState } from "react";
import { billing } from "@/src/sdk";
import toast from "react-hot-toast";

interface ButtonCheckoutProps {
  planSlug: string;
  amount: number;
  planName: string;
  extraStyle?: string;
  children?: React.ReactNode;
}

const ButtonCheckout = ({ planSlug, amount, planName, extraStyle = "", children }: ButtonCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { url } = await billing.createCheckout({
        planSlug,
        amount,
        planName,
        successUrl: `${window.location.origin}/dashboard`,
        cancelUrl: window.location.href,
      });
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={extraStyle || "w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all disabled:opacity-50"}
      onClick={handlePayment}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {children || "Choisir ce plan"}
        </span>
      )}
    </button>
  );
};

export default ButtonCheckout;
