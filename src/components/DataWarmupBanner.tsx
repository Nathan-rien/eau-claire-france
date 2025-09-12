import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { hasData, DataStats } from '@/services/dataStatsApi';

interface DataWarmupBannerProps {
  onDataAvailable?: () => void;
}

export default function DataWarmupBanner({ onDataAvailable }: DataWarmupBannerProps) {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [polling, setPolling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkDataAvailability();
  }, []);

  const checkDataAvailability = async () => {
    try {
      const dataStats = await hasData();
      setStats(dataStats);
      
      if (dataStats.hasPrices && onDataAvailable) {
        onDataAvailable();
      }
    } catch (error) {
      console.error('Error checking data availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    setPolling(true);
    let attempts = 0;
    const maxAttempts = 12; // 2 minutes with 10s intervals

    const poll = async () => {
      attempts++;
      try {
        const dataStats = await hasData();
        setStats(dataStats);
        
        if (dataStats.hasPrices) {
          setPolling(false);
          setScraping(false);
          toast({
            title: "Données disponibles !",
            description: "Le scraping s'est terminé avec succès. Actualisation de l'interface...",
          });
          if (onDataAvailable) {
            onDataAvailable();
          }
          return;
        }
        
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPolling(false);
          setScraping(false);
          toast({
            title: "Délai dépassé",
            description: "Le scraping prend plus de temps que prévu. Veuillez vérifier manuellement.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        setPolling(false);
        setScraping(false);
      }
    };

    poll();
  };

  const handleSmokeTest = () => {
    setScraping(true);
    
    // Show instruction modal since we can't execute CLI directly
    toast({
      title: "Lancement du smoke test",
      description: "Copiez et exécutez cette commande dans votre terminal : pnpm scrape --retailers carrefour,auchan,leclerc --brands evian,cristaline --formats \"1,5 l\" --maxPages 1",
      duration: 10000
    });
    
    // Start polling for data
    startPolling();
  };

  if (loading) {
    return (
      <Alert className="mb-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Vérification des données disponibles...</AlertDescription>
      </Alert>
    );
  }

  if (stats?.hasPrices) {
    return null; // Don't show banner if data is available
  }

  return (
    <Card className="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Database className="h-8 w-8 text-orange-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Aucune donnée disponible
            </h3>
            <p className="text-orange-800 dark:text-orange-200 mb-4">
              La base de données est vide. Lancez un smoke test (3 enseignes) pour alimenter 
              la base avec des données d'exemple et commencer à comparer les prix.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleSmokeTest}
                disabled={scraping || polling}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {scraping || polling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {polling ? 'Vérification...' : 'En cours...'}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Lancer le smoke test
                  </>
                )}
              </Button>
              
              {scraping && (
                <div className="text-sm text-orange-700 dark:text-orange-300 flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Commande à exécuter dans le terminal
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}