import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, TrendingUp, Clock } from 'lucide-react';
import { Price, Retailer, PriceFilters, PaginatedResponse } from '@/types/pricing';
import { getPrices } from '@/services/pricesApi';
import { useToast } from '@/components/ui/use-toast';
import DataWarmupBanner from '@/components/DataWarmupBanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { listDistinctBrands, listActiveRetailers, hasData } from '@/services/dataStatsApi';
import { getBrandRetailerMapping } from '@/services/brandRetailerMappingApi';
import { computeFallbackPricePerL } from '@/lib/normalize';
import { DataBanner } from '@/components/DataBanner';
import { supabase } from '@/integrations/supabase/client';

interface PriceWithRetailer extends Price {
  retailer_name: string;
  retailer_slug?: string;
  price_position?: string;
  source?: string;
}

export default function PrixEaux() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [prices, setPrices] = useState<PriceWithRetailer[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [brandRetailerMapping, setBrandRetailerMapping] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDataBanner, setShowDataBanner] = useState(false);
  const [noActiveRetailers, setNoActiveRetailers] = useState(false);
  const [dataSource, setDataSource] = useState<string>('prices');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 500,
    total: 0,
    totalPages: 0
  });

  // Filtres depuis l'URL avec persistance
  const filters: PriceFilters = useMemo(() => ({
    brand: searchParams.get('brand') || undefined,
    retailer: searchParams.get('retailer') || undefined,
    format: searchParams.get('format') || undefined,
    pack: searchParams.get('pack') || undefined,
    search: searchParams.get('search') || undefined,
    is_promo: searchParams.get('is_promo') === 'true' ? true : searchParams.get('is_promo') === 'false' ? false : undefined,
    availability: searchParams.get('availability') || undefined,
    sort_by: searchParams.get('sort_by') || 'price_per_l_eur',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('pageSize') || '500')
  }), [searchParams]);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<PriceFilters>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    
    // Reset page when filters change (except when changing page itself)
    if (!newFilters.page) {
      params.delete('page');
    }
    
    setSearchParams(params);
  };

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Vérifier si la base a des données
        const dataStats = await hasData();
        setShowDataBanner(!dataStats.hasPrices);
        setNoActiveRetailers((dataStats as any).activeRetailersCount === 0);
        
        // Charger les enseignes actives
        const retailersData = await listActiveRetailers();
        setRetailers(retailersData as Retailer[]);

        // Charger les marques distinctes
        const brandsData = await listDistinctBrands();
        setBrands(brandsData);

        // Charger le mapping marques-enseignes
        const mappingData = await getBrandRetailerMapping();
        setBrandRetailerMapping(mappingData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  const handleDataAvailable = () => {
    setShowDataBanner(false);
    // Reload page data when data becomes available
    window.location.reload();
  };

  const refreshData = () => {
    window.location.reload();
  };

  // Charger les prix avec filtres
  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      try {
        const result = await getPrices(filters);
        
        // Résoudre l'enseigne même si l'ID ne correspond pas (slug/URL/unique_hash)
        const resolveRetailer = (price: any) => {
          const byId = retailers.find(r => r.id === price.retailer_id);
          if (byId) return byId;
          const skuSlug = price.sku?.split('_')?.[0]?.toLowerCase();
          const hashSlug = price.unique_hash?.split('-')?.[0]?.toLowerCase();
          let urlHost = '';
          try { urlHost = price.url ? new URL(price.url).hostname.replace('www.', '') : ''; } catch {}
          return (
            retailers.find(r => r.slug?.toLowerCase() === skuSlug) ||
            retailers.find(r => r.slug?.toLowerCase() === hashSlug) ||
            retailers.find(r => urlHost && r.domain && urlHost.includes(r.domain.replace('www.', '')))
          );
        };

        let pricesWithRetailer = result.items.map(price => {
          const retailerObj = resolveRetailer(price);
          const brandMapping = brandRetailerMapping.find(m => 
            m.brand_name.toLowerCase() === price.brand?.toLowerCase() && 
            m.retailer_id === retailerObj?.id
          );
          
          return {
            ...price,
            retailer_name: retailerObj?.name || 'Enseigne inconnue',
            retailer_slug: retailerObj?.slug,
            retailer_resolved_id: retailerObj?.id,
            price_per_l_eur: computeFallbackPricePerL(price) || price.price_per_l_eur,
            source: price.source || 'prices_history',
            // Enrichissement avec les données de mapping
            has_brand_mapping: !!brandMapping,
            price_position: brandMapping?.price_position || 'unknown',
            is_brand_available: brandMapping?.is_available !== false
          } as any;
        });

        // Filtre par enseigne côté client si demandé
        if (filters.retailer) {
          const selected = retailers.find(r => r.id === filters.retailer);
          if (selected) {
            pricesWithRetailer = pricesWithRetailer.filter(p => (
              p.retailer_resolved_id === selected.id ||
              p.retailer_slug === selected.slug ||
              (p.url && selected.domain && p.url.includes(selected.domain))
            ));
          }
        }

        // Déduplication (unique_hash sinon signature produit)
        const seen = new Set<string>();
        pricesWithRetailer = pricesWithRetailer.filter(p => {
          const key = p.unique_hash || `${p.brand}|${p.product_name}|${p.unit_volume_l}|${p.pack_count}|${p.retailer_resolved_id || p.retailer_id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Tri par enseigne puis par marque
        pricesWithRetailer.sort((a, b) => {
          const retailerCompare = (a.retailer_name || 'Z').localeCompare(b.retailer_name || 'Z');
          if (retailerCompare !== 0) return retailerCompare;
          return (a.brand || 'Z').localeCompare(b.brand || 'Z');
        });

        setPrices(pricesWithRetailer as PriceWithRetailer[]);
        setPagination({
          page: result.page,
          pageSize: result.pageSize,
          total: pricesWithRetailer.length,
          totalPages: Math.ceil(pricesWithRetailer.length / result.pageSize)
        });
        
        // Set data source for badge
        if (result.items.length > 0) {
          setDataSource(result.items[0].source || 'prices');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des prix:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les prix",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [filters, toast, retailers, brandRetailerMapping]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset page on filter change
    setSearchParams(newParams);
  };

  const handleSort = (column: string) => {
    const currentSort = searchParams.get('sort_by');
    const currentOrder = searchParams.get('sort_order') || 'asc';
    
    let newOrder: 'asc' | 'desc' = 'asc';
    if (currentSort === column && currentOrder === 'asc') {
      newOrder = 'desc';
    }
    
    updateFilters({ sort_by: column, sort_order: newOrder, page: 1 });
  };

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

  return (
    <Layout>
      <SEOHead 
        title="Prix des eaux en bouteille - Comparateur par enseigne"
        description="Comparez les prix des eaux en bouteille dans toutes les enseignes. Trouvez les meilleures offres pour Evian, Cristaline, Volvic et plus."
        canonical="/prix-eaux"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Prix des eaux en bouteille</h1>
          <p className="text-muted-foreground mb-6">
            Comparez les prix des eaux en bouteille dans toutes les enseignes. 
            Données mises à jour quotidiennement.
          </p>

          <DataBanner onDataUpdate={refreshData} />

          {/* Data warmup banner */}
          {showDataBanner && <DataWarmupBanner onDataAvailable={handleDataAvailable} />}

          {/* No active retailers banner */}
          {noActiveRetailers && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Aucune enseigne active visible</AlertTitle>
              <AlertDescription>
                Vérifiez le seed des enseignes et les politiques RLS.
              </AlertDescription>
            </Alert>
          )}

          {/* Filtres */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value || null)}
                  className="pl-10"
                />
              </div>

              <Select value={filters.brand || ''} onValueChange={(value) => updateFilter('brand', value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Marque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les marques</SelectItem>
                  {brands
                    .filter(brand => brand && brand.trim() !== '')
                    .sort((a, b) => a.localeCompare(b))
                    .map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={filters.retailer || ''} onValueChange={(value) => updateFilter('retailer', value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Enseigne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les enseignes</SelectItem>
                  {retailers
                    .filter(retailer => retailer.id && retailer.id.trim() !== '')
                    .map(retailer => (
                      <SelectItem key={retailer.id} value={retailer.id}>{retailer.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={filters.format || ''} onValueChange={(value) => updateFilter('format', value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les formats</SelectItem>
                  <SelectItem value="50cl">50cl</SelectItem>
                  <SelectItem value="1L">1L</SelectItem>
                  <SelectItem value="1,5L">1,5L</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select value={filters.pack || ''} onValueChange={(value) => updateFilter('pack', value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pack" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les packs</SelectItem>
                    <SelectItem value="6">Pack de 6</SelectItem>
                    <SelectItem value="8">Pack de 8</SelectItem>
                    <SelectItem value="12">Pack de 12</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={searchParams.get('availability') || ''} onValueChange={(value) => updateFilter('availability', value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Disponibilité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous produits</SelectItem>
                    <SelectItem value="in_stock">En stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ligne séparée pour les filtres promotions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              <Select value={searchParams.get('is_promo') || ''} onValueChange={(value) => updateFilter('is_promo', value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Promotions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="true">En promo</SelectItem>
                  <SelectItem value="false">Prix normal</SelectItem>
                </SelectContent>
              </Select>


              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchParams(new URLSearchParams());
                  }}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Réinitialiser
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setSearchParams(new URLSearchParams({ pageSize: '500' }));
                  }}
                  className="flex items-center gap-2"
                >
                  Afficher tous
                </Button>
              </div>
            </div>
          </Card>

          {/* Résultats */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {pagination.total} produits trouvés
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => updateFilter('page', (pagination.page - 1).toString())}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilter('page', (pagination.page + 1).toString())}
              >
                Suivant
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : showDataBanner ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucune donnée disponible. Les données de prix sont mises à jour périodiquement.
              </p>
            </div>
          ) : prices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucun prix trouvé pour ces critères. Modifiez vos filtres ou essayez une recherche différente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Enseigne</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">
                      Marque
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Produit</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Format</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-right">
                      Prix pack
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-right">
                      Prix €/L
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('scraped_at')}
                        className="h-auto p-0 font-medium text-center w-full"
                      >
                        Mise à jour {searchParams.get('sort_by') === 'scraped_at' && (searchParams.get('sort_order') === 'desc' ? '↓' : '↑')}
                      </Button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price) => (
                    <tr key={price.id} className="hover:bg-muted/50">
                       <td className="border border-gray-200 dark:border-gray-700 p-3">
                          <div>
                            {price.retailer_name || 'Enseigne inconnue'}
                          </div>
                        </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        <span className="font-medium">{price.brand}</span>
                        {price.is_promo && (
                          <Badge variant="destructive" className="ml-2 text-xs">PROMO</Badge>
                        )}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        <div className="max-w-xs truncate">{price.product_name}</div>
                        {price.promo_label && (
                          <div className="text-xs text-muted-foreground">{price.promo_label}</div>
                        )}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3">
                        {formatVolume(price.pack_count, price.unit_volume_l)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3 text-right font-medium">
                        {formatPrice(price.price_total_eur)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3 text-right font-bold text-primary">
                        {formatPrice(price.price_per_l_eur)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-muted-foreground">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(price.scraped_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}