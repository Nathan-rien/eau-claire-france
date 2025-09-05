import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Store, Droplets } from 'lucide-react';
import { BrandPriceStats } from '@/types/pricing';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { bottledWaters } from '@/data/bottleWaterData';

export default function MarquePrix() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  const [brandStats, setBrandStats] = useState<BrandPriceStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Trouve la composition depuis nos données existantes
  const brandComposition = bottledWaters.find(water => 
    water.name.toLowerCase() === slug?.toLowerCase()
  );

  useEffect(() => {
    if (!slug) return;

    const loadBrandData = async () => {
      setLoading(true);
      try {
        // Convertir slug en nom de marque (première lettre majuscule)
        const brandName = slug.charAt(0).toUpperCase() + slug.slice(1);
        
        const { data: pricesData } = await supabase
          .from('prices')
          .select(`
            *,
            retailers!inner(name, slug)
          `)
          .eq('brand', brandName)
          .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('scraped_at', { ascending: false });

        if (!pricesData || pricesData.length === 0) {
          throw new Error('Aucune donnée trouvée pour cette marque');
        }

        // Grouper par enseigne
        const retailerGroups = pricesData.reduce((acc, price) => {
          const retailerId = price.retailer_id;
          if (!acc[retailerId]) {
            acc[retailerId] = {
              retailer: retailerId,
              retailer_name: (price as any).retailers.name,
              prices: [],
              last_scraped: price.scraped_at
            };
          }
          if (price.price_per_l_eur) {
            acc[retailerId].prices.push(price.price_per_l_eur);
          }
          return acc;
        }, {} as any);

        const retailer_prices = Object.values(retailerGroups).map((group: any) => ({
          retailer: group.retailer,
          retailer_name: group.retailer_name,
          min_price_per_l: Math.min(...group.prices),
          max_price_per_l: Math.max(...group.prices),
          avg_price_per_l: group.prices.reduce((a: number, b: number) => a + b, 0) / group.prices.length,
          last_scraped: group.last_scraped,
          product_count: group.prices.length
        })).sort((a, b) => a.min_price_per_l - b.min_price_per_l);

        const allPrices = pricesData
          .map(p => p.price_per_l_eur)
          .filter(Boolean) as number[];

        const sortedPrices = allPrices.sort((a, b) => a - b);
        const median = sortedPrices.length % 2 === 0
          ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
          : sortedPrices[Math.floor(sortedPrices.length / 2)];

        setBrandStats({
          brand: brandName,
          retailer_prices,
          overall_stats: {
            min_price_per_l: Math.min(...allPrices),
            max_price_per_l: Math.max(...allPrices),
            avg_price_per_l: allPrices.reduce((a, b) => a + b, 0) / allPrices.length,
            median_price_per_l: median,
            retailer_count: retailer_prices.length,
            total_products: allPrices.length
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données de la marque:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de cette marque",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadBrandData();
  }, [slug, toast]);

  const formatPrice = (price: number) => `${price.toFixed(3)}€/L`;
  const formatMineralValue = (value: number | undefined, unit: string = 'mg/L') => {
    if (value === undefined || value === null) return '-';
    return `${value} ${unit}`;
  };

  if (loading) {
    return (
      <Layout>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">Chargement...</div>
        </main>
      </Layout>
    );
  }

  if (!brandStats) {
    return (
      <Layout>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Marque non trouvée</h1>
            <p className="text-muted-foreground">
              Aucune donnée de prix disponible pour cette marque.
            </p>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title={`Prix ${brandStats.brand} - Comparaison par enseigne`}
        description={`Comparez les prix de ${brandStats.brand} dans toutes les enseignes. Composition minérale et meilleures offres.`}
        canonical={`/marque/${slug}`}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{brandStats.brand}</h1>
            <p className="text-muted-foreground">
              Prix et composition minérale dans {brandStats.overall_stats.retailer_count} enseignes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Composition minérale */}
            {brandComposition && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">Composition minérale</h2>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">pH</div>
                      <div className="font-medium">-</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Résidu sec</div>
                      <div className="font-medium">
                        {formatMineralValue(brandComposition.composition.residusSec)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Calcium</div>
                      <div className="font-medium">
                        {formatMineralValue(brandComposition.composition.calcium)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Magnésium</div>
                      <div className="font-medium">
                        {formatMineralValue(brandComposition.composition.magnesium)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Sodium</div>
                      <div className="font-medium">
                        {formatMineralValue(brandComposition.composition.sodium)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Nitrates</div>
                      <div className="font-medium">
                        {formatMineralValue(brandComposition.composition.nitrates)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Statistiques des prix */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold">Statistiques des prix</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Prix minimum</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(brandStats.overall_stats.min_price_per_l)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Prix maximum</div>
                    <div className="text-lg font-bold text-red-600">
                      {formatPrice(brandStats.overall_stats.max_price_per_l)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Prix médian</div>
                    <div className="text-lg font-bold">
                      {formatPrice(brandStats.overall_stats.median_price_per_l)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Écart prix</div>
                    <div className="text-lg font-bold text-orange-600">
                      {formatPrice(brandStats.overall_stats.max_price_per_l - brandStats.overall_stats.min_price_per_l)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    {brandStats.overall_stats.total_products} produits dans {brandStats.overall_stats.retailer_count} enseignes
                  </div>
                </div>
              </div>
            </Card>

            {/* Meilleur prix */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Meilleur prix</h2>
              </div>
              
              {brandStats.retailer_prices.length > 0 && (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(brandStats.retailer_prices[0].min_price_per_l)}
                    </div>
                    <div className="text-lg font-medium">
                      {brandStats.retailer_prices[0].retailer_name}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Mis à jour le {new Date(brandStats.retailer_prices[0].last_scraped).toLocaleDateString('fr-FR')}
                  </div>
                  
                  <Badge variant="secondary" className="w-full justify-center">
                    {brandStats.retailer_prices[0].product_count} produits disponibles
                  </Badge>
                </div>
              )}
            </Card>
          </div>

          {/* Tableau des prix par enseigne */}
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Prix par enseigne</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Enseigne</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-right">Prix minimum</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-right">Prix moyen</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-right">Prix maximum</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Produits</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Mise à jour</th>
                  </tr>
                </thead>
                <tbody>
                  {brandStats.retailer_prices.map((retailer, index) => (
                    <tr key={retailer.retailer} className="hover:bg-muted/50">
                      <td className="border border-gray-200 dark:border-gray-700 p-3 font-medium">
                        {retailer.retailer_name}
                        {index === 0 && (
                          <Badge variant="default" className="ml-2 text-xs">MEILLEUR PRIX</Badge>
                        )}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3 text-right font-bold text-green-600">
                        {formatPrice(retailer.min_price_per_l)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3 text-right">
                        {formatPrice(retailer.avg_price_per_l)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3 text-right text-red-600">
                        {formatPrice(retailer.max_price_per_l)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3 text-center">
                        {retailer.product_count}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-muted-foreground">
                        {new Date(retailer.last_scraped).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </Layout>
  );
}