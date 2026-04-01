import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, TrendingUp, Clock, Store, Truck, Package, ShoppingCart, Info } from 'lucide-react';
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
import { extractSourceInfo, detectChannelType, getChannelDescription, ChannelType } from '@/utils/sourceDetection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PriceWithRetailer extends Price {
  retailer_name: string;
  retailer_slug?: string;
  price_position?: string;
  source?: string;
  source_domain?: string;
  source_display?: string;
  channel_type?: ChannelType;
}

export default function PrixEaux() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [prices, setPrices] = useState<PriceWithRetailer[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [brandRetailerMapping, setBrandRetailerMapping] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const retailersRef = useRef<Retailer[]>([]);
  const brandRetailerMappingRef = useRef<any[]>([]);
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
    channel_type: searchParams.get('channel_type') || undefined,
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
        retailersRef.current = retailersData as Retailer[];

        // Charger les marques distinctes
        const brandsData = await listDistinctBrands();
        setBrands(brandsData);

        // Charger le mapping marques-enseignes
        const mappingData = await getBrandRetailerMapping();
        setBrandRetailerMapping(mappingData);
        brandRetailerMappingRef.current = mappingData;

        setInitialDataLoaded(true);
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
    if (!initialDataLoaded) return;

    const loadPrices = async () => {
      setLoading(true);
      try {
        const result = await getPrices(filters);
        
        const currentRetailers = retailersRef.current;
        const currentMapping = brandRetailerMappingRef.current;

        // Résoudre l'enseigne même si l'ID ne correspond pas (slug/URL/unique_hash)
        const resolveRetailer = (price: any) => {
          const byId = currentRetailers.find(r => r.id === price.retailer_id);
          if (byId) return byId;
          const skuSlug = price.sku?.split('_')?.[0]?.toLowerCase();
          const hashSlug = price.unique_hash?.split('-')?.[0]?.toLowerCase();
          let urlHost = '';
          try { urlHost = price.url ? new URL(price.url).hostname.replace('www.', '') : ''; } catch {}
          return (
            currentRetailers.find(r => r.slug?.toLowerCase() === skuSlug) ||
            currentRetailers.find(r => r.slug?.toLowerCase() === hashSlug) ||
            currentRetailers.find(r => urlHost && r.domain && urlHost.includes(r.domain.replace('www.', '')))
          );
        };

        let pricesWithRetailer = result.items.map(price => {
          const retailerObj = resolveRetailer(price);
          const brandMapping = currentMapping.find(m => 
            m.brand_name.toLowerCase() === price.brand?.toLowerCase() && 
            m.retailer_id === retailerObj?.id
          );
          
          // Extraire les informations de source
          const sourceInfo = extractSourceInfo(price.url, retailerObj?.name || 'Enseigne inconnue');
          
          return {
            ...price,
            retailer_name: retailerObj?.name || 'Enseigne inconnue',
            retailer_slug: retailerObj?.slug,
            retailer_resolved_id: retailerObj?.id,
            price_per_l_eur: computeFallbackPricePerL(price) || price.price_per_l_eur,
            source: price.source || 'prices_history',
            source_domain: sourceInfo.fullDomain,
            source_display: sourceInfo.displayName,
            channel_type: sourceInfo.channelType,
            // Enrichissement avec les données de mapping
            has_brand_mapping: !!brandMapping,
            price_position: brandMapping?.price_position || 'unknown',
            is_brand_available: brandMapping?.is_available !== false
          } as any;
        });

        // Filtre par enseigne côté client si demandé
        if (filters.retailer) {
          const selected = currentRetailers.find(r => r.id === filters.retailer);
          if (selected) {
            pricesWithRetailer = pricesWithRetailer.filter(p => (
              p.retailer_resolved_id === selected.id ||
              p.retailer_slug === selected.slug ||
              (p.url && selected.domain && p.url.includes(selected.domain))
            ));
          }
        }

        // Filtre par type de canal côté client
        if (filters.channel_type && filters.channel_type !== 'all') {
          pricesWithRetailer = pricesWithRetailer.filter(p => p.channel_type === filters.channel_type);
        }

        // Déduplication améliorée - garder le plus récent par produit (ignorer unique_hash)
        const productMap = new Map<string, any>();
        const norm = (s: any) => (s ?? '')
          .toString()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // enlever accents
          .replace(/\s+/g, ' ') // espaces multiples -> simple espace
          .trim();
        
        pricesWithRetailer.forEach(p => {
          const vol = Number(p.unit_volume_l ?? 0);
          const volKey = Number.isFinite(vol) ? vol.toFixed(3) : '0.000';
          const pack = Number(p.pack_count ?? 1) || 1;
          const rid = p.retailer_resolved_id || p.retailer_id || '';
          const key = `${norm(p.brand)}|${norm(p.product_name)}|${volKey}|${pack}|${rid}`;

          const existing = productMap.get(key);
          if (!existing) {
            productMap.set(key, p);
          } else {
            // Garder le plus récent (scraped_at ou created_at)
            const existingDate = new Date(existing.scraped_at || existing.created_at);
            const newDate = new Date(p.scraped_at || p.created_at);
            if (newDate > existingDate) {
              productMap.set(key, p);
            }
          }
        });
        
        pricesWithRetailer = Array.from(productMap.values());

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
  }, [filters, toast, initialDataLoaded]);

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
      <SEOHead {...seoData.prixEaux} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Prix des eaux en bouteille</h1>
          <p className="text-muted-foreground mb-6">
            Comparez les prix des eaux en bouteille dans toutes les enseignes. 
            Données mises à jour quotidiennement.
          </p>

          {/* Légende des types de sources */}
          <Alert className="mb-6 bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertTitle>Sources de prix</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  <span><strong>Site principal :</strong> Prix grand public</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span><strong>Drive :</strong> Click & Collect</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span><strong>Grossiste/Pro :</strong> Peut nécessiter conditions</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span><strong>Marketplace :</strong> Vendeur tiers</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

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

            {/* Ligne séparée pour les filtres promotions et type de source */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
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

              <Select value={searchParams.get('channel_type') || ''} onValueChange={(value) => updateFilter('channel_type', value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sources</SelectItem>
                  <SelectItem value="retail">🏪 Site principal</SelectItem>
                  <SelectItem value="drive">🚗 Drive</SelectItem>
                  <SelectItem value="wholesale">📦 Grossiste/Pro</SelectItem>
                  <SelectItem value="marketplace">🛒 Marketplace</SelectItem>
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
            <>
            {/* Mobile: liste compacte e-commerce */}
            <div className="md:hidden space-y-0 divide-y divide-border rounded-lg border border-border bg-card overflow-hidden">
              {prices.map((price) => {
                const getChannelIcon = () => {
                  switch (price.channel_type) {
                    case 'retail': return <Store className="h-3.5 w-3.5" />;
                    case 'drive': return <Truck className="h-3.5 w-3.5" />;
                    case 'wholesale': return <Package className="h-3.5 w-3.5" />;
                    case 'marketplace': return <ShoppingCart className="h-3.5 w-3.5" />;
                    default: return <Store className="h-3.5 w-3.5" />;
                  }
                };
                const relativeDate = (() => {
                  const diff = Date.now() - new Date(price.scraped_at).getTime();
                  const hours = Math.floor(diff / 3600000);
                  if (hours < 1) return "< 1h";
                  if (hours < 24) return `${hours}h`;
                  const days = Math.floor(hours / 24);
                  return `${days}j`;
                })();
                return (
                  <div key={price.id} className="px-4 py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm min-w-0">
                        {getChannelIcon()}
                        <span className="font-medium truncate">{price.source_display || price.retailer_name}</span>
                        {price.channel_type === 'wholesale' && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">PRO</Badge>
                        )}
                      </div>
                      <span className="font-bold text-primary text-sm whitespace-nowrap ml-2">
                        {formatPrice(price.price_per_l_eur)}/L
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate min-w-0">
                        {price.brand} · {formatVolume(price.pack_count, price.unit_volume_l)}
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap ml-2">
                        {formatPrice(price.price_total_eur)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>il y a {relativeDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {price.promo_label && <span className="text-[10px]">{price.promo_label}</span>}
                        {price.is_promo && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">PROMO</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: tableau classique */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">Source</th>
                    <th className="border border-border p-3 text-left">Marque</th>
                    <th className="border border-border p-3 text-left">Produit</th>
                    <th className="border border-border p-3 text-left">Format</th>
                    <th className="border border-border p-3 text-right">Prix pack</th>
                    <th className="border border-border p-3 text-right">Prix €/L</th>
                    <th className="border border-border p-3 text-center">
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
                  {prices.map((price) => {
                    const getChannelIcon = () => {
                      switch (price.channel_type) {
                        case 'retail': return <Store className="h-4 w-4" />;
                        case 'drive': return <Truck className="h-4 w-4" />;
                        case 'wholesale': return <Package className="h-4 w-4" />;
                        case 'marketplace': return <ShoppingCart className="h-4 w-4" />;
                        default: return <Store className="h-4 w-4" />;
                      }
                    };
                    return (
                    <tr key={price.id} className="hover:bg-muted/50">
                      <td className="border border-border p-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-help">
                                {getChannelIcon()}
                                <div>
                                  <div className="font-medium">{price.source_display || price.retailer_name}</div>
                                  {price.source_domain && (
                                    <div className="text-xs text-muted-foreground">{price.source_domain}</div>
                                  )}
                                </div>
                                {price.channel_type === 'wholesale' && (
                                  <Badge variant="secondary" className="text-xs">PRO</Badge>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-medium">{getChannelDescription(price.channel_type || 'retail')}</p>
                              {price.url && (
                                <p className="text-xs mt-1 text-muted-foreground truncate">{price.url}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                      <td className="border border-border p-3">
                        <span className="font-medium">{price.brand}</span>
                        {price.is_promo && (
                          <Badge variant="destructive" className="ml-2 text-xs">PROMO</Badge>
                        )}
                      </td>
                      <td className="border border-border p-3">
                        <div className="max-w-xs truncate">{price.product_name}</div>
                        {price.promo_label && (
                          <div className="text-xs text-muted-foreground">{price.promo_label}</div>
                        )}
                      </td>
                      <td className="border border-border p-3">
                        {formatVolume(price.pack_count, price.unit_volume_l)}
                      </td>
                      <td className="border border-border p-3 text-right font-medium">
                        {formatPrice(price.price_total_eur)}
                      </td>
                      <td className="border border-border p-3 text-right font-bold text-primary">
                        {formatPrice(price.price_per_l_eur)}
                      </td>
                      <td className="border border-border p-3 text-center text-sm text-muted-foreground">
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
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>


                    <th className="border border p-3 text-left">Format</th>
                    <th className="border border p-3 text-right">
                      Prix pack
                    </th>
                    <th className="border border p-3 text-right">
                      Prix €/L
                    </th>
                    <th className="border border p-3 text-center">
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
                  {prices.map((price) => {
                    const getChannelIcon = () => {
                      switch (price.channel_type) {
                        case 'retail': return <Store className="h-4 w-4" />;
                        case 'drive': return <Truck className="h-4 w-4" />;
                        case 'wholesale': return <Package className="h-4 w-4" />;
                        case 'marketplace': return <ShoppingCart className="h-4 w-4" />;
                        default: return <Store className="h-4 w-4" />;
                      }
                    };

                    return (
                    <tr key={price.id} className="hover:bg-muted/50">
                       <td className="border border-border p-3 sticky left-0 bg-background z-10">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help">
                                  {getChannelIcon()}
                                  <div>
                                    <div className="font-medium">{price.source_display || price.retailer_name}</div>
                                    {price.source_domain && (
                                      <div className="text-xs text-muted-foreground">{price.source_domain}</div>
                                    )}
                                  </div>
                                  {price.channel_type === 'wholesale' && (
                                    <Badge variant="secondary" className="text-xs">PRO</Badge>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="font-medium">{getChannelDescription(price.channel_type || 'retail')}</p>
                                {price.url && (
                                  <p className="text-xs mt-1 text-muted-foreground truncate">{price.url}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      <td className="border border p-3">
                        <span className="font-medium">{price.brand}</span>
                        {price.is_promo && (
                          <Badge variant="destructive" className="ml-2 text-xs">PROMO</Badge>
                        )}
                      </td>
                      <td className="border border p-3">
                        <div className="max-w-xs truncate">{price.product_name}</div>
                        {price.promo_label && (
                          <div className="text-xs text-muted-foreground">{price.promo_label}</div>
                        )}
                      </td>
                      <td className="border border p-3">
                        {formatVolume(price.pack_count, price.unit_volume_l)}
                      </td>
                      <td className="border border p-3 text-right font-medium">
                        {formatPrice(price.price_total_eur)}
                      </td>
                      <td className="border border p-3 text-right font-bold text-primary">
                        {formatPrice(price.price_per_l_eur)}
                      </td>
                      <td className="border border p-3 text-center text-sm text-muted-foreground">
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
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}