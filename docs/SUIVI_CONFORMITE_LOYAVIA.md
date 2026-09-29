# Suivi de conformité RGPD — Loyavia (Europe)

Document de suivi interne. À mettre à jour à chaque étape. Dernière mise à jour : 29 septembre 2026.

Ce document garde la trace de trois choses : ce qui a été corrigé, ce qui attend un élément technique extérieur, et ce qui attend une validation juridique. **Aucune question juridique de fond n'a été tranchée** : elles sont listées en partie C, pour le futur juriste.

Documents liés : [registre des traitements](REGISTRE_TRAITEMENTS_EUROPE.md) · [procédure en cas de violation](PROCEDURE_VIOLATION_DONNEES_EUROPE.md).

Règle constante : chaque changement Loyavia passe par la région (`config.region === "europe"` côté site, `CONSENT_MODEL` / `APP_BRAND` côté serveur). Baobab Afrique n'est jamais modifié.

---

## A. Corrigé (code, base Europe, documentation)

### Passe du 29/09/2026 (commits 81dffd1, 9eaa79a et suivants, branche `fix/loyavia-conformite-rgpd`)

| Sujet | Ce qui a été fait | Où |
|---|---|---|
| Accord par canal au registre | Cases WhatsApp / e-mail / SMS ; date et origine (« registre ») posées par le serveur | `app/dashboard/registre/page.tsx`, `src/sdk/clients.ts` |
| Import CSV | Un client désinscrit ou ayant refusé un canal n'est jamais réinscrit par un import | `src/sdk/clients.ts` (`recordImportConsent`) |
| Mode « accord par canal » côté navigateur | La variable `NEXT_PUBLIC_CONSENT_MODEL` était absente du Vercel Europe : le mode suit maintenant la région | `src/sdk/clients.ts` (`getConsentModel`) |
| Liste Segments | Affiche l'accord WhatsApp réel ; « désinscrire / enregistrer l'accord » écrit une preuve par canal | `app/dashboard/segments/page.tsx` |
| STOP WhatsApp | Le STOP retire l'accord WhatsApp par canal (origine « whatsapp_stop ») ; webhook redéployé sur Europe | `supabase/functions/whatsapp-webhook/index.ts` |
| Preuve d'acceptation CGU/CGV/DPA | Tables + fonction ; seules les versions publiées côté serveur sont acceptables ; **rien d'activé** | `supabase/migrations-europe/016_legal_terms_acceptance_europe.sql` (appliquée en base Europe) |
| Registre des sous-traitants | Vercel et OpenRouter ajoutés, Resend corrigé, garanties de transfert renseignées | `supabase/migrations-europe/017_subprocessors_registry_update.sql` (appliquée) |
| Affirmations du site | « Rejoignez les hôteliers », « 2 minutes », « résultats dès la première campagne », fausse entité / siège / FCFA retirés ; blog Afrique masqué ; sitemap Europe nettoyé | pages publiques, `src/lib/region-copy.ts` |
| Promesse de délai | « Une fois votre WhatsApp connecté, préparez et envoyez une campagne en 10 minutes » | idem |
| Fiche de police | Le registre rappelle la fiche individuelle de police (clients étrangers) et interdit les données d'identité | `app/dashboard/registre/page.tsx` |
| Données envoyées à l'IA | Vérifié : jamais de données de client final | voir registre des traitements, B5 |
| Documentation | Registre des traitements (art. 30), procédure de violation (art. 33-34) | `docs/` |
| Tests réels | 22/22 (acceptation + accords) | `scripts/regression-tests/europe-legal-terms-and-consent.mjs` |

### Deuxième passe (demande du 29/09/2026, suite du bilan)

| Sujet | Ce qui a été fait | Où |
|---|---|---|
| PostHog dans les pages légales | Présenté comme **non activé** (aucune clé sur le projet Vercel Europe) : confidentialité, cookies, DPA | `app/legal/confidentialite`, `app/legal/cookies`, `app/legal/dpa` (parties Europe uniquement) |
| Supabase et transferts | Décrit tel qu'il est : données à Francfort ; accès techniques depuis les États-Unis encadrés par les clauses contractuelles types du DPA Supabase ; **non certifié Data Privacy Framework** ; analyse d'impact fournie par Supabase ; acceptation formelle du DPA **pas encore finalisée** | confidentialité et DPA Europe |
| Origine et date de l'accord par canal | Décrites dans le DPA Europe (« Traçabilité des accords de communication ») ; catégories de données et opérations complétées | `app/legal/dpa` |
| Clause d'acceptation électronique du DPA | Rédigée mais **masquée** : interrupteur `config.legal.dpaElectronicAcceptanceEurope = false`. La personne habilitée à accepter reste un champ « à valider juridiquement » | `app/legal/dpa`, `config.js` |
| Rappel IA | Sous les champs envoyés à l'IA (avantage, sujet LinkedIn de la page Templates) : « n'y écrivez jamais le nom ni les coordonnées d'un client » | `app/dashboard/templates/page.tsx` |
| Pré-résolution PostHog | Retirée sur Loyavia (outil non utilisé) | `app/layout.tsx` |
| Test STOP complet | Écrit et lancé : 3/3 vérifications non signées OK ; les 2 vérifications signées attendent le secret Meta (voir B1) | `scripts/regression-tests/europe-whatsapp-stop.mjs` |

