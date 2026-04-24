"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import Logo from "@/components/common/Logo";
import config from "@/config";

type Step = "email" | "code";

export default function BetaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim() });
    if (err) {
      setError("Impossible d'envoyer le code. Vérifiez votre adresse email.");
    } else {
      setStep("code");
    }
    setLoading(false);
  }

  async function verifyCode(code: string) {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "email",
    });
    if (err) {
      setError("Code incorrect ou expiré.");
      setShake(true);
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        setShake(false);
        inputs.current[0]?.focus();
      }, 500);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  }

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "") && index === 5) {
      verifyCode(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputs.current[5]?.focus();
      verifyCode(pasted);
    }
    e.preventDefault();
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light mb-4 p-3">
            <Logo size={36} variant="white" />
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase mt-2">
            {config.appName}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-2xl">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
              ACCÈS BÊTA PRIVÉ
            </span>
          </div>

          {step === "email" ? (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-2">
                Accédez à la bêta
              </h1>
              <p className="text-slate-500 text-center text-sm mb-8">
                Entrez votre adresse email pour recevoir votre code d&apos;accès à 6 chiffres.
              </p>

              <form onSubmit={sendCode} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 text-sm outline-none focus:border-primary transition-all"
                />
                {error && (
                  <p className="text-sm text-red-500 font-medium text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-60"
                >
                  {loading ? "Envoi en cours..." : "Recevoir mon code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-2">
                Vérifiez votre email
              </h1>
              <p className="text-slate-500 text-center text-sm mb-8">
                Un code à 6 chiffres a été envoyé à{" "}
                <span className="font-semibold text-slate-700">{email}</span>
              </p>

              <div
                className={`flex gap-3 justify-center mb-6 ${shake ? "[animation:shake_0.4s_ease-in-out]" : ""}`}
              >
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                    className={`w-11 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all disabled:opacity-50
                      ${error
                        ? "border-red-400 bg-red-50 text-red-600"
                        : digit
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 text-slate-900 focus:border-primary"
                      }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-sm text-red-500 font-medium mb-4">{error}</p>
              )}

              {loading && (
                <p className="text-center text-sm text-slate-400 mb-4">Vérification...</p>
              )}

              <button
                onClick={() => { setStep("email"); setDigits(["", "", "", "", "", ""]); setError(""); }}
                className="w-full text-center text-xs text-slate-400 hover:text-primary transition-colors"
              >
                Changer d&apos;adresse email
              </button>
            </>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Cette page est réservée aux bêta testeurs invités.
        </p>
      </div>
    </main>
  );
}
