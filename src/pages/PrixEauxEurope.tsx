import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Euro, Info, TrendingUp, Droplets } from 'lucide-react';
import { EU_COUNTRY_COORDS } from '@/services/europeWaterApi';

// Static EU tap water price data (€/m³, sources: EurEau, OECD 2023)
const EU_TAP_WATER_PRICES: { code: string; name: string; pricePerM3: number; trend: 'up' | 'stable' | 'down' }[] = [
  { code: 'DK', name: 'Danemark', pricePerM3: 8.46, trend: 'up' },
  { code: 'DE', name: 'Allemagne', pricePerM3: 5.28, trend: 'stable' },
  { code: 'BE', name: 'Belgique', pricePerM3: 4.88, trend: 'up' },
  { code: 'NL', name: 'Pays-Bas', pricePerM3: 4.52, trend: 'stable' },
  { code: 'FI', name: 'Finlande', pricePerM3: 4.10, trend: 'stable' },
  { code: 'SE', name: 'Suède', pricePerM3: 3.80, trend: 'stable' },
  { code: 'AT', name: 'Autriche', pricePerM3: 3.65, trend: 'stable' },
  { code: 'FR', name: 'France', pricePerM3: 3.56, trend: 'up' },
  { code: 'LU', name: 'Luxembourg', pricePerM3: 3.40, trend: 'stable' },
  { code: 'IE', name: 'Irlande', pricePerM3: 3.20, trend: 'stable' },
  { code: 'SI', name: 'Slovénie', pricePerM3: 2.95, trend: 'up' },
  { code: 'ES', name: 'Espagne', pricePerM3: 2.62, trend: 'up' },
  { code: 'IT', name: 'Italie', pricePerM3: 2.45, trend: 'up' },
  { code: 'PT', name: 'Portugal', pricePerM3: 2.30, trend: 'up' },
  { code: 'EE', name: 'Estonie', pricePerM3: 2.20, trend: 'up' },
  { code: 'CZ', name: 'Tchéquie', pricePerM3: 2.10, trend: 'up' },
  { code: 'SK', name: 'Slovaquie', pricePerM3: 1.95, trend: 'up' },
  { code: 'HR', name: 'Croatie', pricePerM3: 1.85, trend: 'stable' },
  { code: 'LT', name: 'Lituanie', pricePerM3: 1.80, trend: 'up' },
  { code: 'LV', name: 'Lettonie', pricePerM3: 1.75, trend: 'up' },
  { code: 'GR', name: 'Grèce', pricePerM3: 1.65, trend: 'stable' },
  { code: 'HU', name: 'Hongrie', pricePerM3: 1.55, trend: 'up' },
  { code: 'PL', name: 'Pologne', pricePerM3: 1.50, trend: 'up' },
  { code: 'MT', name: 'Malte', pricePerM3: 1.40, trend: 'stable' },
  { code: 'CY', name: 'Chypre', pricePerM3: 1.35, trend: 'stable' },
  { code: 'RO', name: 'Roumanie', pricePerM3: 1.10, trend: 'up' },
  { code: 'BG', name: 'Bulgarie', pricePerM3: 0.85, trend: 'up' },
];

const avg = EU_TAP_WATER_PRICES.reduce((s, c) => s + c.pricePerM3, 0) / EU_TAP_WATER_PRICES.length;

const getTrendIcon = (trend: string) => {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-destructive" />;
  return <span className="text-xs text-muted-foreground">—</span>;
};

const PrixEauxEurope = () => {
  const { t } = useLanguage();
  return (
    <Layout>
      <SEOHead
        {...seoData.prixEauxEurope}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{t('europePrices.title')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('europePrices.subtitle')}
        </p>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {t('europePrices.note')}{' '}
            <a href="/prix-eaux" className="underline font-medium">{t('europePrices.seeFrance')}</a>
          </AlertDescription>
        </Alert>

        {/* Average */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Euro className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{avg.toFixed(2)} €/m³</div>
              <div className="text-sm text-muted-foreground">{t('europePrices.euAverage')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{EU_TAP_WATER_PRICES[0].name}</div>
              <div className="text-lg">{EU_TAP_WATER_PRICES[0].pricePerM3} €/m³</div>
              <div className="text-sm text-muted-foreground">{t('europePrices.mostExpensive')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{EU_TAP_WATER_PRICES[EU_TAP_WATER_PRICES.length - 1].name}</div>
              <div className="text-lg">{EU_TAP_WATER_PRICES[EU_TAP_WATER_PRICES.length - 1].pricePerM3} €/m³</div>
              <div className="text-sm text-muted-foreground">Le moins cher</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              Tarifs par pays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {EU_TAP_WATER_PRICES.map((c, i) => (
                <div key={c.code} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-6 text-right">{i + 1}.</span>
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">{getTrendIcon(c.trend)}</div>
                    <Badge variant="secondary" className="min-w-[80px] justify-center">
                      {c.pricePerM3.toFixed(2)} €/m³
                    </Badge>
                    {/* Price bar */}
                    <div className="hidden md:block w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(c.pricePerM3 / EU_TAP_WATER_PRICES[0].pricePerM3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PrixEauxEurope;
