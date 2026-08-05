"""
Generate compliance PDFs for Baobab Loyalty docs-conformite/ folder.
Uses fpdf2 with Windows Arial TTF for full French character support.
"""

import os
import sys
from fpdf import FPDF

ARIAL_PATH = "C:/Windows/Fonts/arial.ttf"
ARIAL_BOLD_PATH = "C:/Windows/Fonts/arialbd.ttf"

GOLD = (235, 193, 97)
DARK = (30, 30, 30)
WHITE = (255, 255, 255)
GRAY_BG = (245, 245, 245)
DARK_GRAY = (80, 80, 80)
TABLE_HEADER = (50, 50, 80)
TABLE_ALT = (240, 240, 248)


class BaobabPDF(FPDF):
    def __init__(self, title, subtitle="", doc_number=""):
        super().__init__()
        self.doc_title = title
        self.doc_subtitle = subtitle
        self.doc_number = doc_number
        self.add_font("Arial", "", ARIAL_PATH)
        self.add_font("Arial", "B", ARIAL_BOLD_PATH)
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*DARK)
        self.rect(0, 0, 210, 12, "F")
        self.set_fill_color(*GOLD)
        self.rect(0, 12, 210, 1.5, "F")
        self.set_y(3)
        self.set_font("Arial", "B", 8)
        self.set_text_color(*GOLD)
        self.cell(0, 6, "BAOBAB LOYALTY — CONFORMITE RGPD & LOIS AFRICAINES", align="C")
        self.set_text_color(*DARK)
        self.ln(12)

    def footer(self):
        self.set_y(-14)
        self.set_fill_color(*DARK)
        self.rect(0, self.get_y(), 210, 14, "F")
        self.set_font("Arial", "", 7)
        self.set_text_color(*GOLD)
        self.cell(100, 8, f"Baobab Loyalty — Avril 2026", align="L")
        self.cell(0, 8, f"Page {self.page_no()}", align="R")
        self.set_text_color(*DARK)

    def cover_page(self):
        self.add_page()
        self.set_fill_color(*DARK)
        self.rect(0, 0, 210, 297, "F")
        self.set_fill_color(*GOLD)
        self.rect(0, 120, 210, 3, "F")
        self.set_y(50)
        self.set_font("Arial", "B", 11)
        self.set_text_color(*GOLD)
        self.cell(0, 8, "BAOBAB LOYALTY", align="C")
        self.ln(10)
        self.set_font("Arial", "", 9)
        self.set_text_color(180, 180, 180)
        self.cell(0, 6, "Programme de fidelisation WhatsApp pour hotels", align="C")
        self.ln(35)
        self.set_font("Arial", "B", 18)
        self.set_text_color(*WHITE)
        self.multi_cell(0, 12, self.doc_title, align="C")
        self.ln(6)
        if self.doc_subtitle:
            self.set_font("Arial", "", 11)
            self.set_text_color(*GOLD)
            self.multi_cell(0, 8, self.doc_subtitle, align="C")
        self.ln(20)
        if self.doc_number:
            self.set_font("Arial", "B", 10)
            self.set_text_color(180, 180, 180)
            self.cell(0, 8, f"Document {self.doc_number}", align="C")
            self.ln(6)
        self.set_font("Arial", "", 9)
        self.set_text_color(140, 140, 140)
        self.cell(0, 6, "Version 1.0 — Avril 2026", align="C")
        self.ln(10)
        self.set_font("Arial", "", 8)
        self.cell(0, 5, "Conforme : RGPD (UE) · Loi 2013-450 (Cote d'Ivoire) · Loi 2008-12 (Senegal) · Loi 09-08 (Maroc)", align="C")

    def section_title(self, text, level=1):
        self.ln(5)
        if level == 1:
            self.set_fill_color(*DARK)
            self.set_text_color(*GOLD)
            self.set_font("Arial", "B", 11)
            self.set_x(10)
            self.cell(0, 9, f"  {text}", fill=True, ln=True)
        elif level == 2:
            self.set_fill_color(*GOLD)
            self.set_text_color(*DARK)
            self.set_font("Arial", "B", 10)
            self.set_x(10)
            self.cell(0, 7, f"  {text}", fill=True, ln=True)
        else:
            self.set_text_color(*DARK)
            self.set_font("Arial", "B", 9)
            self.set_x(12)
            self.cell(0, 6, text, ln=True)
        self.ln(2)
        self.set_text_color(*DARK)

    def body_text(self, text, indent=0):
        self.set_font("Arial", "", 9)
        self.set_text_color(*DARK_GRAY)
        self.set_x(12 + indent)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def info_box(self, text, box_type="info"):
        colors = {
            "info": ((220, 235, 255), (0, 80, 160)),
            "warning": ((255, 248, 220), (160, 100, 0)),
            "important": ((230, 255, 230), (0, 100, 50)),
        }
        bg, fg = colors.get(box_type, colors["info"])
        self.ln(2)
        x = self.get_x()
        y = self.get_y()
        self.set_fill_color(*bg)
        self.set_draw_color(*fg)
        self.set_line_width(0.5)
        w = 186
        lines = self._split_text(text, w - 8)
        h = len(lines) * 5.5 + 6
        self.rect(12, y, w, h, "DF")
        self.set_y(y + 3)
        self.set_font("Arial", "", 8.5)
        self.set_text_color(*fg)
        for line in lines:
            self.set_x(16)
            self.cell(w - 8, 5.5, line)
            self.ln(5.5)
        self.ln(3)
        self.set_text_color(*DARK)
        self.set_draw_color(0, 0, 0)
        self.set_line_width(0.2)

    def _split_text(self, text, width):
        self.set_font("Arial", "", 8.5)
        words = text.replace("\n", " \n ").split(" ")
        lines = []
        current = ""
        for word in words:
            if word == "\n":
                lines.append(current.strip())
                current = ""
            elif self.get_string_width(current + " " + word) < width:
                current += (" " if current else "") + word
            else:
                if current:
                    lines.append(current.strip())
                current = word
        if current.strip():
            lines.append(current.strip())
        return lines

    def table(self, headers, rows, col_widths=None):
        self.ln(3)
        n = len(headers)
        if col_widths is None:
            usable = 186
            col_widths = [usable // n] * n

        self.set_fill_color(*TABLE_HEADER)
        self.set_text_color(*WHITE)
        self.set_font("Arial", "B", 8)
        self.set_x(12)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 7, h, border=1, fill=True)
        self.ln()

        for row_idx, row in enumerate(rows):
            fill = row_idx % 2 == 1
            self.set_fill_color(*TABLE_ALT)
            self.set_text_color(*DARK)
            self.set_font("Arial", "", 8)
            self.set_x(12)

            max_lines = 1
            for i, cell in enumerate(row):
                words = str(cell)
                if self.get_string_width(words) > col_widths[i] - 2:
                    max_lines = max(max_lines, 2)

            row_h = 6 if max_lines == 1 else 5
            for i, cell in enumerate(row):
                if i < len(col_widths):
                    x = self.get_x()
                    y = self.get_y()
                    self.multi_cell(col_widths[i], row_h, str(cell), border=1, fill=fill)
                    self.set_xy(x + col_widths[i], y)
            self.ln(row_h * max_lines if max_lines > 1 else row_h)

        self.ln(3)
        self.set_text_color(*DARK)

    def signature_block(self, party, fields):
        self.ln(4)
        self.set_fill_color(*GRAY_BG)
        self.set_font("Arial", "B", 9)
        self.set_x(12)
        self.cell(186, 7, f"  {party}", fill=True, ln=True)
        self.set_font("Arial", "", 9)
        for label in fields:
            self.set_x(14)
            self.cell(60, 7, f"{label} :")
            self.set_draw_color(180, 180, 180)
            self.line(self.get_x(), self.get_y() + 6, self.get_x() + 110, self.get_y() + 6)
            self.ln(8)
        self.ln(4)


