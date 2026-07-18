## Diagnostic (vérifié via l'API Search Console)

J'ai inspecté un échantillon de 21 URLs de `sc-domain:infoeau.fr` pour comprendre les 65 pages non indexées. Voici l'état réel :

| Statut GSC | Signification | Exemples observés |
|---|---|---|
| ✅ **Submitted and indexed** | OK | `/`, `/carte`, `/qualite-eau`, `/prix-eaux`, `/comparatif-bouteilles`, `/quelle-eau-boire`, `/classement`, `/polluants`, `/sources-eau`, `/carte-europe`, `/actualites/pollution-manganese-vendee` |
| 🟡 **Discovered – currently not indexed** | Google connaît l'URL mais a choisi de ne pas la crawler/indexer (signal qualité/priorité faible) | `/gout-eau`, `/guide/ma-commune`, `/alertes`, `/marque/cristaline` |
| ⚪ **URL is unknown to Google** | Jamais découverte (sitemap trop récent : soumis le 10 juillet 2026) | `/lettre-de-leau`, `/qualite-eau/paris-75001`, `/marque/evian`, `/marque/mont-roucous`, `/cours-eau`, `/parcours-eau` |

**Contexte chiffré** : 88 URLs soumises dans le sitemap, ~23 indexées, **65 en attente** — ce qui correspond exactement au chiffre remonté. Le sitemap indique aussi **1 erreur** (non détaillée par l'API).

## Causes racines

1. **Sitemap récent (8 jours)** : Google n'a pas encore crawlé la majorité des URLs. C'est le facteur principal — beaucoup de "URL unknown" se résoudront naturellement en 2-4 semaines.
2. **Canonicals cassés sur `infoeau.lovable.app`** : `SEOHead.tsx` fait un fallback `window.location.origin + pathname` quand la prop `canonical` n'est pas fournie. Sur le domaine `lovable.app` (aussi vérifié dans GSC), les pages s'auto-canonisent vers `lovable.app` au lieu de `infoeau.fr` → duplicate content perçu par Google → pages "Discovered not indexed".
3. **Contenu perçu comme faible/dupliqué** sur `/alertes`, `/marque/cristaline`, `/gout-eau` : peu de contenu texte unique côté SSR (SPA React → crawlers non-JS voient une coquille vide).
4. **Maillage interne faible** vers `/lettre-de-leau`, `/guide/ma-commune`, `/marque/*` et les pages commune.

## Plan d'action

### 1. Canonical toujours vers `infoeau.fr` (correction bug)
Modifier `src/components/SEOHead.tsx` : quand `canonical` n'est pas fourni, utiliser `siteUrl + window.location.pathname` (jamais `window.location.origin`). Ça neutralise le duplicate infoeau.fr ↔ lovable.app pour toutes les pages.

### 2. Ajouter `noindex` au domaine preview lovable.app
Dans `SEOHead.tsx`, si `window.location.hostname` = `infoeau.lovable.app` ou `id-preview--*.lovable.app`, forcer `noindex, follow`. Empêche définitivement Google d'indexer les doublons.

### 3. Corriger l'erreur sitemap et compléter les URLs manquantes
- Ajouter au `scripts/generate-sitemap.ts` les routes actuellement absentes mais qui existent : `/bouteilles`, `/composition-europe`, blog articles publiés (déjà présent — vérifier fetch).
- Vérifier que toutes les URLs listées dans `sitemap.xml` renvoient un `200` (pas de `/marque/*` orphelin).

### 4. Renforcer le contenu SSR / statique des pages à faible signal
Pour les 4 pages "Discovered – not indexed" (`/gout-eau`, `/guide/ma-commune`, `/alertes`, `/marque/cristaline`), ajouter dans `index.html` un noscript ou du texte visible lors du rendu initial (H1 + intro + 2-3 paragraphes) pour que les crawlers non-JS aient du contenu à indexer.

### 5. Améliorer le maillage interne
- Depuis la home et `/qualite-eau` : liens vers `/lettre-de-leau`, `/gout-eau`, `/guide/ma-commune`, `/alertes`, `/marque/{evian,cristaline,volvic,vittel,perrier}` via `InternalLinkHub` déjà en place → ajouter ces cibles.
- Depuis le footer : bloc "Marques populaires" avec les 8 pages marque.

### 6. Demander l'indexation manuelle des 10 pages prioritaires
Via l'API Search Console (`urlNotifications:publish` n'est plus disponible depuis 2023) → alternative : re-soumettre le sitemap une fois les corrections déployées, ce qui accélère le crawl.

### 7. Vérification post-déploiement
Après publish, relancer `urlInspection` sur 5 URLs cibles pour confirmer que `googleCanonical` = `https://infoeau.fr/...` et que le statut passe de "URL unknown" à "Crawled" sous 7-14 jours.

## Détails techniques

- **Fichiers touchés** : `src/components/SEOHead.tsx` (2 modifs), `scripts/generate-sitemap.ts` (ajout routes), `index.html` (aucun changement — canonical déjà OK), pages "thin" à enrichir en SSR statique.
- **Ce qui NE sera PAS fait** : suppression de la propriété `https://infoeau.lovable.app/` de GSC (à la main dans l'UI si souhaité), ni ajout de SSR global (hors scope — Vite CSR conservé, on ne fait qu'ajouter du fallback statique).
- **Délai attendu** : correctifs actifs immédiatement, mais Google recrawle sous 7 à 21 jours. Les pages "URL unknown" apparaîtront progressivement.

Souhaites-tu que je démarre l'implémentation ?