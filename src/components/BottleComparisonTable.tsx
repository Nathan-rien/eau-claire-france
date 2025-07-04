
import React from 'react';
import { Euro, Droplets, Leaf, Heart, HeartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { BottleWaterData, tapWaterComparison } from '@/data/bottleComparisonData';
import { 
  interpretNitrates, 
  interpretResiduSec, 
  interpretCalcium, 
  interpretMagnesium, 
  interpretSodium, 
  interpretPH 
} from '@/utils/nutritionalInterpretation';

interface BottleComparisonTableProps {
  selectedBottles: BottleWaterData[];
  showTapWater: boolean;
  onToggleFavorite?: (bottle: BottleWaterData) => void;
  onRemoveFavorite?: (bottleId: number) => void;
  isFavorite?: (bottleId: number) => boolean;
  showFavoriteControls?: boolean;
}

const BottleComparisonTable: React.FC<BottleComparisonTableProps> = ({
  selectedBottles,
  showTapWater,
  onToggleFavorite,
  onRemoveFavorite,
  isFavorite,
  showFavoriteControls = false
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

  const handleToggleFavorite = (bottle: BottleWaterData) => {
    if (!onToggleFavorite || !isFavorite) return;
    
    if (isFavorite(bottle.id)) {
      if (onRemoveFavorite) {
        onRemoveFavorite(bottle.id);
        toast({
          title: "Retiré des favoris",
          description: `${bottle.marque === bottle.nom_bouteille ? bottle.marque : `${bottle.marque} ${bottle.nom_bouteille}`} a été retiré de vos favoris.`
        });
      }
    } else {
      onToggleFavorite(bottle);
      toast({
        title: "Ajouté aux favoris",
        description: `${bottle.marque === bottle.nom_bouteille ? bottle.marque : `${bottle.marque} ${bottle.nom_bouteille}`} a été ajouté à vos favoris.`
      });
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
                    {allItems.map((item, index) => {
                      const interpretation = interpretNitrates(item.nitrates_mgL);
                      return (
                        <TableCell key={index} className={`text-center ${interpretation.className}`}>
                          {item.nitrates_mgL} {interpretation.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Résidu sec (mg/L)</TableCell>
                    {allItems.map((item, index) => {
                      const interpretation = interpretResiduSec(item.residu_sec_mgL);
                      return (
                        <TableCell key={index} className={`text-center ${interpretation.className}`}>
                          {item.residu_sec_mgL} {interpretation.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Calcium (mg/L)</TableCell>
                    {allItems.map((item, index) => {
                      const interpretation = interpretCalcium(item.calcium_mgL);
                      return (
                        <TableCell key={index} className={`text-center ${interpretation.className}`}>
                          {item.calcium_mgL} {interpretation.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Magnésium (mg/L)</TableCell>
                    {allItems.map((item, index) => {
                      const interpretation = interpretMagnesium(item.magnesium_mgL);
                      return (
                        <TableCell key={index} className={`text-center ${interpretation.className}`}>
                          {item.magnesium_mgL} {interpretation.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sodium (mg/L)</TableCell>
                    {allItems.map((item, index) => {
                      const interpretation = interpretSodium(item.sodium_mgL);
                      return (
                        <TableCell key={index} className={`text-center ${interpretation.className}`}>
                          {item.sodium_mgL} {interpretation.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">pH</TableCell>
                    {allItems.map((item, index) => {
                      const interpretation = interpretPH(item.pH);
                      return (
                        <TableCell key={index} className={`text-center ${interpretation.className}`}>
                          {item.pH} {interpretation.label}
                        </TableCell>
                      );
                    })}
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
                      <TableCell className="font-medium">Favoris</TableCell>
                      {selectedBottles.map(bottle => (
                        <TableCell key={bottle.id} className="text-center">
                          {onToggleFavorite && isFavorite && (
                            <Button
                              size="sm"
                              variant={isFavorite(bottle.id) ? "default" : "outline"}
                              onClick={() => handleToggleFavorite(bottle)}
                            >
                              {isFavorite(bottle.id) ? (
                                <Heart className="w-3 h-3 mr-1 fill-current" />
                              ) : (
                                <HeartIcon className="w-3 h-3 mr-1" />
                              )}
                              {isFavorite(bottle.id) ? "Retiré" : "Ajouter"}
                            </Button>
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
                <div><strong>Prix :</strong> {tapWaterComparison.prix_moyen_litre.toFixed(3)}€/L</div>
                <div><strong>Nitrates :</strong> 
                  <span className={interpretNitrates(tapWaterComparison.nitrates_mgL).className}>
                    {' '}{tapWaterComparison.nitrates_mgL} mg/L {interpretNitrates(tapWaterComparison.nitrates_mgL).label}
                  </span>
                </div>
                <div><strong>Calcium :</strong> 
                  <span className={interpretCalcium(tapWaterComparison.calcium_mgL).className}>
                    {' '}{tapWaterComparison.calcium_mgL} mg/L {interpretCalcium(tapWaterComparison.calcium_mgL).label}
                  </span>
                </div>
                <div><strong>Magnésium :</strong> 
                  <span className={interpretMagnesium(tapWaterComparison.magnesium_mgL).className}>
                    {' '}{tapWaterComparison.magnesium_mgL} mg/L {interpretMagnesium(tapWaterComparison.magnesium_mgL).label}
                  </span>
                </div>
                <div><strong>Sodium :</strong> 
                  <span className={interpretSodium(tapWaterComparison.sodium_mgL).className}>
                    {' '}{tapWaterComparison.sodium_mgL} mg/L {interpretSodium(tapWaterComparison.sodium_mgL).label}
                  </span>
                </div>
                <div><strong>pH :</strong> 
                  <span className={interpretPH(tapWaterComparison.pH).className}>
                    {' '}{tapWaterComparison.pH} {interpretPH(tapWaterComparison.pH).label}
                  </span>
                </div>
                <div><strong>CO₂ :</strong> {tapWaterComparison.impact_carbone_gCO2L}g/L</div>
                <div><strong>Éco-score :</strong> <Badge className={getEcoScoreColor(tapWaterComparison.ecoscore)}>{tapWaterComparison.ecoscore}</Badge></div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {selectedBottles.map(bottle => (
          <Card key={bottle.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{bottle.marque === bottle.nom_bouteille ? bottle.marque : `${bottle.marque} - ${bottle.nom_bouteille}`}</span>
                {onToggleFavorite && isFavorite && (
                  <Button
                    size="sm"
                    variant={isFavorite(bottle.id) ? "default" : "outline"}
                    onClick={() => handleToggleFavorite(bottle)}
                  >
                    {isFavorite(bottle.id) ? (
                      <Heart className="w-3 h-3 fill-current" />
                    ) : (
                      <HeartIcon className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </CardTitle>
              <div className="text-sm text-gray-600">{bottle.type_eau} • {bottle.format}</div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><strong>Source :</strong> {bottle.source}</div>
                <div><strong>Prix :</strong> {bottle.prix_moyen_litre.toFixed(2)}€/L</div>
                <div><strong>Nitrates :</strong> 
                  <span className={interpretNitrates(bottle.nitrates_mgL).className}>
                    {' '}{bottle.nitrates_mgL} mg/L {interpretNitrates(bottle.nitrates_mgL).label}
                  </span>
                </div>
                <div><strong>Résidu sec :</strong> 
                  <span className={interpretResiduSec(bottle.residu_sec_mgL).className}>
                    {' '}{bottle.residu_sec_mgL} mg/L {interpretResiduSec(bottle.residu_sec_mgL).label}
                  </span>
                </div>
                <div><strong>Calcium :</strong> 
                  <span className={interpretCalcium(bottle.calcium_mgL).className}>
                    {' '}{bottle.calcium_mgL} mg/L {interpretCalcium(bottle.calcium_mgL).label}
                  </span>
                </div>
                <div><strong>Magnésium :</strong> 
                  <span className={interpretMagnesium(bottle.magnesium_mgL).className}>
                    {' '}{bottle.magnesium_mgL} mg/L {interpretMagnesium(bottle.magnesium_mgL).label}
                  </span>
                </div>
                <div><strong>Sodium :</strong> 
                  <span className={interpretSodium(bottle.sodium_mgL).className}>
                    {' '}{bottle.sodium_mgL} mg/L {interpretSodium(bottle.sodium_mgL).label}
                  </span>
                </div>
                <div><strong>pH :</strong> 
                  <span className={interpretPH(bottle.pH).className}>
                    {' '}{bottle.pH} {interpretPH(bottle.pH).label}
                  </span>
                </div>
                <div><strong>Emballage :</strong> {bottle.emballage}</div>
                <div><strong>Recyclable :</strong> 
                  <Badge className={`ml-1 ${bottle.recyclable === 'Oui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {bottle.recyclable}
                  </Badge>
                </div>
                <div><strong>CO₂ :</strong> {bottle.impact_carbone_gCO2L}g/L</div>
                <div><strong>Éco-score :</strong> <Badge className={getEcoScoreColor(bottle.ecoscore)}>{bottle.ecoscore}</Badge></div>
              </div>
              {showFavoriteControls && onRemoveFavorite && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRemoveFavorite(bottle.id)}
                  >
                    <Heart className="w-3 h-3 mr-1 fill-current" />
                    Retirer des favoris
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
