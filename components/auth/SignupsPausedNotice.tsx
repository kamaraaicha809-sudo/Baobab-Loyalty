export default function SignupsPausedNotice() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">
        Inscriptions en pause
      </h1>
      <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
        Nous sommes actuellement en phase de test avec nos premiers hôtels bêta et
        finalisons quelques réglages avant d&apos;ouvrir plus largement. Les nouvelles
        inscriptions reprendront très prochainement.
      </p>
    </div>
  );
}
