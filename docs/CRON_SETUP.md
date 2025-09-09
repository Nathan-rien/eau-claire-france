# Configuration Cron pour le Scraping

## Horaires de Scraping (TZ=Europe/Paris)

Pour respecter les sites marchands et étaler la charge, les scraping sont programmés séquentiellement :

```bash
# Crontab configuration
TZ=Europe/Paris

# 06:30 - Carrefour
30 6 * * * /usr/bin/node /path/to/scraper --retailers carrefour

# 06:50 - Auchan  
50 6 * * * /usr/bin/node /path/to/scraper --retailers auchan

# 07:10 - E.Leclerc
10 7 * * * /usr/bin/node /path/to/scraper --retailers leclerc

# 07:30 - Intermarché
30 7 * * * /usr/bin/node /path/to/scraper --retailers intermarche

# 07:50 - Système U
50 7 * * * /usr/bin/node /path/to/scraper --retailers coursesu

# 08:10 - Monoprix
10 8 * * * /usr/bin/node /path/to/scraper --retailers monoprix

# 08:30 - Casino
30 8 * * * /usr/bin/node /path/to/scraper --retailers casino

# 08:50 - Franprix
50 8 * * * /usr/bin/node /path/to/scraper --retailers franprix

# 09:10 - Cora
10 9 * * * /usr/bin/node /path/to/scraper --retailers cora

# 09:30 - Match
30 9 * * * /usr/bin/node /path/to/scraper --retailers match

# 09:50 - Chronodrive
50 9 * * * /usr/bin/node /path/to/scraper --retailers chronodrive

# 10:10 - Houra
10 10 * * * /usr/bin/node /path/to/scraper --retailers houra
```

## Activation

1. Ouvrir la crontab :
```bash
crontab -e
```

2. Ajouter les lignes ci-dessus en adaptant le chemin du script

3. Vérifier la configuration :
```bash
crontab -l
```

## Variables d'environnement

Assurez-vous que les variables suivantes sont disponibles :

```bash
export TZ=Europe/Paris
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Surveillance

- Les logs sont automatiquement stockés en base (table `runs`)
- Consultez `/admin/runs` pour surveiller l'état des scraping
- Des alertes sont envoyées si error_rate > 0.3 ou items_saved = 0