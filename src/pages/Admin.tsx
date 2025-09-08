import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Run, Retailer } from '@/types/pricing';
// Server-side scraping removed from client
import { BRAND_CONFIG } from '@/config/brands';

export default function Admin() {
  const [runs, setRuns] = useState<(Run & { retailers: Retailer })[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<string | null>(null);
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
      // TODO: Implement API endpoint for triggering scraping
      // await fetch(`/api/scrape?retailer=${retailerSlug}`, { method: 'POST' });
      
      toast({
        title: "Scraping en cours",
        description: `Le scraping de ${retailerSlug} va être implémenté via API`
      });

      // Reload data after delay
      setTimeout(() => loadData(), 2000);
      
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
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administration - Scraping des prix</h1>
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
  );
}