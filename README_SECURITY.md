# InfoEau - Guide de Sécurité Utilisateur

## Configuration Initiale

### 1. Définir le Token Admin dans Supabase

1. **Accédez à votre projet Supabase** : https://supabase.com/dashboard/project/xblogttmomuogdhmaztf
2. **Aller dans Settings → Edge Functions** 
3. **Créer un secret `ADMIN_DASHBOARD_TOKEN`** :
   - Nom : `ADMIN_DASHBOARD_TOKEN`
   - Valeur : Générez un token sécurisé (minimum 32 caractères aléatoires)
   - Exemple : `admin_2024_secure_token_xyz123abc456def789`

### 2. Configurer le Token dans l'Interface

1. **Accédez au Security Dashboard** : `/admin/security`
2. **Onglet ENV Helper** → section "Token Admin"
3. **Saisissez votre token** dans le champ masqué
4. **Cliquez sur "Sauvegarder Token"** (stockage en localStorage)
5. **Testez avec "Tester Token"**

### 3. Corriger les Erreurs CORS

Si vous obtenez des erreurs CORS lors des appels directs :

1. **Notez votre domaine actuel** dans l'onglet Self-check
2. **Accédez aux secrets Supabase** et modifiez `ALLOWED_ORIGINS`
3. **Format attendu** : `https://votre-domaine.com,https://www.votre-domaine.com`
4. **Pour le développement local** : `http://localhost:5173,http://127.0.0.1:5173`

## Utilisation du Security Dashboard

### Self-check (Tests Rapides)

1. **Ping via proxy** : Teste la connectivité via le serveur proxy
2. **Ping direct** : Teste l'appel direct au Edge Function
3. **Echo Test** : Vérifie l'authentification et les headers
4. **ENV Status** : Affiche l'état des variables d'environnement

✅ **Résultats attendus** :
- Ping proxy : 200 avec `via: "proxy"`
- Ping direct : 200 avec `via: "edge"`
- Echo : `authorization_present: false`, `x_admin_token: true`

### Smoke Test Complet

1. **Exécutez tous les checks** : RLS, Hardening, Diagnostic
2. **Tous doivent être PASS** avant d'activer le CRON
3. **Le Smoke Test global** valide l'ensemble

### Activation du CRON

⚠️ **Pré-requis** : Tous les Security Checks doivent être PASS

1. **Vérifiez que tous les checks sont ✅**
2. **Le bouton "Activer CRON" se débloque**
3. **Cliquez pour activer** les tâches automatiques

## Dépannage Courant

### Erreur "Admin token manquant ou invalide"

1. **Vérifiez** que `ADMIN_DASHBOARD_TOKEN` est défini dans Supabase
2. **Re-saisissez le token** dans l'interface
3. **Testez avec "Tester Token"**

### Erreur CORS "Origine non autorisée"

1. **Copiez votre domaine** depuis l'onglet Self-check
2. **Ajoutez-le à `ALLOWED_ORIGINS`** dans Supabase
3. **Format** : domaines séparés par virgules, sans espaces

### Erreur "IP non autorisée"

1. **Vérifiez `ADMIN_IP_ALLOWLIST`** dans Supabase (optionnel)
2. **Ajoutez votre IP** ou supprimez la restriction
3. **Format** : `1.2.3.4,5.6.7.8` (sans espaces)

### Edge Functions ne répondent pas

1. **Utilisez le proxy fallback** (automatique)
2. **Vérifiez la configuration réseau** (HTTPS/Mixed Content)
3. **Consultez les logs** dans l'onglet Self-check

## Variables d'Environnement Critiques

| Variable | Description | Requis |
|----------|-------------|---------|
| `SUPABASE_URL` | URL du projet Supabase (backend) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase (backend) | ✅ |
| `VITE_SUPABASE_URL` | URL du projet Supabase (frontend) | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase (frontend) | ✅ |
| `ADMIN_DASHBOARD_TOKEN` | Token d'accès admin | ✅ |
| `ALLOWED_ORIGINS` | Domaines autorisés (CORS) | ✅ |
| `ADMIN_IP_ALLOWLIST` | IPs autorisées (optionnel) | ❌ |

## Sécurité

⚠️ **JAMAIS** exposer `SUPABASE_SERVICE_ROLE_KEY` côté client  
⚠️ **Générer un token admin fort** (min 32 caractères)  
⚠️ **En production** : domaines spécifiques dans `ALLOWED_ORIGINS`  
⚠️ **CRON** : ne pas activer tant que Security Smoke ≠ PASS  

## Support

- **Security Dashboard** : `/admin/security`
- **Logs en temps réel** : onglet Self-check → "Logs Edge"
- **Documentation complète** : `RAPPORT_SÉCURITÉ.md`