

## Plan : Séparer le libellé de l'onglet header du libellé de la page

### Problème
La clé `nav.journey` est utilisée à la fois pour le **nom de l'onglet dropdown** dans le header ET pour le **lien vers /parcours-eau** dans le menu. En la renommant "Infographies", le lien de la page a aussi changé de nom.

### Solution

1. **`src/i18n/translations.ts`** — Ajouter une nouvelle clé `nav.journeyTab` pour l'onglet, et remettre `nav.journey` à sa valeur originale :
   - `nav.journey` → "Parcours de l'eau" (FR) / "Water journey" (EN) — utilisé pour le lien vers /parcours-eau
   - `nav.journeyTab` → "Infographies" (FR) / "Infographics" (EN) — utilisé pour le titre de l'onglet dropdown

2. **`src/components/Header.tsx`** — Remplacer `t('nav.journey')` par `t('nav.journeyTab')` aux 2 endroits où il sert de **titre de section/onglet** (ligne ~168 bouton dropdown, ligne ~319 section mobile), en laissant `t('nav.journey')` pour le lien page (ligne ~60).

3. **`src/components/Navigation.tsx`** — Aucun changement (utilise déjà `nav.journey` pour le lien direct, ce qui est correct).

### Fichiers modifiés
- `src/i18n/translations.ts` — 4 lignes (2 par langue)
- `src/components/Header.tsx` — 2 occurrences

