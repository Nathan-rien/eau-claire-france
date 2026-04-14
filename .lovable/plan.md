

## Plan : Rendre les réponses d'Ondine concises

### Problème
Ondine produit des réponses trop longues avec des anecdotes non demandées ("Le savais-tu ?", comparaisons prix robinet vs bouteille, etc.) au lieu de répondre directement à la question.

### Solution
Modifier les instructions du system prompt dans l'edge function pour imposer un format de réponse court et progressif.

### Changement dans `supabase/functions/ondine-chat/index.ts`

Remplacer la section "Tes règles" (lignes 153-162) par des instructions de concision et de réponse progressive :

**Nouvelles règles :**
1. **Répondre d'abord, développer ensuite** : donner la réponse directe en 2-4 phrases maximum, puis proposer "Souhaites-tu en savoir plus ?" ou "Je peux détailler si tu veux."
2. **Pas d'anecdotes non sollicitées** : ne pas ajouter de "Le savais-tu ?", de comparaisons prix robinet/bouteille, ou de fun facts sauf si l'utilisateur le demande explicitement.
3. **Pas de récapitulatifs ou conclusions** quand la réponse tient en quelques lignes.
4. **Listes à puces** uniquement si la question porte sur une comparaison ou plusieurs éléments.
5. Si l'utilisateur demande d'en savoir plus, alors développer avec détails, contexte et pages du site pertinentes.

### Fichier modifié
- `supabase/functions/ondine-chat/index.ts` — ~15 lignes modifiées dans le system prompt

