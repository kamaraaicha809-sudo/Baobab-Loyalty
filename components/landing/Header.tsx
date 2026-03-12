"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import config from "@/config";
import { isDemoMode } from "@/src/lib/demo";

const navLinks = [
  { href: "/#solution", label: "Solution" },
  { href: "/#benefices", label: "Bénéfices" },
  { href: "/#tarifs", label: "Tarifs" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      const demoLoggedIn = typeof window !== "undefined" && sessionStorage.getItem("demo_logged_in") === "1";
      setIsLoggedIn(demoLoggedIn);
      setIsLoading(false);
      return;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      setIsLoading(false);
      return;
    }
    const checkAuth = async () => {
      try {
        const { createClient } = await import("@/libs/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" aria-label="Navigation">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#2C2C2C] flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">B</span>
          </div>
          <span className="font-display text-xl font-semibold text-[#2C2C2C]">{config.appName}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#2C2C2C] hover:text-[#555] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          {!isLoading && (
            isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-lg bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#444] transition-colors"
              >
                Mon compte
              </Link>
            ) : (
              <Link
                href="/signin"
                className="px-5 py-2.5 rounded-lg border border-[#2C2C2C] text-[#2C2C2C] text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Connexion
              </Link>
            )
          )}
        </div>

        <button
          className="md:hidden p-2 text-[#2C2C2C]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 text-[#2C2C2C] font-medium" onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/signin" className="block py-2" onClick={() => setIsMenuOpen(false)}>
            <span className="inline-block px-5 py-2.5 rounded-lg border border-[#2C2C2C] text-[#2C2C2C] text-sm font-medium">
              Connexion
            </span>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
