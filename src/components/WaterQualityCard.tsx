
import React from 'react';
import { Droplets, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWaterQuality } from '@/hooks/useWaterQuality';

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
            {data.data.map((pollutant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getPollutantIcon(pollutant.conformite)}
                  <div>
                    <p className="font-medium">{pollutant.parametreAnalyse}</p>
                    <p className="text-sm text-gray-600">
                      Limite: {pollutant.limiteQualite} {pollutant.uniteParametre}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {pollutant.valeurParametre} {pollutant.uniteParametre}
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
                </div>
              </div>
            ))}
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
