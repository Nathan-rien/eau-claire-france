import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { PriceDisplay } from '@/components/PriceDisplay';
import { useLanguage } from '@/contexts/LanguageContext';
import { makeTapPrice, aggregateBottlePrices, sanityCheckEuroPerL } from '@/lib/price';
import { PRICE_INPUTS } from '@/data/prices.example';
import { bottleWaterDatabase } from '@/data/bottleComparisonData';

/**
 * Page de diagnostic des prix - Audit et vérifications
 * Affiche les sources, calculs et garde-fous pour transparence
 */
export default function DiagnosticPrix() {
  const { t } = useLanguage();
  // Calcul des prix avec logging
  const tapPrice = makeTapPrice(PRICE_INPUTS.tap!);
  
  // Échantillon de prix bouteilles pour test
  const sampleBottles = bottleWaterDatabase.slice(0, 5);
  const bottlePrices = sampleBottles.map(bottle => 
    aggregateBottlePrices([{ 
      pricePerLitre: bottle.prix_moyen_litre, 
      source: `Données ${bottle.marque}`, 
      updatedAt: "2025-01-01" 
    }])
  );

  // Tests des bornes
  const testValues = [
    { value: 0.0001, kind: "tap" as const, label: "Eau robinet trop bas" },
    { value: 0.004, kind: "tap" as const, label: "Eau robinet normal" },
    { value: 0.1, kind: "tap" as const, label: "Eau robinet trop élevé" },
    { value: 0.01, kind: "bottle" as const, label: "Bouteille trop bas" },
    { value: 0.5, kind: "bottle" as const, label: "Bouteille normal" },
    { value: 10, kind: "bottle" as const, label: "Bouteille trop élevé" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">{t('priceDiag.title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('priceDiag.subtitle')}
          </p>
        </div>

        {/* Prix de l'eau du robinet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💧 {t('priceDiag.tapWater')}
              <Badge variant="outline">{t('priceDiag.centralSource')}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">{t('priceDiag.publicDisplay')}</h3>
                <PriceDisplay priceData={tapPrice} kind="tap" showMetadata={true} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('priceDiag.rawData')}</h3>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(PRICE_INPUTS.tap, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prix des bouteilles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🍶 Prix Eaux en Bouteille
              <Badge variant="outline">Échantillon</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleBottles.map((bottle, index) => (
                <Card key={bottle.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{bottle.marque}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <PriceDisplay 
                      priceData={bottlePrices[index]} 
                      kind="bottle" 
                      showMetadata={true} 
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Prix brut: {bottle.prix_moyen_litre}€/L
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tests de validation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛡️ Tests de Validation
              <Badge variant="outline">Garde-fous</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testValues.map((test, index) => {
                const check = sanityCheckEuroPerL(test.value, test.kind);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{test.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {test.value}€/L ({test.kind})
                      </div>
                    </div>
                    <Badge variant={check.ok ? "default" : "destructive"}>
                      {check.ok ? "✓ Valide" : `✗ ${check.reason}`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Méthode de calcul */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Méthodes de Calcul</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-2">Eau du Robinet</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Source: Prix au m³ (€/m³)</li>
                  <li>• Conversion: prix / 1000 → €/L</li>
                  <li>• Bornes: 0,0005 - 0,02 €/L</li>
                  <li>• Fallback: 0,004 €/L</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">Eau en Bouteille</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Source: Prix pack/bouteille + volume</li>
                  <li>• Conversion: prix / volume → €/L</li>
                  <li>• Bornes: 0,05 - 5 €/L</li>
                  <li>• Fallback: 0,50 €/L</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations système */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Informations système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Consultez la console du navigateur pour voir les logs détaillés :</p>
              <ul className="mt-2 space-y-1 font-mono">
                <li>• [price:audit] - Données d'entrée et conversions</li>
                <li>• [price:final] - Prix finaux affichés</li>
                <li>• [formatPrice] - Validations et clamping</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}