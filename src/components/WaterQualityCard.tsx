
import React from 'react';
import { Droplets, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWaterQuality } from '@/hooks/useWaterQuality';

const PARAMETER_DESCRIPTIONS: Record<string, string> = {
  "Nitrates": "Proviennent de l'agriculture. Un excès peut être dangereux pour les nourrissons.",
  "Nitrites": "Indicateur de pollution récente. Toxique à forte concentration, surtout pour les nourrissons.",
  "pH": "Mesure l'acidité de l'eau. Influence le goût et l'efficacité du traitement.",
  "Chlore total": "Désinfectant ajouté pour éliminer les bactéries. Peut altérer le goût.",
  "Chlore libre": "Forme active du chlore désinfectant. Garantit la potabilité dans le réseau.",
  "Escherichia coli": "Bactérie indicatrice de contamination fécale. Sa présence signale un risque sanitaire.",
  "Entérocoques": "Bactéries intestinales. Leur présence indique une contamination microbiologique.",
  "Bactéries coliformes": "Indicateurs généraux de qualité microbiologique. Signalent un défaut de traitement.",
  "Turbidité": "Mesure la limpidité. Une eau trouble peut masquer des contaminants.",
  "Odeur": "Paramètre organoleptique. Une odeur anormale peut signaler une pollution.",
  "Saveur": "Paramètre organoleptique. Un goût inhabituel peut indiquer une contamination.",
  "Couleur": "Paramètre visuel. Une coloration peut révéler la présence de fer ou de matières organiques.",
  "Fluorures": "En faible dose, protège les dents. En excès, risque de fluorose.",
  "Plomb": "Métal toxique pouvant provenir des canalisations anciennes. Dangereux pour le développement des enfants.",
  "Arsenic": "Élément naturel toxique à forte dose, à surveiller dans certaines régions.",
  "Cuivre": "Oligo-élément essentiel, mais en excès il donne un goût métallique et peut être toxique.",
  "Fer total": "Non toxique mais altère le goût et la couleur de l'eau à forte concentration.",
  "Manganèse": "Naturellement présent. En excès, colore l'eau et peut affecter le système nerveux.",
  "Aluminium total": "Utilisé dans le traitement de l'eau. En excès, fait l'objet de précautions sanitaires.",
  "Sulfates": "Présents naturellement. En excès, peuvent avoir un effet laxatif.",
  "Calcium": "Contribue à la dureté de l'eau. Essentiel pour les os et les dents.",
  "Magnésium": "Contribue à la dureté. Bénéfique pour le système cardiovasculaire.",
  "Sodium": "Présent naturellement. À surveiller pour les régimes pauvres en sel.",
  "Potassium": "Minéral essentiel. Rarement problématique dans l'eau potable.",
  "Conductivité": "Reflète la minéralisation globale de l'eau. Plus elle est élevée, plus l'eau est minéralisée.",
  "Température": "Influence le goût et la prolifération bactérienne. Idéalement entre 10 et 15 °C.",
  "Ammonium": "Indicateur de pollution organique récente ou de dysfonctionnement du traitement.",
  "Pesticides totaux": "Somme des résidus de pesticides. Leur présence signale une contamination agricole.",
  "Atrazine": "Herbicide interdit mais persistant dans les sols. Perturbateur endocrinien suspecté.",
  "Sélénium": "Oligo-élément essentiel à faible dose, mais toxique en excès.",
  "Coloration": "Indicateur visuel de la qualité. Une coloration peut révéler la présence de fer ou de matières organiques.",
  "Aspect (qualitatif)": "Évaluation visuelle générale de l'eau. Doit être limpide et sans particules.",
  "Bact. aér. revivifiables à 36°-44h": "Bactéries cultivées à 36 °C. Indicatrices de la qualité microbiologique générale.",
  "Bact. aér. revivifiables à 22°-68h": "Bactéries cultivées à 22 °C. Reflètent la flore naturelle de l'eau et l'efficacité du traitement.",
  "Bactéries sulfito-réductrices": "Bactéries sporulées résistantes. Leur présence peut indiquer une contamination ancienne.",
  "Chlorures": "Présents naturellement. En excès, donnent un goût salé et peuvent signaler une pollution.",
  "Carbone organique total": "Mesure la matière organique dissoute. Peut favoriser la prolifération bactérienne.",
  "Oxydabilité": "Indicateur de la charge en matière organique. Reflète la vulnérabilité de l'eau aux pollutions.",
};

