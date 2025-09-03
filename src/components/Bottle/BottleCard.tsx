"use client";
import React from 'react';
import { Heart, HeartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BottleWaterData } from '@/data/bottleComparisonData';
import { 
  interpretNitrates, 
  interpretResiduSec, 
  interpretCalcium, 
  interpretMagnesium, 
  interpretSodium, 
  interpretPH 
} from '@/utils/nutritionalInterpretation';
import { normalizeBottleName, formatPrice } from '@/utils/conversionUtils';

interface BottleCardProps {
  bottle: BottleWaterData;
  onToggleFavorite?: (bottle: BottleWaterData) => void;
  isFavorite?: (bottleId: number) => boolean;
  getEcoScoreColor: (score: string) => string;
  isLoading?: boolean;
}

const BottleCard: React.FC<BottleCardProps> = ({
  bottle,
  onToggleFavorite,
  isFavorite,
  getEcoScoreColor,
  isLoading = false
}) => {
  const bottleName = normalizeBottleName(bottle.marque, bottle.nom_bouteille);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="truncate pr-2">{bottleName}</span>
          {onToggleFavorite && isFavorite && (
            <Button
              size="sm"
              variant={isFavorite(bottle.id) ? "default" : "outline"}
              onClick={() => onToggleFavorite(bottle)}
              className="shrink-0"
              aria-label={isFavorite(bottle.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {isFavorite(bottle.id) ? (
                <Heart className="w-3 h-3 fill-current" />
              ) : (
                <HeartIcon className="w-3 h-3" />
              )}
            </Button>
          )}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {bottle.type_eau} • {bottle.format}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Source :</strong> 
            <span className="ml-1 text-muted-foreground">{bottle.source}</span>
          </div>
          <div>
            <strong>Prix :</strong> 
            <span className="ml-1 font-semibold text-green-700" data-price="bottle" id="price-bottle-card">
              {(bottle.prix_moyen_litre < 0.01 ? bottle.prix_moyen_litre.toFixed(3) : bottle.prix_moyen_litre.toFixed(2))}€/L <em style={{opacity:.7}}>💧PRICE-HOOK-ACTIVE</em>
            </span>
          </div>
          <div>
            <strong>Nitrates :</strong> 
            <span className={`ml-1 ${interpretNitrates(bottle.nitrates_mgL).className}`}>
              {bottle.nitrates_mgL} mg/L {interpretNitrates(bottle.nitrates_mgL).label}
            </span>
          </div>
          <div>
            <strong>Résidu sec :</strong> 
            <span className={`ml-1 ${interpretResiduSec(bottle.residu_sec_mgL).className}`}>
              {bottle.residu_sec_mgL} mg/L {interpretResiduSec(bottle.residu_sec_mgL).label}
            </span>
          </div>
          <div>
            <strong>Calcium :</strong> 
            <span className={`ml-1 ${interpretCalcium(bottle.calcium_mgL).className}`}>
              {bottle.calcium_mgL} mg/L {interpretCalcium(bottle.calcium_mgL).label}
            </span>
          </div>
          <div>
            <strong>Magnésium :</strong> 
            <span className={`ml-1 ${interpretMagnesium(bottle.magnesium_mgL).className}`}>
              {bottle.magnesium_mgL} mg/L {interpretMagnesium(bottle.magnesium_mgL).label}
            </span>
          </div>
          <div>
            <strong>Sodium :</strong> 
            <span className={`ml-1 ${interpretSodium(bottle.sodium_mgL).className}`}>
              {bottle.sodium_mgL} mg/L {interpretSodium(bottle.sodium_mgL).label}
            </span>
          </div>
          <div>
            <strong>pH :</strong> 
            <span className={`ml-1 ${interpretPH(bottle.pH).className}`}>
              {bottle.pH} {interpretPH(bottle.pH).label}
            </span>
          </div>
          <div>
            <strong>Emballage :</strong> 
            <span className="ml-1 text-muted-foreground">{bottle.emballage}</span>
          </div>
          <div>
            <strong>CO₂ :</strong> 
            <span className="ml-1 font-medium text-orange-700">
              {bottle.impact_carbone_gCO2L}g/L
            </span>
          </div>
          <div>
            <strong>Recyclable :</strong> 
            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
              bottle.recyclable === 'Oui' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {bottle.recyclable}
            </span>
          </div>
          <div>
            <strong>Éco-score :</strong> 
            <Badge className={`ml-1 ${getEcoScoreColor(bottle.ecoscore)}`}>
              {bottle.ecoscore}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BottleCard;