import Link from "next/link";
import config from "@/config";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-slate-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C2C2C] flex items-center justify-center">
              <span className="text-white font-bold text-base">B</span>
            </div>
            <span className="font-semibold text-[#2C2C2C]">{config.appName}</span>
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-100 bg-[#FDFDF9] mt-16">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
            <Link href="/legal/mentions-legales" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">Mentions légales</Link>
            <span className="text-slate-300 text-xs">·</span>
            <Link href="/legal/cgu" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">CGU</Link>
            <span className="text-slate-300 text-xs">·</span>
            <Link href="/legal/confidentialite" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">Confidentialité</Link>
            <span className="text-slate-300 text-xs">·</span>
            <Link href="/legal/cookies" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">Cookies</Link>
            <span className="text-slate-300 text-xs">·</span>
            <Link href="/legal/cgv" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">CGV</Link>
          </div>
          <p className="text-slate-400 text-xs">© {new Date().getFullYear()} {config.appName}. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  );
}
