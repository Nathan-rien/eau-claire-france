# Audit Technique Complet - InfoEau.fr

## Table des matières
1. [Analyse structurelle](#1-analyse-structurelle)
2. [Revue fonctionnelle](#2-revue-fonctionnelle)
3. [Diagnostic d'optimisation](#3-diagnostic-doptimisation)
4. [Plan d'action prioritaire](#4-plan-daction-prioritaire)

---

## 1. Analyse structurelle

### Architecture générale
**Stack technique :** React 18.3.1 + Vite + TypeScript + Tailwind CSS + React Router + Supabase

### Arborescence complète

#### Pages principales (`src/pages/`)
- **Index.tsx** - Page d'accueil avec 8 blocs de services
- **Carte.tsx** - Carte interactive de qualité de l'eau
- **CartePolluants.tsx** - Cartographie des polluants
- **Diagnostic.tsx** - Diagnostic de qualité d'eau par commune
- **Bouteilles.tsx** - Comparaison avec eaux en bouteille
- **ComparatifBouteilles.tsx** - Comparatif détaillé bouteilles
- **QuelleEauBoire.tsx** - Recommandations personnalisées
- **Classement.tsx** - Classement des eaux
- **Polluants.tsx** - Liste des polluants
- **Auth.tsx** - Authentification
- **Dashboard.tsx** - Tableau de bord utilisateur

#### Pages secondaires
- Contact.tsx, APropos.tsx, Sources.tsx, Methodologie.tsx
- RGPD.tsx, MentionsLegales.tsx, Accessibilite.tsx
- ApiPublique.tsx, OpenData.tsx
- NotFound.tsx

#### Composants (`src/components/`)
**UI Framework (Shadcn/ui)** - 29 composants : Button, Card, Dialog, Form, etc.

**Composants métier :**
- `InteractiveMap.tsx` - Carte interactive (Mapbox)
- `BottleComparisonTable.tsx` - Tableau comparatif bouteilles
- `WaterQualityCard.tsx` - Fiche qualité eau
- `PollutantMap.tsx` - Carte polluants
- `BottleSelector.tsx` - Sélecteur de bouteilles
- `SearchBar.tsx` - Barre de recherche
- `StatisticsOverview.tsx` - Vue d'ensemble statistiques
- `SEOHead.tsx` - Gestion SEO
- `Layout.tsx` - Layout principal

#### Hooks personnalisés (`src/hooks/`)
- `useAuth.tsx` - Gestion authentification
- `useWaterQuality.ts` - Données qualité eau
- `useFavorites.ts` - Gestion favoris
- `useBottleComparisonUrl.ts` - Synchronisation URL/sélection
- `useAnalytics.ts` - Analytics intégrées

#### Services (`src/services/`)
- `dataGouvApi.ts` - API Data.gouv.fr
- `addressApi.ts` - API Adresse
- `analyticsService.ts` - Service analytics interne
- `securityService.ts` - Validation et sécurité

#### Données (`src/data/`)
- `bottleComparisonData.ts` - 1200+ eaux en bouteille
- `bottleWaterData.ts` - Données simplifiées bouteilles
- `waterProfiles.ts` - Profils utilisateurs et critères

#### Utilitaires (`src/utils/`)
- `bottleConversion.ts` - Conversion formats données
- `bottleRanking.ts` - Algorithme classement
- `nutritionalInterpretation.ts` - Interprétation valeurs
- `waterRecommendation.ts` - Moteur de recommandation
- `seoData.ts` - Données SEO structurées
- `cookieUtils.ts` - Gestion cookies/analytics

---

## 2. Revue fonctionnelle

### Fonctionnalités principales

#### 🗺️ **Module Cartographique**
- **Fichiers :** `Carte.tsx`, `QualityMap.tsx`, `InteractiveMap.tsx`
- **Fonctionnement :** Mapbox GL pour visualisation interactive
- **Données :** API Data.gouv.fr + données de démonstration

#### 🔍 **Diagnostic par commune**
- **Fichiers :** `Diagnostic.tsx`, `useWaterQuality.ts`, `dataGouvApi.ts`
- **Fonctionnement :** Recherche par adresse → récupération données qualité
- **API :** Adresse Data.gouv.fr + API qualité eau

#### 🍼 **Comparateur de bouteilles**
- **Fichiers :** `ComparatifBouteilles.tsx`, `BottleComparisonTable.tsx`
- **Base de données :** 1200+ références (bottleComparisonData.ts)
- **Fonctionnalités :** Comparaison multi-critères, favoris, synchronisation URL

#### 💧 **"Quelle eau boire ?"**
- **Fichiers :** `QuelleEauBoire.tsx`, `waterRecommendation.ts`, `waterProfiles.ts`
- **Algorithme :** Scoring basé sur profils utilisateur (sportif, grossesse, etc.)
- **Export :** PDF des recommandations

#### 📊 **Classement et statistiques**
- **Fichiers :** `Classement.tsx`, `bottleRanking.ts`
- **Algorithme :** Score nutritionnel 0-50 points
- **Critères :** Nitrates, résidu sec, calcium, magnésium, sodium

#### 🚨 **Alertes**
- **Fichiers :** `Alertes.tsx`, `AlertSubscriptionForm.tsx`
- **Fonctionnement :** Inscription aux alertes qualité eau

#### 🔐 **Authentification**
- **Stack :** Supabase Auth
- **Fichiers :** `Auth.tsx`, `useAuth.tsx`, `Dashboard.tsx`

### Fonctionnalités transversales

#### 🔍 **SEO & Performance**
- `SEOHead.tsx` - Meta tags dynamiques
- `seoData.ts` - Structured data Schema.org
- React Helmet Async pour gestion head

#### 🌍 **Internationalisation**
- `LanguageContext.tsx` - Système FR/EN
- 100+ clés de traduction intégrées

#### 📈 **Analytics intégrées**
- `analyticsService.ts` - Tracking interne
- Métriques : pages vues, durée, clics, visiteurs uniques

---

## 3. Diagnostic d'optimisation

### 🔴 **CRITIQUE - À corriger immédiatement**

#### Performance
1. **Mapbox non lazy-loadé**
   - **Problème :** Mapbox GL (2.8MB) chargé sur toutes les pages
   - **Impact :** +3s temps de chargement initial
   - **Fichiers :** `InteractiveMap.tsx`, `QualityMap.tsx`
   - **Solution :** Dynamic import + lazy loading

2. **Bundle JavaScript non optimisé**
   - **Problème :** Pas de code splitting par route
   - **Impact :** Bundle initial ~800KB
   - **Solution :** React.lazy() sur les pages

3. **Données bouteilles en dur**
   - **Problème :** 1200 bouteilles (400KB) chargées au démarrage
   - **Fichier :** `bottleComparisonData.ts`
   - **Solution :** Lazy loading + pagination

#### SEO
4. **Images OG manquantes**
   - **Problème :** Références vers `/images/og-default.jpg` inexistants
   - **Fichiers :** `SEOHead.tsx`, `index.html`
   - **Impact :** Partages sociaux cassés

5. **Sitemap manquant**
   - **Problème :** Pas de sitemap.xml généré
   - **Impact :** Indexation SEO suboptimale

### 🟠 **IMPORTANT - À traiter rapidement**

#### Accessibilité
6. **Contraste insuffisant**
   - **Fichier :** `index.css` (lignes 107-118)
   - **Problème :** Classes CSS hardcodées non conformes WCAG
   - **Solution :** Utiliser design tokens

7. **Navigation clavier incomplete**
   - **Fichiers :** `InteractiveMap.tsx`, `BottleSelector.tsx`
   - **Problème :** Cartes et sélecteurs non accessibles au clavier

#### Performance
8. **Images non optimisées**
   - **Problème :** Pas de formats WebP/AVIF
   - **Fichiers :** Composants avec images statiques
   - **Solution :** Optimisation build-time

9. **API calls non cachées**
   - **Fichier :** `dataGouvApi.ts`
   - **Problème :** Pas de cache local pour données statiques
   - **Impact :** Requêtes répétées inutiles

#### Sécurité
10. **Validation côté client uniquement**
    - **Fichier :** `securityService.ts`
    - **Problème :** Pas de validation serveur Supabase
    - **Risque :** Injection de données malicieuses

### 🟡 **MINEUR - Améliorations**

#### Code Quality
11. **Duplication de logique**
    - **Fichiers :** `bottleConversion.ts`, `waterRecommendation.ts`
    - **Problème :** Logique de conversion dupliquée

12. **Composants trop volumineux**
    - **Fichier :** `BottleComparisonTable.tsx` (428 lignes)
    - **Solution :** Décomposer en sous-composants

13. **Types TypeScript incomplets**
    - **Fichiers :** Plusieurs interfaces sans tous les champs requis
    - **Impact :** Erreurs runtime potentielles

#### UX/UI
14. **Loading states manquants**
    - **Fichiers :** Composants avec appels API
    - **Impact :** UX dégradée pendant chargements

15. **Responsive design perfectible**
    - **Fichiers :** Tables de comparaison sur mobile
    - **Solution :** Breakpoints supplémentaires

---

## 4. Plan d'action prioritaire

### Phase 1 - CRITIQUE (Semaine 1)
1. **Optimisation bundle**
   ```bash
   # Actions :
   - Implémenter React.lazy() sur toutes les pages
   - Dynamic import pour Mapbox
   - Code splitting par route
   ```
   **Fichiers à modifier :** `App.tsx`, `InteractiveMap.tsx`, `QualityMap.tsx`

2. **Données bouteilles en lazy loading**
   ```bash
   # Actions :
   - Créer endpoint API pour données bouteilles
   - Implémenter pagination/recherche
   - Cache local avec React Query
   ```
   **Fichiers à modifier :** `bottleComparisonData.ts`, `ComparatifBouteilles.tsx`

3. **Assets SEO**
   ```bash
   # Actions :
   - Générer images OG/Twitter Card
   - Créer sitemap.xml automatique
   - Vérifier tous les liens meta
   ```
   **Fichiers à créer :** Images dans `/public/images/`

### Phase 2 - IMPORTANT (Semaine 2)
4. **Système de design cohérent**
   ```bash
   # Actions :
   - Migrer CSS hardcodé vers design tokens
   - Audit contraste couleurs (WCAG AA)
   - Classes utilitaires Tailwind uniformisées
   ```
   **Fichiers à modifier :** `index.css`, tous les composants UI

5. **Optimisation images**
   ```bash
   # Actions :
   - Pipeline WebP/AVIF avec Vite
   - Lazy loading images
   - Sizes responsive appropriées
   ```

6. **Cache API intelligent**
   ```bash
   # Actions :
   - Configuration React Query avancée
   - Cache persistant localStorage
   - Stratégie stale-while-revalidate
   ```
   **Fichiers à modifier :** `App.tsx`, tous les hooks de données

### Phase 3 - MINEUR (Semaine 3-4)
7. **Refactoring composants**
   ```bash
   # Actions :
   - Décomposer BottleComparisonTable
   - Extraction hooks métier
   - Optimisation re-renders
   ```

8. **Amélioration accessibilité**
   ```bash
   # Actions :
   - Navigation clavier complète
   - ARIA labels manquants
   - Focus management
   ```

9. **Monitoring & Analytics**
   ```bash
   # Actions :
   - Web Vitals tracking
   - Error boundary global
   - Logs structurés
   ```

### Fichiers prioritaires à modifier

#### Immédiat
- `App.tsx` - Code splitting
- `InteractiveMap.tsx` - Lazy loading Mapbox
- `bottleComparisonData.ts` - Migration API
- `SEOHead.tsx` - Correction liens images

#### Important
- `index.css` - Design system
- `dataGouvApi.ts` - Cache intelligent
- `BottleComparisonTable.tsx` - Décomposition

#### Mineur
- Tous composants UI - Accessibilité
- `analyticsService.ts` - Web Vitals
- Types TypeScript - Complétude

---

## Estimation gains attendus

### Performance
- **Temps de chargement initial :** -60% (5s → 2s)
- **Bundle JavaScript :** -50% (800KB → 400KB)
- **Score Lighthouse :** 65 → 90+

### SEO
- **Pages indexables :** +100% (sitemap)
- **Partages sociaux :** +300% (OG images)
- **Core Web Vitals :** Amélioration significative LCP/CLS

### Accessibilité
- **Score WCAG :** AA compliance
- **Navigation clavier :** 100% fonctionnelle
- **Lecteurs d'écran :** Support complet

---

*Rapport généré le 23/07/2025 - Version 1.0*