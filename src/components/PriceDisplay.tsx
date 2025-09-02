import { Badge } from "@/components/ui/badge";
import { PriceValue, clampPriceForDisplay } from "@/lib/price";

interface PriceDisplayProps {
  priceData: PriceValue;
  kind: "tap" | "bottle";
  showMetadata?: boolean;
}

export function PriceDisplay({ priceData, kind, showMetadata = true }: PriceDisplayProps) {
  const clampedPrice = clampPriceForDisplay(priceData.value, kind);
  const decimals = kind === "tap" ? 3 : 2;
  const formattedPrice = clampedPrice.toFixed(decimals);
  
  // Log final price for debugging
  console.log("[price:final]", { 
    kind, 
    original: priceData.value, 
    clamped: clampedPrice, 
    formatted: formattedPrice,
    source: priceData.source,
    notes: priceData.notes 
  });

  const hasAnomaly = priceData.notes?.includes("fallback_due_to") || clampedPrice !== priceData.value;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-medium">{formattedPrice}€/L</span>
        {hasAnomaly && (
          <Badge variant="destructive" className="text-xs">
            anomalie détectée (fallback)
          </Badge>
        )}
        {priceData.notes && !hasAnomaly && (
          <Badge variant="secondary" className="text-xs">
            donnée à vérifier
          </Badge>
        )}
      </div>
      
      {showMetadata && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Source: {priceData.source}</div>
          <div>Mis à jour: {new Date(priceData.updatedAt).toLocaleDateString('fr-FR')}</div>
          <div>Méthode: {priceData.method}</div>
        </div>
      )}
    </div>
  );
}