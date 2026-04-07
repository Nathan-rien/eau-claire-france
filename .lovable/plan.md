

## Refonte page d'accueil — Retrait NavigationCTA + Ajout sections editoriales et visuelles

### Ce qui est retire

- La section `NavigationCTA` en bas de page (l'encart "Explorez nos services" avec les 3 cartes Carte des eaux / Diagnostic / Quelle eau boire). Ces liens existent deja dans les sections precedentes.

### Ce qui est ajoute

3 nouvelles sections editoriales entre la section "Cartes & Infographies" et le footer, avec des icones animees et des illustrations CSS pour rendre la page vivante.

**Section A — "Les risques lies a l'eau du robinet"**
- Layout : texte a gauche, illustration a droite (icone animee goutte + alerte)
- Contenu : pesticides, microplastiques, residus medicamenteux, plomb des canalisations anciennes, chlore et sous-produits. Ton informatif, pas alarmiste.
- Icone AlertTriangle avec animation pulse subtile
- Fond leger rouge/orange transparent
- CTA : lien vers `/polluants`

**Section B — "Bien choisir son eau en bouteille"**
- Layout : illustration a gauche, texte a droite (inverse de la section A)
- Contenu : composition minerale adaptee a vos besoins (calcium, magnesium), eau pour bebes, sportifs, personnes agees. Importance du pH et du residu sec.
- Icone Award/Droplets avec animation fade-in au scroll (via classe `animate-fade-in`)
- Fond leger bleu/vert transparent
- CTA : lien vers `/classement`

**Section C — "Surveiller la qualite de votre eau"**
- Layout : centree, style "call to action" final
- Contenu : importance du suivi regulier, donnees publiques accessibles, alertes en temps reel, comprendre les analyses de votre commune
- Icone Shield/Search avec animation scale-in
- Fond gradient bleu
- CTA : lien vers `/diagnostic`

### Animations et visuels

- Utilisation des animations Tailwind existantes : `animate-fade-in`, `hover-scale`, `animate-[pulse_3s_ease-in-out_infinite]`
- Icones decoratives de grande taille (w-20 h-20) avec opacite reduite en arriere-plan des sections
- Bordures laterales colorees sur les blocs de texte (style "accent bar")

### Fichier modifie

- `src/pages/Index.tsx` — retrait de la section NavigationCTA, ajout des 3 sections editoriales. L'import de NavigationCTA peut etre supprime.

