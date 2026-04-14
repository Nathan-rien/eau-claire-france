

## Plan : Rendre les liens cliquables et visibles dans le chat Ondine

### Probleme
Les liens dans les reponses d'Ondine (ex: `/quelle-eau-boire`) ne sont pas visuellement distincts du texte normal. `ReactMarkdown` les rend mais sans style specifique car les classes `prose` par defaut ne suffisent pas dans ce contexte de bulle de chat sur fond `bg-muted`.

### Solution
Passer un composant custom `a` a `ReactMarkdown` via la prop `components` pour styler les liens avec une couleur primaire, un soulignement et une icone externe optionnelle. Les liens internes (`/quelle-eau-boire`) utiliseront la navigation client-side.

### Changement dans `src/components/OndineChat.tsx`

1. Ajouter un import de `Link` depuis `react-router-dom` et `ExternalLink` depuis `lucide-react`
2. Passer `components={{ a: CustomLink }}` a `<ReactMarkdown>` (ligne 202)
3. `CustomLink` : si le `href` commence par `/`, rendre un `<Link>` React Router ; sinon un `<a target="_blank">`
4. Style : `text-primary underline underline-offset-2 font-medium hover:text-primary/80` + petite icone pour les liens externes

### Fichier modifie
- `src/components/OndineChat.tsx` — ~15 lignes ajoutees

