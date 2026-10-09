# Roadmap SEO (plan validé 15/09)

## Crise de l’eau — Finistère
- [ ] Ajouter l’article FR sourcé, sa route et son entrée dans le sitemap/prérendu.
- [ ] Ajouter le calculateur indicatif et tester les formules, bornes et gains.
- [ ] Ajouter l’alerte FR et l’encadré d’accueil ; vérifier le parcours mobile et bureau.

- [x] P1 — Liens de langue crawlables (Header + Footer)
- [x] P2 — Version anglaise de /classement (routes, seoData, traductions)
- [x] Régénérer le sitemap après P1/P2 (147 URLs, /en/classement inclus)
- [x] P3 — Refonte /prix-eaux vers les requêtes larges (encadré moins cher, tableau prix/type, coût annuel, FAQ, title/desc)
- [x] P4 — Titres/meta des pages Europe (carte-europe, classement-europe)

## Suites possibles
- Traduire le détail des recommandations par profil santé (seuils, contre-indications) pour /en/classement
- Inspection GSC de /en/classement et /en/traiter-eau-robinet dans 2-3 semaines

## Zone d’Eau
- [x] Ajouter les états des 256 secteurs, l’affichage progressif, la reprise automatique bornée et la reprise après rechargement dans le même navigateur ; 3 tests réussis.
- [x] Relancer Bordeaux et Lyon : premier lot de 24 points traité, 12 nouveaux points après dédoublonnage ; 1 775 points publics vérifiés en SQL et sur la carte.
- [x] Importer une première série de 100 points OpenStreetMap réels et enrichir les informations disponibles.
- [x] Corriger le chargement exhaustif et la synchronisation de la carte.
- [x] Vérifier le nombre en base et l’affichage public (100 points).
- [x] Ajouter suivi des succès, classification des erreurs, pause et reprise persistée des zones échouées (256 zones).
- [x] Reprendre l’import réel : Paris, 1 668 points traités ; 1 763 points publics vérifiés après dédoublonnage.
- [ ] Achever le périmètre national : lancement depuis le compte administrateur requis (appel protégé refusé en 401 ici) ; Lille échoue en HTTP 504. Bordeaux et Lyon disposent encore de points à importer. Vérification du suivi connecté indisponible (Supabase externe).
