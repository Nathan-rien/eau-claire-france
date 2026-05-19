# Profil "Général" par défaut + descriptifs enrichis avec recommandations

## 1. Ajouter un profil "Général" (sélectionné par défaut)

Nouveau profil `general` dans `src/utils/rankingV2.ts`, ajouté en premier dans `PROFILES` et utilisé comme défaut de `Classement.tsx` (à la place de `purity`).

**Principe** : classement neutre, sans biais santé. Une eau est "globalement bonne" si elle :
- respecte largement les seuils réglementaires français (nitrates < 10, fluorure < 1.5, sulfates < 250 conseillé en quotidien)
- offre un pH proche neutre (6.5–7.8)
- a une minéralisation modérée (résidu sec 150–800, ni trop pure ni trop minéralisée pour l'usage courant)
- présente un équilibre Ca/Mg/Na sans valeur extrême

**Implémentation** : tous les critères utilisent des règles `window` larges autour des valeurs idéales d'une eau "passe-partout", avec des poids équilibrés (~7 chacun, total 80). Pas d'exclusion.

Icon: `⚖️` (équilibre) — label: `Général` — description courte: `Classement neutre, sans orientation santé spécifique`.

## 2. Descriptifs enrichis avec recommandations officielles

Étendre `ProfileConfig` avec un champ `recommendations` structuré :

```ts
recommendations: {
  who: string;          // À qui s'adresse le profil
  guidelines: string[]; // Recommandations officielles (Afssa, ANSES, OMS, PNNS…)
  avoid?: string[];     // Ce qu'il faut éviter
  source?: string;      // Source officielle
}
```

Exemples de contenu par profil :

- **Bébé** : Afssa 2003 — nitrates < 10 mg/L, fluorure < 0,3 mg/L, sodium < 20 mg/L, résidu sec < 500 mg/L. Mention « convient à l'alimentation des nourrissons » obligatoire.
- **Grossesse** : ANSES — privilégier eaux riches en calcium (>150 mg/L) et magnésium (>50 mg/L), nitrates < 25 mg/L.
- **Sport** : INSEP — réhydratation post-effort avec eaux bicarbonatées (>600 mg/L HCO3) et riches en sodium/magnésium.
- **Régime sans sel** : ANSES/HAS hypertension — sodium < 20 mg/L (mention « convient à un régime pauvre en sodium »).
- **Os & calcium** : PNNS — calcium > 300 mg/L pour contribuer aux apports (Hépar, Contrex, Courmayeur, Talians).
- **Transit** : sulfates > 200 mg/L et magnésium > 50 mg/L (Hépar, Hunyadi Janos).
- **Senior** : équilibre Ca/Mg, surveillance sodium.
- **Digestion** : bicarbonates > 600 mg/L (Vichy, Saint-Yorre, Badoit).
- **Thé** : résidu < 150 mg/L, pH neutre.
- **Pureté** : eau très peu minéralisée (résidu < 100), idéale soif et bébé.
- **Général** : Pas de recommandation médicale spécifique — classement neutre basé sur conformité réglementaire et équilibre minéral.

### 3. Affichage dans `Classement.tsx`

Remplacer le simple badge actuel (`icon + label + description courte`) par un encadré plus riche, juste sous le sélecteur de profil :

```text
┌────────────────────────────────────────────────────┐
│ 👶  Bébé — Préparation des biberons                │
│ ─────────────────────────────────────────────────  │
│ Pour qui : nourrissons de 0 à 6 mois               │
│ Recommandations officielles (Afssa 2003) :         │
│  • Nitrates < 10 mg/L                              │
│  • Fluorure < 0,3 mg/L                             │
│  • Sodium < 20 mg/L                                │
│  • Résidu sec < 500 mg/L                           │
│ À éviter : eaux gazeuses, fortement minéralisées   │
│ Source : Afssa, avis 2003                          │
└────────────────────────────────────────────────────┘
```

L'encadré est dépliable (par défaut ouvert sur desktop, replié sur mobile pour économiser l'espace) avec un toggle "Voir les recommandations".

### 4. Fichiers modifiés
- `src/utils/rankingV2.ts` : ajout du profil `general`, type `Profile` étendu, contenu `recommendations` par profil, helper `getProfileInfo` mis à jour.
- `src/components/Ranking/RankingProfileSelector.tsx` : ajouter `general` en premier dans la liste.
- `src/pages/Classement.tsx` : défaut `profile = "general"`, remplacer le mini-badge par le nouvel encadré.
- Nouveau composant `src/components/Ranking/ProfileRecommendationCard.tsx` (encadré dépliable).

## Question

Souhaitez-vous que le profil "Général" devienne aussi le défaut pour les **nouveaux visiteurs** (donc à la place de `purity` actuellement), ou conserver `purity` pour les utilisateurs revenants ? Par défaut je pars sur **`general` pour tout le monde**.
