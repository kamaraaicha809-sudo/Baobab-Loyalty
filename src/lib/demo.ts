/**
 * Demo Mode Configuration
 * 
 * Permet de tester l'interface sans configurer Supabase.
 * Activez avec NEXT_PUBLIC_DEMO_MODE=true dans .env.local
 */

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Utilisateur fictif pour le mode démo
export const demoUser = {
  id: "demo-user-id",
  email: "directeur@hotel-baobab.sn",
  user_metadata: { 
    full_name: "Amadou Diallo",
    avatar_url: null,
  },
  aud: "authenticated",
  role: "authenticated",
  created_at: new Date().toISOString(),
};

// Profil fictif pour le mode démo (admin par défaut pour tester l'admin)
export const demoProfile = {
  id: "demo-user-id",
  email: "directeur@hotel-baobab.sn",
  full_name: "Amadou Diallo",
  customer_id: null,
  price_id: null,
  has_access: true,
  role: "admin",
  hotel_name: "Hôtel Le Baobab",
  config_complete: true,
  onboarding_completed: true,
  onboarding_step: 3,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ============================================
// DONNÉES FICTIVES — CLIENTS
// ============================================

export const demoClients = [
  { id: "c1", nom: "Moussa Diop", email: "moussa.diop@email.com", telephone: "+221 77 123 45 67", whatsapp: "+221771234567", derniere_visite: "2025-12-10", notes: "Client fidèle, préfère suite junior" },
  { id: "c2", nom: "Fatou Ndiaye", email: "fatou.ndiaye@email.com", telephone: "+221 78 234 56 78", whatsapp: "+221782345678", derniere_visite: "2025-11-05", notes: "Voyage en famille, 2 chambres" },
  { id: "c3", nom: "Omar Sy", email: "omar.sy@email.com", telephone: "+221 76 345 67 89", whatsapp: "+221763456789", derniere_visite: "2025-10-20", notes: "Séjour d'affaires régulier" },
  { id: "c4", nom: "Aminata Ba", email: "aminata.ba@email.com", telephone: "+221 77 456 78 90", whatsapp: "+221774567890", derniere_visite: "2025-09-15", notes: "Anniversaire en mars" },
  { id: "c5", nom: "Ibrahima Sow", email: "ibrahima.sow@email.com", telephone: "+221 78 567 89 01", whatsapp: "+221785678901", derniere_visite: "2025-08-22", notes: "Aime le restaurant de l'hôtel" },
  { id: "c6", nom: "Aissatou Fall", email: "aissatou.fall@email.com", telephone: "+221 76 678 90 12", whatsapp: "+221766789012", derniere_visite: "2025-07-10", notes: "Week-ends prolongés" },
  { id: "c7", nom: "Cheikh Mbaye", email: "cheikh.mbaye@email.com", telephone: "+221 77 789 01 23", whatsapp: "+221777890123", derniere_visite: "2025-06-01", notes: "Conférences et séminaires" },
  { id: "c8", nom: "Mariama Diouf", email: "mariama.diouf@email.com", telephone: "+221 78 890 12 34", whatsapp: "+221788901234", derniere_visite: "2026-01-15", notes: "Client récent, première visite" },
  { id: "c9", nom: "Ousmane Kane", email: "ousmane.kane@email.com", telephone: "+221 76 901 23 45", whatsapp: "+221769012345", derniere_visite: "2026-02-01", notes: "Voyageur d'affaires" },
  { id: "c10", nom: "Khady Sarr", email: "khady.sarr@email.com", telephone: "+221 77 012 34 56", whatsapp: "+221770123456", derniere_visite: "2026-02-20", notes: "Spa et bien-être" },
  { id: "c11", nom: "Mamadou Gueye", email: "mamadou.gueye@email.com", telephone: "+221 78 111 22 33", whatsapp: "+221781112233", derniere_visite: "2025-05-10", notes: "" },
  { id: "c12", nom: "Sokhna Dieng", email: "sokhna.dieng@email.com", telephone: "+221 76 222 33 44", whatsapp: "+221762223344", derniere_visite: "2025-04-25", notes: "Couple, suite avec vue mer" },
];

// ============================================
// DONNÉES FICTIVES — SEGMENTS
// ============================================

export const demoSegmentCounts = {
  "3mois": 124,
  "6mois": 89,
  "9mois": 56,
  tous: 450,
};

// ============================================
// DONNÉES FICTIVES — OFFRES
// ============================================

export const demoOffers = [
  { id: "o1", name: "Remise 20% Chambre Standard", type: "remise", description: "20% sur les chambres standard", value: { percent: 20 }, status: "active", valid_from: "2026-03-01", valid_until: "2026-04-30" },
  { id: "o2", name: "Surclassement Suite Junior", type: "surclassement", description: "Surclassement gratuit en Suite Junior", value: { text: "Suite Junior offerte" }, status: "active", valid_from: "2026-03-01", valid_until: "2026-03-31" },
  { id: "o3", name: "Cocktail de Bienvenue", type: "cocktail", description: "2 cocktails signature à l'arrivée", value: { text: "2 cocktails offerts" }, status: "active", valid_from: "2026-02-14", valid_until: "2026-05-31" },
  { id: "o4", name: "Offre Famille -25%", type: "famille", description: "-25% sur la 2ème chambre communicante", value: { percent: 25 }, status: "active", valid_from: "2026-03-01", valid_until: "2026-06-30" },
  { id: "o5", name: "Spécial Ramadan", type: "evenement", description: "Iftar offert + tarif spécial", value: { text: "Iftar offert" }, status: "inactive", valid_from: "2026-02-28", valid_until: "2026-03-29" },
];

// ============================================
// DONNÉES FICTIVES — TYPES DE CHAMBRES
// ============================================

export const demoRoomTypes = [
  { id: "rt1", name: "Standard", description: "Chambre confortable avec vue jardin", base_price_fcfa: 45000 },
  { id: "rt2", name: "Supérieure", description: "Chambre spacieuse avec balcon", base_price_fcfa: 65000 },
  { id: "rt3", name: "Suite Junior", description: "Suite avec salon séparé", base_price_fcfa: 95000 },
  { id: "rt4", name: "Suite Présidentielle", description: "Suite de luxe avec vue panoramique", base_price_fcfa: 150000 },
];

// ============================================
// DONNÉES FICTIVES — CAMPAGNES
// ============================================

export const demoCampaigns = [
  { id: "camp1", name: "Remise printemps", segment_code: "6mois", offer_id: "o1", status: "completed", recipient_count: 89, started_at: "2026-02-24T10:00:00Z", ended_at: "2026-02-24T10:05:00Z" },
  { id: "camp2", name: "Cocktail Saint-Valentin", segment_code: "tous", offer_id: "o3", status: "completed", recipient_count: 450, started_at: "2026-02-14T09:00:00Z", ended_at: "2026-02-14T09:12:00Z" },
  { id: "camp3", name: "Surclassement VIP", segment_code: "3mois", offer_id: "o2", status: "completed", recipient_count: 124, started_at: "2026-02-10T14:00:00Z", ended_at: "2026-02-10T14:03:00Z" },
  { id: "camp4", name: "Offre Famille Pâques", segment_code: "9mois", offer_id: "o4", status: "sending", recipient_count: 56, started_at: "2026-03-12T08:00:00Z", ended_at: null },
];

// ============================================
// DONNÉES FICTIVES — MESSAGES ENVOYÉS
// ============================================

export const demoSentMessages = [
  { id: "sm1", campaign_id: "camp1", client_name: "Moussa Diop", channel: "whatsapp", status: "delivered", sent_at: "2026-02-24T10:01:00Z" },
  { id: "sm2", campaign_id: "camp1", client_name: "Fatou Ndiaye", channel: "whatsapp", status: "read", sent_at: "2026-02-24T10:01:30Z" },
  { id: "sm3", campaign_id: "camp2", client_name: "Omar Sy", channel: "whatsapp", status: "delivered", sent_at: "2026-02-14T09:02:00Z" },
  { id: "sm4", campaign_id: "camp2", client_name: "Aminata Ba", channel: "whatsapp", status: "read", sent_at: "2026-02-14T09:03:00Z" },
  { id: "sm5", campaign_id: "camp3", client_name: "Ibrahima Sow", channel: "whatsapp", status: "sent", sent_at: "2026-02-10T14:01:00Z" },
];

// ============================================
// DONNÉES FICTIVES — RÉDEMPTIONS (clics réserver)
// ============================================

export const demoRedemptions = [
  { id: "r1", client_name: "Moussa Diop", offer_name: "Remise 20%", status: "booked", redemption_date: "2026-02-25T16:30:00Z" },
  { id: "r2", client_name: "Fatou Ndiaye", offer_name: "Remise 20%", status: "booked", redemption_date: "2026-02-26T09:15:00Z" },
  { id: "r3", client_name: "Aminata Ba", offer_name: "Cocktail de Bienvenue", status: "clicked", redemption_date: "2026-02-15T11:00:00Z" },
  { id: "r4", client_name: "Omar Sy", offer_name: "Cocktail de Bienvenue", status: "booked", redemption_date: "2026-02-16T14:20:00Z" },
  { id: "r5", client_name: "Ibrahima Sow", offer_name: "Surclassement Suite Junior", status: "pending_booking", redemption_date: "2026-02-11T10:45:00Z" },
];

// ============================================
// DONNÉES FICTIVES — RÉSERVATIONS
// ============================================

export const demoReservations = [
  { id: "res1", reservation_date: "2026-03-10", type_reservation: "directe", montant_fcfa: 90000, hotel_name: "Hôtel Le Baobab", source: "baobab", client_name: "Moussa Diop", room_type: "Supérieure", check_in: "2026-03-15", check_out: "2026-03-18" },
  { id: "res2", reservation_date: "2026-03-09", type_reservation: "directe", montant_fcfa: 135000, hotel_name: "Hôtel Le Baobab", source: "baobab", client_name: "Fatou Ndiaye", room_type: "Standard", check_in: "2026-03-20", check_out: "2026-03-23" },
  { id: "res3", reservation_date: "2026-03-08", type_reservation: "autre", montant_fcfa: 95000, hotel_name: "Hôtel Le Baobab", source: "import", client_name: "Omar Sy", room_type: "Suite Junior", check_in: "2026-03-12", check_out: "2026-03-14" },
  { id: "res4", reservation_date: "2026-03-07", type_reservation: "directe", montant_fcfa: 45000, hotel_name: "Hôtel Le Baobab", source: "baobab", client_name: "Aminata Ba", room_type: "Standard", check_in: "2026-03-10", check_out: "2026-03-11" },
  { id: "res5", reservation_date: "2026-03-06", type_reservation: "directe", montant_fcfa: 150000, hotel_name: "Hôtel Le Baobab", source: "baobab", client_name: "Cheikh Mbaye", room_type: "Suite Présidentielle", check_in: "2026-03-08", check_out: "2026-03-10" },
  { id: "res6", reservation_date: "2026-03-05", type_reservation: "autre", montant_fcfa: 65000, hotel_name: "Hôtel Le Baobab", source: "import", client_name: null, room_type: "Supérieure", check_in: "2026-03-06", check_out: "2026-03-08" },
  { id: "res7", reservation_date: "2026-03-04", type_reservation: "directe", montant_fcfa: 90000, hotel_name: "Hôtel Le Baobab", source: "baobab", client_name: "Khady Sarr", room_type: "Supérieure", check_in: "2026-03-05", check_out: "2026-03-07" },
  { id: "res8", reservation_date: "2026-03-03", type_reservation: "directe", montant_fcfa: 45000, hotel_name: "Hôtel Le Baobab", source: "baobab", client_name: "Ousmane Kane", room_type: "Standard", check_in: "2026-03-04", check_out: "2026-03-05" },
  { id: "res9", reservation_date: "2026-03-02", type_reservation: "directe", montant_fcfa: 95000, hotel_name: "Hôtel Le Baobab", source: "baobab", client_name: "Mariama Diouf", room_type: "Suite Junior", check_in: "2026-03-03", check_out: "2026-03-06" },
  { id: "res10", reservation_date: "2026-03-01", type_reservation: "autre", montant_fcfa: 45000, hotel_name: "Hôtel Le Baobab", source: "autre", client_name: null, room_type: "Standard", check_in: "2026-03-01", check_out: "2026-03-02" },
  { id: "res11", reservation_date: "2026-02-28", type_reservation: "directe", montant_fcfa: 65000, hotel_name: "Hôtel Le Baobab", source: "baobab", client_name: "Sokhna Dieng", room_type: "Supérieure", check_in: "2026-03-01", check_out: "2026-03-03" },
  { id: "res12", reservation_date: "2026-02-27", type_reservation: "directe", montant_fcfa: 90000, hotel_name: "Hôtel Le Baobab", source: "baobab", client_name: "Mamadou Gueye", room_type: "Supérieure", check_in: "2026-02-28", check_out: "2026-03-02" },
];

// ============================================
// DONNÉES FICTIVES — GRAPHIQUE (dashboard)
// ============================================

export const demoChartData = [
  { jour: "LUN", directes: 8, autres: 3 },
  { jour: "MAR", directes: 12, autres: 5 },
  { jour: "MER", directes: 6, autres: 4 },
  { jour: "JEU", directes: 14, autres: 2 },
  { jour: "VEN", directes: 10, autres: 6 },
  { jour: "SAM", directes: 22, autres: 8 },
  { jour: "DIM", directes: 18, autres: 5 },
];

// ============================================
// DONNÉES FICTIVES — FLUX EN DIRECT (dashboard)
// ============================================

export const demoFlux = [
  { client: "Moussa Diop", hotel: "Hôtel Le Baobab", offre: "REMISE EXCEPTIONNELLE", time: "Il y a 15 min" },
  { client: "Fatou Ndiaye", hotel: "Hôtel Le Baobab", offre: "SAINT VALENTIN", time: "Il y a 45 min" },
  { client: "Omar Sy", hotel: "Hôtel Le Baobab", offre: "SURCLASSEMENT", time: "12:08" },
  { client: "Aminata Ba", hotel: "Hôtel Le Baobab", offre: "COCKTAIL OFFERT", time: "11:30" },
  { client: "Khady Sarr", hotel: "Hôtel Le Baobab", offre: "OFFRE FAMILLE", time: "Hier 18:45" },
];

// ============================================
// DONNÉES FICTIVES — DERNIÈRES CAMPAGNES (dashboard)
// ============================================

export const demoCampagnesSummary = [
  { date: "24 Fév 2026", segment: "Clients - 6 mois", offre: "Remise 20%", resultats: "8 résas", statut: "TERMINÉE" },
  { date: "18 Fév 2026", segment: "Tous les clients", offre: "Cocktail offert", resultats: "14 résas", statut: "TERMINÉE" },
  { date: "10 Fév 2026", segment: "Clients - 3 mois", offre: "Surclassement", resultats: "5 résas", statut: "TERMINÉE" },
  { date: "12 Mar 2026", segment: "Clients - 9 mois", offre: "Offre Famille", resultats: "En cours", statut: "EN COURS" },
];

// ============================================
// MÉTRIQUES CALCULÉES
// ============================================

export const demoMetrics = {
  totalReservationsFromApp: 12,
  revenueFromApp: 1_020_000,
  revenueFormatted: "1 020 000",
  growthPercent: 20,
  impactToday: 3,
};

// ============================================
// DONNÉES FICTIVES — ADMIN STATS
// ============================================

export const demoAdminStats = {
  promptsCount: 1,
  model: "openai/gpt-4o-mini",
};

// ============================================
// DONNÉES FICTIVES — LINKEDIN → TEMPLATES
// ============================================

export const demoLinkedinPost = {
  url: "https://www.linkedin.com/posts/hotel-le-baobab_activity-1234567890123456789-XXXX",
  preview: "Offre exclusive pour nos clients fidèles ! Profitez de -20% sur votre prochain séjour à l'Hôtel Le Baobab...",
};

export const demoGeneratedTemplate = {
  content:
    "Bonjour {{client_name}},\n\nL'Hôtel {{hotel_name}} pense à vous et vous réserve une surprise exceptionnelle.\n\nBénéficiez de {{offer_discount}} sur votre prochain séjour chez nous. Une façon pour nous de vous remercier de votre fidélité et de vous accueillir de nouveau dans notre maison.\n\nCette offre est valable jusqu'au {{valid_until}}.\n\nRépondez simplement à ce message pour réserver ou cliquez sur le lien ci-dessous.\n\nNous avons hâte de vous retrouver !",
  variables_found: ["client_name", "hotel_name", "offer_discount", "valid_until"],
};

export const demoMessageTemplates = [
  {
    id: "tpl1",
    profile_id: "demo-user-id",
    name: "Offre fidélité générale",
    content:
      "Bonjour {{client_name}},\n\nL'Hôtel {{hotel_name}} pense à vous ! Profitez de {{offer_discount}} sur votre prochain séjour, valable jusqu'au {{valid_until}}.\n\nNous serons ravis de vous accueillir.",
    variables: ["client_name", "hotel_name", "offer_discount", "valid_until"],
    source: "linkedin" as const,
    linkedin_url:
      "https://www.linkedin.com/posts/hotel-le-baobab_activity-1234567890123456789-XXXX",
    created_at: "2026-03-10T08:00:00Z",
    updated_at: "2026-03-10T08:00:00Z",
  },
  {
    id: "tpl2",
    profile_id: "demo-user-id",
    name: "Retour client inactif",
    content:
      "Cher {{client_name}},\n\nVous nous manquez ! Pour fêter votre retour à l'Hôtel {{hotel_name}}, nous vous offrons {{offer_discount}}.\n\nOffre valable jusqu'au {{valid_until}}. À très bientôt !",
    variables: ["client_name", "hotel_name", "offer_discount", "valid_until"],
    source: "manual" as const,
    linkedin_url: null,
    created_at: "2026-03-05T14:00:00Z",
    updated_at: "2026-03-05T14:00:00Z",
  },
];

// ============================================
// DONNÉES FICTIVES — PROMPTS IA
// ============================================

export const demoPrompts = [
  {
    id: "demo-1",
    name: "campaign_whatsapp",
    description: "Prompt système RCOSEC pour la génération de messages WhatsApp de fidélisation hôtelière",
    content: `<ROLE>
Tu es un expert en marketing hotelier et en communication WhatsApp
pour les hotels d'Afrique francophone. Ta mission est de rediger
des messages de fidelisation courts, chaleureux et percutants,
qui donnent envie aux clients inactifs de revenir.
</ROLE>

<CONTEXTE>
Tu disposes des informations suivantes fournies par l'hotelier :
- Type d'offre : {type_offre} (remise, surclassement, cocktail, evenement special, etc.)
- Avantage concret : {avantage} (ex : "20% de reduction sur votre chambre")
- Segment cible : {segment} (clients absents depuis 3 mois, 6 mois, 9 mois, ou tous)
- Nom de l'hotel (optionnel) : {hotel_name}
Le message sera envoye via WhatsApp a un client reel.
</CONTEXTE>

<OBJECTIF>
Rediger un message WhatsApp de fidelisation personnalise, pret a
envoyer, qui relance le client avec l'offre proposee et l'incite
a faire une reservation.
</OBJECTIF>

<ETAPES_A_SUIVRE>
Etape 1 : Commencer par une salutation chaleureuse avec la variable
          {nom} pour personnaliser le message.
Etape 2 : Mentionner l'avantage de facon claire et attractive en
          1 phrase, en tenant compte du segment (plus le client est
          absent depuis longtemps, plus le ton est genereux).
Etape 3 : Terminer par un appel a l'action court et direct
          (ex : "Reservez des maintenant", "Profitez-en ce mois-ci").
</ETAPES_A_SUIVRE>

<SORTIE_ATTENDUE>
- 2 a 3 phrases maximum
- Ton : chaleureux, personnel, sans exces de majuscules ni emojis
- Inclure obligatoirement la variable {nom} au debut
- Inclure l'avantage exact fourni par l'utilisateur
- Langue : francais, adapte au marche africain francophone
- Produire UNIQUEMENT le texte du message, sans explication ni commentaire
</SORTIE_ATTENDUE>

<EXEMPLE_DE_SORTIE>
Bonjour {nom}, vous nous manquez ! Pour votre prochain sejour,
nous vous offrons un surclassement gratuit en Suite Junior.
Reservez avant la fin du mois et profitez-en directement a votre arrivee.
</EXEMPLE_DE_SORTIE>

<CONTRAINTES>
- Ne jamais inventer un avantage non fourni par l'utilisateur
- Ne pas depasser 3 phrases
- Ne pas utiliser de langage trop formel ni trop familier
- Toujours inclure {nom} comme variable dynamique (ne pas remplacer)
- Ne pas mentionner de prix en chiffres sauf si l'avantage le precise
- Ne jamais generer plusieurs versions : une seule version finale
- Les paiements et offres doivent rester realistes et honnetement formules
</CONTRAINTES>`,
    created_at: "2026-04-01T10:00:00Z",
    updated_at: "2026-04-01T10:00:00Z",
  },
];

// ============================================
// DONNÉES FICTIVES — GÉNÉRATION POST LINKEDIN
// ============================================

export const demoLinkedInPostGenerated = {
  content: `Saviez-vous que 68% des clients d'un hôtel ne reviennent pas simplement parce qu'ils ont été oubliés ?

Chez Hôtel Le Baobab, nous avons décidé de changer cela.

Chaque mois, nous identifions nos clients inactifs et leur envoyons un message personnalisé sur WhatsApp — pas un message générique, mais un vrai message qui reconnaît leur dernière visite et leur propose quelque chose de concret.

En 3 mois, notre taux de retour a progressé de 31%. Pas grâce à une grande campagne publicitaire. Juste grâce à une attention sincère et un bon outil.

La fidélisation, c'est d'abord une question de relation. La technologie vient ensuite.

Et vous, comment gardez-vous le lien avec vos anciens clients ?

#Hotellerie #Fidelisation #MarketingHotelier #AfriqueOccidentale #CustomerExperience`,
};
