#!/bin/bash

echo "🚀 InfoEau - Build avec Vérification ENV Complète"
echo "================================================"

# 1. Diagnostic ENV pré-build
echo "📋 1. Diagnostic ENV pré-build..."
if command -v tsx &> /dev/null; then
    tsx src/scripts/env-diagnostic.ts
    env_status=$?
else
    echo "⚠️ tsx non disponible, tentative avec npx..."
    npx tsx src/scripts/env-diagnostic.ts
    env_status=$?
fi

if [ $env_status -ne 0 ]; then
    echo "❌ Problème de configuration ENV détecté"
    echo "🔧 Veuillez corriger les problèmes avant le build"
    exit 1
fi

echo ""

# 2. Purge du cache Vite
echo "🧹 2. Purge du cache Vite..."
rm -rf node_modules/.vite/
rm -rf dist/

# 3. Vérification du fichier .env
echo "📄 3. Vérification du fichier .env..."
if [ -f ".env" ]; then
    echo "✅ Fichier .env trouvé à la racine"
    echo "📝 Variables VITE_* détectées:"
    grep -E '^VITE_' .env | cut -d'=' -f1 | while read var; do
        echo "   - $var"
    done
else
    echo "❌ Fichier .env manquant à la racine du projet"
    echo "🔧 Créez le fichier .env avec les variables VITE_*"
    exit 1
fi

echo ""

# 4. Build avec variables d'environnement
echo "⚡ 4. Build Vite avec injection des variables..."
echo ""

# Capturer le temps de début
start_time=$(date +%s)

# Lancer le build avec vérification
if npm run build; then
    # Capturer le temps de fin
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    echo ""
    echo "✅ BUILD RÉUSSI !"
    echo "==================="
    echo "⏱️  Durée: ${duration}s"
    echo "📂 Dossier de sortie: dist/"
    echo ""
    
    # Vérifier que les assets ont été générés
    if [ -d "dist" ]; then
        echo "📊 Taille des fichiers générés:"
        du -sh dist/* 2>/dev/null | head -5
        echo ""
        
        echo "🔍 Fichiers JS/CSS générés:"
        find dist -name "*.js" -o -name "*.css" | head -5
        echo ""
    fi
    
    echo "🎉 Build InfoEau terminé avec succès !"
    echo "   Variables d'environnement correctement injectées"
    echo ""
    echo "🔄 Étapes suivantes:"
    echo "   1. Lancez npm run dev ou servez le dossier dist/"
    echo "   2. Accédez à /admin/security"
    echo "   3. Vérifiez le statut ENV Helper"
    
else
    echo ""
    echo "❌ ÉCHEC DU BUILD"
    echo "=================="
    echo ""
    echo "💡 Vérifications suggérées:"
    echo "1. Variables d'environnement définies dans .env"
    echo "2. Syntaxe TypeScript correcte"
    echo "3. Imports et dépendances valides"
    echo "4. Relancez tsx src/scripts/env-diagnostic.ts pour diagnostiquer"
    echo ""
    exit 1
fi