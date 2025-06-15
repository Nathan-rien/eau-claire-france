
import React from 'react';
import { Droplets, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WaterQualityCardProps {
  city: string;
}

const WaterQualityCard: React.FC<WaterQualityCardProps> = ({ city }) => {
  // Mock data for demonstration
  const mockData = {
    Paris: {
      grade: 'B',
      score: 85,
      lastAnalysis: '2024-06-10',
      pollutants: [
        { name: 'Nitrates', value: 12, limit: 50, unit: 'mg/L', status: 'ok' },
        { name: 'Chlore résiduel', value: 0.3, limit: 2, unit: 'mg/L', status: 'ok' },
        { name: 'Trihalométhanes', value: 28, limit: 100, unit: 'µg/L', status: 'warning' },
        { name: 'Plomb', value: 2, limit: 10, unit: 'µg/L', status: 'ok' },
      ],
      source: 'Seine et Marne',
      treatment: 'Filtration + Chloration',
      hardness: 'Moyennement dure (15°fH)',
    },
    Lyon: {
      grade: 'A',
      score: 92,
      lastAnalysis: '2024-06-12',
      pollutants: [
        { name: 'Nitrates', value: 8, limit: 50, unit: 'mg/L', status: 'ok' },
        { name: 'Chlore résiduel', value: 0.2, limit: 2, unit: 'mg/L', status: 'ok' },
        { name: 'Trihalométhanes', value: 15, limit: 100, unit: 'µg/L', status: 'ok' },
        { name: 'Plomb', value: 1, limit: 10, unit: 'µg/L', status: 'ok' },
      ],
      source: 'Rhône',
      treatment: 'Ozonation + Filtration',
      hardness: 'Dure (22°fH)',
    },
  };

  const data = mockData[city as keyof typeof mockData] || mockData.Paris;

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

  const getPollutantIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'danger': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

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
                <p className="font-medium">{new Date(data.lastAnalysis).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <span className="text-gray-600">Source</span>
                <p className="font-medium">{data.source}</p>
              </div>
              <div>
                <span className="text-gray-600">Traitement</span>
                <p className="font-medium">{data.treatment}</p>
              </div>
              <div>
                <span className="text-gray-600">Dureté</span>
                <p className="font-medium">{data.hardness}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pollutants Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.pollutants.map((pollutant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getPollutantIcon(pollutant.status)}
                  <div>
                    <p className="font-medium">{pollutant.name}</p>
                    <p className="text-sm text-gray-600">
                      Limite: {pollutant.limit} {pollutant.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {pollutant.value} {pollutant.unit}
                  </p>
                  <div className="flex items-center space-x-1">
                    {pollutant.value < pollutant.limit * 0.5 ? (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className={`text-sm ${pollutant.value < pollutant.limit * 0.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {Math.round((pollutant.value / pollutant.limit) * 100)}% limite
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
          <CardTitle className="text-blue-800">Comparaison nationale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{data.score}</p>
              <p className="text-sm text-gray-600">Votre commune</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">78</p>
              <p className="text-sm text-gray-600">Moyenne régionale</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">82</p>
              <p className="text-sm text-gray-600">Moyenne nationale</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-sm text-center">
              {data.score > 82 ? (
                <span className="text-green-600 font-medium">
                  ✓ Votre eau est au-dessus de la moyenne nationale
                </span>
              ) : (
                <span className="text-orange-600 font-medium">
                  ⚠ Votre eau est en dessous de la moyenne nationale
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterQualityCard;
