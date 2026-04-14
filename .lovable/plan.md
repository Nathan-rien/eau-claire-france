

## Plan : Ondine accede a toutes les donnees (59 eaux + robinet + prix)

### Probleme

Le plan precedent injectait seulement les 12 eaux de `bottleWaterData.ts` dans le system prompt d'Ondine. Or le site dispose de **59 eaux en bouteille** (fichier `infoeau_emn_composition_v2_partial.csv`) avec composition minerale complete, plus **105 references catalogue**, les **donnees MDD**, et les donnees eau du robinet par commune via l'API data.gouv.fr.

### Solution

Injecter dans le system prompt d'Ondine toutes les donnees statiques disponibles et lui donner la capacite d'interroger l'API eau du robinet en temps reel.

### Changements

#### 1. Edge Function `supabase/functions/ondine-chat/index.ts`

**System prompt enrichi avec :**
- Les 59 eaux en bouteille du CSV `infoeau_emn_composition_v2_partial.csv` : marque, source, localisation, gazeuse/plate, pH, residu sec, HCO3, Ca, Cl, F, Mg, NO3, K, SiO2, Na, SO4 — formatte en bloc texte structure
- Les 105 references catalogue du CSV `infoeau_catalog_eaux_v3.csv` : water_id, marque, categorie, variante, gazeuse, groupe proprietaire, source, formats bouteilles, EAN
- Les 11 eaux MDD du CSV `eaux_MDD_par_distributeur_et_source_FR_v3.csv` : distributeur, marque MDD, source
- Le contenu complet de `llms-full.txt` (documentation site, pages, methodologie, scoring)
- Les seuils reglementaires francais et OMS pour les principaux parametres
- Les prix moyens par marque (depuis `bottleWaterData.ts` + donnees Supabase si disponibles)
- Instructions pour rediriger vers les pages du site selon la question

**Capacite eau du robinet :**
- L'edge function accepte un champ optionnel `commune` dans le body
- Si fourni, elle interroge l'API Hub'Eau (qualite eau potable) pour recuperer les dernieres analyses de la commune et les injecte dans le contexte du message
- Ondine peut ainsi repondre avec des donnees reelles sur l'eau du robinet d'une commune specifique

**Le system prompt sera construit au build-time** pour les donnees statiques (CSV lus une fois au demarrage de la fonction) et enrichi dynamiquement avec les donnees communales si demandees.

#### 2. `src/components/OndineChat.tsx` — Widget de chat

- Bouton flottant en bas a droite (icone goutte d'eau)
- Fenetre de chat avec header "Ondine", historique de messages, champ de saisie
- Streaming SSE token par token avec `react-markdown` pour le rendu
- Message d'accueil : "Bonjour ! Je suis Ondine, votre assistante eau. Posez-moi vos questions sur la qualite de l'eau, les eaux en bouteille, les prix, les polluants..."
- Detection automatique de noms de communes dans les messages pour enrichir le contexte
- Responsive : plein ecran mobile, 400px desktop
- Z-index eleve, animation d'ouverture

#### 3. `src/App.tsx` — Integration globale

- Ajouter `<OndineChat />` dans le layout, visible sur toutes les pages

#### 4. `supabase/config.toml`

- Ajouter `[functions.ondine-chat]` avec `verify_jwt = false`

### Donnees injectees (volume estime du system prompt)

| Source | Contenu | ~Taille |
|--------|---------|---------|
| CSV compositions | 59 eaux, 16 parametres chacune | ~4 KB |
| CSV catalogue | 105 references, formats, EAN | ~3 KB |
| CSV MDD | 11 eaux distributeurs | ~0.5 KB |
| llms-full.txt | Doc complete du site | ~4 KB |
| Seuils reglementaires | 15 parametres, limites FR/OMS | ~0.5 KB |
| Prix moyens | 12 marques principales | ~0.5 KB |
| **Total** | | **~13 KB** |

Ce volume est largement dans les limites du contexte des modeles utilises.

### Dependance

- Installer `react-markdown` pour le rendu des reponses

### Fichiers crees/modifies

- **Cree** : `supabase/functions/ondine-chat/index.ts`
- **Cree** : `src/components/OndineChat.tsx`
- **Modifie** : `src/App.tsx`
- **Modifie** : `supabase/config.toml`

