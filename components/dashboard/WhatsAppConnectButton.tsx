"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import config from "@/config";
import { whatsapp } from "@/src/sdk/whatsapp";
import { isDemoMode } from "@/src/lib/demo";

interface Props {
  initialConnected: boolean;
  initialPhone?: string;
  onStatusChange?: (connected: boolean) => void;
}

declare global {
  interface Window {
    FB: {
      init: (params: object) => void;
      login: (callback: (response: FacebookLoginResponse) => void, options: object) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface FacebookLoginResponse {
  status: string;
  authResponse?: {
    code?: string;
    accessToken?: string;
  };
}

interface EmbeddedSignupMessage {
  type: string;
  data?: {
    phone_number_id?: string;
    waba_id?: string;
  };
}

export default function WhatsAppConnectButton({ initialConnected, initialPhone, onStatusChange }: Props) {
  const [connected, setConnected] = useState(initialConnected);
  const [phone, setPhone] = useState(initialPhone || "");
  const [loading, setLoading] = useState(false);
  const [fbReady, setFbReady] = useState(false);
  const pendingDataRef = useRef<{ phone_number_id: string; waba_id: string } | null>(null);

  useEffect(() => {
    if (!config.whatsapp?.metaAppId) return;

    // Listen for Embedded Signup session info (phone_number_id + waba_id)
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("facebook.com")) return;
      try {
        const data: EmbeddedSignupMessage =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.data?.phone_number_id) {
          pendingDataRef.current = {
            phone_number_id: data.data.phone_number_id,
            waba_id: data.data.waba_id || "",
          };
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);

    // Load Facebook SDK
    if (!document.getElementById("facebook-jssdk")) {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: config.whatsapp?.metaAppId,
          autoLogAppEvents: true,
          xfbml: true,
          version: "v19.0",
        });
        setFbReady(true);
      };

      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if (window.FB) {
      setFbReady(true);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnect = () => {
    if (isDemoMode) {
      setLoading(true);
      setTimeout(() => {
        setConnected(true);
        setPhone("2250700000000");
        setLoading(false);
        onStatusChange?.(true);
        toast.success("WhatsApp connecté (démo)");
      }, 1200);
      return;
    }

    if (!config.whatsapp?.metaAppId) {
      toast.error("Configuration Meta App manquante — contactez le support Baobab Loyalty");
      return;
    }

    if (!fbReady) {
      toast.error("Chargement en cours, réessayez dans quelques secondes");
      return;
    }

    setLoading(true);
    pendingDataRef.current = null;

    window.FB.login(
      async (response: FacebookLoginResponse) => {
        if (response.status !== "connected" || !response.authResponse?.code) {
          setLoading(false);
          toast.error("Connexion annulée");
          return;
        }

        const code = response.authResponse.code;
        const extra = pendingDataRef.current;

        if (!extra?.phone_number_id) {
          setLoading(false);
          toast.error("Identifiants WhatsApp non reçus — réessayez");
          return;
        }

        try {
          await whatsapp.connect({
            code,
            phone_number_id: extra.phone_number_id,
            waba_id: extra.waba_id,
          });
          setConnected(true);
          setPhone(extra.phone_number_id);
          onStatusChange?.(true);
          toast.success("WhatsApp Business connecté");
        } catch {
          toast.error("Erreur lors de la connexion — réessayez");
        } finally {
          setLoading(false);
        }
      },
      {
        scope: "whatsapp_business_management,business_management",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "3",
        },
      },
    );
  };

  const handleDisconnect = async () => {
    if (isDemoMode) {
      setConnected(false);
      setPhone("");
      onStatusChange?.(false);
      toast.success("WhatsApp déconnecté (démo)");
      return;
    }

    setLoading(true);
    try {
      await whatsapp.disconnect();
      setConnected(false);
      setPhone("");
      onStatusChange?.(false);
      toast.success("WhatsApp déconnecté");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-50 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-800">
            {phone ? `+${phone.replace(/^\+/, "")}` : "Connecté"}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          )}
          Déconnecter
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )}
      {loading ? "Connexion en cours…" : isDemoMode ? "Simuler la connexion" : "Connecter WhatsApp"}
    </button>
  );
}
