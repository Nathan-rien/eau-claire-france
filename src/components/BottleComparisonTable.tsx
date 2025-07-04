
import React from 'react';
import { Euro, Droplets, Leaf, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BottleWaterData, tapWaterComparison } from '@/data/bottleComparisonData';

interface BottleComparisonTableProps {
  selectedBottles: BottleWaterData[];
  showTapWater: boolean;
}

const BottleComparisonTable: React.FC<BottleComparisonTableProps> = ({
  selectedBottles,
  showTapWater
}) => {
  if (selectedBottles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <Droplets className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Aucune bouteille sélectionnée</h3>
          <p>Sélectionnez jusqu'à 3 bouteilles pour commencer la comparaison</p>
        </CardContent>
      </Card>
    );
  }

  const getEcoScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const allItems = showTapWater ? [tapWaterComparison, ...selectedBottles] : selectedBottles;

  return (
    <div className="space-y-6">
      {/* Vue desktop - Tableau horizontal */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="w-5 h-5" />
              <span>Comparaison détaillée</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Caractéristiques</TableHead>
                    {showTapWater && (
                      <TableHead className="text-center bg-blue-50">
                        <div className="font-medium text-blue-800">Eau du robinet</div>
                        <div className="text-xs text-blue-600">Référence</div>
                      </TableHead>
                    )}
                    {selectedBottles.map(bottle => (
                      <TableHead key={bottle.id} className="text-center">
                        <div className="font-medium">{bottle.marque}</div>
                        <div className="text-xs text-gray-600">{bottle.nom_bouteille}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Type d'eau</TableCell>
                    {showTapWater && (
                      <TableCell className="text-center bg-blue-50">Eau du robinet</TableCell>
                    )}
                    {selectedBottles.map(bottle => (
                      <TableCell key={bottle.id} className="text-center">{bottle.type_eau}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Format</TableCell>
                    {showTapWater && (
                      <TableCell className="text-center bg-blue-50">∞</TableCell>
                    )}
                    {selectedBottles.map(bottle => (
                      <TableCell key={bottle.id} className="text-center">{bottle.format}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Source</TableCell>
                    {showTapWater && (
                      <TableCell className="text-center bg-blue-50">Réseau public</TableCell>
                    )}
                    {selectedBottles.map(bottle => (
                      <TableCell key={bottle.id} className="text-center">{bottle.source}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-green-50">
                    <TableCell className="font-medium flex items-center">
                      <Euro className="w-4 h-4 mr-2" />
                      Prix (€/L)
                    </TableCell>
                    {allItems.map((item, index) => (
                      <TableCell key={index} className="text-center font-bold text-green-700">
                        {item.prix_moyen_litre.toFixed(3)}€
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Nitrates (mg/L)</TableCell>
                    {allItems.map((item, index) => (
                      <TableCell key={index} className="text-center">{item.nitrates_mgL}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Résidu sec (mg/L)</TableCell>
                    {allItems.map((item, index) => (
                      <TableCell key={index} className="text-center">{item.residu_sec_mgL}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Calcium (mg/L)</TableCell>
                    {allItems.map((item, index) => (
                      <TableCell key={index} className="text-center">{item.calcium_mgL}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Magnésium (mg/L)</TableCell>
                    {allItems.map((item, index) => (
                      <TableCell key={index} className="text-center">{item.magnesium_mgL}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sodium (mg/L)</TableCell>
                    {allItems.map((item, index) => (
                      <TableCell key={index} className="text-center">{item.sodium_mgL}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">pH</TableCell>
                    {allItems.map((item, index) => (
                      <TableCell key={index} className="text-center">{item.pH}</TableCell>
                    ))}
                  </TableRow>
                  {!showTapWater && (
                    <>
                      <TableRow>
                        <TableCell className="font-medium">Emballage</TableCell>
                        {selectedBottles.map(bottle => (
                          <TableCell key={bottle.id} className="text-center">{bottle.emballage}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Recyclable</TableCell>
                        {selectedBottles.map(bottle => (
                          <TableCell key={bottle.id} className="text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              bottle.recyclable === 'Oui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {bottle.recyclable}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Consigné</TableCell>
                        {selectedBottles.map(bottle => (
                          <TableCell key={bottle.id} className="text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              bottle.consigne === 'Oui' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {bottle.consigne}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    </>
                  )}
                  <TableRow className="bg-orange-50">
                    <TableCell className="font-medium flex items-center">
                      <Leaf className="w-4 h-4 mr-2" />
                      Impact carbone (g CO₂/L)
                    </TableCell>
                    {allItems.map((item, index) => (
                      <TableCell key={index} className="text-center font-bold text-orange-700">
                        {item.impact_carbone_gCO2L}g
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Éco-score</TableCell>
                    {allItems.map((item, index) => (
                      <TableCell key={index} className="text-center">
                        <Badge className={getEcoScoreColor(item.ecoscore)}>
                          {item.ecoscore}
                        </Badge>
                      </TableCell>
                    ))}
                  </TableRow>
                  {!showTapWater && (
                    <TableRow>
                      <TableCell className="font-medium">Fiche détaillée</TableCell>
                      {selectedBottles.map(bottle => (
                        <TableCell key={bottle.id} className="text-center">
                          {bottle.url_fiche ? (
                            <Button size="sm" variant="outline" asChild>
                              <a href={bottle.url_fiche} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Voir
                              </a>
                            </Button>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vue mobile - Cards verticales */}
      <div className="lg:hidden space-y-4">
        {showTapWater && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Eau du robinet (référence)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Prix:</strong> {tapWaterComparison.prix_moyen_litre.toFixed(3)}€/L</div>
                <div><strong>Nitrates:</strong> {tapWaterComparison.nitrates_mgL} mg/L</div>
                <div><strong>Calcium:</strong> {tapWaterComparison.calcium_mgL} mg/L</div>
                <div><strong>Magnésium:</strong> {tapWaterComparison.magnesium_mgL} mg/L</div>
                <div><strong>Sodium:</strong> {tapWaterComparison.sodium_mgL} mg/L</div>
                <div><strong>pH:</strong> {tapWaterComparison.pH}</div>
                <div><strong>CO₂:</strong> {tapWaterComparison.impact_carbone_gCO2L}g/L</div>
                <div><strong>Éco-score:</strong> <Badge className={getEcoScoreColor(tapWaterComparison.ecoscore)}>{tapWaterComparison.ecoscore}</Badge></div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {selectedBottles.map(bottle => (
          <Card key={bottle.id}>
            <CardHeader>
              <CardTitle>{bottle.marque} - {bottle.nom_bouteille}</CardTitle>
              <div className="text-sm text-gray-600">{bottle.type_eau} • {bottle.format}</div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Source:</strong> {bottle.source}</div>
                <div><strong>Prix:</strong> {bottle.prix_moyen_litre.toFixed(2)}€/L</div>
                <div><strong>Nitrates:</strong> {bottle.nitrates_mgL} mg/L</div>
                <div><strong>Résidu sec:</strong> {bottle.residu_sec_mgL} mg/L</div>
                <div><strong>Calcium:</strong> {bottle.calcium_mgL} mg/L</div>
                <div><strong>Magnésium:</strong> {bottle.magnesium_mgL} mg/L</div>
                <div><strong>Sodium:</strong> {bottle.sodium_mgL} mg/L</div>
                <div><strong>pH:</strong> {bottle.pH}</div>
                <div><strong>Emballage:</strong> {bottle.emballage}</div>
                <div><strong>Recyclable:</strong> 
                  <Badge className={`ml-1 ${bottle.recyclable === 'Oui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {bottle.recyclable}
                  </Badge>
                </div>
                <div><strong>CO₂:</strong> {bottle.impact_carbone_gCO2L}g/L</div>
                <div><strong>Éco-score:</strong> <Badge className={getEcoScoreColor(bottle.ecoscore)}>{bottle.ecoscore}</Badge></div>
              </div>
              {bottle.url_fiche && (
                <div className="mt-4">
                  <Button size="sm" variant="outline" asChild>
                    <a href={bottle.url_fiche} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Voir la fiche détaillée
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BottleComparisonTable;