def write_dpa(output_path):
    pdf = BaobabPDF(
        "CONTRAT DE SOUS-TRAITANCE",
        "Data Processing Agreement (DPA)",
        "01"
    )
    pdf.cover_page()
    pdf.add_page()

    pdf.section_title("PREAMBULE")
    pdf.body_text(
        "Dans le cadre de la fourniture du service Baobab Loyalty (logiciel SaaS de fidelisation client "
        "pour hotels), Baobab Loyalty est amenee a traiter des donnees a caractere personnel pour le compte "
        "de l'Hotelier. Le present contrat definit les conditions dans lesquelles Baobab Loyalty s'engage "
        "a effectuer ces operations de traitement conformement aux instructions de l'Hotelier."
    )
    pdf.info_box(
        "Conforme a : Article 28 du RGPD · Loi n 2013-450 (Cote d'Ivoire) · Loi n 2008-12 (Senegal) · Loi n 09-08 (Maroc)",
        "important"
    )

    pdf.section_title("IDENTIFICATION DES PARTIES")
    pdf.section_title("Le Responsable de Traitement (l'Hotelier)", level=2)
    pdf.table(
        ["Champ", "A remplir par l'hotelier"],
        [
            ["Raison sociale", "___________________________________"],
            ["Forme juridique", "___________________________________"],
            ["Adresse du siege", "___________________________________"],
            ["Pays", "___________________________________"],
            ["Represente par", "___________________________________"],
            ["Email", "___________________________________"],
        ],
        [70, 116]
    )

    pdf.section_title("Le Sous-traitant : Baobab Loyalty", level=2)
    pdf.table(
        ["Champ", "Information"],
        [
            ["Raison sociale", "Baobab Loyalty"],
            ["Email", "support@baobabloyalty.com"],
            ["Site web", "baobabloyalty.com"],
        ],
        [70, 116]
    )

    pdf.section_title("ARTICLE 2 — DESCRIPTION DU TRAITEMENT")
    pdf.section_title("2.3 Categories de donnees traitees", level=3)
    pdf.table(
        ["Categorie", "Donnees", "Sensibilite"],
        [
            ["Identite", "Nom, prenom", "Standard"],
            ["Contact", "Email, telephone, WhatsApp", "Standard"],
            ["Comportement", "Date de derniere visite, notes internes", "Standard"],
            ["Interaction", "Statut lecture messages, clics offres", "Standard"],
        ],
        [50, 96, 40]
    )
    pdf.info_box("Aucune donnee sensible au sens de l'article 9 du RGPD n'est traitee.", "important")

    pdf.section_title("2.5 Destinataires des donnees", level=3)
    pdf.table(
        ["Destinataire", "Role"],
        [
            ["L'Hotelier", "Responsable de traitement — acces direct via interface"],
            ["Baobab Loyalty", "Sous-traitant — acces technique limite a la maintenance"],
            ["Supabase Inc.", "Hebergeur base de donnees (sous-traitant ulterieur)"],
            ["WhatsApp Business API", "Envoi des messages uniquement"],
        ],
        [80, 106]
    )

    pdf.add_page()
    pdf.section_title("ARTICLE 3 — OBLIGATIONS DE BAOBAB LOYALTY")
    obligations = [
        ("3.1 Traitement sur instruction", "Traiter les donnees uniquement sur instruction documentee de l'Hotelier."),
        ("3.2 Confidentialite", "Veiller a ce que les personnes autorisees respectent la confidentialite."),
        ("3.3 Securite technique", "Chiffrement TLS 1.3, AES-256, JWT, RLS PostgreSQL, Supabase Vault, sauvegardes quotidiennes."),
        ("3.4 Sous-traitants ulterieurs", "Ne pas recruter un sous-traitant sans accord prealable ecrit de l'Hotelier."),
        ("3.5 Droits des personnes", "Aider l'Hotelier a repondre aux exercices de droits (acces, rectification, suppression)."),
        ("3.6 Notification violations", "Notifier l'Hotelier de toute violation dans les 72 heures."),
        ("3.8 Suppression", "Supprimer toutes les donnees dans les 30 jours apres fin du contrat."),
    ]
    for title, text in obligations:
        pdf.section_title(title, level=3)
        pdf.body_text(text)

    pdf.section_title("ARTICLE 5 — SOUS-TRAITANTS ULTERIEURS AUTORISES")
    pdf.table(
        ["Sous-traitant", "Pays", "Role", "Donnees transmises"],
        [
            ["Supabase Inc.", "USA (AWS EU West)", "Hebergement BDD", "Toutes les donnees"],
            ["Vercel Inc.", "USA", "Hebergement web", "Aucune donnee client"],
            ["Resend Inc.", "USA", "Emails transactionnels", "Email hotelier uniquement"],
            ["OpenRouter", "USA", "Generation IA", "Texte du message (sans PII)"],
            ["WhatsApp (Meta)", "USA", "Envoi messages", "Numero de telephone"],
            ["Moneroo", "Afrique", "Paiements FCFA", "Donnees facturation hotelier"],
        ],
        [40, 35, 55, 56]
    )

    pdf.section_title("ARTICLE 7 — DUREES DE CONSERVATION")
    pdf.table(
        ["Type de donnee", "Duree", "Motif"],
        [
            ["Donnees clients", "Duree du compte actif", "Necessite fonctionnelle"],
            ["Journaux messages", "3 ans apres envoi", "Tracabilite legale"],
            ["Donnees reservation", "5 ans", "Obligation comptable"],
            ["Apres cloture compte", "Suppression sous 30 jours", "Article 3.8 DPA"],
        ],
        [70, 60, 56]
    )

    pdf.add_page()
    pdf.section_title("SIGNATURES")
    pdf.signature_block("Pour l'Hotelier (Responsable de traitement)", ["Nom", "Qualite", "Date", "Signature"])
    pdf.signature_block("Pour Baobab Loyalty (Sous-traitant)", ["Nom", "Qualite", "Date", "Signature"])

    pdf.output(output_path)
    print(f"  OK: {output_path}")


