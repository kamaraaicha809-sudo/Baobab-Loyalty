import Link from "next/link";
import Image from "next/image";
import config from "@/config";

const Footer = () => {
  return (
    <footer className="py-12 bg-[#FDFDF9] border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <Image
            src="/brand/baobab-tree.png"
            alt={config.appName}
            width={775}
            height={575}
            className="h-9 w-auto"
          />
          <span className="font-display text-xl font-semibold text-[#2C2C2C]">{config.appName}</span>
        </Link>
        {(config.social?.facebook || config.social?.instagram) && (
          <div className="flex items-center justify-center gap-4 mb-4">
            {config.social?.facebook && (
              <a
                href={config.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${config.appName} sur Facebook`}
                className="text-slate-400 hover:text-[#1a2f2a] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.877h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
                </svg>
              </a>
            )}
            {config.social?.instagram && (
              <a
                href={config.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${config.appName} sur Instagram`}
                className="text-slate-400 hover:text-[#1a2f2a] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.256 1.216.6 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.01 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.898 4.898 0 0 1 1.153-1.772A4.89 4.89 0 0 1 5.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.01 9.283 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.25a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5ZM17.5 5.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
                </svg>
              </a>
            )}
          </div>
        )}
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} {config.appName}. Tous droits réservés.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 mb-1">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Marchés</span>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/cote-divoire" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Côte d&apos;Ivoire
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
          <Link href="/logiciel-fidelisation-hotel" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Logiciel de fidélisation
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/blog" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Blog
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 mb-1">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Entreprise</span>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/a-propos" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            À propos
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/contact" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Contact
          </Link>
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/presse" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            Presse
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
          <span className="text-slate-300 text-xs">·</span>
          <Link href="/legal/dpa" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">
            DPA
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
