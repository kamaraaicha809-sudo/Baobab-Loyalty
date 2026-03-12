# Configuration GitHub - Baobab Loyalty

**Dépôt :** [https://github.com/kamaraaicha809-sudo/Baobab-Loyalty](https://github.com/kamaraaicha809-sudo/Baobab-Loyalty)

## Pousser ce projet vers GitHub

### Prérequis
Installez Git : [https://git-scm.com/download/win](https://git-scm.com/download/win)

### Méthode 1 : Double-clic (le plus simple)
Double-cliquez sur **`PUSH_VERS_GITHUB.bat`** dans le dossier du projet.  
Une fenêtre s'ouvrira : si Git demande vos identifiants, entrez votre token GitHub comme mot de passe.

### Méthode 2 : Script PowerShell
```powershell
.\scripts\push-to-github.ps1
```

### Méthode 3 : Commandes manuelles
Ouvrez un terminal dans le dossier du projet :

```bash
git init
git add .
git commit -m "Initial commit - Baobab Loyalty"
git branch -M main
git remote add origin https://github.com/kamaraaicha809-sudo/Baobab-Loyalty.git
git push -u origin main
```

**Note :** À la première connexion, Git peut demander vos identifiants GitHub.
