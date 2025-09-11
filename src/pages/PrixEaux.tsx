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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PriceWithRetailer extends Price {
  retailer_name: string;
}

export default function PrixEaux() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [prices, setPrices] = useState<PriceWithRetailer[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0
  });

  // Filtres depuis l'URL avec persistance
  const filters: PriceFilters = useMemo(() => ({
    brand: searchParams.get('brands') || undefined, // Changed to 'brands' for multi-select
    retailer: searchParams.get('retailers') || undefined, // Changed to 'retailers' for multi-select
    format: searchParams.get('format') || undefined,
    pack: searchParams.get('pack') || undefined,
    search: searchParams.get('search') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('pageSize') || '50')
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

  // Charger les prix avec filtres
  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('prices')
          .select(`
            *,
            retailers!inner(name)
          `, { count: 'exact' });

        // Appliquer les filtres
        if (filters.brand) {
          query = query.eq('brand', filters.brand);
        }
        if (filters.retailer) {
          query = query.eq('retailer_id', filters.retailer);
        }
        if (filters.search) {
          query = query.ilike('product_name', `%${filters.search}%`);
        }
        
        // Filtre disponibilité
        const availability = searchParams.get('availability');
        if (availability === 'in_stock') {
          query = query.eq('availability', 'in_stock');
        }
        if (filters.format) {
          switch (filters.format) {
            case '50cl':
              query = query.eq('unit_volume_l', 0.5);
              break;
            case '1l':
              query = query.eq('unit_volume_l', 1.0);
              break;
            case '1.5l':
              query = query.eq('unit_volume_l', 1.5);
              break;
          }
        }
        if (filters.pack) {
          switch (filters.pack) {
            case '6':
              query = query.eq('pack_count', 6);
              break;
            case '8':
              query = query.eq('pack_count', 8);
              break;
            case '12':
              query = query.eq('pack_count', 12);
              break;
          }
        }

        // Pagination et tri
        const offset = ((filters.page || 1) - 1) * (filters.limit || 50);
        query = query
          .order('price_per_l_eur', { ascending: true })
          .order('scraped_at', { ascending: false })
          .range(offset, offset + (filters.limit || 50) - 1);

        const { data, count, error } = await query;

        if (error) throw error;

        if (data) {
          const pricesWithRetailer = data.map(price => ({
            ...price,
            retailer_name: (price as any).retailers.name
          }));
          
          setPrices(pricesWithRetailer as PriceWithRetailer[]);
          setPagination({
            page: filters.page || 1,
            pageSize: filters.limit || 50,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / (filters.limit || 50))
          });
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
  }, [filters, toast]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset page on filter change
    setSearchParams(newParams);
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

          {/* Filtres */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                  <SelectItem value="">Toutes les marques</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.retailer || ''} onValueChange={(value) => updateFilter('retailer', value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Enseigne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les enseignes</SelectItem>
                  {retailers.map(retailer => (
                    <SelectItem key={retailer.id} value={retailer.id}>{retailer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.format || ''} onValueChange={(value) => updateFilter('format', value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les formats</SelectItem>
                  <SelectItem value="50cl">50cl</SelectItem>
                  <SelectItem value="1l">1L</SelectItem>
                   <SelectItem value="1.5l">1,5L</SelectItem>
                   <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select value={filters.pack || ''} onValueChange={(value) => updateFilter('pack', value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pack" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les packs</SelectItem>
                    <SelectItem value="6">Pack de 6</SelectItem>
                    <SelectItem value="8">Pack de 8</SelectItem>
                    <SelectItem value="12">Pack de 12</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={searchParams.get('availability') || 'all'} onValueChange={(value) => updateFilter('availability', value === 'all' ? null : value)}>
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
          </Card>

          {/* Résultats */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {pagination.total} produits trouvés
            </p>
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Marque</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Produit</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Format</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">Enseigne</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-right">Prix pack</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-right">€/L</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Mise à jour</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((price) => (
                    <tr key={price.id} className="hover:bg-muted/50">
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