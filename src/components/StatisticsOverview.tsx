
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Pollutant {
  riskLevel: string;
}

interface StatisticsOverviewProps {
  pollutants: Pollutant[];
}

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({ pollutants }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{pollutants.length}</div>
          <div className="text-sm text-blue-800">Polluants surveillés</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {pollutants.filter(p => p.riskLevel === 'low').length}
          </div>
          <div className="text-sm text-green-800">Risque faible</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {pollutants.filter(p => p.riskLevel === 'medium').length}
          </div>
          <div className="text-sm text-yellow-800">Risque modéré</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {pollutants.filter(p => p.riskLevel === 'high').length}
          </div>
          <div className="text-sm text-red-800">Risque élevé</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsOverview;
