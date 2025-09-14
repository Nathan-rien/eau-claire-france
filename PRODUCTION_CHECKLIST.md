# Production Checklist

Ce checklist garantit que l'application est sécurisée et prête pour la production.

## 🔒 Sécurité - Configuration

### Environment Variables
- [ ] `VITE_SUPABASE_URL` configuré avec l'URL de production Supabase
- [ ] `VITE_SUPABASE_ANON_KEY` configuré avec la clé publique
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configuré côté serveur uniquement
- [ ] `ADMIN_DASHBOARD_TOKEN` généré et sécurisé (côté serveur)
- [ ] Aucune variable secrète dans les variables `VITE_*`

### Feature Flags de Production
- [ ] `FF_ADMIN_UI=false` (sauf si admin requis)
- [ ] `FF_DEBUG_ROUTES=false` 
- [ ] `FF_QUICKSTART=false`
- [ ] `FF_SECURITY_HEADERS=true`
- [ ] `FF_RATE_LIMITING=true`
- [ ] `FF_AUDIT_LOGGING=true`
- [ ] `CRON_ENABLED=false` (activation manuelle après tests)

## 🛡️ Sécurité - Base de données

### RLS Policies
- [ ] `retailers` : lecture publique, écriture service role uniquement
- [ ] `prices` : lecture publique, écriture service role uniquement
- [ ] `prices_history` : lecture publique limitée à 90 jours
- [ ] `runs` : lecture publique limitée à 30 jours, écriture service role
- [ ] `audit_logs` : accès service role uniquement
- [ ] `rate_limits` : accès service role uniquement

### Tests RLS
```bash
npm run rls:check
```
- [ ] Toutes les politiques testées et validées
- [ ] Accès anonyme correctement restreint
- [ ] Accès service role fonctionnel

## 🌐 Sécurité - Web

### Headers HTTP
- [ ] `Content-Security-Policy` configuré
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Strict-Transport-Security` (si HTTPS)
- [ ] `Permissions-Policy` restrictif

### CORS
- [ ] Origines limitées aux domaines autorisés
- [ ] Pas de wildcard `*` en production
- [ ] Headers autorisés minimaux

### Robots & Indexation
- [ ] `robots.txt` interdit `/admin/`, `/api/`, `/debug/`, `/exports/`
- [ ] Pages admin avec `<meta name="robots" content="noindex,nofollow">`
- [ ] Sitemap mis à jour sans pages sensibles

## 🔐 Accès & Authentication

### Routes Admin
- [ ] `/admin/*` protégé par `AdminGuard`
- [ ] `/api/admin/*` exige auth + rôle admin
- [ ] `/api/debug/*` exige auth (sauf `/debug/health` si flag activé)
- [ ] Rate limiting : 60 req/min public, 600 req/min admin

### Interface Utilisateur
- [ ] QuickStart masqué si `FF_QUICKSTART=false`
- [ ] Boutons debug/smoke masqués en production
- [ ] Messages d'erreur non techniques pour utilisateurs finaux

## 🧹 Nettoyage

### Artefacts de développement
```bash
npm run clean:artifacts
```
- [ ] Dossier `debug/` supprimé
- [ ] Dossier `exports/` supprimé
- [ ] Fichiers `*.log` supprimés
- [ ] `SMOKE_RESULT.json` supprimé
- [ ] `coverage.json` supprimé

### Code
- [ ] `console.log` verbeux remplacés par debug conditionnel
- [ ] Pas de secrets hardcodés
- [ ] Source maps désactivées ou non exposées
- [ ] Dependencies de dev exclues du bundle

## 📊 Monitoring & Logs

### Audit Logging
- [ ] Events de sécurité loggués (tentatives d'accès admin)
- [ ] Rate limiting violations tracées
- [ ] IPs suspectes identifiées
- [ ] Logs structurés et exploitables

### Performance
- [ ] Rate limiting testé sous charge
- [ ] Métriques d'usage collectées
- [ ] Alertes configurées pour incidents

## 🚀 Déploiement

### Build
```bash
npm run build
npm run harden:check
```
- [ ] Build sans erreurs
- [ ] Validation de sécurité passée
- [ ] Bundle size optimisé
- [ ] Pas de leak de variables serveur

### Tests
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests de sécurité passent
- [ ] Smoke tests en environnement staging

### Post-déploiement
- [ ] Health check `/api/debug/health` répond 200
- [ ] Pages publiques accessibles
- [ ] Pages admin inaccessibles sans auth
- [ ] CRON désactivé par défaut
- [ ] Monitoring opérationnel

## ⚡ Activation Cron (Optionnel)

Si l'automatisation de scraping est requise :
- [ ] Tests manuels complets sur tous retailers
- [ ] `CRON_ENABLED=true` 
- [ ] Surveillance des runs automatiques
- [ ] Plan de rollback en cas d'incident

## 🆘 Incident Response

- [ ] Procédure de désactivation rapide du cron
- [ ] Contacts techniques identifiés
- [ ] Logs d'audit consultables
- [ ] Capacité de bloquer IPs suspectes

---

**Statut** : ⏳ En cours | ✅ Validé | ❌ Échec

**Dernière mise à jour** : $(date)
**Validé par** : _______________