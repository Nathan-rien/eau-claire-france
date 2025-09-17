#!/bin/bash

echo "🚀 InfoEau - Rebuild Complet avec Tests de Sécurité"
echo "=================================================="

# 1. Vérification des variables d'environnement
echo "📋 1. Vérification du fichier .env..."
if [ -f ".env" ]; then
    echo "✅ Fichier .env trouvé"
    echo "📝 Variables définies:"
    grep -E '^[^#].*=' .env | head -10
else
    echo "❌ Fichier .env manquant"
    exit 1
fi

echo ""

# 2. Nettoyage et rebuild
echo "🧹 2. Nettoyage des builds précédents..."
rm -rf dist/ node_modules/.vite/

echo "⚡ 3. Rebuild complet de l'application..."
if npm run build; then
    echo "✅ Build réussi!"
else
    echo "❌ Échec du build"
    exit 1
fi

echo ""

# 3. Test des variables d'environnement
echo "🔍 4. Test de rechargement des variables..."
echo "Variables VITE_ disponibles:"
env | grep VITE_ || echo "Aucune variable VITE_ trouvée"

echo ""

# 4. Attendre que le serveur soit prêt
echo "⏳ 5. Attente du serveur de développement..."
sleep 3

# 5. Tests de sécurité automatiques
echo "🔒 6. Exécution des tests de sécurité..."
if command -v tsx &> /dev/null; then
    tsx src/scripts/security-diagnostic.ts
else
    echo "⚠️ tsx non disponible, tentative avec node..."
    npx tsx src/scripts/security-diagnostic.ts
fi

echo ""
echo "🎉 Rebuild et tests terminés!"