def write_guide(output_path):
    pdf = BaobabPDF(
        "GUIDE DE CONFORMITE",
        "Protection des Donnees Personnelles — A l'usage des Hoteliers",
        "02"
    )
    pdf.cover_page()
    pdf.add_page()

    pdf.section_title("INTRODUCTION")
    pdf.body_text(
        "En utilisant Baobab Loyalty, vous traitez des donnees a caractere personnel de vos clients. "
        "Cela vous soumet a des obligations legales selon votre pays. Ce guide vous explique, etape par "
        "etape, ce que vous devez faire pour etre en conformite."
    )

    pdf.section_title("ETAPE 1 — Signer le DPA avec Baobab Loyalty")
    pdf.info_box("Obligatoire dans tous les pays. A faire en premier, AVANT d'utiliser Baobab Loyalty.", "warning")
    pdf.body_text("1. Telecharger le Document 01 (DPA — Contrat de Sous-traitance)")
    pdf.body_text("2. Remplir vos informations (raison sociale, adresse, representant legal)")
    pdf.body_text("3. Signer et dater")
    pdf.body_text("4. Envoyer un exemplaire signe a : support@baobabloyalty.com")
    pdf.body_text("5. Conserver un exemplaire dans vos archives")

    pdf.section_title("ETAPE 2 — Informer vos clients")
    pdf.info_box("Obligatoire dans tous les pays. A faire avant ou au moment de l'import des donnees.", "warning")
    pdf.body_text("1. Telecharger le Document 03 (Notice d'Information Clients)")
    pdf.body_text("2. Personnaliser avec le nom de votre hotel et vos coordonnees")
    pdf.body_text("3. Choisir AU MOINS DEUX des moyens de diffusion suivants :")
    pdf.body_text("   - Afficher la notice a la reception (format A4 encadre)", indent=4)
    pdf.body_text("   - L'inclure dans le formulaire de check-in signe par le client", indent=4)
    pdf.body_text("   - L'envoyer par email a la confirmation de reservation", indent=4)
    pdf.body_text("   - La publier sur le site web de votre hotel", indent=4)

    pdf.add_page()
    pdf.section_title("ETAPE 3 — Declaration a l'autorite competente")

    pdf.section_title("COTE D'IVOIRE — Declaration a l'ARTCI", level=2)
    pdf.info_box("Base legale : Loi n 2013-450 du 19 juin 2013. Declaration requise AVANT utilisation.", "warning")
    pdf.table(
        ["Champ du formulaire ARTCI", "Ce que vous indiquez"],
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

    pdf.section_title("SENEGAL — Declaration a la CDP", level=2)
    pdf.body_text("1. Creer un compte sur le portail CDP : www.cdp.sn")
    pdf.body_text("2. Remplir le formulaire de declaration en ligne")
    pdf.body_text("3. Joindre une copie du DPA signe avec Baobab Loyalty")
    pdf.body_text("4. Conserver le recepisse de declaration")
    pdf.info_box("Sanction en cas de non-declaration : jusqu'a 5 millions de FCFA d'amende.", "warning")

    pdf.section_title("FRANCE / UNION EUROPEENNE — Conformite RGPD", level=2)
    pdf.body_text("1. Tenir un registre des activites de traitement (obligatoire si > 250 salaries)")
    pdf.body_text("2. Signer le DPA avec Baobab Loyalty (Article 28 RGPD)")
    pdf.body_text("3. Informer vos clients via la notice de confidentialite")
    pdf.info_box("Aucune declaration prealable a la CNIL n'est requise (le RGPD a supprime cette obligation).", "important")

    pdf.add_page()
    pdf.section_title("RECAPITULATIF DES ACTIONS PAR PAYS")
    pdf.table(
        ["Action", "Cote d'Ivoire", "Senegal", "Maroc", "UE/France", "Delai"],
        [
            ["Signer le DPA", "OUI", "OUI", "OUI", "OUI", "Immediat"],
            ["Notice clients", "OUI", "OUI", "OUI", "OUI", "Avant import"],
            ["Declaration ARTCI", "OUI", "—", "—", "—", "Avant utilisation"],
            ["Declaration CDP", "—", "OUI", "—", "—", "Avant utilisation"],
            ["Declaration CNDP", "—", "—", "OUI", "—", "Avant utilisation"],
            ["Registre traitements", "Recommande", "Recommande", "Recommande", "Obligatoire", "Avant import"],
            ["Formation personnel", "OUI", "OUI", "OUI", "OUI", "Sous 60 jours"],
        ],
        [50, 26, 22, 22, 26, 40]
    )

    pdf.section_title("EN CAS DE VIOLATION DE DONNEES")
    pdf.info_box(
        "Si vous suspectez une compromission des donnees : contactez immediatement Baobab Loyalty "
        "a support@baobabloyalty.com. Baobab Loyalty vous notifiera dans les 72 heures avec un rapport d'incident.",
        "warning"
    )
    pdf.table(
        ["Autorite", "Pays", "Site web"],
        [
            ["ARTCI", "Cote d'Ivoire", "www.artci.ci"],
            ["CDP", "Senegal", "www.cdp.sn — cdp@cdp.sn"],
            ["CNDP", "Maroc", "www.cndp.ma"],
            ["CNIL", "France", "www.cnil.fr — Delai : 72h"],
        ],
        [60, 50, 76]
    )

    pdf.output(output_path)
    print(f"  OK: {output_path}")


def write_notice(output_path):
    pdf = BaobabPDF(
        "NOTICE D'INFORMATION CLIENTS",
        "Template — Protection de vos Donnees Personnelles",
        "03"
    )
    pdf.cover_page()
    pdf.add_page()

    pdf.info_box(
        "INSTRUCTIONS POUR L'HOTELIER : Remplacez les zones entre crochets [...] par vos informations. "
        "Choisissez la version adaptee a votre pays. Affichez ce document a la reception et/ou sur votre site web.",
        "warning"
    )

    pdf.section_title("VERSION A — Notice Generale (tous pays)")
    pdf.section_title("Qui traite vos donnees ?", level=3)
    pdf.body_text(
        "[Nom de l'hotel], [forme juridique], dont le siege social est situe [adresse], est responsable du "
        "traitement de vos donnees personnelles. Contact DPO : [email]"
    )

    pdf.section_title("Quelles donnees collectons-nous et pourquoi ?", level=3)
    pdf.table(
        ["Donnees", "Pourquoi nous les utilisons"],
        [
            ["Nom et prenom", "Vous identifier et personnaliser nos communications"],
            ["Adresse email", "Vous envoyer des confirmations et offres de fidelisation"],
            ["Telephone / WhatsApp", "Vous envoyer des messages de fidelisation via WhatsApp"],
            ["Date de dernier sejour", "Vous proposer des offres adaptees a votre profil"],
        ],
        [70, 116]
    )

    pdf.section_title("Qui recoit vos donnees ?", level=3)
    pdf.body_text("- Baobab Loyalty (sous-traitant) : gestion technique du programme de fidelisation")
    pdf.body_text("- WhatsApp Business API (Meta) : votre numero de telephone pour l'envoi des messages")
    pdf.info_box("Vos donnees ne sont JAMAIS vendues a des tiers.", "important")

    pdf.section_title("Ou sont stockees vos donnees ?", level=3)
    pdf.body_text(
        "Vos donnees sont hebergees sur des serveurs securises situes en Europe de l'Ouest (Irlande), "
        "operes par Amazon Web Services (AWS), et soumis au RGPD europeen."
    )

    pdf.section_title("Vos droits", level=3)
    pdf.table(
        ["Droit", "Description"],
        [
            ["Droit d'acces", "Obtenir une copie de vos donnees"],
            ["Droit de rectification", "Corriger des donnees inexactes"],
            ["Droit a l'effacement", "Demander la suppression de vos donnees"],
            ["Droit d'opposition", "Vous opposer a l'utilisation a des fins marketing"],
            ["Droit a la portabilite", "Recevoir vos donnees dans un format structure"],
        ],
        [60, 126]
    )
    pdf.body_text("Pour exercer vos droits : [email de l'hotel] | [adresse de l'hotel] | A la reception")
    pdf.body_text("Delai de reponse : 30 jours maximum.")

    pdf.add_page()
    pdf.section_title("VERSION B — Notice specifique Cote d'Ivoire")
    pdf.info_box(
        "Conforme a la Loi n 2013-450 du 19 juin 2013 — Supervisee par l'ARTCI",
        "important"
    )
    pdf.table(
        ["Champ", "Information"],
        [
            ["Responsable du traitement", "[Nom de l'hotel], [adresse], represente par [nom du dirigeant]"],
            ["Finalite du traitement", "Fidelisation clientele hoteliere par communications WhatsApp personnalisees"],
            ["Donnees traitees", "Nom, telephone/WhatsApp, email, date de derniere visite"],
            ["Sous-traitant", "Baobab Loyalty (contrat de sous-traitance signe)"],
            ["Transfert hors CI", "Oui — serveurs AWS EU West (Irlande) — proteges par RGPD"],
            ["N declaration ARTCI", "[A completer apres depot de la declaration]"],
            ["Duree de conservation", "[X annees] a compter de votre dernier sejour"],
        ],
        [70, 116]
    )
    pdf.body_text(
        "Vos droits (Articles 22 a 29 Loi 2013-450) : acces, rectification, opposition. "
        "Contact : [email de l'hotel]"
    )
    pdf.body_text("Reclamations ARTCI : Tour Postel 2001, Avenue Marchand, Abidjan-Plateau — www.artci.ci")

    pdf.section_title("VERSION C — Notice specifique Senegal")
    pdf.info_box(
        "Conforme a la Loi n 2008-12 du 25 janvier 2008 — Supervisee par la CDP",
        "important"
    )
    pdf.table(
        ["Champ", "Information"],
        [
            ["Responsable du traitement", "[Nom de l'hotel], enregistre a la CDP sous le n [...]"],
            ["Finalite", "Communication d'offres commerciales de fidelisation par voie WhatsApp"],
            ["Donnees traitees", "Identite, coordonnees telephoniques, historique de sejour"],
            ["Sous-traitant", "Baobab Loyalty, lie par contrat conforme a la loi senegalaise"],
            ["Duree", "[X annees] apres votre dernier sejour"],
        ],
        [70, 116]
    )
    pdf.body_text("Droits : Acces, rectification, effacement, opposition — [email de l'hotel]")
    pdf.body_text("Reclamations CDP : www.cdp.sn — cdp@cdp.sn")

    pdf.output(output_path)
    print(f"  OK: {output_path}")


def write_artci(output_path):
    pdf = BaobabPDF(
        "FORMULAIRE DECLARATION ARTCI",
        "Cote d'Ivoire — Loi n 2013-450 du 19 juin 2013",
        "04"
    )
    pdf.cover_page()
    pdf.add_page()

    pdf.info_box(
        "A deposer aupres de l'ARTCI : Tour Postel 2001, Avenue Marchand, Abidjan-Plateau — www.artci.ci. "
        "Joindre une copie du DPA signe avec Baobab Loyalty.",
        "warning"
    )

    pdf.section_title("SECTION 1 — IDENTITE DU RESPONSABLE DE TRAITEMENT")
    pdf.table(
        ["Champ", "A remplir par l'hotelier"],
        [
            ["Raison sociale / Nom", "[Nom complet de l'hotel]"],
            ["Forme juridique", "[SA / SARL / SAS / Entreprise individuelle]"],
            ["Numero RCCM", "[Numero RCCM de l'hotel]"],
            ["Adresse du siege", "[Adresse complete, ville, Cote d'Ivoire]"],
            ["Representant legal", "[Nom et prenom du directeur / gerant]"],
            ["Email de contact", "[Email professionnel de l'hotel]"],
            ["Telephone", "[Numero de telephone de l'hotel]"],
        ],
        [70, 116]
    )

    pdf.section_title("SECTION 3 — INTITULE ET FINALITE DU TRAITEMENT")
    pdf.info_box(
        'Intitule a copier dans le formulaire ARTCI : "Gestion de la fidelisation de la clientele '
        'hoteliere par communications personnalisees via WhatsApp"',
        "important"
    )
    pdf.body_text(
        "Finalite principale : Fidelisation de la clientele hoteliere par l'envoi de messages de "
        "prospection commerciale (offres promotionnelles, reductions, surclassements) via WhatsApp."
    )
    pdf.body_text(
        "Base legale : Interet legitime du responsable de traitement (fidelisation de la clientele "
        "existante) — Article 5 de la Loi n 2013-450."
    )

    pdf.section_title("SECTION 4 — CATEGORIES DE DONNEES TRAITEES")
    pdf.table(
        ["Categorie", "Donnees", "Obligatoire"],
        [
            ["Identite", "Nom et prenom du client", "Obligatoire"],
            ["Coordonnees", "Adresse email", "Facultatif"],
            ["Coordonnees", "Numero de telephone mobile", "Facultatif"],
            ["Coordonnees", "Numero WhatsApp", "Obligatoire pour l'envoi"],
            ["Historique", "Date du dernier sejour", "Obligatoire"],
            ["Notes internes", "Commentaires de l'hotelier (usage interne)", "Facultatif"],
        ],
        [50, 96, 40]
    )
    pdf.info_box("Aucune donnee sensible (sante, origine ethnique, religion...) n'est traitee.", "important")

    pdf.add_page()
    pdf.section_title("SECTION 6 — DESTINATAIRES DES DONNEES")
    pdf.table(
        ["Destinataire", "Qualite", "Donnees transmises", "Localisation"],
        [
            ["[Nom de l'hotel]", "Responsable de traitement", "Toutes les donnees", "Cote d'Ivoire"],
            ["Baobab Loyalty", "Sous-traitant", "Toutes (gestion technique)", "Hebergement EU"],
            ["WhatsApp (Meta)", "Destinataire envoi", "Numero de telephone", "Etats-Unis"],
        ],
        [40, 40, 60, 46]
    )

    pdf.section_title("SECTION 7 — TRANSFERTS INTERNATIONAUX DE DONNEES")
    pdf.info_box("Y a-t-il un transfert hors de Cote d'Ivoire ? OUI", "warning")
    pdf.table(
        ["Element", "Detail"],
        [
            ["Pays destinataire", "Union Europeenne (Irlande)"],
            ["Organisme", "Amazon Web Services EMEA SARL (via Supabase Inc.)"],
            ["Garanties offertes", "RGPD (UE 2016/679) — niveau de protection superieur a la Loi 2013-450"],
            ["Mecanisme de transfert", "Clauses Contractuelles Types (CCT) de la Commission Europeenne"],
        ],
        [70, 116]
    )

    pdf.section_title("SECTION 9 — MESURES DE SECURITE")
    pdf.table(
        ["Mesure", "Implantee", "Detail"],
        [
            ["Controle d'acces", "Oui", "Authentification JWT, identifiants uniques"],
            ["Isolation des donnees", "Oui", "RLS PostgreSQL — chaque hotelier voit ses donnees uniquement"],
            ["Chiffrement en transit", "Oui", "HTTPS / TLS 1.3 sur toutes les connexions"],
            ["Chiffrement au repos", "Oui", "Infrastructure AWS AES-256"],
            ["Journalisation", "Oui", "Journal complet de tous les messages envoyes"],
            ["Sauvegardes", "Oui", "Sauvegardes automatiques quotidiennes"],
            ["Gestion incidents", "Oui", "Notification sous 72h en cas de violation"],
        ],
        [60, 25, 101]
    )

    pdf.section_title("DOCUMENTS A JOINDRE")
    pdf.body_text("- Copie de l'extrait RCCM de l'hotel")
    pdf.body_text("- Copie du DPA signe avec Baobab Loyalty (Document 01)")
    pdf.body_text("- Exemplaire de la Notice d'Information clients (Document 03)")

    pdf.section_title("SIGNATURES")
    pdf.signature_block("Representant de l'hotel", ["Nom et prenom", "Qualite", "Date", "Signature et cachet"])

    pdf.output(output_path)
    print(f"  OK: {output_path}")


def write_registre(output_path):
    pdf = BaobabPDF(
        "REGISTRE DES ACTIVITES DE TRAITEMENT",
        "Document Interne — Baobab Loyalty",
        "05"
    )
    pdf.cover_page()
    pdf.add_page()

    pdf.info_box(
        "Conforme a l'Article 30 du RGPD · Article 8 de la Loi n 2013-450 (Cote d'Ivoire) · Loi n 2008-12 (Senegal). "
        "Document confidentiel — Transmissible aux autorites de controle sur demande.",
        "info"
    )

    pdf.section_title("PARTIE I — INFORMATIONS SUR BAOBAB LOYALTY")
    pdf.table(
        ["Champ", "Information"],
        [
            ["Raison sociale", "Baobab Loyalty"],
            ["Role", "Sous-traitant (donnees clients hotels) ET Responsable de traitement (donnees abonnes)"],
            ["Contact DPO", "support@baobabloyalty.com"],
        ],
        [60, 126]
    )

    pdf.section_title("PARTIE II — TRAITEMENTS EN TANT QUE SOUS-TRAITANT")
    pdf.info_box(
        "Ces traitements sont effectues POUR LE COMPTE des hoteliers (responsables de traitement). "
        "Baobab Loyalty execute uniquement sur instruction.",
        "info"
    )

    for ref, title, details in [
        ("ST-01", "Gestion de la base clients hoteliere", [
            ("Finalite", "Stocker, segmenter et gerer la base clients pour campagnes WhatsApp"),
            ("Base legale", "Interet legitime de l'hotelier (Article 6.1.f RGPD)"),
            ("Donnees traitees", "Nom, email, telephone, WhatsApp, date de derniere visite, notes"),
            ("Personnes concernees", "Clients (voyageurs) des hotels abonnes"),
            ("Duree de conservation", "Duree du compte actif + 30 jours apres resiliation"),
            ("Hebergement", "Supabase Inc. — AWS EU West (Irlande)"),
            ("Sous-traitants ulterieurs", "Supabase Inc. (hebergement), WhatsApp/Meta (envoi)"),
        ]),
        ("ST-02", "Envoi de campagnes WhatsApp", [
            ("Finalite", "Transmettre des messages commerciaux personnalises aux clients des hotels"),
            ("Donnees traitees", "Numero de telephone/WhatsApp du client, texte du message"),
            ("Duree des logs", "3 ans apres l'envoi (tracabilite)"),
            ("Sous-traitant", "WhatsApp Business API (Meta Platforms)"),
        ]),
        ("ST-03", "Tracking des reservations et offres", [
            ("Finalite", "Mesurer l'efficacite des campagnes (clics, reservations converties, revenus)"),
            ("Donnees traitees", "ID client, statut du clic, date et montant de reservation"),
            ("Duree de conservation", "5 ans (obligation comptable)"),
        ]),
    ]:
        pdf.section_title(f"{ref} — {title}", level=2)
        pdf.table(["Champ", "Detail"], details, [55, 131])

    pdf.add_page()
    pdf.section_title("PARTIE III — TRAITEMENTS EN TANT QUE RESPONSABLE DE TRAITEMENT")

    for ref, title, details in [
        ("RT-01", "Gestion des comptes hoteliers (abonnes)", [
            ("Finalite", "Creation et gestion des comptes hoteliers, authentification, configuration"),
            ("Base legale", "Execution du contrat d'abonnement (Article 6.1.b RGPD)"),
            ("Donnees traitees", "Email, nom hotel, pays, adresse, telephone, role"),
            ("Duree de conservation", "Duree de l'abonnement + 3 ans apres cloture"),
            ("Hebergement", "Supabase (table profiles) — AWS EU West (Irlande)"),
        ]),
        ("RT-02", "Facturation et paiements", [
            ("Finalite", "Facturation des abonnements SaaS (plans Essentiel, Croissance, Premium)"),
            ("Base legale", "Execution du contrat + obligation legale (comptabilite)"),
            ("Donnees traitees", "Email, nom, montant abonnement, historique paiements"),
            ("Duree de conservation", "7 ans (obligation legale comptable)"),
            ("Sous-traitants", "Stripe Inc. (paiements carte), Moneroo (paiements FCFA)"),
        ]),
        ("RT-04", "Generation de contenu par IA", [
            ("Finalite", "Aider les hoteliers a rediger des messages via intelligence artificielle"),
            ("Donnees traitees", "Texte du message uniquement — AUCUNE donnee nominative cliente"),
            ("Duree de conservation", "Non applicable — traitement en temps reel, pas de stockage"),
            ("Sous-traitant", "OpenRouter Inc. (routage vers modeles IA)"),
        ]),
    ]:
        pdf.section_title(f"{ref} — {title}", level=2)
        pdf.table(["Champ", "Detail"], details, [55, 131])

    pdf.section_title("PARTIE IV — SOUS-TRAITANTS ULTERIEURS")
    pdf.table(
        ["Sous-traitant", "Pays", "Role", "Conformite"],
        [
            ["Supabase Inc.", "USA (AWS EU West)", "Hebergement BDD", "RGPD + CCT"],
            ["Vercel Inc.", "USA", "Hebergement web", "RGPD + CCT"],
            ["Resend Inc.", "USA", "Emails transactionnels", "RGPD + CCT"],
            ["OpenRouter Inc.", "USA", "Routage IA", "CGU"],
            ["WhatsApp (Meta)", "USA", "Envoi messages", "CCT"],
            ["Stripe Inc.", "USA (EU)", "Paiements carte", "RGPD + PCI-DSS"],
            ["Moneroo", "Afrique", "Paiements FCFA", "Regl. locales"],
        ],
        [44, 34, 56, 52]
    )

    pdf.section_title("PARTIE VIII — MESURES ORGANISATIONNELLES")
    pdf.section_title("Acces aux donnees clients des hotels", level=3)
    pdf.table(
        ["Role", "Acces aux donnees clients", "Niveau d'acces"],
        [
            ["Hotelier (abonne)", "Oui", "Ses clients uniquement (RLS)"],
            ["Employes hotelier", "Oui", "Idem (meme compte hotelier)"],
            ["Equipe technique Baobab Loyalty", "Oui, limite", "Via Supabase Dashboard — maintenance uniquement"],
            ["Support client Baobab Loyalty", "Non", "Pas d'acces direct aux donnees clients"],
        ],
        [55, 35, 96]
    )

    pdf.section_title("Politique de suppression des donnees", level=3)
    pdf.body_text("- Resiliation du compte : export disponible pendant 30 jours")
    pdf.body_text("- Apres 30 jours : suppression definitive et irreversible")
    pdf.body_text("- Sur demande : certificat de suppression fourni dans les 15 jours")

    pdf.output(output_path)
    print(f"  OK: {output_path}")


def main():
    base = os.path.dirname(os.path.abspath(__file__))
    docs = [
        ("01_DPA_Contrat_Sous_Traitance.pdf", write_dpa),
        ("02_Guide_Conformite_Hoteliers.pdf", write_guide),
        ("03_Notice_Information_Clients.pdf", write_notice),
        ("04_Declaration_ARTCI.pdf", write_artci),
        ("05_Registre_Traitements_Baobab.pdf", write_registre),
    ]
    print("Generating Baobab Loyalty compliance PDFs...")
    for filename, fn in docs:
        path = os.path.join(base, filename)
        try:
            fn(path)
        except Exception as e:
            print(f"  ERROR {filename}: {e}", file=sys.stderr)
    print("Done.")


if __name__ == "__main__":
    main()
