
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const NutritionalGuide = () => {
  return (
    <Card className="bg-blue-50 border-blue-200 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Info className="w-5 h-5" />
          <span>Comment lire les valeurs nutritionnelles ?</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="text-left py-2 px-3 font-medium text-blue-800">Élément</th>
                <th className="text-left py-2 px-3 font-medium text-blue-800">Recommandations</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-blue-100">
                <td className="py-2 px-3 font-medium">Nitrates</td>
                <td className="py-2 px-3">Moins de 5 mg/L = très faible (bon)</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-2 px-3 font-medium">Résidu sec</td>
                <td className="py-2 px-3">Entre 150 et 500 mg/L = idéal</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-2 px-3 font-medium">Calcium</td>
                <td className="py-2 px-3">Plus de 150 mg/L = riche</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-2 px-3 font-medium">Magnésium</td>
                <td className="py-2 px-3">Plus de 50 mg/L = riche</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="py-2 px-3 font-medium">Sodium</td>
                <td className="py-2 px-3">Moins de 20 mg/L = faible</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">pH</td>
                <td className="py-2 px-3">Entre 6.5 et 8.5 = idéal</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Légende des interprétations :</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex flex-wrap gap-4">
              <span className="value-good">• Très faible, Faible, Idéal, Riche, Très riche</span>
              <span className="value-warn">• Correct, Moyen, Modéré, Élevé, Basique</span>
              <span className="value-bad">• Trop faible, Trop élevé, Trop salé, Acide</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionalGuide;