function getParameterDescription(name: string): string | undefined {
  if (PARAMETER_DESCRIPTIONS[name]) return PARAMETER_DESCRIPTIONS[name];
  const key = Object.keys(PARAMETER_DESCRIPTIONS).find(k =>
    name.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(name.toLowerCase())
  );
  return key ? PARAMETER_DESCRIPTIONS[key] : undefined;
}

interface WaterQualityCardProps {
  city: string;
}

const WaterQualityCard: React.FC<WaterQualityCardProps> = ({ city }) => {
  const { data, isLoading, error } = useWaterQuality(city);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'E': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeLabel = (grade: string) => {
    switch (grade) {
      case 'A': return 'Excellente';
      case 'B': return 'Bonne';
      case 'C': return 'Acceptable';
      case 'D': return 'Médiocre';
      case 'E': return 'Mauvaise';
      default: return 'Non évaluée';
    }
  };

  const getPollutantIcon = (conformite: string) => {
    switch (conformite) {
      case 'Conforme': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Non conforme': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des données pour {city}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200">
        <CardContent className="py-12 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Erreur lors du chargement des données</p>
          <p className="text-sm text-gray-600 mt-2">Utilisation des données de démonstration</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="py-12 text-center">
          <Droplets className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune donnée disponible pour {city}</p>
          <p className="text-sm text-gray-500 mt-2">Essayez une autre commune</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Quality Score */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="w-6 h-6 text-blue-500" />
              <span>Qualité de l'eau - {city}</span>
            </CardTitle>
            <div className={`w-16 h-16 ${getGradeColor(data.grade)} rounded-full flex items-center justify-center text-white font-bold text-2xl`}>
              {data.grade}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium">{getGradeLabel(data.grade)}</span>
                <span className="text-2xl font-bold text-blue-600">{data.score}/100</span>
              </div>
              <Progress value={data.score} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Dernière analyse</span>
                <p className="font-medium">
                  {data.lastAnalysis ? new Date(data.lastAnalysis).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Nombre d'analyses</span>
                <p className="font-medium">{data.data.length}</p>
              </div>
              <div>
                <span className="text-gray-600">Source</span>
                <p className="font-medium">Data.gouv.fr</p>
              </div>
              <div>
                <span className="text-gray-600">Conformité</span>
                <p className="font-medium">
                  {data.data.filter(d => d.conformite === 'Conforme').length}/{data.data.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pollutants Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des analyses officielles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.data.map((pollutant, index) => {
              const isQualitative = pollutant.uniteParametre?.toUpperCase() === 'SANS OBJET' || pollutant.uniteParametre?.toUpperCase() === 'N/A';
              const displayUnit = isQualitative ? '' : pollutant.uniteParametre;

              return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getPollutantIcon(pollutant.conformite)}
                  <div>
                    <p className="font-medium">{pollutant.parametreAnalyse}</p>
                    {!isQualitative && (
                      <p className="text-sm text-muted-foreground">
                        Limite: {pollutant.limiteQualite} {displayUnit}
                      </p>
                    )}
                    {getParameterDescription(pollutant.parametreAnalyse) && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">
                        {getParameterDescription(pollutant.parametreAnalyse)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {isQualitative ? (
                    <Badge variant={pollutant.conformite === 'Conforme' ? 'default' : 'destructive'}>
                      {pollutant.conformite === 'Conforme' ? 'Conforme' : 'Non conforme'}
                    </Badge>
                  ) : (
                    <>
                      <p className="font-bold text-lg">
                        {pollutant.valeurParametre} {displayUnit}
                      </p>
                      <div className="flex items-center space-x-1">
                        {pollutant.valeurParametre < pollutant.limiteQualite * 0.5 ? (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={`text-sm ${pollutant.valeurParametre < pollutant.limiteQualite * 0.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {Math.round((pollutant.valeurParametre / pollutant.limiteQualite) * 100)}% limite
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Informations techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Source des données:</span>
              <span className="font-medium">API officielle data.gouv.fr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date de dernière mise à jour:</span>
              <span className="font-medium">
                {data.lastAnalysis ? new Date(data.lastAnalysis).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conformité globale:</span>
              <span className={`font-medium ${data.data.every(d => d.conformite === 'Conforme') ? 'text-green-600' : 'text-orange-600'}`}>
                {data.data.every(d => d.conformite === 'Conforme') ? '✓ Conforme' : '⚠ À surveiller'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterQualityCard;
