import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, TrendingUp, BarChart3 } from 'lucide-react';
import { Retailer, BrandPriceStats } from '@/types/pricing';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function ComparateurPrix() {
  const { toast } = useToast();
  
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Mode A: Comparer 2 marques
  const [brand1, setBrand1] = useState<string>('');
  const [brand2, setBrand2] = useState<string>('');
  const [brandComparison, setBrandComparison] = useState<{
    brand1?: BrandPriceStats;
    brand2?: BrandPriceStats;
  }>({});

  // Mode B: Comparer 2 enseignes
  const [retailer1, setRetailer1] = useState<string>('');
  const [retailer2, setRetailer2] = useState<string>('');
  const [selectedBrandsForRetailers, setSelectedBrandsForRetailers] = useState<string[]>([]);
  const [retailerComparison, setRetailerComparison] = useState<any>({});

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Charger les enseignes
        const { data: retailersData } = await supabase
          .from('retailers')
          .select('*')
          .eq('status', 'active')
          .order('name');

        if (retailersData) setRetailers(retailersData as Retailer[]);

        // Charger les marques distinctes
        const { data: brandsData } = await supabase
          .from('prices')
          .select('brand')
          .not('brand', 'eq', 'Inconnu')
          .order('brand');

        if (brandsData) {
          const uniqueBrands = [...new Set(brandsData.map(b => b.brand))];
          setBrands(uniqueBrands);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        });
      }
    };

    loadInitialData();
  }, [toast]);

  // Charger la comparaison de marques
  const loadBrandComparison = async () => {
    if (!brand1 || !brand2) return;
    
    setLoading(true);
    try {
      const loadBrandStats = async (brand: string): Promise<BrandPriceStats> => {
        const { data: pricesData } = await supabase
          .from('prices')
          .select(`
            *,
            retailers!inner(name, slug)
          `)
          .eq('brand', brand)
          .gte('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (!pricesData) throw new Error('Pas de données');

        const retailerGroups = pricesData.reduce((acc, price) => {
          const retailerId = price.retailer_id;
          if (!acc[retailerId]) {
            acc[retailerId] = {
              retailer: retailerId,
              retailer_name: (price as any).retailers.name,
              prices: []
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
          last_scraped: new Date().toISOString(),
          product_count: group.prices.length
        }));

        const allPrices = pricesData
          .map(p => p.price_per_l_eur)
          .filter(Boolean) as number[];

        const sortedPrices = allPrices.sort((a, b) => a - b);
        const median = sortedPrices.length % 2 === 0
          ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
          : sortedPrices[Math.floor(sortedPrices.length / 2)];

        return {
          brand,
          retailer_prices,
          overall_stats: {
            min_price_per_l: Math.min(...allPrices),
            max_price_per_l: Math.max(...allPrices),
            avg_price_per_l: allPrices.reduce((a, b) => a + b, 0) / allPrices.length,
            median_price_per_l: median,
            retailer_count: retailer_prices.length,
            total_products: allPrices.length
          }
        };
      };

      const [stats1, stats2] = await Promise.all([
        loadBrandStats(brand1),
        loadBrandStats(brand2)
      ]);

      setBrandComparison({ brand1: stats1, brand2: stats2 });
    } catch (error) {
      console.error('Erreur lors de la comparaison:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la comparaison",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brand1 && brand2) {
      loadBrandComparison();
    }
  }, [brand1, brand2]);

  const formatPrice = (price: number) => `${price.toFixed(3)}€/L`;

  const swapBrands = () => {
    setBrand1(brand2);
    setBrand2(brand1);
  };

  return (
    <Layout>
      <SEOHead 
        title="Comparateur de prix des eaux en bouteille"
        description="Comparez les prix des eaux en bouteille entre marques et enseignes. Analysez les écarts de prix et trouvez les meilleures offres."
        canonical="/comparateur-prix"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Comparateur de prix</h1>
          <p className="text-muted-foreground mb-6">
            Comparez les prix entre marques ou enseignes pour trouver les meilleures offres.
          </p>

          <Tabs defaultValue="brands" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="brands">Comparer 2 marques</TabsTrigger>
              <TabsTrigger value="retailers">Comparer 2 enseignes</TabsTrigger>
            </TabsList>

            <TabsContent value="brands" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sélection des marques</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Select value={brand1} onValueChange={setBrand1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Première marque" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={swapBrands}
                    disabled={!brand1 || !brand2}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <Select value={brand2} onValueChange={setBrand2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Deuxième marque" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {loading && (
                <div className="text-center py-12">Chargement de la comparaison...</div>
              )}

              {brandComparison.brand1 && brandComparison.brand2 && !loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[brandComparison.brand1, brandComparison.brand2].map((stats, index) => (
                    <Card key={stats.brand} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{stats.brand}</h3>
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {stats.retailer_prices.length} enseignes
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Statistiques globales</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Prix minimum</div>
                              <div className="font-bold text-green-600">
                                {formatPrice(stats.overall_stats.min_price_per_l)}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Prix maximum</div>
                              <div className="font-bold text-red-600">
                                {formatPrice(stats.overall_stats.max_price_per_l)}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Prix médian</div>
                              <div className="font-bold">
                                {formatPrice(stats.overall_stats.median_price_per_l)}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Produits</div>
                              <div className="font-bold">{stats.overall_stats.total_products}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Prix par enseigne</h4>
                          <div className="space-y-2">
                            {stats.retailer_prices
                              .sort((a, b) => a.min_price_per_l - b.min_price_per_l)
                              .slice(0, 5)
                              .map(retailer => (
                              <div key={retailer.retailer} className="flex justify-between items-center text-sm">
                                <span>{retailer.retailer_name}</span>
                                <span className="font-medium">
                                  {formatPrice(retailer.min_price_per_l)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="retailers" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Fonction en cours de développement</h3>
                <p className="text-muted-foreground">
                  La comparaison entre enseignes sera bientôt disponible.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Layout>
  );
}