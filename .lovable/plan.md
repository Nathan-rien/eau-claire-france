
## Intégration Amplitude Analytics dans le `<head>`

### Ce que je vais faire

Ajouter les deux balises `<script>` Amplitude directement dans le `<head>` de `index.html`, juste avant la fermeture `</head>`.

### Pourquoi c'est sûr

La clé `72c4c3199e84554e813d8264960c10e2` est une **clé publique côté client** (elle est d'ailleurs déjà visible dans l'URL CDN). Elle n'a pas besoin d'être stockée comme secret.

### Fonctionnalités activées par ce snippet

- **Session Replay** avec `sampleRate: 1` (100% des sessions enregistrées)
- **Autocapture complet** :
  - Attribution UTM / campagnes marketing
  - Téléchargements de fichiers
  - Interactions formulaires
  - Pages vues
  - Sessions
  - Interactions éléments
  - Suivi réseau
  - Web Vitals (LCP, FID, CLS…)
  - Frustration tracking : curseur agité, clics sur erreurs, clics morts, rage clicks
- Serveur EU (`serverZone: "EU"`) — conforme RGPD

### Modification technique

**Fichier `index.html`** — Ajout des deux scripts juste avant `</head>` :

```html
<!-- Amplitude Analytics -->
<script src="https://cdn.eu.amplitude.com/script/72c4c3199e84554e813d8264960c10e2.js"></script>
<script>
  window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
  window.amplitude.init('72c4c3199e84554e813d8264960c10e2', {
    "fetchRemoteConfig": true,
    "serverZone": "EU",
    "autocapture": { ... }
  });
</script>
```

### Note RGPD

Le serveur EU est déjà configuré (`serverZone: "EU"`). Si vous avez une bannière de consentement cookies, il peut être utile de ne charger Amplitude qu'après acceptation. Je peux adapter si besoin.
