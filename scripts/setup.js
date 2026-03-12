#!/usr/bin/env node

/**
 * Kodefast Setup Script
 *
 * Script interactif pour configurer le template.
 * Usage: npm run setup
 *
 * Phases :
 *  1. npm install (si nécessaire)
 *  2. Informations du projet (nom, description, couleur, prototype)
 *  3. Configuration technique (domaine, email support, mode démo)
 *  4. Configuration Supabase (saisie manuelle des clés)
 *  5. Résumé, confirmation et écriture des fichiers
 */

const { execSync } = require("child_process");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// ─── Couleurs ANSI ───────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

// ─── Constantes ──────────────────────────────────────────────────

const TOTAL_STEPS = 4;

const COLORS = [
  { name: "Violet", hex: "#848bf6" },
  { name: "Vert",   hex: "#10b981" },
  { name: "Orange", hex: "#f59e0b" },
  { name: "Bleu",   hex: "#3b82f6" },
  { name: "Rose",   hex: "#ec4899" },
  { name: "Indigo", hex: "#6366f1" },
];

// ─── Readline ────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// ─── Helpers UI ──────────────────────────────────────────────────

const icon = {
  ok: `${c.green}✓${c.reset}`,
  skip: `${c.yellow}○${c.reset}`,
  err: `${c.red}✗${c.reset}`,
  info: `${c.cyan}ℹ${c.reset}`,
};

function log(msg, type = "info") {
  console.log(`${icon[type] || icon.info} ${msg}`);
}

function step(n) {
  return `${c.dim}Étape ${n}/${TOTAL_STEPS}${c.reset}`;
}

function section(title, emoji) {
  console.log(`\n${c.bold}${c.magenta}${emoji}  ${title}${c.reset}`);
  console.log(`${c.dim}${"─".repeat(50)}${c.reset}\n`);
}

function progress(n) {
  const pct = Math.round((n / TOTAL_STEPS) * 100);
  const filled = Math.round((pct / 100) * 30);
  return `[${c.green}${"█".repeat(filled)}${c.dim}${"░".repeat(30 - filled)}${c.reset}] ${pct}%`;
}

function colorPreview(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const [r, g, b] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((x) => parseInt(x, 16));
  return `\x1b[48;2;${r};${g};${b}m   ${c.reset} ${hex}`;
}

