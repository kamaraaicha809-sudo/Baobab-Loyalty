"""
Generate SECURITE_DONNEES_CLIENTS_v2.pdf
Comprehensive technical + legal + compliance document for Baobab Loyalty.
"""

import os
from fpdf import FPDF

ARIAL_PATH = "C:/Windows/Fonts/arial.ttf"
ARIAL_BOLD_PATH = "C:/Windows/Fonts/arialbd.ttf"
COURIER_PATH = "C:/Windows/Fonts/cour.ttf"
COURIER_BOLD_PATH = "C:/Windows/Fonts/courbd.ttf"

GOLD = (235, 193, 97)
DARK = (30, 30, 30)
WHITE = (255, 255, 255)
GRAY_BG = (245, 245, 245)
DARK_GRAY = (80, 80, 80)
TABLE_HEADER = (50, 50, 80)
TABLE_ALT = (240, 240, 248)
CODE_BG = (28, 32, 40)
CODE_FG = (180, 220, 180)
INFO_BG = (220, 235, 255)
INFO_FG = (0, 80, 160)
WARN_BG = (255, 248, 220)
WARN_FG = (160, 100, 0)
OK_BG = (230, 255, 230)
OK_FG = (0, 120, 50)


class SecuritePDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("Arial", "", ARIAL_PATH)
        self.add_font("Arial", "B", ARIAL_BOLD_PATH)
        try:
            self.add_font("Cour", "", COURIER_PATH)
            self.add_font("Cour", "B", COURIER_BOLD_PATH)
            self.has_courier = True
        except Exception:
            self.has_courier = False
        self.set_auto_page_break(auto=True, margin=20)
        self._toc = []

    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*DARK)
        self.rect(0, 0, 210, 12, "F")
        self.set_fill_color(*GOLD)
        self.rect(0, 12, 210, 1.5, "F")
        self.set_y(3)
        self.set_font("Arial", "B", 7.5)
        self.set_text_color(*GOLD)
        self.cell(0, 6, "BAOBAB LOYALTY — SECURITE ET CONFORMITE DES DONNEES CLIENTS — VERSION 2.0", align="C")
        self.set_text_color(*DARK)
        self.ln(12)

    def footer(self):
        self.set_y(-14)
        self.set_fill_color(*DARK)
        self.rect(0, self.get_y(), 210, 14, "F")
        self.set_font("Arial", "", 7)
        self.set_text_color(*GOLD)
        self.cell(150, 8, "Baobab Loyalty — Document Technique et Juridique — Version 2.0 — Avril 2026", align="L")
        self.cell(0, 8, f"Page {self.page_no()}", align="R")
        self.set_text_color(*DARK)

    def cover_page(self):
        self.add_page()
        self.set_fill_color(*DARK)
        self.rect(0, 0, 210, 297, "F")

        self.set_fill_color(*GOLD)
        self.rect(0, 115, 210, 3, "F")

        self.set_y(35)
        self.set_font("Arial", "B", 10)
        self.set_text_color(*GOLD)
        self.cell(0, 8, "BAOBAB LOYALTY", align="C")
        self.ln(8)
        self.set_font("Arial", "", 8)
        self.set_text_color(160, 160, 160)
        self.cell(0, 5, "Programme de fidelisation WhatsApp pour hotels en Afrique francophone", align="C")

        self.ln(30)
        self.set_font("Arial", "B", 22)
        self.set_text_color(*WHITE)
        self.multi_cell(0, 13, "SECURITE ET CONFORMITE\nDES DONNEES CLIENTS", align="C")
        self.ln(6)
        self.set_font("Arial", "", 12)
        self.set_text_color(*GOLD)
        self.cell(0, 8, "Document Technique et Juridique", align="C")
        self.ln(22)

        labels = [
            ("Destinataires", "Equipe informatique · Equipe juridique · Hoteliers"),
            ("Version", "2.0 — Avril 2026"),
            ("Classification", "Confidentiel — Usage interne et partenaires"),
            ("Conformite", "RGPD · Loi 2013-450 (CI) · Loi 2008-12 (SN) · Loi 09-08 (MA)"),
        ]
        for label, value in labels:
            self.set_font("Arial", "B", 8.5)
            self.set_text_color(*GOLD)
            self.set_x(35)
            self.cell(40, 7, f"{label} :")
            self.set_font("Arial", "", 8.5)
            self.set_text_color(200, 200, 200)
            self.multi_cell(0, 7, value)

        self.set_y(230)
        self.set_font("Arial", "", 7.5)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, "Ce document integre : securite technique, obligations de conformite, DPA, notice clients, registre des traitements", align="C")

    def toc_page(self, sections):
        self.add_page()
        self.set_font("Arial", "B", 14)
        self.set_text_color(*DARK)
        self.ln(5)
        self.cell(0, 10, "TABLE DES MATIERES", align="C")
        self.ln(12)
        self.set_fill_color(*GOLD)
        self.rect(12, self.get_y(), 186, 1, "F")
        self.ln(6)
        for num, title, level in sections:
            if level == 1:
                self.set_font("Arial", "B", 9)
                self.set_text_color(*DARK)
                self.set_x(12)
                self.cell(8, 7, str(num) + ".")
                self.cell(0, 7, title)
            else:
                self.set_font("Arial", "", 8.5)
                self.set_text_color(*DARK_GRAY)
                self.set_x(24)
                self.cell(8, 6, str(num))
                self.cell(0, 6, title)
            self.ln()
        self.ln(4)
        self.set_fill_color(*GOLD)
        self.rect(12, self.get_y(), 186, 1, "F")

    def section(self, num, title, level=1):
        self.ln(6)
        if level == 1:
            self.set_fill_color(*DARK)
            self.set_text_color(*GOLD)
            self.set_font("Arial", "B", 11)
            self.set_x(10)
            self.cell(0, 9, f"  {num}. {title}", fill=True, ln=True)
        elif level == 2:
            self.set_fill_color(*GOLD)
            self.set_text_color(*DARK)
            self.set_font("Arial", "B", 9.5)
            self.set_x(10)
            self.cell(0, 7, f"  {num} {title}", fill=True, ln=True)
        else:
            self.set_text_color(*DARK)
            self.set_font("Arial", "B", 9)
            self.set_x(12)
            self.cell(0, 6, f"{num} {title}", ln=True)
        self.ln(2)
        self.set_text_color(*DARK)

    def body(self, text, indent=0):
        self.set_font("Arial", "", 9)
        self.set_text_color(*DARK_GRAY)
        self.set_x(12 + indent)
        self.multi_cell(186 - indent, 5.5, text)
        self.ln(1)

    def bullet(self, text, level=0):
        indent = 12 + level * 6
        self.set_font("Arial", "", 9)
        self.set_text_color(*DARK_GRAY)
        self.set_x(indent)
        marker = "-" if level == 0 else "·"
        self.cell(5, 5.5, marker)
        self.multi_cell(186 - indent - 5, 5.5, text)

    def box(self, text, kind="info"):
        palettes = {
            "info": (INFO_BG, INFO_FG),
            "warn": (WARN_BG, WARN_FG),
            "ok": (OK_BG, OK_FG),
        }
        bg, fg = palettes.get(kind, palettes["info"])
        self.ln(2)
        y = self.get_y()
        self.set_font("Arial", "", 8.5)
        lines = self._wrap(text, 178)
        h = len(lines) * 5.5 + 7
        self.set_fill_color(*bg)
        self.set_draw_color(*fg)
        self.set_line_width(0.5)
        self.rect(12, y, 186, h, "DF")
        self.set_y(y + 3.5)
        self.set_text_color(*fg)
        for line in lines:
            self.set_x(16)
            self.cell(178, 5.5, line)
            self.ln(5.5)
        self.ln(3)
        self.set_text_color(*DARK)
        self.set_draw_color(0, 0, 0)
        self.set_line_width(0.2)

    def _wrap(self, text, width):
        self.set_font("Arial", "", 8.5)
        words = text.replace("\n", " \n ").split(" ")
        lines, current = [], ""
        for w in words:
            if w == "\n":
                lines.append(current.strip()); current = ""
            elif self.get_string_width(current + " " + w) < width:
                current += (" " if current else "") + w
            else:
                if current: lines.append(current.strip())
                current = w
        if current.strip(): lines.append(current.strip())
        return lines

    def table(self, headers, rows, widths=None):
        self.ln(3)
        n = len(headers)
        if widths is None:
            w = 186 // n
            widths = [w] * n

        self.set_fill_color(*TABLE_HEADER)
        self.set_text_color(*WHITE)
        self.set_font("Arial", "B", 7.5)
        self.set_x(12)
        for i, h in enumerate(headers):
            self.cell(widths[i], 7, h, border=1, fill=True)
        self.ln()

        for r, row in enumerate(rows):
            fill = r % 2 == 1
            self.set_fill_color(*TABLE_ALT)
            self.set_text_color(*DARK)
            self.set_font("Arial", "", 7.5)
            self.set_x(12)
            row_h = 5.5
            for i, cell in enumerate(row):
                if i < len(widths):
                    x, y = self.get_x(), self.get_y()
                    self.multi_cell(widths[i], row_h, str(cell), border=1, fill=fill)
                    self.set_xy(x + widths[i], y)
            self.ln(row_h)

        self.ln(3)
        self.set_text_color(*DARK)

    def code_block(self, lines_text):
        self.ln(3)
        lines = lines_text.split("\n")
        h_per_line = 5
        total_h = len(lines) * h_per_line + 8
        y = self.get_y()
        if y + total_h > 270:
            self.add_page()
            y = self.get_y()
        self.set_fill_color(*CODE_BG)
        self.rect(12, y, 186, total_h, "F")
        self.set_y(y + 4)
        font = "Cour" if self.has_courier else "Arial"
        self.set_font(font, "", 7.5)
        self.set_text_color(*CODE_FG)
        for line in lines:
            self.set_x(15)
            self.cell(180, h_per_line, line)
            self.ln(h_per_line)
        self.ln(4)
        self.set_text_color(*DARK)

    def checklist(self, items, done=True):
        for item, checked in items:
            self.set_font("Arial", "", 9)
            self.set_x(12)
            mark = "[x]" if checked else "[ ]"
            color = OK_FG if checked else WARN_FG
            self.set_text_color(*color)
            self.cell(10, 6, mark)
            self.set_text_color(*DARK_GRAY)
            self.multi_cell(172, 6, item)


