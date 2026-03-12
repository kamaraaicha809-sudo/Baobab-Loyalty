@echo off
chcp 65001 >nul
echo ========================================
echo   Pousser Baobab Loyalty vers GitHub
echo ========================================
echo.

cd /d "%~dp0"

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCES ! Votre projet est sur GitHub.
    echo https://github.com/kamaraaicha809-sudo/Baobab-Loyalty
) else (
    echo.
    echo Si Git demande vos identifiants :
    echo - Nom d'utilisateur : kamaraaicha809-sudo
    echo - Mot de passe : utilisez un token GitHub
    echo.
    echo Creer un token : https://github.com/settings/tokens
    echo Cochez "repo" puis Generate. Collez le token comme mot de passe.
)

echo.
pause
