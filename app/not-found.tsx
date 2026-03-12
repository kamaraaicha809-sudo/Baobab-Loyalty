import Link from "next/link";
import config from "@/config";

export default function Custom404() {
  return (
    <section className="bg-slate-50 text-slate-900 h-screen w-full flex flex-col justify-center gap-8 items-center p-10">
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-4xl">😅</span>
      </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Page introuvable
        </h1>
        
        <p className="text-slate-500 text-sm mb-8">
          Cette page n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
              className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
              clipRule="evenodd"
            />
          </svg>
            Accueil
        </Link>

          <a
            href={`mailto:${config.resend.supportEmail}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
            <path d="M3 4a2 2 0 00-2 2v1.161l8.447 4.224a1 1 0 001.106 0L19 7.162V6a2 2 0 00-2-2H3z" />
            <path d="M19 8.839l-7.757 3.879a3 3 0 01-3.486 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
          </svg>
          Support
        </a>
        </div>
      </div>
    </section>
  );
}
