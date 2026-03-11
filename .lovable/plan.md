

## Mise a jour des pages footer pour la version europeenne

Ajouter des sections "Europe" dans chaque page du footer qui le necessite, sans modifier la structure existante. Les pages purement techniques (Accessibilite, RGPD) recevront des ajustements minimaux.

### Fichiers a modifier

**1. `src/pages/Sources.tsx`**
- Ajouter 4 sources europeennes dans `dataSources` : EEA (Agence Europeenne de l'Environnement), WISE DWD (Drinking Water Directive), Eurostat (statistiques eau), WHO/Europe (indicateurs sante)
- Ajouter la Directive 2020/2184 dans `qualityStandards` si pas deja presente de maniere explicite

**2. `src/pages/Methodologie.tsx`**
- Ajouter une section "Donnees europeennes" apres les etapes existantes, expliquant le traitement des CSV EEA WISE DWD (27 pays, polluants PFAS/microplastiques/THM, scores A/B/C)
- Mentionner le fallback CSV et la frequence de mise a jour (tous les 3 ans par l'EEA)

**3. `src/pages/ApiPublique.tsx`**
- Ajouter 3 endpoints europeens : `/api/v1/eu/water-quality/{country}`, `/api/v1/eu/pollutants`, `/api/v1/eu/pollutants/{country}`
- Ajouter un exemple de reponse EU

**4. `src/pages/APropos.tsx`**
- Mettre a jour la timeline : remplacer "A venir - Extension europeenne" par "2025 - Lancement du portail Europe" avec description des 27 pays couverts
- Ajouter "27 pays UE" dans les stats d'impact
- Mettre a jour la description de mission pour inclure l'Europe

**5. `src/pages/OpenData.tsx`**
- Ajouter 2 datasets europeens : "Qualite de l'eau par pays (UE 27)" et "Polluants europeens par pays"
- Ajouter 2 endpoints API europeens

**6. `src/pages/MentionsLegales.tsx`**
- Ajouter une mention dans "Donnees publiques" que les donnees europeennes proviennent de l'EEA et sont regies par la licence EEA

**7. `src/pages/Contact.tsx`**
- Mettre a jour la description du projet citoyen pour mentionner la couverture europeenne

**8. `src/pages/RGPD.tsx`**
- Ajouter une mention que les donnees europeennes traitees sont des donnees publiques EEA, pas des donnees personnelles

**9. `src/pages/Accessibilite.tsx`**
- Pas de changement necessaire (deja generique)

**10. `src/components/Footer.tsx`**
- Mettre a jour le copyright : "Donnees basees sur les sources officielles ARS, EauFrance, BRGM, EEA"
- Mettre a jour la description : "...en France et en Europe"

### Pas de nouveau fichier. Ajouts de contenu statique dans les tableaux/listes existants de chaque page.

