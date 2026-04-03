import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { Price, Retailer, BrandPriceStats } from '@/types/pricing';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getBrandTimeseries, BrandTimeseries } from '@/services/timeseriesApi';

interface PriceWithRetailer extends Price {
  retailer_name: string;
}

export default function MarquePrix() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [brand, setBrand] = useState<string>('');
  const [prices, setPrices] = useState<PriceWithRetailer[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [stats, setStats] = useState<BrandPriceStats | null>(null);
  const [timeseries, setTimeseries] = useState<BrandTimeseries[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    const loadBrandData = async () => {
      setLoading(true);
      try {
        // Détecter la marque depuis le slug
        const brandName = slug.charAt(0).toUpperCase() + slug.slice(1);
        setBrand(brandName);

        // Charger les prix récents pour cette marque
        const { data: pricesData, error: pricesError } = await supabase
          .from('prices')
          .select(`
            *,
            retailers!inner(name)
          `)
          .eq('brand', brandName)
          .order('scraped_at', { ascending: false })
          .limit(100);

        if (pricesError) throw pricesError;
        
        if (pricesData) {
          const pricesWithRetailer = pricesData.map(price => ({
            ...price,
            retailer_name: (price as any).retailers.name
          }));
          setPrices(pricesWithRetailer as PriceWithRetailer[]);
        }

        // Charger les enseignes
        const { data: retailersData, error: retailersError } = await supabase
          .from('retailers')
          .select('*')
          .eq('status', 'active')
          .order('name');

        if (retailersError) throw retailersError;
        if (retailersData) setRetailers(retailersData as Retailer[]);

        // Calculer les stats (médiane par enseigne) 
        const retailerStats = retailers.map(retailer => {
          const retailerPrices = prices
            .filter(p => p.retailer_id === retailer.id && p.price_per_l_eur)
            .map(p => p.price_per_l_eur!)
            .sort((a, b) => a - b);

          const median = retailerPrices.length > 0 
            ? retailerPrices[Math.floor(retailerPrices.length / 2)]
            : 0;

          return {
            retailer: retailer.slug,
            retailer_name: retailer.name,
            min_price_per_l: retailerPrices[0] || 0,
            max_price_per_l: retailerPrices[retailerPrices.length - 1] || 0,
            avg_price_per_l: median,
            last_scraped: new Date().toISOString(),
            product_count: retailerPrices.length
          };
        }).filter(stat => stat.product_count > 0);

        setStats({
          brand: brandName,
          retailer_prices: retailerStats,
          overall_stats: {
            min_price_per_l: 0, max_price_per_l: 0, avg_price_per_l: 0,
            median_price_per_l: 0, retailer_count: 0, total_products: 0
          }
        });

        // Charger les données timeseries
        try {
          const timeseriesData = await getBrandTimeseries(brandName, selectedPeriod);
          setTimeseries(timeseriesData);
        } catch (error) {
          console.error('Erreur timeseries:', error);
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données de la marque:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la marque",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadBrandData();
  }, [slug, toast, retailers, prices, selectedPeriod]);

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return `${price.toFixed(2)}€`;
  };

  const formatVolume = (packCount: number | null, unitVolume: number | null) => {
    if (!packCount || !unitVolume) return '-';
    if (packCount === 1) {
      return unitVolume >= 1 ? `${unitVolume}L` : `${unitVolume * 1000}cl`;
    }
    const unit = unitVolume >= 1 ? `${unitVolume}L` : `${unitVolume * 1000}cl`;
    return `${packCount} × ${unit}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title={t('brandPrice.price', { brand })}
        description={t('brandPrice.comparison', { brand })}
        canonical={`/marque/${slug}`}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('brandPrice.price', { brand })}</h1>
          <p className="text-muted-foreground mb-6">
            {t('brandPrice.comparison', { brand })}
          </p>

          {/* Composition placeholder */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('brandPrice.composition')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('brandPrice.compositionNote')}
              </p>
            </CardContent>
          </Card>

          {/* Prix par enseigne */}
          {stats && (
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('brandPrice.medianByRetailer')}</CardTitle>
                <Select value={selectedPeriod.toString()} onValueChange={(value) => setSelectedPeriod(parseInt(value) as 7 | 30)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 {t('brandPrice.days')}</SelectItem>
                    <SelectItem value="30">30 {t('brandPrice.days')}</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.retailer_prices
                    .sort((a, b) => a.avg_price_per_l - b.avg_price_per_l)
                    .map((stat, index) => (
                    <div key={stat.retailer_name} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{stat.retailer_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {stat.product_count} produits
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatPrice(stat.avg_price_per_l)}/L
                        </div>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            {t('brandPrice.bestPrice')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tableau des prix récents */}
          <Card>
            <CardHeader>
              <CardTitle>Derniers prix relevés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Produit</th>
                      <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Format</th>
                      <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Enseigne</th>
                      <th className="border border-gray-200 dark:border-gray-700 p-3 text-right">Prix pack</th>
                      <th className="border border-gray-200 dark:border-gray-700 p-3 text-right">€/L</th>
                      <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Date</th>
                      <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.slice(0, 50).map((price) => (
                      <tr key={price.id} className="hover:bg-muted/50">
                        <td className="border border-gray-200 dark:border-gray-700 p-3">
                          <div className="max-w-xs truncate">{price.product_name}</div>
                          {price.is_promo && (
                            <Badge variant="destructive" className="text-xs mt-1">PROMO</Badge>
                          )}
                          {price.promo_label && (
                            <div className="text-xs text-muted-foreground mt-1">{price.promo_label}</div>
                          )}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-3">
                          {formatVolume(price.pack_count, price.unit_volume_l)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-3">
                          {price.retailer_name}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-right font-medium">
                          {formatPrice(price.price_total_eur)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-right font-bold text-primary">
                          {formatPrice(price.price_per_l_eur)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-muted-foreground">
                          {new Date(price.scraped_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-center">
                          {price.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={price.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}