def build(output_path):
    pdf = SecuritePDF()

    toc = [
        (1, "Presentation de l'application", 1),
        (2, "Donnees collectees sur les clients des hotels", 1),
        (3, "Ou sont hebergees les donnees", 1),
        (4, "Comment les donnees sont securisees (4 niveaux)", 1),
        ("4.1", "Niveau 1 — Authentification JWT", 2),
        ("4.2", "Niveau 2 — Isolation par RLS PostgreSQL", 2),
        ("4.3", "Niveau 3 — Separation des cles d'acces", 2),
        ("4.4", "Niveau 4 — Secrets dans coffre-fort", 2),
        (5, "Flux complet d'une donnee client", 1),
        (6, "Qui peut acceder aux donnees", 1),
        (7, "Donnees transmises a des tiers", 1),
        (8, "Mesures de securite — Recapitulatif", 1),
        (9, "Points d'attention juridique", 1),
        ("9.4", "Transferts internationaux — Conformite par pays", 2),
        (10, "Obligations de conformite par pays", 1),
        ("10.2", "Declaration ARTCI (Cote d'Ivoire)", 2),
        ("10.3", "Declaration CDP (Senegal)", 2),
        ("10.4", "En cas de violation de donnees", 2),
        (11, "Contrat de Sous-traitance (DPA) — Resume", 1),
        ("11.1", "Engagements de Baobab Loyalty", 2),
        ("11.2", "Engagements de l'hotelier", 2),
        ("11.3", "Sous-traitants ulterieurs autorises", 2),
        ("11.4", "Fin de contrat et sort des donnees", 2),
        (12, "Notice d'information clients — Template", 1),
        (13, "Registre des activites de traitement — Synthese", 1),
        (14, "Checklist de conformite complete", 1),
        (15, "Exemple de migration SQL — Securite table clients", 1),
    ]

    pdf.cover_page()
    pdf.toc_page(toc)

    # ── SECTION 1 ──────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section(1, "Presentation de l'application")
    pdf.body(
        "Baobab Loyalty est un logiciel SaaS (Software as a Service) destine aux proprietaires d'hotels "
        "en Afrique francophone. Il leur permet de :"
    )
    for item in [
        "Importer leur base de clients depuis un fichier CSV",
        "Segmenter automatiquement ces clients selon leur date de derniere visite (3, 6, 9 mois d'inactivite)",
        "Envoyer des campagnes de fidelisation par WhatsApp avec des offres personnalisees",
        "Suivre les reservations generees et les revenus en FCFA depuis un tableau de bord",
    ]:
        pdf.bullet(item)
    pdf.ln(2)
    pdf.box(
        "Chaque hotelier possede un espace totalement isole. Il ne voit et ne peut interagir "
        "qu'avec ses propres donnees. L'isolation est garantie au niveau de la base de donnees (RLS PostgreSQL).",
        "ok"
    )

    # ── SECTION 2 ──────────────────────────────────────────────────────────────
    pdf.section(2, "Donnees collectees sur les clients des hotels")
    pdf.table(
        ["Champ", "Nature", "Obligatoire", "Exemple"],
        [
            ["`nom`", "Nom du client", "Oui", '"Aminata Diallo"'],
            ["`email`", "Adresse email", "Non", '"aminata@gmail.com"'],
            ["`telephone`", "Numero de telephone", "Non", '"+221 77 000 00 00"'],
            ["`whatsapp`", "Numero WhatsApp", "Non", '"+221 77 000 00 00"'],
            ["`derniere_visite`", "Date du dernier sejour", "Oui", '"2025-10-15"'],
            ["`notes`", "Notes internes hotelier", "Non", '"Client VIP, chambre 204"'],
        ],
        [32, 42, 28, 84]
    )
    pdf.box(
        "Ces donnees sont fournies par l'hotelier lui-meme (via import CSV). Baobab Loyalty n'est pas "
        "a l'origine de la collecte initiale — c'est l'hotelier qui les a recueillies lors des sejours.",
        "info"
    )

    # ── SECTION 3 ──────────────────────────────────────────────────────────────
    pdf.section(3, "Ou sont hebergees les donnees")
    pdf.section("3.1", "Infrastructure", level=2)
    pdf.body(
        "Les donnees sont hebergees sur Supabase (PostgreSQL cloud), dans la region "
        "EU West (Europe de l'Ouest — Irlande) par defaut, soumise au RGPD europeen."
    )
    pdf.box(
        "Point juridique important : L'hotelier doit verifier avec l'equipe Baobab Loyalty la region "
        "de stockage pour s'assurer de la conformite avec les lois locales (RGPD, Loi 09-08 Maroc, "
        "PPDP Senegal, Loi n 2013-450 du 19 juin 2013 relative a la protection des donnees "
        "a caractere personnel en Cote d'Ivoire).",
        "warn"
    )
    pdf.section("3.2", "Tables de la base de donnees", level=2)
    pdf.table(
        ["Table", "Role"],
        [
            ["clients", "Les voyageurs (nom, email, telephone, date de visite)"],
            ["campaigns", "Historique des campagnes WhatsApp envoyees"],
            ["sent_messages", "Journal des messages (quel message, a quel client, quand)"],
            ["redemptions", "Suivi des clics sur les offres recues par WhatsApp"],
            ["reservations", "Reservations generees suite aux campagnes"],
            ["profiles", "Compte de l'hotelier (nom hotel, email, abonnement)"],
        ],
        [40, 146]
    )

    # ── SECTION 4 ──────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section(4, "Comment les donnees sont securisees — 4 niveaux")

    pdf.section("4.1", "Niveau 1 — Authentification par jeton JWT", level=2)
    pdf.body(
        "Chaque hotelier se connecte avec un email et un mot de passe. Supabase genere un jeton JWT "
        "(JSON Web Token) signe cryptographiquement, valide pour une duree limitee. Aucune operation "
        "sur les donnees n'est possible sans ce jeton valide."
    )
    pdf.code_block(
        "// supabase/functions/_shared/auth.ts\n"
        "export async function requireAuth(req: Request): Promise<AuthResult> {\n"
        '  const authHeader = req.headers.get("Authorization");\n'
        '  if (!authHeader || !authHeader.startsWith("Bearer ")) {\n'
        '    return { user: null, error: "Authorization header manquant ou invalide" };\n'
        "  }\n"
        '  const token = authHeader.replace("Bearer ", "");\n'
        "  const { data: { user }, error } = await supabase.auth.getUser(token);\n"
        "  if (error || !user) {\n"
        '    return { user: null, error: "Jeton invalide" };\n'
        "  }\n"
        "  return { user, userClient, error: null };\n"
        "}"
    )

    pdf.section("4.2", "Niveau 2 — Isolation totale par RLS (Row Level Security)", level=2)
    pdf.body(
        "C'est le mecanisme de securite le plus important. Le RLS PostgreSQL garantit qu'un hotelier "
        "ne peut JAMAIS acceder aux clients d'un autre hotelier. La regle auth.uid() = profile_id est "
        "verifiee systematiquement au niveau du moteur de base de donnees, independamment du code."
    )
    pdf.code_block(
        "ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;\n\n"
        'CREATE POLICY "Users can view own clients"\n'
        "  ON public.clients FOR SELECT\n"
        "  USING (auth.uid() = profile_id);\n\n"
        'CREATE POLICY "Users can insert own clients"\n'
        "  ON public.clients FOR INSERT\n"
        "  WITH CHECK (auth.uid() = profile_id);\n\n"
        'CREATE POLICY "Users can update own clients"\n'
        "  ON public.clients FOR UPDATE\n"
        "  USING (auth.uid() = profile_id);\n\n"
        'CREATE POLICY "Users can delete own clients"\n'
        "  ON public.clients FOR DELETE\n"
        "  USING (auth.uid() = profile_id);"
    )
    pdf.box(
        "Ce que cela signifie juridiquement : Meme en cas de bug dans le code applicatif, "
        "la base de donnees elle-meme refusera toute requete tentant d'acceder aux donnees d'un autre hotelier.",
        "ok"
    )

    pdf.section("4.3", "Niveau 3 — Separation des cles d'acces", level=2)
    pdf.table(
        ["Cle", "Qui l'utilise", "Ce qu'elle permet"],
        [
            ["Anon Key (publique)", "L'application web", "Acces limite, soumis au RLS"],
            ["JWT utilisateur", "L'hotelier connecte", "Acces a ses donnees uniquement (RLS actif)"],
            ["Service Role Key (secrete)", "Fonctions backend uniquement", "Acces total — JAMAIS exposee au navigateur"],
        ],
        [46, 50, 90]
    )

    pdf.section("4.4", "Niveau 4 — Secrets dans coffre-fort", level=2)
    pdf.body(
        "Aucun secret (cle API, mot de passe) n'est ecrit en dur dans le code source. "
        "Tous sont stockes dans Supabase Vault (coffre-fort chiffre) ou variables d'environnement."
    )
    pdf.code_block(
        "Secrets dans Supabase Vault :\n"
        "  STRIPE_SECRET_KEY        -> Cle de paiement Stripe\n"
        "  RESEND_API_KEY           -> Cle d'envoi d'emails\n"
        "  OPENROUTER_API_KEY       -> Cle IA (generation de messages)\n"
        "  MONEROO_API_KEY          -> Cle de paiement FCFA\n"
        "  MONEROO_WEBHOOK_SECRET   -> Cle de verification webhook"
    )

    # ── SECTION 5 ──────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section(5, "Flux complet d'une donnee client")
    steps = [
        "L'hotelier importe un fichier CSV depuis son logiciel hotelier",
        "Le fichier est traite dans le navigateur (parsing CSV cote client)",
        "Les donnees sont envoyees par lot (100 lignes) vers Supabase via l'API securisee (JWT + RLS)",
        "Les donnees sont stockees dans la table `clients` avec profile_id = identifiant de l'hotelier",
        "L'hotelier selectionne un segment (ex : clients inactifs 6 mois) — filtre par profile_id",
        "L'hotelier choisit une offre et lance la campagne — enregistrement dans `campaigns` + `sent_messages`",
        "Les messages WhatsApp sont envoyes aux clients concernes — chaque envoi est journalise",
        "Si un client clique sur le lien et reserve — enregistrement dans `redemptions` et `reservations`",
    ]
    for i, s in enumerate(steps, 1):
        pdf.set_font("Arial", "B", 9)
        pdf.set_x(12)
        pdf.set_text_color(*DARK)
        pdf.cell(8, 6, f"{i}.")
        pdf.set_font("Arial", "", 9)
        pdf.set_text_color(*DARK_GRAY)
        pdf.multi_cell(172, 6, s)

    # ── SECTION 6 ──────────────────────────────────────────────────────────────
    pdf.section(6, "Qui peut acceder aux donnees des clients des hotels")
    pdf.table(
        ["Acteur", "Acces", "Niveau d'acces"],
        [
            ["L'hotelier proprietaire", "Oui", "Ses clients uniquement (RLS)"],
            ["Un autre hotelier", "Non", "Bloque par RLS au niveau base de donnees"],
            ["Equipe Baobab Loyalty (admin)", "Oui, limite", "Via Supabase Dashboard, maintenance uniquement"],
            ["Services tiers (Stripe, Resend)", "Non", "Ne recoivent jamais les donnees clients"],
            ["Systemes IA (OpenRouter)", "Non", "Seul le texte du message genere est traite, pas les PII"],
        ],
        [60, 22, 104]
    )

    # ── SECTION 7 ──────────────────────────────────────────────────────────────
    pdf.section(7, "Donnees transmises a des tiers")
    pdf.table(
        ["Service tiers", "Donnees transmises", "Finalite"],
        [
            ["Supabase (PostgreSQL)", "Toutes les donnees", "Hebergement et base de donnees"],
            ["Vercel", "Aucune donnee client", "Hebergement de l'application web uniquement"],
            ["Resend", "Email de l'hotelier uniquement", "Envoi d'emails transactionnels a l'hotelier"],
            ["Stripe / Moneroo", "Donnees de facturation hotelier", "Paiement de l'abonnement"],
            ["OpenRouter / IA", "Texte du message (sans PII)", "Generation de texte marketing"],
            ["WhatsApp Business API", "Numero de telephone du client", "Envoi du message de campagne"],
        ],
        [46, 72, 68]
    )
    pdf.box(
        "Les donnees des clients des hotels (nom, email, telephone) ne sont JAMAIS transmises "
        "a Stripe, Resend, ou OpenRouter. Seul WhatsApp recoit le numero de telephone.",
        "ok"
    )

    # ── SECTION 8 ──────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section(8, "Mesures de securite — Recapitulatif")
    pdf.table(
        ["Mesure", "Implementee", "Detail"],
        [
            ["Authentification JWT", "Oui", "Supabase Auth, sessions securisees"],
            ["Isolation des donnees (RLS)", "Oui", "4 politiques sur la table clients"],
            ["Chiffrement en transit", "Oui", "HTTPS/TLS 1.3 sur toutes les connexions"],
            ["Secrets dans coffre-fort", "Oui", "Supabase Vault + variables d'environnement"],
            ["Verification signature webhook", "Oui", "HMAC-SHA256 pour webhooks de paiement"],
            ["Journalisation des actions", "Oui", "Table sent_messages pour tracabilite"],
            ["Chiffrement au repos", "Partiel", "PostgreSQL chiffre, pas de chiffrement colonne par colonne"],
            ["Limitation du debit", "Partiel", "Gere par Supabase et Vercel"],
            ["Controle d'acces admin", "Oui", "Colonne role = 'admin' dans profiles"],
        ],
        [60, 28, 98]
    )

    # ── SECTION 9 ──────────────────────────────────────────────────────────────
    pdf.section(9, "Points d'attention juridique")
    pdf.section("9.1", "Base legale du traitement", level=3)
    pdf.body(
        "L'hotelier est responsable de traitement au sens du RGPD et des lois africaines applicables. "
        "Baobab Loyalty agit en tant que sous-traitant. Un contrat de sous-traitance (DPA) doit etre "
        "signe entre l'hotelier et Baobab Loyalty (voir Section 11)."
    )
    pdf.section("9.2", "Duree de conservation", level=3)
    pdf.table(
        ["Type de donnee", "Duree", "Motif"],
        [
            ["Donnees clients (nom, contact, visite)", "Duree du compte actif", "Necessite fonctionnelle"],
            ["Journaux de messages envoyes", "3 ans apres l'envoi", "Tracabilite legale"],
            ["Donnees de reservation", "5 ans", "Obligation comptable"],
            ["Donnees apres cloture", "Suppression sous 30 jours", "Contrat de sous-traitance"],
        ],
        [70, 50, 66]
    )
    pdf.section("9.3", "Droits des personnes concernees", level=3)
    pdf.body(
        "Les clients des hotels (voyageurs) peuvent exercer leurs droits (acces, rectification, suppression) "
        "aupres de l'hotelier. L'hotelier dispose des outils dans Baobab Loyalty pour supprimer un client "
        "specifique de sa base."
    )
    pdf.section("9.4", "Transferts internationaux — Conformite par pays", level=3)
    pdf.table(
        ["Pays", "Loi applicable", "Autorite de controle", "Statut transfert AWS EU West"],
        [
            ["Union Europeenne", "RGPD — Reglement (UE) 2016/679", "CNIL", "Conforme — RGPD applique directement"],
            ["Senegal", "Loi n 2008-12 du 25 janv. 2008", "CDP — www.cdp.sn", "Conforme sous reserve declaration CDP"],
            ["Maroc", "Loi n 09-08 du 18 fevr. 2009", "CNDP — www.cndp.ma", "Conforme — accord partiel UE/Maroc"],
            ["Cote d'Ivoire", "Loi n 2013-450 du 19 juin 2013", "ARTCI — www.artci.ci", "Conforme — declaration ARTCI requise"],
            ["Cameroun", "Loi n 2010/021", "—", "Conforme — meme logique que CI"],
        ],
        [28, 48, 40, 70]
    )
    pdf.box(
        "Point critique Cote d'Ivoire : Le niveau de protection RGPD est superieur a la Loi n 2013-450, "
        "mais le transfert de donnees hors de CI doit faire l'objet d'une declaration prealable a l'ARTCI "
        "(Articles 8 a 14). Cette obligation est a la charge de l'hotelier. Un formulaire pre-rempli est "
        "disponible (Document 04 — Declaration ARTCI).",
        "warn"
    )

    # ── SECTION 10 ─────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section(10, "Obligations de conformite par pays — Ce que doit faire l'hotelier")
    pdf.section("10.1", "Recapitulatif des actions obligatoires", level=2)
    pdf.table(
        ["Action", "Cote d'Ivoire", "Senegal", "Maroc", "UE/France", "Delai"],
        [
            ["Signer le DPA", "Oui", "Oui", "Oui", "Oui", "Avant utilisation"],
            ["Notice info clients", "Oui", "Oui", "Oui", "Oui", "Avant import"],
            ["Declaration ARTCI", "Oui", "—", "—", "—", "Avant utilisation"],
            ["Declaration CDP", "—", "Oui", "—", "—", "Avant utilisation"],
            ["Declaration CNDP", "—", "—", "Oui", "—", "Avant utilisation"],
            ["Registre traitements", "Recommande", "Recommande", "Recommande", "Obligatoire", "Avant import"],
            ["Formation personnel", "Oui", "Oui", "Oui", "Oui", "Sous 60 jours"],
        ],
        [54, 24, 22, 22, 26, 38]
    )

    pdf.section("10.2", "Declaration ARTCI — Cote d'Ivoire", level=2)
    pdf.box(
        "Base legale : Loi n 2013-450 du 19 juin 2013. Declaration requise AVANT utilisation de Baobab Loyalty.",
        "warn"
    )
    pdf.table(
        ["Champ du formulaire ARTCI", "Ce que l'hotelier indique"],
        [
            ["Finalite du traitement", "Fidelisation clientele hoteliere par communications WhatsApp"],
            ["Categories de donnees", "Nom, email, telephone, date de derniere visite"],
            ["Destinataires", "Baobab Loyalty (sous-traitant), WhatsApp Business API"],
            ["Duree de conservation", "Duree de l'abonnement actif Baobab Loyalty"],
            ["Transferts hors CI", "Oui — vers serveurs AWS EU West (Irlande) — proteges par RGPD"],
            ["Mesures de securite", "Chiffrement TLS, JWT, RLS PostgreSQL"],
        ],
        [80, 106]
    )
    pdf.body(
        "Delai de reponse ARTCI : 1 mois (sans reponse = declaration acceptee). Gratuit.\n"
        "Adresse : Tour Postel 2001, Avenue Marchand, Abidjan-Plateau — www.artci.ci"
    )

    pdf.section("10.3", "Declaration CDP — Senegal", level=2)
    pdf.body("1. Creer un compte sur www.cdp.sn")
    pdf.body("2. Remplir le formulaire de declaration en ligne")
    pdf.body("3. Joindre le DPA signe avec Baobab Loyalty")
    pdf.body("4. Conserver le recepisse")
    pdf.box("Sanction en cas de non-declaration : jusqu'a 5 millions de FCFA d'amende (CDP).", "warn")

    pdf.section("10.4", "En cas de violation de donnees (incident de securite)", level=2)
    pdf.table(
        ["Etape", "Action"],
        [
            ["1", "L'hotelier contacte Baobab Loyalty : support@baobabloyalty.com"],
            ["2", "Baobab Loyalty notifie l'hotelier dans les 72h avec rapport d'incident"],
            ["3", "L'hotelier notifie l'autorite competente de son pays"],
            ["4", "Si risque grave pour les personnes : les informer directement"],
        ],
        [12, 174]
    )
    pdf.table(
        ["Autorite", "Pays", "Delai legal", "Contact"],
        [
            ["ARTCI", "Cote d'Ivoire", "Des que possible", "www.artci.ci"],
            ["CDP", "Senegal", "Des que possible", "cdp@cdp.sn"],
            ["CNDP", "Maroc", "Des que possible", "www.cndp.ma"],
            ["CNIL", "France / UE", "72 heures", "www.cnil.fr"],
        ],
        [35, 38, 42, 71]
    )

    # ── SECTION 11 ─────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section(11, "Contrat de Sous-traitance (DPA) — Resume")
    pdf.box(
        "Le DPA est obligatoire dans TOUS les pays avant d'utiliser Baobab Loyalty. "
        "A signer et envoyer a : support@baobabloyalty.com",
        "warn"
    )

    pdf.section("11.1", "Engagements de Baobab Loyalty (sous-traitant)", level=2)
    pdf.table(
        ["Obligation", "Detail"],
        [
            ["Traitement sur instruction", "Ne traite les donnees que sur instruction documentee de l'hotelier"],
            ["Confidentialite", "Tout acces couvert par une obligation de confidentialite"],
            ["Securite technique", "Chiffrement TLS 1.3, AES-256, JWT, RLS PostgreSQL, Supabase Vault"],
            ["Notification violations", "Notification de l'hotelier dans les 72 heures apres detection"],
            ["Suppression fin contrat", "Toutes les donnees supprimees dans les 30 jours apres resiliation"],
            ["Droits des personnes", "Assistance a l'hotelier pour repondre aux exercices de droits"],
            ["Audit", "Fourniture des informations necessaires a l'audit (preavis 30 jours)"],
        ],
        [55, 131]
    )

    pdf.section("11.2", "Engagements de l'hotelier (responsable de traitement)", level=2)
    pdf.table(
        ["Obligation", "Detail"],
        [
            ["Liceite du traitement", "Disposer d'une base legale valable (interet legitime, consentement)"],
            ["Information des clients", "Informer les voyageurs du traitement et de la transmission a Baobab Loyalty"],
            ["Declarations reglementaires", "Effectuer les declarations ARTCI / CDP / CNDP selon son pays"],
            ["Qualite des donnees", "S'assurer de l'exactitude des donnees importees"],
        ],
        [55, 131]
    )

    pdf.section("11.3", "Sous-traitants ulterieurs autorises", level=2)
    pdf.table(
        ["Sous-traitant", "Pays", "Role", "Donnees transmises"],
        [
            ["Supabase Inc.", "USA (AWS EU West)", "Hebergement base de donnees", "Toutes les donnees"],
            ["Vercel Inc.", "USA", "Hebergement web", "Aucune donnee client"],
            ["Resend Inc.", "USA", "Emails transactionnels", "Email hotelier uniquement"],
            ["OpenRouter", "USA", "Generation IA", "Texte message (sans PII)"],
            ["WhatsApp (Meta)", "USA", "Envoi messages", "Numero de telephone"],
            ["Moneroo", "Afrique", "Paiements FCFA", "Donnees facturation hotelier"],
        ],
        [40, 35, 54, 57]
    )

    pdf.section("11.4", "Fin de contrat et sort des donnees", level=2)
    pdf.body("1. L'hotelier peut exporter ses donnees pendant 30 jours apres resiliation")
    pdf.body("2. Apres 30 jours : suppression definitive et irreversible de tous les serveurs")
    pdf.body("3. Un certificat de suppression est fourni sur demande dans les 15 jours")

    # ── SECTION 12 ─────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section(12, "Notice d'information clients — Template")
    pdf.body(
        "L'hotelier est legalement tenu d'informer ses clients (voyageurs) que leurs donnees sont "
        "utilisees dans Baobab Loyalty. Ce texte est a personnaliser et afficher a la reception "
        "(ou via au moins 2 canaux parmi ceux listes ci-dessous)."
    )

    pdf.section("12.1", "Version Cote d'Ivoire — Loi n 2013-450 du 19 juin 2013", level=2)
    pdf.table(
        ["Champ", "Contenu a afficher"],
        [
            ["Responsable du traitement", "[Nom de l'hotel], [adresse], represente par [nom du dirigeant]"],
            ["Finalite", "Fidelisation clientele hoteliere par communications WhatsApp personnalisees"],
            ["Donnees traitees", "Nom, telephone/WhatsApp, email, date de derniere visite"],
            ["Sous-traitant", "Baobab Loyalty (contrat de sous-traitance signe)"],
            ["Transfert hors CI", "Oui — serveurs AWS EU West (Irlande) — proteges par RGPD. N declaration ARTCI : [...]"],
            ["Droits", "Acces, rectification, opposition (Articles 22 a 29 Loi 2013-450) — contact : [email hotel]"],
            ["Reclamations", "ARTCI — Tour Postel 2001, Avenue Marchand, Abidjan-Plateau — www.artci.ci"],
        ],
        [45, 141]
    )

    pdf.section("12.2", "Moyens de diffusion (choisir au moins 2)", level=3)
    pdf.bullet("Affichage a la reception (format A4 encadre)")
    pdf.bullet("Inclus dans le formulaire de check-in signe par le client")
    pdf.bullet("Envoi par email a la confirmation de reservation")
    pdf.bullet("Publication sur le site web de l'hotel (page Confidentialite)")

    # ── SECTION 13 ─────────────────────────────────────────────────────────────
    pdf.section(13, "Registre des activites de traitement — Synthese")
    pdf.section("13.1", "Traitements en tant que sous-traitant (pour les hoteliers)", level=2)
    pdf.table(
        ["Ref.", "Traitement", "Donnees", "Hebergement"],
        [
            ["ST-01", "Gestion base clients hoteliere", "Nom, email, tel, WhatsApp, date visite", "AWS EU West"],
            ["ST-02", "Envoi campagnes WhatsApp", "Numero tel, texte message", "WhatsApp Business API"],
            ["ST-03", "Tracking reservations et offres", "ID client, statut clic, montant resa", "AWS EU West"],
        ],
        [16, 54, 72, 44]
    )
    pdf.section("13.2", "Traitements en tant que responsable de traitement (donnees hoteliers abonnes)", level=2)
    pdf.table(
        ["Ref.", "Traitement", "Base legale", "Duree conservation"],
        [
            ["RT-01", "Gestion des comptes hoteliers", "Execution du contrat", "Duree abonnement + 3 ans"],
            ["RT-02", "Facturation et paiements", "Contrat + obligation legale", "7 ans (obligation comptable)"],
            ["RT-03", "Emails transactionnels", "Execution du contrat", "Logs 1 an"],
            ["RT-04", "Generation contenu IA", "Interet legitime (aucune PII transmise a l'IA)", "Non applicable"],
        ],
        [16, 54, 64, 52]
    )

    # ── SECTION 14 ─────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section(14, "Checklist de conformite complete")

    pdf.section("14.1", "Pour l'hotelier — Actions a effectuer", level=2)
    pdf.checklist([
        ("Signer le DPA avec Baobab Loyalty et l'envoyer a support@baobabloyalty.com", False),
        ("Afficher la Notice d'information clients a la reception (ou 1 autre canal)", False),
        ("Si Cote d'Ivoire : deposer le formulaire de declaration a l'ARTCI (Document 04)", False),
        ("Si Senegal : declarer le traitement sur www.cdp.sn", False),
        ("Si Maroc : declarer ou demander autorisation a la CNDP (www.cndp.ma)", False),
        ("Si site web : ajouter un paragraphe Baobab Loyalty dans la politique de confidentialite", False),
        ("Former le personnel qui accede a Baobab Loyalty (ne jamais partager ses identifiants)", False),
        ("Mettre en place un processus de reponse aux droits des clients (delai 30 jours)", False),
    ])

    pdf.ln(4)
    pdf.section("14.2", "Pour Baobab Loyalty — Engagements en place", level=2)
    pdf.checklist([
        ("DPA disponible et signable (Document 01)", True),
        ("Hebergement EU West (Irlande) conforme RGPD", True),
        ("RLS PostgreSQL — isolation totale des donnees par hotelier", True),
        ("JWT authentication + chiffrement TLS 1.3", True),
        ("Secrets dans Supabase Vault (aucun secret en clair dans le code)", True),
        ("Procedure de notification violation sous 72h", True),
        ("Suppression des donnees a la resiliation sous 30 jours", True),
        ("Sous-traitants ulterieurs conformes RGPD avec CCT", True),
        ("Registre des activites de traitement maintenu (Document 05)", True),
    ])

    # ── SECTION 15 ─────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section(15, "Exemple de migration SQL — Securite de la table clients")
    pdf.body(
        "Le fichier suivant, versionne dans le code source sous supabase/migrations/005_clients_and_config.sql, "
        "montre l'implementation complete de la securite sur la table clients :"
    )
    pdf.code_block(
        "-- Creation de la table\n"
        "CREATE TABLE IF NOT EXISTS public.clients (\n"
        "  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n"
        "  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,\n"
        "  nom             TEXT NOT NULL,\n"
        "  email           TEXT,\n"
        "  telephone       TEXT,\n"
        "  derniere_visite DATE NOT NULL,\n"
        "  notes           TEXT,\n"
        "  created_at      TIMESTAMPTZ DEFAULT NOW(),\n"
        "  updated_at      TIMESTAMPTZ DEFAULT NOW()\n"
        ");\n\n"
        "-- Index de performance\n"
        "CREATE INDEX IF NOT EXISTS idx_clients_profile\n"
        "  ON public.clients(profile_id);\n\n"
        "-- ACTIVATION DU ROW LEVEL SECURITY\n"
        "ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;\n\n"
        'CREATE POLICY "Users can view own clients"\n'
        "  ON public.clients FOR SELECT USING (auth.uid() = profile_id);\n\n"
        'CREATE POLICY "Users can insert own clients"\n'
        "  ON public.clients FOR INSERT WITH CHECK (auth.uid() = profile_id);\n\n"
        'CREATE POLICY "Users can update own clients"\n'
        "  ON public.clients FOR UPDATE USING (auth.uid() = profile_id);\n\n"
        'CREATE POLICY "Users can delete own clients"\n'
        "  ON public.clients FOR DELETE USING (auth.uid() = profile_id);\n\n"
        '-- Acces service role pour fonctions backend securisees\n'
        'CREATE POLICY "Service role can manage clients"\n'
        "  ON public.clients FOR ALL USING (auth.role() = 'service_role');"
    )
    pdf.box(
        "Ce fichier est archive dans le depot Git de l'application, versionne et auditable a tout moment "
        "par l'hotelier, l'equipe juridique ou une autorite de controle.",
        "ok"
    )

    pdf.ln(8)
    pdf.set_font("Arial", "", 8)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 5, "Document genere le 27 avril 2026 — Baobab Loyalty — Version 2.0", align="C")
    pdf.ln(5)
    pdf.cell(0, 5, "Ce document est confidentiel et destine aux equipes techniques, juridiques et aux partenaires hoteliers.", align="C")

    pdf.output(output_path)
    print(f"PDF genere : {output_path}")
    size_kb = os.path.getsize(output_path) // 1024
    print(f"Taille : {size_kb} KB")


if __name__ == "__main__":
    base = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(base, "SECURITE_DONNEES_CLIENTS_v2.pdf")
    build(out)
