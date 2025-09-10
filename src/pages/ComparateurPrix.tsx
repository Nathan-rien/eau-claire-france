import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Price, Retailer } from '@/types/pricing';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ComparisonData {
  brand?: string;
  retailer?: string;
  prices: (Price & { retailer_name: string })[];
  medianPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

export default function ComparateurPrix() {
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'brands' | 'retailers'>('brands');
  const [brands, setBrands] = useState<string[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [selectedBrand1, setSelectedBrand1] = useState<string>('');
  const [selectedBrand2, setSelectedBrand2] = useState<string>('');
  const [selectedRetailer1, setSelectedRetailer1] = useState<string>('');
  const [selectedRetailer2, setSelectedRetailer2] = useState<string>('');
  const [comparison1, setComparison1] = useState<ComparisonData | null>(null);
  const [comparison2, setComparison2] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Charger les marques
      const { data: brandsData } = await supabase
        .from('prices')
        .select('brand')
        .not('brand', 'eq', 'Inconnu')
        .order('brand');

      if (brandsData) {
        const uniqueBrands = [...new Set(brandsData.map(b => b.brand))];
        setBrands(uniqueBrands);
      }

      // Charger les enseignes
      const { data: retailersData } = await supabase
        .from('retailers')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (retailersData) setRetailers(retailersData as Retailer[]);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    }
  };

  const loadBrandComparison = async (brand: string): Promise<ComparisonData> => {
    const { data: pricesData, error } = await supabase
      .from('prices')
      .select(`
        *,
        retailers!inner(name)
      `)
      .eq('brand', brand)
      .not('price_per_l_eur', 'is', null)
      .order('scraped_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const prices = (pricesData || []).map(price => ({
      ...price,
      retailer_name: (price as any).retailers.name
    })) as (Price & { retailer_name: string })[];

    const pricesPerL = prices.map(p => p.price_per_l_eur!).filter(Boolean).sort((a, b) => a - b);
    
    return {
      brand,
      prices,
      medianPrice: pricesPerL.length > 0 ? pricesPerL[Math.floor(pricesPerL.length / 2)] : null,
      minPrice: pricesPerL.length > 0 ? Math.min(...pricesPerL) : null,
      maxPrice: pricesPerL.length > 0 ? Math.max(...pricesPerL) : null
    };
  };

  const loadRetailerComparison = async (retailerId: string): Promise<ComparisonData> => {
    const { data: pricesData, error } = await supabase
      .from('prices')
      .select(`
        *,
        retailers!inner(name)
      `)
      .eq('retailer_id', retailerId)
      .not('price_per_l_eur', 'is', null)
      .order('scraped_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const prices = (pricesData || []).map(price => ({
      ...price,
      retailer_name: (price as any).retailers.name
    })) as (Price & { retailer_name: string })[];

    const retailer = retailers.find(r => r.id === retailerId);
    const pricesPerL = prices.map(p => p.price_per_l_eur!).filter(Boolean).sort((a, b) => a - b);
    
    return {
      retailer: retailer?.name,
      prices,
      medianPrice: pricesPerL.length > 0 ? pricesPerL[Math.floor(pricesPerL.length / 2)] : null,
      minPrice: pricesPerL.length > 0 ? Math.min(...pricesPerL) : null,
      maxPrice: pricesPerL.length > 0 ? Math.max(...pricesPerL) : null
    };
  };

  const handleCompare = async () => {
    if (mode === 'brands' && (!selectedBrand1 || !selectedBrand2)) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner deux marques à comparer",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'retailers' && (!selectedRetailer1 || !selectedRetailer2)) {
      toast({
        title: "Sélection incomplète", 
        description: "Veuillez sélectionner deux enseignes à comparer",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'brands') {
        const [comp1, comp2] = await Promise.all([
          loadBrandComparison(selectedBrand1),
          loadBrandComparison(selectedBrand2)
        ]);
        setComparison1(comp1);
        setComparison2(comp2);
      } else {
        const [comp1, comp2] = await Promise.all([
          loadRetailerComparison(selectedRetailer1),
          loadRetailerComparison(selectedRetailer2)
        ]);
        setComparison1(comp1);
        setComparison2(comp2);
      }
    } catch (error) {
      console.error('Erreur lors de la comparaison:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de comparaison",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return `${price.toFixed(2)}€`;
  };

  const getPriceComparison = (price1: number | null, price2: number | null) => {
    if (!price1 || !price2) return null;
    const diff = ((price1 - price2) / price2) * 100;
    return {
      percentage: Math.abs(diff),
      isHigher: diff > 0,
      isLower: diff < 0
    };
  };

  return (
    <Layout>
      <SEOHead 
        title="Comparateur de prix - Eaux en bouteille"
        description="Comparez les prix des eaux en bouteille entre marques ou enseignes. Trouvez les meilleures offres et économisez sur vos achats."
        canonical="/comparateur-prix"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Comparateur de prix</h1>
          <p className="text-muted-foreground mb-6">
            Comparez les prix entre marques ou entre enseignes pour trouver les meilleures offres.
          </p>

          {/* Sélection du mode */}
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'brands' | 'retailers')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="brands">Comparer des marques</TabsTrigger>
              <TabsTrigger value="retailers">Comparer des enseignes</TabsTrigger>
            </TabsList>

            <TabsContent value="brands">
              <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-2">Première marque</label>
                    <Select value={selectedBrand1} onValueChange={setSelectedBrand1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une marque" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-center">
                    <ArrowLeftRight className="h-6 w-6 mx-auto text-muted-foreground" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Seconde marque</label>
                    <Select value={selectedBrand2} onValueChange={setSelectedBrand2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une marque" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.filter(b => b !== selectedBrand1).map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="retailers">
              <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-2">Première enseigne</label>
                    <Select value={selectedRetailer1} onValueChange={setSelectedRetailer1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une enseigne" />
                      </SelectTrigger>
                      <SelectContent>
                        {retailers.map(retailer => (
                          <SelectItem key={retailer.id} value={retailer.id}>{retailer.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-center">
                    <ArrowLeftRight className="h-6 w-6 mx-auto text-muted-foreground" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Seconde enseigne</label>
                    <Select value={selectedRetailer2} onValueChange={setSelectedRetailer2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une enseigne" />
                      </SelectTrigger>
                      <SelectContent>
                        {retailers.filter(r => r.id !== selectedRetailer1).map(retailer => (
                          <SelectItem key={retailer.id} value={retailer.id}>{retailer.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Bouton de comparaison */}
          <div className="text-center mb-8">
            <Button 
              onClick={handleCompare} 
              disabled={loading}
              size="lg"
              className="px-8"
            >
              {loading ? 'Comparaison en cours...' : 'Comparer'}
            </Button>
          </div>

          {/* Résultats de comparaison */}
          {comparison1 && comparison2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comparaison 1 */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {mode === 'brands' ? comparison1.brand : comparison1.retailer}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(comparison1.minPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">Prix min/L</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {formatPrice(comparison1.medianPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">Prix médian/L</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatPrice(comparison1.maxPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">Prix max/L</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground text-center">
                      {comparison1.prices.length} produits analysés
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparaison 2 */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {mode === 'brands' ? comparison2.brand : comparison2.retailer}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(comparison2.minPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">Prix min/L</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {formatPrice(comparison2.medianPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">Prix médian/L</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatPrice(comparison2.maxPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">Prix max/L</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground text-center">
                      {comparison2.prices.length} produits analysés
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analyse comparative */}
          {comparison1 && comparison2 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Analyse comparative</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Prix minimum */}
                  <div className="text-center">
                    <h3 className="font-medium mb-2">Prix minimum</h3>
                    {(() => {
                      const comp = getPriceComparison(comparison1.minPrice, comparison2.minPrice);
                      const winner = (comparison1.minPrice || 0) < (comparison2.minPrice || 0) ? 1 : 2;
                      return (
                        <div>
                          <Badge variant={winner === 1 ? "default" : "secondary"}>
                            {mode === 'brands' ? 
                              (winner === 1 ? comparison1.brand : comparison2.brand) :
                              (winner === 1 ? comparison1.retailer : comparison2.retailer)
                            }
                          </Badge>
                          {comp && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {comp.percentage.toFixed(1)}% moins cher
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Prix médian */}
                  <div className="text-center">
                    <h3 className="font-medium mb-2">Prix médian</h3>
                    {(() => {
                      const comp = getPriceComparison(comparison1.medianPrice, comparison2.medianPrice);
                      const winner = (comparison1.medianPrice || 0) < (comparison2.medianPrice || 0) ? 1 : 2;
                      return (
                        <div>
                          <Badge variant={winner === 1 ? "default" : "secondary"}>
                            {mode === 'brands' ? 
                              (winner === 1 ? comparison1.brand : comparison2.brand) :
                              (winner === 1 ? comparison1.retailer : comparison2.retailer)
                            }
                          </Badge>
                          {comp && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {comp.percentage.toFixed(1)}% moins cher
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Nombre de produits */}
                  <div className="text-center">
                    <h3 className="font-medium mb-2">Choix disponible</h3>
                    {(() => {
                      const winner = comparison1.prices.length > comparison2.prices.length ? 1 : 2;
                      return (
                        <div>
                          <Badge variant={winner === 1 ? "default" : "secondary"}>
                            {mode === 'brands' ? 
                              (winner === 1 ? comparison1.brand : comparison2.brand) :
                              (winner === 1 ? comparison1.retailer : comparison2.retailer)
                            }
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {winner === 1 ? comparison1.prices.length : comparison2.prices.length} produits
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </Layout>
  );
}