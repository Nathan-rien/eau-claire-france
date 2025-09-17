#!/bin/bash

echo "🚀 InfoEau - Lancement du build de production"
echo "============================================="

# Nettoyer les anciens builds
echo "🧹 Nettoyage des anciens builds..."
rm -rf dist/

# Vérifier que les modules sont installés
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Lancer le build
echo "⚡ Lancement du build Vite..."
echo ""

# Capturer le temps de début
start_time=$(date +%s)

# Lancer le build avec output détaillé
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
    
    # Afficher les statistiques du build
    if [ -d "dist" ]; then
        echo "📊 Taille des fichiers générés:"
        du -sh dist/*
        echo ""
        
        echo "📋 Contenu du dossier dist/:"
        find dist -type f -name "*.js" -o -name "*.css" -o -name "*.html" | head -10
    fi
    
    echo ""
    echo "🎉 Le projet InfoEau est prêt pour la production !"
    echo "   Vous pouvez déployer le contenu du dossier 'dist/' sur votre serveur."
    
else
    echo ""
    echo "❌ ÉCHEC DU BUILD"
    echo "=================="
    echo ""
    echo "💡 Suggestions pour résoudre les erreurs:"
    echo "1. Vérifiez les erreurs TypeScript ci-dessus"
    echo "2. Assurez-vous que tous les imports sont corrects"
    echo "3. Lancez 'npm run lint' pour identifier les problèmes"
    echo "4. Vérifiez que toutes les dépendances sont installées"
    echo ""
    exit 1
fi