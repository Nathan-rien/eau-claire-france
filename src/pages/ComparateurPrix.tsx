import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftRight, RotateCcw } from 'lucide-react';
import { Price, Retailer } from '@/types/pricing';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import DataWarmupBanner from '@/components/DataWarmupBanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { listDistinctBrands, listActiveRetailers, hasData } from '@/services/dataStatsApi';
import { computeFallbackPricePerL } from '@/lib/normalize';
import { DataBanner } from '@/components/DataBanner';

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
  const { t } = useLanguage();
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
  const [showDataBanner, setShowDataBanner] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [noActiveRetailers, setNoActiveRetailers] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Vérifier si la base a des données
      const dataStats = await hasData();
      setShowDataBanner(!dataStats.hasPrices);
      if (dataStats.lastScrapeAt) {
        setLastUpdate(dataStats.lastScrapeAt);
      }
      setNoActiveRetailers((dataStats as any).activeRetailersCount === 0);
      
      // Ne pas bloquer le chargement des listes même si la base semble vide
      // Cela permet de diagnostiquer un éventuel problème de scraping/RLS


      // Charger les marques depuis la base
      const brandsData = await listDistinctBrands();
      setBrands(brandsData);

      // Charger les enseignes actives
      const retailersData = await listActiveRetailers();
      setRetailers(retailersData as Retailer[]);

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
      .order('scraped_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const prices = (pricesData || []).map(price => {
      const priceWithFallback = {
        ...price,
        retailer_name: (price as any).retailers.name,
        price_per_l_eur: computeFallbackPricePerL(price)
      };
      return priceWithFallback;
    }).filter(p => p.price_per_l_eur !== null) as (Price & { retailer_name: string })[];

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
      .order('scraped_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const prices = (pricesData || []).map(price => {
      const priceWithFallback = {
        ...price,
        retailer_name: (price as any).retailers.name,
        price_per_l_eur: computeFallbackPricePerL(price)
      };
      return priceWithFallback;
    }).filter(p => p.price_per_l_eur !== null) as (Price & { retailer_name: string })[];

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
        title: t('priceComparator.incompleteSelection'),
        description: t('priceComparator.selectTwoBrands'),
        variant: "destructive"
      });
      return;
    }

    if (mode === 'retailers' && (!selectedRetailer1 || !selectedRetailer2)) {
      toast({
        title: t('priceComparator.incompleteSelection'),
        description: t('priceComparator.selectTwoRetailers'),
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

  const handleSwapSelections = () => {
    if (mode === 'brands') {
      const temp = selectedBrand1;
      setSelectedBrand1(selectedBrand2);
      setSelectedBrand2(temp);
    } else {
      const temp = selectedRetailer1;
      setSelectedRetailer1(selectedRetailer2);
      setSelectedRetailer2(temp);
    }
  };

  const handleDataAvailable = () => {
    setShowDataBanner(false);
    loadInitialData(); // Reload data when available
  };

  const refreshData = () => {
    loadInitialData();
  };

  // Empty states
  const isSelectionEmpty = mode === 'brands' 
    ? !selectedBrand1 || !selectedBrand2
    : !selectedRetailer1 || !selectedRetailer2;

  const hasNoResults = comparison1 && comparison2 && 
    comparison1.prices.length === 0 && comparison2.prices.length === 0;

  return (
    <Layout>
      <SEOHead {...seoData.comparateurPrix} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('priceComparator.title')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('priceComparator.subtitle')}
          </p>

          <DataBanner onDataUpdate={refreshData} />

          {/* Data warmup banner */}
          {showDataBanner && <DataWarmupBanner onDataAvailable={handleDataAvailable} />}

          {/* No active retailers banner */}
          {noActiveRetailers && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>{t('prices.noActiveRetailers')}</AlertTitle>
              <AlertDescription>
                {t('prices.checkConfig')}
              </AlertDescription>
            </Alert>
          )}

          {/* Sélection du mode */}
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'brands' | 'retailers')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="brands">{t('priceComparator.compareBrands')}</TabsTrigger>
              <TabsTrigger value="retailers">{t('priceComparator.compareRetailers')}</TabsTrigger>
            </TabsList>

            <TabsContent value="brands">
              <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('priceComparator.firstBrand')}</label>
                    <Select value={selectedBrand1} onValueChange={setSelectedBrand1}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('priceComparator.selectBrand')} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands
                          .filter(brand => brand && brand.trim() !== '')
                          .map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSwapSelections}
                      className="p-2"
                      disabled={isSelectionEmpty}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('priceComparator.secondBrand')}</label>
                    <Select value={selectedBrand2} onValueChange={setSelectedBrand2}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('priceComparator.selectBrand')} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands
                          .filter(b => b && b.trim() !== '' && b !== selectedBrand1)
                          .map(brand => (
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
                    <label className="block text-sm font-medium mb-2">{t('priceComparator.firstRetailer')}</label>
                    <Select value={selectedRetailer1} onValueChange={setSelectedRetailer1}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('priceComparator.selectRetailer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {retailers
                          .filter(retailer => retailer.id && retailer.id.trim() !== '')
                          .map(retailer => (
                            <SelectItem key={retailer.id} value={retailer.id}>{retailer.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSwapSelections}
                      className="p-2"
                      disabled={isSelectionEmpty}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('priceComparator.secondRetailer')}</label>
                    <Select value={selectedRetailer2} onValueChange={setSelectedRetailer2}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('priceComparator.selectRetailer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {retailers
                          .filter(r => r.id && r.id.trim() !== '' && r.id !== selectedRetailer1)
                          .map(retailer => (
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
              disabled={loading || isSelectionEmpty || showDataBanner}
              size="lg"
              className="px-8"
            >
              {loading ? t('priceComparator.comparing') : t('priceComparator.compare')}
            </Button>
            
            {lastUpdate && (
              <p className="text-sm text-muted-foreground mt-2">
                {t('priceComparator.lastUpdate')} {new Date(lastUpdate).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>

          {/* Empty state messages */}
          {!showDataBanner && isSelectionEmpty && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t('priceComparator.selectToStart', { type: mode === 'brands' ? t('priceComparator.brands') : t('priceComparator.retailers') })}
              </p>
            </div>
          )}

          {hasNoResults && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t('priceComparator.noData', { type: mode === 'brands' ? t('priceComparator.brands') : t('priceComparator.retailers') })}
              </p>
            </div>
          )}

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
                        <div className="text-sm text-muted-foreground">{t('priceComparator.minPrice')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {formatPrice(comparison1.medianPrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('priceComparator.medianPrice')}</div>
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