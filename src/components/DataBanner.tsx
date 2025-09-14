import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DataStats {
  active_retailers_count: number;
  prices_count: number;
  distinct_brands_count: number;
}

interface DataBannerProps {
  onDataUpdate?: () => void;
}

export const DataBanner = ({ onDataUpdate }: DataBannerProps) => {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [smokeLoading, setSmokeLoading] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch basic stats
      const [retailersRes, pricesRes, brandsRes] = await Promise.all([
        supabase.from('retailers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('prices').select('*', { count: 'exact', head: true }),
        supabase.functions.invoke('debug-brands'),
      ]);

      const stats: DataStats = {
        active_retailers_count: retailersRes.count || 0,
        prices_count: pricesRes.count || 0,
        distinct_brands_count: brandsRes.error ? 0 : (brandsRes.data as string[]).length,
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSmokeTest = async () => {
    setSmokeLoading(true);
    try {
      toast({
        title: "Scraping en cours",
        description: "Remplissage de la base (1-2 min)...",
      });

      const { data, error } = await supabase.functions.invoke('admin-smoke');
      if (error) throw error;

      if (data.ok) {
        toast({
          title: "Smoke test réussi !",
          description: `${data.items_saved} produits ajoutés`,
        });
        // Refresh stats and notify parent
        await fetchStats();
        onDataUpdate?.();
      } else {
        toast({
          title: "Smoke test échoué",
          description: data.message || "Aucun produit sauvegardé",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur smoke test",
        description: "Impossible de lancer le scraping",
        variant: "destructive",
      });
    } finally {
      setSmokeLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Vérification des données disponibles...
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) return null;

  // Show banner if no active retailers
  if (stats.active_retailers_count === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Aucune enseigne active visible. Vérifiez la configuration (RLS/seed).</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/admin', '_blank')}
          >
            Vérifier ma configuration
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show banner if no prices
  if (stats.prices_count === 0) {
    return (
      <Alert className="mb-4 border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <span>Aucune donnée disponible. Lancez un scraping pour remplir la base.</span>
          <Button 
            onClick={runSmokeTest}
            disabled={smokeLoading}
            size="sm"
          >
            {smokeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remplir la base (Smoke test)
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No banner needed if data is available
  return null;
};