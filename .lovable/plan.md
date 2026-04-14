

## Plan : Liens cliquables + fix clavier mobile dans Ondine

### Probleme 1 — Liens non cliquables
Ondine renvoie les pages sous forme de texte brut (`/quelle-eau-boire`) au lieu de liens Markdown (`[Quelle eau boire](/quelle-eau-boire)`). Le composant `ChatLink` fonctionne deja mais le LLM ne genere pas de syntaxe Markdown pour les liens.

**Solution** : Modifier le system prompt pour instruire Ondine de toujours formater les pages du site en liens Markdown cliquables avec un libelle lisible. Exemple : `[Quelle eau boire](/quelle-eau-boire)` au lieu de `/quelle-eau-boire`.

Ajouter une regle dans la section "Tes regles" du system prompt :
> Quand tu mentionnes une page du site, utilise TOUJOURS un lien Markdown avec un libelle humain : `[Classement des eaux](/classement)`, jamais `/classement` en texte brut.

Mettre a jour la section "Pages du site" pour inclure les libelles suggeres.

**Fichier** : `supabase/functions/ondine-chat/index.ts` — modifier le system prompt (~5 lignes)

### Probleme 2 — Clavier mobile s'ouvre a l'ouverture du chat
Le `useEffect` sur `isOpen` fait `inputRef.current.focus()`, ce qui ouvre le clavier sur mobile et masque la conversation.

**Solution** : Supprimer l'auto-focus a l'ouverture du chat. L'utilisateur tapera dans le champ quand il le souhaitera.

**Fichier** : `src/components/OndineChat.tsx` — supprimer le `useEffect` lignes 58-62

### Resume des fichiers
- `supabase/functions/ondine-chat/index.ts` — ajout instruction liens Markdown dans le prompt
- `src/components/OndineChat.tsx` — suppression auto-focus mobile

