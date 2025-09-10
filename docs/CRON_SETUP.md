# Configuration Cron pour les scrapers

## Vue d'ensemble

Le système de scraping des prix est conçu pour s'exécuter automatiquement tous les jours selon un planning séquencé pour éviter la surcharge des serveurs et réduire les risques de détection.

## Planning de production (TZ=Europe/Paris)

### Enseignes actives - Exécution séquentielle (15 min d'intervalle)

```bash
# Groupe Carrefour
20 6 * * * cd /app && pnpm scrape --retailers carrefour --brands evian,cristaline,volvic,vittel,contrex,hepar,badoit,perrier --formats "50cl,1l,1.5l,6x1.5l" --maxPages 3
35 6 * * * cd /app && pnpm scrape --retailers carrefour_market --brands evian,cristaline,volvic,vittel,contrex --formats "50cl,1l,1.5l" --maxPages 2
50 6 * * * cd /app && pnpm scrape --retailers carrefour_drive --brands evian,cristaline,volvic,vittel --formats "1l,1.5l,6x1.5l" --maxPages 2

# Autres grandes enseignes
5 7 * * * cd /app && pnpm scrape --retailers auchan --brands evian,cristaline,volvic,vittel,contrex,hepar,badoit,perrier --formats "50cl,1l,1.5l,6x1.5l" --maxPages 3
20 7 * * * cd /app && pnpm scrape --retailers auchan_super --brands evian,cristaline,volvic,vittel --formats "50cl,1l,1.5l" --maxPages 2
35 7 * * * cd /app && pnpm scrape --retailers leclerc --brands evian,cristaline,volvic,vittel,contrex,hepar,badoit,perrier --formats "50cl,1l,1.5l,6x1.5l" --maxPages 3
50 7 * * * cd /app && pnpm scrape --retailers intermarche --brands evian,cristaline,volvic,vittel,contrex --formats "50cl,1l,1.5l" --maxPages 2

# Enseignes spécialisées
5 8 * * * cd /app && pnpm scrape --retailers u_drive --brands evian,cristaline,volvic,vittel --formats "1l,1.5l,6x1.5l" --maxPages 2
20 8 * * * cd /app && pnpm scrape --retailers monoprix --brands evian,cristaline,volvic,vittel,contrex,hepar --formats "50cl,1l,1.5l" --maxPages 2
35 8 * * * cd /app && pnpm scrape --retailers monoprix_plus --brands evian,cristaline,volvic --formats "50cl,1l,1.5l" --maxPages 2
50 8 * * * cd /app && pnpm scrape --retailers casino --brands evian,cristaline,volvic,vittel,contrex --formats "50cl,1l,1.5l" --maxPages 2

# Enseignes complémentaires
5 9 * * * cd /app && pnpm scrape --retailers geant_casino --brands evian,cristaline,volvic,vittel --formats "1l,1.5l,6x1.5l" --maxPages 2
20 9 * * * cd /app && pnpm scrape --retailers franprix --brands evian,cristaline,volvic,vittel --formats "50cl,1l,1.5l" --maxPages 2
35 9 * * * cd /app && pnpm scrape --retailers cora --brands evian,cristaline,volvic,vittel,contrex --formats "50cl,1l,1.5l" --maxPages 2
50 9 * * * cd /app && pnpm scrape --retailers match --brands evian,cristaline,volvic,vittel --formats "1l,1.5l" --maxPages 2

# Drive et livraison
5 10 * * * cd /app && pnpm scrape --retailers chronodrive --brands evian,cristaline,volvic,vittel --formats "1l,1.5l,6x1.5l" --maxPages 2
20 10 * * * cd /app && pnpm scrape --retailers houra --brands evian,cristaline,volvic,vittel --formats "50cl,1l,1.5l" --maxPages 2
```

### Enseignes beta (non activées en cron pour l'instant)

```bash
# Ces enseignes sont en phase de test et ne doivent PAS être ajoutées au cron automatique
# Test manual uniquement avec : pnpm scrape --retailers lidl,aldi,greenweez,lafourche,amazon_fresh_fr,deliveroo_grocery --brands evian,cristaline --formats "1l,1.5l" --maxPages 1
```

## Configuration système

### Variables d'environnement

