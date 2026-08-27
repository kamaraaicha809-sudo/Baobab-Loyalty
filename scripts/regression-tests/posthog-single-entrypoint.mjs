// Garde-fou structurel : PostHog ne doit jamais pouvoir etre initialise
// (posthog.init) ailleurs que dans components/common/PostHogProvider.tsx, le
// seul endroit ou l'initialisation est correctement subordonnee au
// consentement (getStoredConsent() === "granted") et exclue de /dashboard et
// /admin (voir isRestrictedPath).
//
// Sans ce test, un futur import de "posthog-js" dans un autre composant (ex:
// une page qui voudrait tracker un evenement specifique) pourrait
// reintroduire un appel a posthog.init() ou posthog.capture() en dehors de ce
// controle de consentement, sans qu'aucune revue de code ne le detecte
// automatiquement.
//
// Ce test est un test STATIQUE (analyse de fichiers), pas un test contre la
// production : il ne necessite aucun secret ni compte de test.
//
// A relancer avant toute release touchant au tracking/analytics.
//
// Usage : node scripts/regression-tests/posthog-single-entrypoint.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeReporter } from "./_shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const { log, printAndExit } = makeReporter();

const SCAN_DIRS = ["app", "components", "src"];
const ALLOWED_FILE = path.join("components", "common", "PostHogProvider.tsx");
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git"]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry)) files.push(full);
  }
  return files;
}

try {
  const offenders = [];
  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(repoRoot, dir);
    try { statSync(dirPath); } catch { continue; }
    for (const file of walk(dirPath)) {
      const relative = path.relative(repoRoot, file);
      const content = readFileSync(file, "utf8");
      const importsPostHog = /from\s+["']posthog-js["']/.test(content);
      if (importsPostHog && relative !== ALLOWED_FILE) {
        offenders.push(relative);
      }
    }
  }

  log(
    "posthog-js n'est importe que dans PostHogProvider.tsx (point d'entree unique)",
    offenders.length === 0,
    offenders.length === 0
      ? "aucun autre fichier n'importe posthog-js"
      : `import(s) inattendu(s) detecte(s) dans : ${offenders.join(", ")} - ce code peut initialiser/tracker en dehors du controle de consentement`
  );
} catch (err) {
  log("ERREUR SCRIPT", false, err instanceof Error ? err.stack : String(err));
}

printAndExit();