---

## B. En attente d'un élément technique extérieur (pas de juriste nécessaire)

| # | Sujet | Ce qui bloque | Ce qu'il faudra faire |
|---|---|---|---|
| B1 | Test STOP WhatsApp signé | Aucune application Meta Europe ; le Vault Europe ne contient ni `META_APP_SECRET` ni `WHATSAPP_WEBHOOK_VERIFY_TOKEN` : **le webhook Europe ne peut traiter aucun message aujourd'hui** | Créer l'app Meta Europe, mettre le secret dans le Vault Europe et dans `.env.europe.local`, relancer `node scripts/regression-tests/europe-whatsapp-stop.mjs` |
| B2 | Mise en ligne sur loyavia.com | Push sur `main` en attente du GO de l'utilisatrice (redéploie aussi Baobab) | Rebuild des deux régions, push, vérifier les deux déploiements Vercel |
| B3 | Aperçus Vercel Baobab | Les clés Supabase d'aperçu du projet baobab-loyalty sont limitées à la branche `dev` : tout aperçu d'une autre branche échoue | Choix de l'utilisatrice : étendre ces variables aux aperçus de toutes les branches, ou continuer à vérifier Baobab par build local |
| B4 | Bandeau cookies Europe | Il demande un accord alors qu'aucun outil d'analyse n'est configuré | À revoir au moment où l'on décide d'activer (ou non) la mesure d'audience |
| B5 | IA en Europe | `OPENROUTER_API_KEY` absent du Vault Europe : la génération IA ne fonctionne pas en Europe | Dépend de la décision C4 |
| B6 | Mise à jour de l'interface IA LinkedIn | La page `app/dashboard/linkedin/page.tsx` fait partie des 8 fichiers gelés (chantier tiering) : rappel IA non ajouté | À faire à la reprise du chantier tiering |

## C. À valider juridiquement (aucune décision prise)

| # | Question | État actuel |
|---|---|---|
| C1 | **Soft opt-in** : peut-on écrire aux anciens clients d'un hôtel sans accord explicite (exception « produits ou services analogues ») ? | Non tranché. Le code n'envoie qu'aux clients ayant un accord enregistré sur le canal |
| C2 | **DPO** : désignation obligatoire ou non (art. 37) | La politique de confidentialité indique « aucun DPO désigné à ce stade » (texte antérieur, non modifié) |
| C3 | **Durées de conservation** (comptes, preuves d'acceptation, demandes RGPD, registre des violations, facturation) | Champs « à fixer » dans le registre des traitements ; les durées déjà écrites dans la politique de confidentialité (3 ans, 12 mois) n'ont pas été modifiées et restent à confirmer |
| C4 | **OpenRouter** : utilisable sans DPA signé ? Offre Enterprise, routage UE, ou fournisseur UE (Mistral via l'AI Gateway) ? | IA inactive en Europe ; pages légales décrivent la situation réelle |
| C5 | **Personne habilitée à accepter le DPA** au nom de l'hôtel, et valeur probante de l'acceptation électronique (art. 28.9) | Clause rédigée et masquée ; champ explicitement « à valider » |
| C6 | **Entité juridique, autorité chef de file, droit applicable, TVA** | Placeholders dans les pages légales et la procédure de violation |
| C7 | **Acceptation formelle des DPA** Supabase, Vercel, Resend (et conservation de l'analyse d'impact Supabase) | Non finalisée ; `dpa_signed = false` dans `subprocessors_registry` |
| C8 | **Fiche de police** : référence CESEDA (art. R. 814-1 et suivants) et durée de conservation, pays par pays | Rappel affiché au registre, à confirmer |
| C9 | Texte d'introduction actuel du DPA (« s'applique automatiquement à tout compte ») | Conservé tel quel tant que C5 n'est pas validé |

## D. Activer l'acceptation des CGU/CGV/DPA (après validation C5 et C6)

1. Insérer la version validée dans `legal_document_versions` (service role), avec `is_active = true`.
2. Mettre la même version dans `config.legal` pour l'Europe et passer `requireTermsAcceptance` à `true` pour l'Europe.
3. Passer `config.legal.dpaElectronicAcceptanceEurope` à `true` (et remplacer le champ « personne habilitée » par le texte validé).
4. Relancer `scripts/regression-tests/europe-legal-terms-and-consent.mjs`, puis vérifier la fenêtre sur un compte jetable.
