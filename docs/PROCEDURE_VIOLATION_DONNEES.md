# Procédure en cas de violation de données — Baobab Loyalty

Document interne. First Digital Prod SARL (Baobab Loyalty). Dernière mise à jour : 29 septembre 2026.

Une violation de données, c'est toute perte, fuite, modification ou accès non autorisé à des données personnelles : base clients d'un hôtel consultée par un tiers, clé d'accès exposée, export envoyé à la mauvaise personne, messages WhatsApp partis vers les mauvais destinataires.

Cadre : loi ivoirienne n° 2013-450 (obligation de sécurité et de confidentialité ; la FAQ de l'ARTCI prévoit le signalement des violations). Engagement contractuel envers les hôtels : les prévenir dans les meilleurs délais (DPA, article 3), au plus tard 72 heures après la découverte.

---

## 1. Dans l'heure : contenir

- [ ] Noter l'heure de découverte, qui a découvert, ce qui a été constaté (captures d'écran).
- [ ] Couper l'accès en cause : révoquer la session ou le compte concerné, faire tourner la clé exposée (Supabase, Vercel, Meta, Moneroo, Resend, OpenRouter), désactiver la fonction fautive.
- [ ] Ne rien supprimer des journaux : ils servent à comprendre ce qui s'est passé.

## 2. Sous 24 heures : évaluer

- [ ] Quelles données ? (comptes hôteliers, clients d'hôtels, paiements)
- [ ] Combien de personnes et quels hôtels sont touchés ?
- [ ] Les données sont-elles sorties réellement (preuve dans les journaux Supabase / Vercel) ou seulement exposées ?
- [ ] Quel risque pour les personnes ? (numéros WhatsApp exposés = risque d'arnaque ; données de paiement = risque financier)

## 3. Sous 72 heures : informer

- [ ] **Chaque hôtel concerné** (responsable du traitement de ses clients) : email à l'adresse du compte, avec la nature de l'incident, les données touchées, le nombre de personnes, les mesures prises et ce que l'hôtel doit faire.
- [ ] **L'ARTCI** pour les traitements dont First Digital Prod SARL est responsable (comptes hôteliers, facturation) : signalement écrit avec les mêmes informations. Pour les clients des hôtels, aider chaque hôtel à faire son propre signalement.
- [ ] **Les personnes concernées** directement, si le risque est élevé (par exemple numéros et noms publiés).

## 4. Après l'incident

- [ ] Corriger la cause et tester la correction en conditions réelles.
- [ ] Consigner l'incident dans un registre des violations (date, faits, données, personnes, mesures, notifications faites).
- [ ] Mettre à jour cette procédure si une étape a manqué.

---

## Contacts

| Qui | Comment |
|-----|---------|
| Responsable (gérante) | legal@baobabloyalty.com — +225 05 74 85 11 23 |
| ARTCI | www.artci.ci — www.autoritedeprotection.ci |
| Supabase (hébergement base) | support via le tableau de bord Supabase |
| Meta (WhatsApp) | Business Support Home |
