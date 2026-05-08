import Link from "next/link";
import config from "@/config";

const Footer = () => {
  return (
    <footer className="py-12 bg-[#FDFDF9] border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#2C2C2C] flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">B</span>
          </div>
          <span className="font-display text-xl font-semibold text-[#2C2C2C]">{config.appName}</span>
        </Link>
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} {config.appName}. Tous droits réservés.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 mb-1">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Marchés</span>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/cote-divoire" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Côte d'Ivoire
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/senegal" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Sénégal
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/cameroun" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Cameroun
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/ghana" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Ghana
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 mb-1">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Produit</span>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/fonctionnalites" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Fonctionnalités
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/tarifs" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Tarifs
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/comment-ca-marche" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Comment ça marche
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/blog" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Blog
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3">
          <Link href="/legal/mentions-legales" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Mentions légales
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/legal/cgu" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            CGU
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/legal/confidentialite" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Confidentialité
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/legal/cookies" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Cookies
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/legal/cgv" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            CGV
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
