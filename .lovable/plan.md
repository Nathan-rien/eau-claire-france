

## Plan : Fermer le chat Ondine au clic sur un lien interne

### Probleme
Sur mobile, quand on clique un lien interne dans une reponse d'Ondine, la navigation s'effectue mais le chat reste ouvert en plein ecran, masquant la page de destination.

### Solution
Le composant `ChatLink` n'a pas acces a `setIsOpen`. Il faut lui passer une callback `onNavigate` qui ferme le chat quand un lien interne est clique.

### Changement dans `src/components/OndineChat.tsx`

1. Transformer `ChatLink` pour accepter une prop `onNavigate` et l'appeler au clic sur un lien interne
2. Dans le rendu `ReactMarkdown`, passer `components={{ a: (props) => <ChatLink {...props} onNavigate={() => setIsOpen(false)} /> }}`

Concretement ~5 lignes modifiees :
- `ChatLink` : ajouter `onClick={() => onNavigate?.()}` sur le `<Link>`
- Le `components` de `ReactMarkdown` : wrapper pour injecter `onNavigate`

### Fichier modifie
- `src/components/OndineChat.tsx`

