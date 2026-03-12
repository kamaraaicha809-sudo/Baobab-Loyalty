# Pousse le projet Baobab Loyalty vers GitHub
# https://github.com/kamaraaicha809-sudo/Baobab-Loyalty

$ErrorActionPreference = "Stop"
$repoUrl = "https://github.com/kamaraaicha809-sudo/Baobab-Loyalty.git"
$projectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Set-Location $projectDir

if (-not (Test-Path .git)) {
    git init
    git add .
    git commit -m "Initial commit - Baobab Loyalty Micro-SaaS"
    git branch -M main
    git remote add origin $repoUrl
    git push -u origin main
} else {
    git remote remove origin 2>$null
    git remote add origin $repoUrl
    git add .
    git status
    Write-Host "`nExécutez: git commit -m 'Votre message' puis git push -u origin main"
}
