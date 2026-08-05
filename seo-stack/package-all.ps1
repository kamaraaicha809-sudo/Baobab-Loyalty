# package-all.ps1
# Cree un fichier .skill (archive zip) pour chacun des 12 skills.
# Utilisation : depuis le dossier seo-stack, faire clic-droit sur le fichier
# -> "Executer avec PowerShell" (ou en ligne de commande : pwsh ./package-all.ps1)

$ErrorActionPreference = "Stop"

# Le dossier ou se trouve ce script
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$skills = @(
    # Stack technique generique (6)
    "seo-audit",
    "seo-meta",
    "seo-sitemap",
    "seo-schema",
    "seo-keywords",
    "seo-content",
    # Stack operationnelle Baobab Loyalty (6)
    "baobabloyalty-seo-ops",
    "baobabloyalty-seo-writer",
    "baobabloyalty-seo-refresh",
    "baobabloyalty-seo-brief",
    "baobabloyalty-seo-tracker",
    "baobabloyalty-seo-legal"
)

Write-Host "Packaging des 12 skills dans : $root" -ForegroundColor Cyan
Write-Host ""

$success = 0
$skipped = 0

foreach ($name in $skills) {
    $sourceDir  = Join-Path $root $name
    $tmpZip     = Join-Path $root "$name.zip"
    $finalSkill = Join-Path $root "$name.skill"

    if (-not (Test-Path $sourceDir)) {
        Write-Host "  [SKIP] $name (dossier absent)" -ForegroundColor Yellow
        $skipped++
        continue
    }

    if (Test-Path $tmpZip)     { Remove-Item $tmpZip }
    if (Test-Path $finalSkill) { Remove-Item $finalSkill }

    # On cree le zip avec le nom du dossier comme racine de l'archive
    Compress-Archive -Path $sourceDir -DestinationPath $tmpZip -CompressionLevel Optimal
    Rename-Item -Path $tmpZip -NewName "$name.skill"

    Write-Host "  [OK]   $name.skill" -ForegroundColor Green
    $success++
}

Write-Host ""
Write-Host "Termine : $success skills packages, $skipped ignores." -ForegroundColor Cyan
Write-Host ""
Write-Host "Installation : ouvre Cowork, glisse-depose chaque .skill dans la conversation," -ForegroundColor Gray
Write-Host "puis clique sur le bouton 'Save skill' qui apparait sur la carte du fichier." -ForegroundColor Gray