```bash
# Timezone obligatoire
export TZ=Europe/Paris

# Niveau de log
export LOG_LEVEL=info

# Répertoire de logs
export SCRAPE_LOGS_DIR=/var/log/scraping

# Webhook d'alerte (optionnel)
export ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### Logs et monitoring

```bash
# Créer le répertoire de logs
sudo mkdir -p /var/log/scraping
sudo chown $USER:$USER /var/log/scraping

# Logs par enseigne et date
/var/log/scraping/carrefour_20241210.log
/var/log/scraping/auchan_20241210.log
# etc.
```

### Rotation des logs

```bash
# Ajouter à /etc/logrotate.d/scraping
/var/log/scraping/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
}
```

## Gestion des pannes

### Surveillance automatique

Le système surveille automatiquement :
- **Runs vides** : Si `items_saved = 0` → alerte
- **Taux d'erreur élevé** : Si `error_rate > 0.3` → alerte  
- **Runs consécutifs en échec** : 2 échecs d'affilée → pause automatique de l'enseigne

### Commandes de gestion

```bash
# Vérifier le statut des enseignes
pnpm exec tsx src/scripts/check-retailers-status.ts

# Mettre en pause une enseigne problématique
pnpm exec tsx src/scripts/pause-retailer.ts --retailer carrefour

# Relancer une enseigne après correction
pnpm exec tsx src/scripts/resume-retailer.ts --retailer carrefour

# Test smoke après maintenance
pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats "1l,1.5l" --maxPages 1 --dry-run
```

### Procédure en cas d'incident

1. **Identifier l'enseigne en panne** via `/admin/runs`
2. **Consulter les logs** : `/var/log/scraping/[retailer]_[date].log`
3. **Test manuel** : `pnpm scrape --retailers [retailer] --brands evian --formats "1l" --maxPages 1 --headful`
4. **Corrections nécessaires** :
   - Mise à jour des sélecteurs CSS
   - Ajustement du throttling
   - Modification du User-Agent
5. **Test de validation** : run smoke
6. **Réactivation** via script resume-retailer

## Anti-détection et bonnes pratiques

### Mesures préventives intégrées

- **Throttling adaptatif** : 1000-1500ms + jitter ±250ms
- **User-Agent rotatif** : 5 UA desktop stables
- **Timeout raisonnable** : 30s par page
- **Retry avec backoff** : 3 tentatives max avec délai croissant
- **Détection captcha** : abandon automatique si détecté

### Respect des CGU

- **robots.txt** : Respect obligatoire
- **Pas de contournement actif** de mesures anti-bot
- **Fenêtre de scraping limitée** : 6h20 à 10h20 uniquement
- **Pause immédiate** en cas de demande d'arrêt

### Surveillance de la santé système

```bash
# Statistiques quotidiennes
pnpm exec tsx src/scripts/daily-report.ts

# Alertes automatiques configurées pour :
# - Taux d'erreur > 30%
# - Aucun produit trouvé
# - Temps d'exécution anormalement long (> 45 min)
# - Détection de captcha répétée
```

## Maintenance et mises à jour

### Mise à jour des sélecteurs

1. **Test en local** avec `--headful` pour déboguer visuellement
2. **Validation** avec fixtures HTML en mode test
3. **Déploiement progressif** : 1 enseigne à la fois
4. **Surveillance** pendant 48h post-déploiement

### Ajout d'une nouvelle enseigne

1. **Phase beta** : `status='beta'` dans la table retailers
2. **Tests manuels** intensifs pendant 1 semaine
3. **Validation qualité** : error_rate < 0.1 sur 5 runs
4. **Activation** : `status='active'` + ajout au cron séquencé

### Backup et restauration

```bash
# Sauvegarde quotidienne des données (inclus dans le cron système)
pg_dump -h localhost -U postgres pricing_db > /backup/pricing_$(date +%Y%m%d).sql

# Rétention : 30 jours de données complètes + 1 an de données agrégées
```

## Contact et support

En cas de problème critique :
1. **Logs système** : `/var/log/scraping/`
2. **Interface admin** : `/admin/runs` et `/admin/quality`  
3. **Monitoring** : Dashboard Grafana (si configuré)
4. **Alertes** : Webhook Slack configuré pour les incidents majeurs