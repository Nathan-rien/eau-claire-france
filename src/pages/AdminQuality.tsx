import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Download, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { isPriceOutlier, isValidVolume, isKnownBrand, normalizeBrand } from '@/lib/quality';

interface QualityAnomaly {
  id: string;
  type: 'price_outlier' | 'volume_invalid' | 'brand_unknown';
  severity: 'high' | 'medium' | 'low';
  retailer_name: string;
  brand: string;
  product_name: string;
  price_per_l_eur: number | null;
  total_volume_l: number | null;
  url: string;
  run_id: string;
  scraped_at: string;
  details: string;
}

interface QualityStats {
  total_products: number;
  outliers_count: number;
  invalid_volumes_count: number;
  unknown_brands_count: number;
  error_rate: number;
}

export default function AdminQuality() {
  const [anomalies, setAnomalies] = useState<QualityAnomaly[]>([]);
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<string>('latest');

  useEffect(() => {
    loadQualityData();
  }, [selectedRun]);

  const loadQualityData = async () => {
    try {
      setLoading(true);
      
      // Get latest run or specific run
      let runQuery = supabase
        .from('runs')
        .select('id, retailer_id, started_at, status, quality_score, outliers_count, unknown_brands_count, retailers(name)')
        .order('started_at', { ascending: false });
      
      if (selectedRun !== 'latest') {
        runQuery = runQuery.eq('id', selectedRun);
      } else {
        runQuery = runQuery.limit(1);
      }
      
      const { data: runs, error: runsError } = await runQuery;
      if (runsError) throw runsError;
      
      if (!runs || runs.length === 0) {
        setAnomalies([]);
        setStats(null);
        return;
      }
      
      const targetRun = runs[0];
      
      // Get prices from this run
      const { data: prices, error: pricesError } = await supabase
        .from('prices')
        .select('*, retailers(name)')
        .eq('run_id', targetRun.id);
      
      if (pricesError) throw pricesError;
      
      // Analyze quality issues
      const detectedAnomalies: QualityAnomaly[] = [];
      
      prices?.forEach(price => {
        // Check price outliers
        if (price.price_per_l_eur && isPriceOutlier(price.price_per_l_eur)) {
          detectedAnomalies.push({
            id: price.id,
            type: 'price_outlier',
            severity: price.price_per_l_eur > 10 ? 'high' : 'medium',
            retailer_name: price.retailers?.name || 'Unknown',
            brand: price.brand,
            product_name: price.product_name,
            price_per_l_eur: price.price_per_l_eur,
            total_volume_l: price.total_volume_l,
            url: price.url,
            run_id: price.run_id,
            scraped_at: price.scraped_at,
            details: `Prix hors plage normale (0.05€ - 5.00€/L)`
          });
        }
        
        // Check volume formats
        if (price.total_volume_l && !isValidVolume(price.total_volume_l)) {
          detectedAnomalies.push({
            id: price.id + '_volume',
            type: 'volume_invalid',
            severity: 'medium',
            retailer_name: price.retailers?.name || 'Unknown',
            brand: price.brand,
            product_name: price.product_name,
            price_per_l_eur: price.price_per_l_eur,
            total_volume_l: price.total_volume_l,
            url: price.url,
            run_id: price.run_id,
            scraped_at: price.scraped_at,
            details: `Volume non standard (attendus: 0.33, 0.5, 1, 1.5L...)`
          });
        }
        
        // Check unknown brands
        if (!isKnownBrand(price.brand) || price.brand === 'Inconnu') {
          detectedAnomalies.push({
            id: price.id + '_brand',
            type: 'brand_unknown',
            severity: 'low',
            retailer_name: price.retailers?.name || 'Unknown',
            brand: price.brand,
            product_name: price.product_name,
            price_per_l_eur: price.price_per_l_eur,
            total_volume_l: price.total_volume_l,
            url: price.url,
            run_id: price.run_id,
            scraped_at: price.scraped_at,
            details: `Marque non reconnue dans le catalogue`
          });
        }
      });
      
      setAnomalies(detectedAnomalies);
      
      // Calculate stats
      const totalProducts = prices?.length || 0;
      const outliersCount = detectedAnomalies.filter(a => a.type === 'price_outlier').length;
      const invalidVolumesCount = detectedAnomalies.filter(a => a.type === 'volume_invalid').length;
      const unknownBrandsCount = detectedAnomalies.filter(a => a.type === 'brand_unknown').length;
      
      setStats({
        total_products: totalProducts,
        outliers_count: outliersCount,
        invalid_volumes_count: invalidVolumesCount,
        unknown_brands_count: unknownBrandsCount,
        error_rate: totalProducts > 0 ? (outliersCount + invalidVolumesCount) / totalProducts : 0
      });
      
    } catch (error) {
      console.error('Error loading quality data:', error);
      toast.error('Erreur lors du chargement des données qualité');
    } finally {
      setLoading(false);
    }
  };

  const downloadAnomaliesCSV = () => {
    if (anomalies.length === 0) {
      toast.error('Aucune anomalie à exporter');
      return;
    }
    
    const headers = ['Type', 'Sévérité', 'Enseigne', 'Marque', 'Produit', 'Prix €/L', 'Volume L', 'URL', 'Détails', 'Date'];
    const csvData = [
      headers.join(','),
      ...anomalies.map(a => [
        a.type,
        a.severity,
        a.retailer_name,
        a.brand,
        `"${a.product_name}"`,
        a.price_per_l_eur || '',
        a.total_volume_l || '',
        a.url,
        `"${a.details}"`,
        new Date(a.scraped_at).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `anomalies_qualite_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Export CSV téléchargé');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'price_outlier': return 'Prix aberrant';
      case 'volume_invalid': return 'Volume invalide';
      case 'brand_unknown': return 'Marque inconnue';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">Chargement des données qualité...</div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <SEOHead 
          title="Contrôle Qualité - Administration"
          description="Monitoring et analyse de la qualité des données de prix"
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Contrôle Qualité</h1>
              <p className="text-muted-foreground">Monitoring et analyse de la qualité des données</p>
            </div>
            <Button onClick={downloadAnomaliesCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Produits analysés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_products}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Prix aberrants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{stats.outliers_count}</div>
                    {stats.outliers_count > 0 && <AlertTriangle className="w-4 h-4 text-destructive" />}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Volumes invalides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.invalid_volumes_count}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Taux d'erreur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{(stats.error_rate * 100).toFixed(1)}%</div>
                    {stats.error_rate > 0.1 ? 
                      <TrendingUp className="w-4 h-4 text-destructive" /> : 
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="outliers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="outliers">Prix aberrants ({anomalies.filter(a => a.type === 'price_outlier').length})</TabsTrigger>
              <TabsTrigger value="volumes">Volumes invalides ({anomalies.filter(a => a.type === 'volume_invalid').length})</TabsTrigger>
              <TabsTrigger value="brands">Marques inconnues ({anomalies.filter(a => a.type === 'brand_unknown').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="outliers">
              <Card>
                <CardHeader>
                  <CardTitle>Prix aberrants détectés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {anomalies.filter(a => a.type === 'price_outlier').map(anomaly => (
                      <div key={anomaly.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                            <span className="font-medium">{anomaly.retailer_name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => window.open(anomaly.url, '_blank')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Produit:</strong> {anomaly.product_name}</div>
                          <div><strong>Marque:</strong> {anomaly.brand}</div>
                          <div><strong>Prix:</strong> {anomaly.price_per_l_eur?.toFixed(2)}€/L</div>
                          <div><strong>Détails:</strong> {anomaly.details}</div>
                          <div className="text-muted-foreground">
                            {new Date(anomaly.scraped_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {anomalies.filter(a => a.type === 'price_outlier').length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun prix aberrant détecté
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volumes">
              <Card>
                <CardHeader>
                  <CardTitle>Volumes invalides détectés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {anomalies.filter(a => a.type === 'volume_invalid').map(anomaly => (
                      <div key={anomaly.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                            <span className="font-medium">{anomaly.retailer_name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => window.open(anomaly.url, '_blank')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Produit:</strong> {anomaly.product_name}</div>
                          <div><strong>Volume:</strong> {anomaly.total_volume_l}L</div>
                          <div><strong>Détails:</strong> {anomaly.details}</div>
                          <div className="text-muted-foreground">
                            {new Date(anomaly.scraped_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {anomalies.filter(a => a.type === 'volume_invalid').length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun volume invalide détecté
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="brands">
              <Card>
                <CardHeader>
                  <CardTitle>Marques inconnues détectées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {anomalies.filter(a => a.type === 'brand_unknown').map(anomaly => (
                      <div key={anomaly.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                            <span className="font-medium">{anomaly.retailer_name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => window.open(anomaly.url, '_blank')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Produit:</strong> {anomaly.product_name}</div>
                          <div><strong>Marque détectée:</strong> {anomaly.brand}</div>
                          <div><strong>Détails:</strong> {anomaly.details}</div>
                          <div className="text-muted-foreground">
                            {new Date(anomaly.scraped_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {anomalies.filter(a => a.type === 'brand_unknown').length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucune marque inconnue détectée
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}