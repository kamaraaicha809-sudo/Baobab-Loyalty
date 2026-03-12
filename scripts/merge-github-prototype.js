#!/usr/bin/env node
/**
 * Fusionne un projet GitHub (prototype) dans le dossier Baobab Loyalty.
 * 
 * 1. Mettez à jour prototype.json avec l'URL GitHub réelle :
 *    "githubUrl": "https://github.com/username/nom-du-repo"
 * 
 * 2. Exécutez : node scripts/merge-github-prototype.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const prototypePath = path.join(__dirname, "../prototype.json");
const projectRoot = path.join(__dirname, "..");

function main() {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(prototypePath, "utf8"));
  } catch {
    console.error("❌ prototype.json introuvable ou invalide");
    process.exit(1);
  }

  const url = config.githubUrl?.trim();
  if (!url || url.includes("github.com/user/repo")) {
    console.log("📋 Pour fusionner un prototype GitHub :");
    console.log("   1. Ouvrez prototype.json");
    console.log("   2. Remplacez githubUrl par l'URL réelle (ex: https://github.com/user/baobab-prototype)");
    console.log("   3. Relancez : node scripts/merge-github-prototype.js");
    console.log("");
    console.log("   Votre projet Baobab Loyalty est déjà dans :", projectRoot);
    process.exit(0);
  }

  // Extraire owner/repo de l'URL
  const match = url.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!match) {
    console.error("❌ URL GitHub invalide:", url);
    process.exit(1);
  }
  const [, owner, repo] = match;

  console.log("📥 Téléchargement du prototype depuis", url);
  console.log("   (Git requis - exécutez manuellement si besoin :)");
  console.log("");
  console.log("   git clone", url, "temp-prototype");
  console.log("   xcopy /E /I /Y temp-prototype\\* .");
  console.log("   rmdir /S /Q temp-prototype");
  console.log("");
  console.log("   Ou sur macOS/Linux :");
  console.log("   git clone", url, "temp-prototype && cp -r temp-prototype/* . && rm -rf temp-prototype");
}

main();
