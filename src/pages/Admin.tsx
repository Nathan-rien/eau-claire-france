import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Run, Retailer } from '@/types/pricing';
// Server-side scraping removed from client
import { BRAND_CONFIG, TARGET_BRANDS } from '@/config/brands';
import { AdminQuickStart } from '@/components/AdminQuickStart';
import { AdminGuard, QuickStartGuard } from '@/components/SecurityGuard';
import { getMetaSecurityTags } from '@/utils/securityHeaders';
import { Helmet } from 'react-helmet-async';
import { ExternalLink } from 'lucide-react';
import TasteSubmissionsAdmin from '@/components/TasteSubmissionsAdmin';


export default function Admin() {
  const [runs, setRuns] = useState<(Run & { retailers: Retailer })[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<string | null>(null);
  const [scrapingAll, setScrapingAll] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [pricesHealth, setPricesHealth] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load recent runs
      const { data: runsData, error: runsError } = await supabase
        .from('runs')
        .select(`
          *,
          retailers(*)
        `)
        .order('started_at', { ascending: false })
        .limit(20);

      if (runsError) throw runsError;
      setRuns((runsData || []) as any);

      // Load retailers
      const { data: retailersData, error: retailersError } = await supabase
        .from('retailers')
        .select('*')
        .order('name');

      if (retailersError) throw retailersError;
      setRetailers((retailersData || []) as Retailer[]);

      // Load database stats and prices health
      const [statsResponse, pricesResponse] = await Promise.all([
        supabase.functions.invoke('admin-stats'),
        supabase.functions.invoke('admin-prices-health')
      ]);
      
      setStats(statsResponse.data);
      setPricesHealth(pricesResponse.data);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeRetailer = async (retailerSlug: string) => {
    setScraping(retailerSlug);
    
    try {
      const brands = TARGET_BRANDS.map(b => b.toLowerCase());
      const formats = ['0,5 l', '1 l', '1,5 l'];
      const adminToken = import.meta.env.VITE_ADMIN_DASHBOARD_TOKEN;
      
      const { data, error } = await supabase.functions.invoke('admin-scrape', {
        body: {
          mode: 'wide',
          retailers: [retailerSlug],
          brands,
          formats,
          maxPages: 2,
          dryRun: false
        },
        headers: {
          'x-admin-token': adminToken
        }
      });

      if (error) throw error;

      toast({
        title: "Scraping lancé",
        description: `Le scraping de ${retailerSlug} a été lancé avec succès`
      });

      // Reload data after a few seconds
      setTimeout(() => loadData(), 3000);
      
    } catch (error) {
      console.error('Error during scraping:', error);
      toast({
        title: "Erreur",
        description: `Le scraping de ${retailerSlug} a échoué`,
        variant: "destructive"
      });
    } finally {
      setScraping(null);
    }
  };

  const handleScrapeAll = async () => {
    const activeRetailers = retailers.filter(r => r.status === 'active');
    
    if (activeRetailers.length === 0) {
      toast({
        title: "Aucune enseigne active",
        description: "Impossible de lancer le scraping",
        variant: "destructive"
      });
      return;
    }

    setScrapingAll(true);
    
    try {
      const brands = TARGET_BRANDS.map(b => b.toLowerCase());
      const formats = ['0,5 l', '1 l', '1,5 l'];
      const retailerSlugs = activeRetailers.map(r => r.slug);
      const adminToken = import.meta.env.VITE_ADMIN_DASHBOARD_TOKEN;
      
      const { data, error } = await supabase.functions.invoke('admin-scrape', {
        body: {
          mode: 'wide',
          retailers: retailerSlugs,
          brands,
          formats,
          maxPages: 2,
          dryRun: false
        },
        headers: {
          'x-admin-token': adminToken
        }
      });

      if (error) throw error;

      toast({
        title: "Scraping global lancé",
        description: `Le scraping de ${activeRetailers.length} enseignes a été lancé avec succès`
      });

      // Reload data after delay
      setTimeout(() => loadData(), 5000);
      
    } catch (error) {
      console.error('Error during global scraping:', error);
      toast({
        title: "Erreur",
        description: "Le scraping global a échoué",
        variant: "destructive"
      });
    } finally {
      setScrapingAll(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'partial':
        return 'bg-orange-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <Helmet>
        <title>Administration - InfoEau</title>
        {getMetaSecurityTags(true).map((tag, index) => (
          <meta key={index} {...tag} />
        ))}
      </Helmet>
      <div className="container mx-auto py-8 space-y-8">
        <QuickStartGuard>
          <AdminQuickStart />
        </QuickStartGuard>
      
      {/* Database Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques base de données</CardTitle>
            <CardDescription>État actuel des données</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.prices_history_today}</div>
                <div className="text-sm text-muted-foreground">Prix scrapés aujourd'hui</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.prices_history_last_count}</div>
                <div className="text-sm text-muted-foreground">Derniers prix uniques</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.current_prices_count}</div>
                <div className="text-sm text-muted-foreground">Prix actuels</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Dernière vérification</div>
                <div className="text-xs">{new Date(stats.timestamp).toLocaleString('fr-FR')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Prix */}
      {pricesHealth && (
        <Card>
          <CardHeader>
            <CardTitle>🏥 Santé Prix</CardTitle>
            <CardDescription>Qualité des données de prix</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{pricesHealth.rows_today}</div>
                <div className="text-sm text-muted-foreground">Lignes aujourd'hui</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{pricesHealth.rows_with_null_volume}</div>
                <div className="text-sm text-muted-foreground">Sans volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{pricesHealth.rows_with_null_ppl}</div>
                <div className="text-sm text-muted-foreground">Sans €/L</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{pricesHealth.rows_in_last_view}</div>
                <div className="text-sm text-muted-foreground">Vue derniers prix</div>
              </div>
            </div>
            {pricesHealth.sample_rows?.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">Exemples récents</summary>
                <div className="mt-2 text-sm space-y-1">
                  {pricesHealth.sample_rows.slice(0, 3).map((row: any, i: number) => (
                    <div key={i} className="bg-muted p-2 rounded">
                      <strong>{row.brand}</strong> - {row.product_name.substring(0, 50)}...
                      <br />Volume: {row.total_volume_l}L, Prix/L: {row.price_per_l_eur}€
                    </div>
                  ))}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administration - Scraping des prix</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleScrapeAll}
            disabled={scrapingAll || retailers.filter(r => r.status === 'active').length === 0}
            variant="default"
          >
            {scrapingAll ? 'Scraping en cours...' : '⚡ Scraper toutes les enseignes'}
          </Button>
          <Button
            onClick={() => window.open('https://github.com/YOUR_USERNAME/YOUR_REPO/actions', '_blank')}
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            GitHub Actions
          </Button>
        </div>
      </div>

      {/* Retailers Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enseignes</CardTitle>
          <CardDescription>
            Lancer le scraping pour une enseigne spécifique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {retailers.map(retailer => (
              <div key={retailer.id} className="space-y-2">
                <div className="font-medium">{retailer.name}</div>
                <Button
                  onClick={() => handleScrapeRetailer(retailer.slug)}
                  disabled={scraping === retailer.slug || retailer.status !== 'active'}
                  className="w-full"
                  size="sm"
                >
                  {scraping === retailer.slug ? 'En cours...' : 'Scraper'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières exécutions</CardTitle>
          <CardDescription>
            Historique des 20 dernières exécutions de scraping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enseigne</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Trouvés</TableHead>
                <TableHead>Sauvés</TableHead>
                <TableHead>Taux d'erreur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map(run => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">
                    {(run.retailers as any)?.name || 'Inconnu'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(run.status)}
                    >
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(run.started_at).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {run.finished_at 
                      ? new Date(run.finished_at).toLocaleString('fr-FR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{run.items_found}</TableCell>
                  <TableCell>{run.items_saved}</TableCell>
                  <TableCell>
                    {(run.error_rate * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </AdminGuard>
  );
}