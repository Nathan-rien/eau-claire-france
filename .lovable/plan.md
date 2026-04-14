

## Plan : Ajouter une description d'impact sous chaque paramètre d'analyse

### Objectif
Sous chaque paramètre affiché dans "Détail des analyses officielles", ajouter une courte ligne explicative décrivant à quoi sert ce paramètre et quel est son impact sur la santé ou le goût de l'eau.

### Fichiers modifiés

#### 1. `src/components/WaterQualityCard.tsx`
- Créer un dictionnaire `PARAMETER_DESCRIPTIONS` mappant les noms de paramètres courants (Nitrates, pH, Chlore, E. coli, Entérocoques, Turbidité, Fluorures, Pesticides, Plomb, Arsenic, Odeur, etc.) vers une courte description d'impact (~1 phrase)
- Ajouter sous le nom du paramètre et la limite une ligne `<p className="text-xs text-gray-500 mt-1 italic">` affichant la description correspondante (ou rien si paramètre inconnu)

### Exemples de descriptions
| Paramètre | Description |
|---|---|
| Nitrates | Proviennent de l'agriculture. Un excès peut être dangereux pour les nourrissons. |
| pH | Mesure l'acidité de l'eau. Influence le goût et l'efficacité du traitement. |
| Chlore total | Désinfectant ajouté pour éliminer les bactéries. Peut altérer le goût. |
| Escherichia coli | Bactérie indicatrice de contamination fécale. Sa présence signale un risque sanitaire. |
| Entérocoques | Bactéries intestinales. Leur présence indique une contamination microbiologique. |
| Turbidité | Mesure la limpidité. Une eau trouble peut masquer des contaminants. |
| Odeur | Un paramètre organoleptique. Une odeur anormale peut signaler une pollution. |
| Fluorures | En faible dose, protège les dents. En excès, risque de fluorose. |
| Plomb | Métal toxique pouvant provenir des canalisations anciennes. |
| Arsenic | Élément naturel toxique à forte dose, surveiller dans certaines régions. |

Le dictionnaire couvrira ~20 paramètres courants de l'API Hub'Eau. Pour les paramètres non répertoriés, aucune description ne sera affichée.

### Aucun autre fichier modifié
Changement purement visuel dans le composant d'affichage.

