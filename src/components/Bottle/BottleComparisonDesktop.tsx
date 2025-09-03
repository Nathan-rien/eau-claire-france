import React from 'react';
import { Euro, Droplets, Leaf, Heart, HeartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { BottleWaterData, tapWaterComparison } from '@/data/bottleComparisonData';
import { 
  interpretNitrates, 
  interpretResiduSec, 
  interpretCalcium, 
  interpretMagnesium, 
  interpretSodium, 
  interpretPH 
} from '@/utils/nutritionalInterpretation';

import BottleRow from './BottleRow';
import type { LoadingState } from '@/types/bottle';
import { PriceDisplay } from '@/components/PriceDisplay';
import { aggregateBottlePrices } from '@/lib/price';
import { usePrices } from '@/hooks/usePrices';

interface BottleComparisonDesktopProps {
  selectedBottles: BottleWaterData[];
  showTapWater: boolean;
  allItems: BottleWaterData[];
  handleToggleFavorite: (bottle: BottleWaterData) => void;
  getEcoScoreColor: (score: string) => string;
  isFavorite?: (bottleId: number) => boolean;
  loadingState: LoadingState;
}

const BottleComparisonDesktop: React.FC<BottleComparisonDesktopProps> = ({
  selectedBottles,
  showTapWater,
  allItems,
  handleToggleFavorite,
  getEcoScoreColor,
  isFavorite,
  loadingState
}) => {
  const { tap } = usePrices();
  if (loadingState.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="w-5 h-5" />
            <span>Comparaison détaillée</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadingState.isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">
          <p>Erreur lors du chargement des données.</p>
          {loadingState.error && (
            <p className="text-sm text-muted-foreground mt-2">
              {loadingState.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
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
                  <TableHead key={bottle.id} className="text-center min-w-32">
                    <div className="font-medium">{bottle.marque}</div>
                    <div className="text-xs text-muted-foreground">{bottle.nom_bouteille}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <BottleRow
                label="Type d'eau"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue="Eau du robinet"
                renderValue={(bottle) => bottle.type_eau}
              />
              
              <BottleRow
                label="Format"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue="∞"
                renderValue={(bottle) => bottle.format}
              />
              
              <BottleRow
                label="Source"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue="Réseau public"
                renderValue={(bottle) => bottle.source}
              />

              <BottleRow
                label="Prix (€/L)"
                icon={<Euro className="w-4 h-4" />}
                className="bg-green-50"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                 tapWaterValue={
                   <div className="text-green-700">
                     <PriceDisplay 
                       priceData={tap} 
                       kind="tap" 
                       showMetadata={false}
                     />
                   </div>
                 }
                renderValue={(bottle) => (
                  <div className="text-green-700" data-price="bottle" id="price-bottle-desktop">
                    <span className="font-medium">
                      {fmt(bottle.value)} <em style={{opacity:.6}}>💧HOOK</em>
                    </span>
                    <em style={{opacity:.7, fontSize:'10px'}}> 💧PRICE-HOOK-ACTIVE</em>
                  </div>
                )}
              />

              <BottleRow
                label="Nitrates (mg/L)"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue={
                  <span className={interpretNitrates(tapWaterComparison.nitrates_mgL).className}>
                    {tapWaterComparison.nitrates_mgL} {interpretNitrates(tapWaterComparison.nitrates_mgL).label}
                  </span>
                }
                renderValue={(bottle) => {
                  const interpretation = interpretNitrates(bottle.nitrates_mgL);
                  return (
                    <span className={interpretation.className}>
                      {bottle.nitrates_mgL} {interpretation.label}
                    </span>
                  );
                }}
              />

              <BottleRow
                label="Résidu sec (mg/L)"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue={
                  <span className={interpretResiduSec(tapWaterComparison.residu_sec_mgL).className}>
                    {tapWaterComparison.residu_sec_mgL} {interpretResiduSec(tapWaterComparison.residu_sec_mgL).label}
                  </span>
                }
                renderValue={(bottle) => {
                  const interpretation = interpretResiduSec(bottle.residu_sec_mgL);
                  return (
                    <span className={interpretation.className}>
                      {bottle.residu_sec_mgL} {interpretation.label}
                    </span>
                  );
                }}
              />

              <BottleRow
                label="Calcium (mg/L)"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue={
                  <span className={interpretCalcium(tapWaterComparison.calcium_mgL).className}>
                    {tapWaterComparison.calcium_mgL} {interpretCalcium(tapWaterComparison.calcium_mgL).label}
                  </span>
                }
                renderValue={(bottle) => {
                  const interpretation = interpretCalcium(bottle.calcium_mgL);
                  return (
                    <span className={interpretation.className}>
                      {bottle.calcium_mgL} {interpretation.label}
                    </span>
                  );
                }}
              />

              <BottleRow
                label="Magnésium (mg/L)"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue={
                  <span className={interpretMagnesium(tapWaterComparison.magnesium_mgL).className}>
                    {tapWaterComparison.magnesium_mgL} {interpretMagnesium(tapWaterComparison.magnesium_mgL).label}
                  </span>
                }
                renderValue={(bottle) => {
                  const interpretation = interpretMagnesium(bottle.magnesium_mgL);
                  return (
                    <span className={interpretation.className}>
                      {bottle.magnesium_mgL} {interpretation.label}
                    </span>
                  );
                }}
              />

              <BottleRow
                label="Sodium (mg/L)"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue={
                  <span className={interpretSodium(tapWaterComparison.sodium_mgL).className}>
                    {tapWaterComparison.sodium_mgL} {interpretSodium(tapWaterComparison.sodium_mgL).label}
                  </span>
                }
                renderValue={(bottle) => {
                  const interpretation = interpretSodium(bottle.sodium_mgL);
                  return (
                    <span className={interpretation.className}>
                      {bottle.sodium_mgL} {interpretation.label}
                    </span>
                  );
                }}
              />

              <BottleRow
                label="pH"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue={
                  <span className={interpretPH(tapWaterComparison.pH).className}>
                    {tapWaterComparison.pH} {interpretPH(tapWaterComparison.pH).label}
                  </span>
                }
                renderValue={(bottle) => {
                  const interpretation = interpretPH(bottle.pH);
                  return (
                    <span className={interpretation.className}>
                      {bottle.pH} {interpretation.label}
                    </span>
                  );
                }}
              />

              {!showTapWater && (
                <>
                  <BottleRow
                    label="Emballage"
                    bottles={selectedBottles}
                    showTapWater={showTapWater}
                    renderValue={(bottle) => bottle.emballage}
                  />
                  
                  <BottleRow
                    label="Recyclable"
                    bottles={selectedBottles}
                    showTapWater={showTapWater}
                    renderValue={(bottle) => (
                      <span className={`px-2 py-1 rounded text-xs ${
                        bottle.recyclable === 'Oui' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bottle.recyclable}
                      </span>
                    )}
                  />
                  
                  <BottleRow
                    label="Consigné"
                    bottles={selectedBottles}
                    showTapWater={showTapWater}
                    renderValue={(bottle) => (
                      <span className={`px-2 py-1 rounded text-xs ${
                        bottle.consigne === 'Oui' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bottle.consigne}
                      </span>
                    )}
                  />
                </>
              )}

              <BottleRow
                label="Impact carbone (g CO₂/L)"
                icon={<Leaf className="w-4 h-4" />}
                className="bg-orange-50"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue={
                  <span className="font-bold text-orange-700">
                    {tapWaterComparison.impact_carbone_gCO2L}g
                  </span>
                }
                renderValue={(bottle) => (
                  <span className="font-bold text-orange-700">
                    {bottle.impact_carbone_gCO2L}g
                  </span>
                )}
              />

              <BottleRow
                label="Éco-score"
                bottles={selectedBottles}
                showTapWater={showTapWater}
                tapWaterValue={
                  <Badge className={getEcoScoreColor(tapWaterComparison.ecoscore)}>
                    {tapWaterComparison.ecoscore}
                  </Badge>
                }
                renderValue={(bottle) => (
                  <Badge className={getEcoScoreColor(bottle.ecoscore)}>
                    {bottle.ecoscore}
                  </Badge>
                )}
              />

              {!showTapWater && isFavorite && (
                <BottleRow
                  label="Favoris"
                  bottles={selectedBottles}
                  showTapWater={showTapWater}
                  renderValue={(bottle) => (
                    <Button
                      size="sm"
                      variant={isFavorite(bottle.id) ? "default" : "outline"}
                      onClick={() => handleToggleFavorite(bottle)}
                      aria-label={isFavorite(bottle.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      {isFavorite(bottle.id) ? (
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                      ) : (
                        <HeartIcon className="w-3 h-3 mr-1" />
                      )}
                      {isFavorite(bottle.id) ? "Retirer" : "Ajouter"}
                    </Button>
                  )}
                />
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BottleComparisonDesktop;