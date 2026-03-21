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
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link href="/tos" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Conditions d&apos;utilisation
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/privacy-policy" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
