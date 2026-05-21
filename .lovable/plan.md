## 1. Strip côté client (couvre anciens + nouveaux)
Dans `src/pages/LettreEauArticle.tsx`, appliquer la regex sur `article.content_md` avant `<ReactMarkdown>` :
```
.replace(/\s*\(\s*sources?\s*\d+(?:\s*(?:,|et)\s*\d+)*\s*\)/gi, "")
.replace(/[ \t]{2,}/g, " ")
.replace(/\s+([,.;:!?])/g, "$1")
```

## 2. Nettoyage rétroactif en base
Via outil insert (UPDATE) sur `blog_articles` :
```sql
UPDATE blog_articles
SET content_md = regexp_replace(
  content_md,
  '\s*\(\s*[Ss]ources?\s*\d+(\s*(,|et)\s*\d+)*\s*\)',
  '', 'g'
)
WHERE content_md ~ '\([Ss]ources?\s*\d';
```

## 3. Vérif visuelle de l'espacement
Recharger la preview après build et confirmer que `prose-lg` + `prose-p:my-5` est bien appliqué. Augmenter si besoin.