function spinner(message) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const cols = process.stdout.columns || 80;
  const id = setInterval(() => {
    const line = `${c.cyan}${frames[i]}${c.reset} ${message}`;
    process.stdout.write(`\r${line}${"".padEnd(cols - message.length - 4)}`);
    i = (i + 1) % frames.length;
  }, 80);
  return {
    done(msg) {
      clearInterval(id);
      const final = `${icon.ok} ${msg || message}`;
      process.stdout.write(`\r${final}${"".padEnd(cols - (msg || message).length - 4)}\n`);
    },
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Prompts ─────────────────────────────────────────────────────

function ask(question, def = "", validator = null, hint = "") {
  const defTxt = def ? ` ${c.dim}(${def})${c.reset}` : "";
  const hintTxt = hint ? `\n${c.dim}   💡 ${hint}${c.reset}` : "";
  return new Promise((resolve) => {
    const go = () => {
      rl.question(`${c.cyan}→${c.reset} ${question}${defTxt}${hintTxt}: `, (answer) => {
        const val = answer.trim() || def;
        if (validator) {
          const result = validator(val);
          if (!result.ok) {
            console.log(`${icon.err} ${result.msg}`);
            return go();
          }
        }
        resolve(val);
      });
    };
    go();
  });
}

function askYesNo(question, def = "y") {
  const label = def === "y" ? "(Y/n)" : "(y/N)";
  return new Promise((resolve) => {
    rl.question(`${c.cyan}→${c.reset} ${question} ${label}: `, (answer) => {
      const val = answer.trim().toLowerCase() || def;
      resolve(val === "y" || val === "yes");
    });
  });
}

async function askSkippable(question, def = "", validator = null, hint = "") {
  const fullHint = (hint ? hint + " | " : "") + "Tapez 'skip' pour passer";
  const val = await ask(question, def, null, fullHint);
  if (val.toLowerCase() === "skip" || val.toLowerCase() === "s") return null;
  if (validator) {
    const result = validator(val);
    if (!result.ok) {
      console.log(`${icon.err} ${result.msg}`);
      return askSkippable(question, def, validator, hint);
    }
  }
  return val;
}

// ─── Validators ──────────────────────────────────────────────────

const validate = {
  hex: (val) =>
    /^#[0-9a-fA-F]{6}$/i.test(val)
      ? { ok: true }
      : { ok: false, msg: "Format #RRGGBB attendu (ex: #848bf6)" },
  email: (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      ? { ok: true }
      : { ok: false, msg: "Format d'email invalide" },
  domain: (val) =>
    /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(val)
      ? { ok: true }
      : { ok: false, msg: "Domaine invalide (ex: example.com)" },
  github: (val) =>
    !val || /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i.test(val)
      ? { ok: true }
      : { ok: false, msg: "URL Github invalide (ex: https://github.com/user/repo)" },
  sbUrl: (val) =>
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(val)
      ? { ok: true }
      : { ok: false, msg: "Format: https://xxx.supabase.co" },
  sbKey: (val) =>
    val.startsWith("eyJ") && val.split(".").length === 3
      ? { ok: true }
      : { ok: false, msg: "JWT invalide (doit commencer par eyJ)" },
};

// ─── Utilitaires ─────────────────────────────────────────────────

function adjustColor(hex, amount) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  return (
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.max(0, Math.min(255, parseInt(hex.slice(i, i + 2), 16) + amount))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}


// ─── Générateurs de fichiers ─────────────────────────────────────

function buildEnv(cfg) {
  const examplePath = path.join(process.cwd(), ".env.example");

  let content;
  if (fs.existsSync(examplePath)) {
    content = fs.readFileSync(examplePath, "utf8");
  } else {
    content = `# Kodefast — Variables d'environnement
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SITE_URL=https://example.com
`;
  }

  content = content.replace(/NEXT_PUBLIC_DEMO_MODE=.*/, `NEXT_PUBLIC_DEMO_MODE=${cfg.technical.isDemoEnabled}`);
  content = content.replace(/NEXT_PUBLIC_SUPABASE_URL=.*/, `NEXT_PUBLIC_SUPABASE_URL=${cfg.supabase.url || ""}`);
  content = content.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${cfg.supabase.anonKey || ""}`);

  if (/^# ?SITE_URL=/m.test(content)) {
    content = content.replace(/^# ?SITE_URL=.*/m, `SITE_URL=https://${cfg.technical.domainName}`);
  } else {
    content = content.replace(/SITE_URL=.*/, `SITE_URL=https://${cfg.technical.domainName}`);
  }

  return content;
}

function buildVaultDoc() {
  return `# Secrets Supabase Vault

Ajoutez ces secrets dans **Dashboard Supabase > Settings > Vault**.

---

## Requis

| Secret | Description | Obtention |
|--------|-------------|-----------|
| \`SUPABASE_SERVICE_ROLE_KEY\` | Clé admin pour Edge Functions | Dashboard > Settings > API → service_role |

> ⚠️ Ne jamais exposer cette clé côté client.

---

## Optionnels (à ajouter selon vos besoins)

| Secret | Service | Format | Description |
|--------|---------|--------|-------------|
| \`STRIPE_SECRET_KEY\` | Stripe | \`sk_test_...\` / \`sk_live_...\` | Clé secrète pour les paiements |
| \`STRIPE_WEBHOOK_SECRET\` | Stripe | \`whsec_...\` | Signature des webhooks Stripe |
| \`RESEND_API_KEY\` | Resend | \`re_...\` | Envoi d'emails transactionnels |
| \`OPENROUTER_API_KEY\` | OpenRouter | \`sk-or-...\` | Accès aux modèles IA |

Consultez **docs/DEPLOYMENT.md** pour les instructions détaillées de chaque service.
`;
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.clear();
  console.log(`
${c.bold}${c.cyan}
╔═══════════════════════════════════════════════════╗
║                                                   ║
║            🚀  KODEFAST SETUP                     ║
║                                                   ║
║     Configuration rapide de votre Micro SaaS      ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
${c.reset}
${c.dim}Appuyez sur Entrée pour garder la valeur par défaut.${c.reset}
`);

  // ── npm install si nécessaire ──────────────────────────────────

  const nodeModulesPath = path.join(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    log("node_modules introuvable — installation des dépendances…", "info");
    const s = spinner("npm install en cours…");
    try {
      execSync("npm install", { cwd: process.cwd(), stdio: "pipe" });
      s.done("Dépendances installées");
    } catch (err) {
      s.done("Erreur lors de npm install");
      console.log(`${c.red}Lancez manuellement : npm install${c.reset}`);
    }
    console.log();
  }

  const cfg = { project: {}, technical: {}, supabase: { mode: "skipped" } };

  // ── Phase 1 : Projet ───────────────────────────────────────────

  section("INFORMATIONS DU PROJET", "📋");
  console.log(step(1));

  cfg.project.appName = await ask(
    "Nom de votre application",
    "Mon Micro SaaS",
    null,
    "Affiché dans le header, footer et emails"
  );

  cfg.project.appDescription = await ask(
    "Description courte (SEO)",
    "Une application moderne pour...",
    null,
    "Balises meta et homepage"
  );

  console.log(`\n${c.bold}Couleurs suggérées :${c.reset}`);
  COLORS.forEach((col, i) => console.log(`  ${i + 1}. ${colorPreview(col.hex)} ${col.name}`));
  console.log();

  cfg.project.mainColor = await ask("Couleur principale (hex)", "#848bf6", validate.hex, "#RRGGBB");
  console.log(`   ${colorPreview(cfg.project.mainColor)} Aperçu\n`);
  cfg.project.darkColor = adjustColor(cfg.project.mainColor, -30);
  cfg.project.lightColor = adjustColor(cfg.project.mainColor, 40);

  console.log(`${c.dim}💡 Lien vers un repo Github de référence pour le design / la logique souhaitée.${c.reset}`);
  cfg.project.githubUrl =
    (await askSkippable("Prototype Github (optionnel)", "", validate.github, "https://github.com/user/repo")) || "";

  // ── Phase 2 : Technique ────────────────────────────────────────

  section("CONFIGURATION TECHNIQUE", "⚙️");
  console.log(step(2));

  cfg.technical.domainName = await ask("Domaine de production", "example.com", validate.domain, "Sans https://");
  cfg.technical.supportEmail = await ask("Email de support", `support@${cfg.technical.domainName}`, validate.email);
  cfg.technical.isDemoEnabled = await askYesNo("Activer le mode démo ?", "y");

  // ── Phase 3 : Supabase ─────────────────────────────────────────

  section("CONFIGURATION SUPABASE", "🗄️");
  console.log(step(3));

  console.log(`${c.dim}💡 Si vous avez configuré MCP Supabase dans Cursor, vous pourrez demander${c.reset}`);
  console.log(`${c.dim}   à Cursor de finaliser la configuration automatiquement après le setup.${c.reset}\n`);

  const url = await askSkippable("URL du projet Supabase", "", validate.sbUrl, "https://xxx.supabase.co");
  if (url) {
    cfg.supabase.url = url;
    cfg.supabase.anonKey =
      (await askSkippable("Clé publique (anon key)", "", validate.sbKey, "JWT commençant par eyJ")) || "";
    cfg.supabase.mode = cfg.supabase.anonKey ? "manual" : "skipped";
  } else {
    cfg.supabase.mode = "skipped";
    log("Configuration Supabase ignorée — configurable plus tard via Cursor + MCP.", "skip");
  }

  // ── Phase 4 : Résumé & confirmation ────────────────────────────

  section("RÉSUMÉ", "📝");
  console.log(step(4));

  console.log(`${c.bold}Projet${c.reset}`);
  console.log(`  ${icon.ok} Nom : ${cfg.project.appName}`);
  console.log(
    `  ${icon.ok} Description : ${cfg.project.appDescription.slice(0, 55)}${cfg.project.appDescription.length > 55 ? "…" : ""}`
  );
  console.log(
    `  ${icon.ok} Couleur : ${cfg.project.mainColor}  (dark: ${cfg.project.darkColor}, light: ${cfg.project.lightColor})`
  );
  console.log(`  ${cfg.project.githubUrl ? icon.ok : icon.skip} Prototype : ${cfg.project.githubUrl || "Non fourni"}`);

  console.log(`\n${c.bold}Technique${c.reset}`);
  console.log(`  ${icon.ok} Domaine : ${cfg.technical.domainName}`);
  console.log(`  ${icon.ok} Support : ${cfg.technical.supportEmail}`);
  console.log(`  ${icon.ok} Mode démo : ${cfg.technical.isDemoEnabled ? "Oui" : "Non"}`);

  console.log(`\n${c.bold}Supabase${c.reset}`);
  if (cfg.supabase.mode === "manual") {
    console.log(`  ${icon.ok} ${c.green}Configuré${c.reset} — ${cfg.supabase.url}`);
  } else {
    console.log(`  ${icon.skip} ${c.dim}Ignoré (à configurer via Cursor + MCP)${c.reset}`);
  }

  console.log(`\n${progress(4)}`);

  if (!(await askYesNo("\nAppliquer cette configuration ?", "y"))) {
    log("Configuration annulée.", "skip");
    rl.close();
    return;
  }

  // ── Écriture des fichiers ──────────────────────────────────────

  section("APPLICATION", "⚡");

  const root = process.cwd();
  const files = {
    env: path.join(root, ".env.local"),
    config: path.join(root, "config.js"),
    proto: path.join(root, "prototype.json"),
    vault: path.join(root, "SUPABASE_VAULT_SECRETS.md"),
  };

  // .env.local
  let s = spinner("Création de .env.local");
  await sleep(200);
  fs.writeFileSync(files.env, buildEnv(cfg));
  s.done(".env.local créé");

  // config.js
  s = spinner("Mise à jour de config.js");
  await sleep(200);
  let cfgJs = fs.readFileSync(files.config, "utf8");
  const replacements = {
    'appName: ".*"': `appName: "${cfg.project.appName}"`,
    'appDescription: ".*"': `appDescription: "${cfg.project.appDescription.replace(/"/g, '\\"')}"`,
    'domainName: ".*"': `domainName: "${cfg.technical.domainName}"`,
    'main: "#[0-9a-fA-F]{6}"': `main: "${cfg.project.mainColor}"`,
    'dark: "#[0-9a-fA-F]{6}"': `dark: "${cfg.project.darkColor}"`,
    'light: "#[0-9a-fA-F]{6}"': `light: "${cfg.project.lightColor}"`,
    'supportEmail: ".*"': `supportEmail: "${cfg.technical.supportEmail}"`,
    "fromNoReply: `.*`": `fromNoReply: \`${cfg.project.appName} <noreply@${cfg.technical.domainName}>\``,
    "fromAdmin: `.*`": `fromAdmin: \`Support ${cfg.project.appName} <support@${cfg.technical.domainName}>\``,
  };
  for (const [pattern, replacement] of Object.entries(replacements)) {
    cfgJs = cfgJs.replace(new RegExp(pattern), replacement);
  }
  fs.writeFileSync(files.config, cfgJs);
  s.done("config.js mis à jour");

  // prototype.json
  s = spinner("Création de prototype.json");
  await sleep(150);
  fs.writeFileSync(
    files.proto,
    JSON.stringify(
      {
        githubUrl: cfg.project.githubUrl || null,
        appName: cfg.project.appName,
        createdAt: new Date().toISOString(),
        notes: cfg.project.githubUrl
          ? "Prototype de référence pour la logique et le design"
          : "Aucun prototype fourni",
      },
      null,
      2
    )
  );
  s.done("prototype.json créé");

  // SUPABASE_VAULT_SECRETS.md
  s = spinner("Création de SUPABASE_VAULT_SECRETS.md");
  await sleep(150);
  fs.writeFileSync(files.vault, buildVaultDoc());
  s.done("SUPABASE_VAULT_SECRETS.md créé");

  // ── Message final ──────────────────────────────────────────────

  const createdFiles = [".env.local", "config.js", "prototype.json", "SUPABASE_VAULT_SECRETS.md"];
  let n = 1;

  console.log(`
${c.green}${c.bold}
╔═══════════════════════════════════════════════════╗
║                                                   ║
║         ✓  CONFIGURATION TERMINÉE                 ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
${c.reset}

${c.bold}${c.cyan}Fichiers créés/modifiés :${c.reset}
${createdFiles.map((f) => `  ${icon.ok} ${f}`).join("\n")}

${c.bold}${c.cyan}Prochaines étapes :${c.reset}

${c.bold}${n++}.${c.reset} ${c.cyan}Lancer le dev :${c.reset}
   ${c.dim}npm run dev${c.reset}
${cfg.supabase.mode === "skipped" ? `
${c.bold}${n++}.${c.reset} ${c.cyan}Configurer Supabase via Cursor + MCP :${c.reset}
   ${c.dim}Demandez à Cursor : "Configure mon projet Supabase, applique les${c.reset}
   ${c.dim}migrations et déploie les Edge Functions"${c.reset}
` : `
${c.bold}${n++}.${c.reset} ${c.cyan}Finaliser Supabase via Cursor + MCP :${c.reset}
   ${c.dim}Demandez à Cursor : "Applique les migrations SQL et déploie${c.reset}
   ${c.dim}les Edge Functions de mon projet Supabase"${c.reset}
`}
${c.bold}${n++}.${c.reset} ${c.cyan}Secrets Supabase Vault :${c.reset}
   ${c.dim}Consultez SUPABASE_VAULT_SECRETS.md${c.reset}
${cfg.project.githubUrl ? `
${c.bold}${n++}.${c.reset} ${c.cyan}Prototype :${c.reset}
   ${c.dim}${cfg.project.githubUrl}${c.reset}
` : ""}
${c.bold}${n++}.${c.reset} ${c.cyan}Documentation :${c.reset}
   ${c.dim}docs/DEPLOYMENT.md · docs/SUPABASE.md · docs/CURSOR_INSTRUCTIONS.md${c.reset}

${c.bold}Bonne chance avec votre Micro SaaS ! 🚀${c.reset}
`);

  rl.close();
}

main().catch((err) => {
  console.error(`\n${icon.err} ${err.message}`);
  rl.close();
  process.exit(1);
});
