import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DiagnosticResult {
  ok: boolean;
  details: {
    retailers_count: number;
    active_retailers_count: number;
    prices_count: number;
    history_90d_count: number;
    last_scraped_at: string | null;
    distinct_brands_count: number;
  };
  env: {
    has_service_role_key: boolean;
    has_anon_key: boolean;
    has_url: boolean;
  };
  errors?: string[];
}

interface SmokeResult {
  ok: boolean;
  items_found: number;
  items_saved: number;
  error_rate: number;
  started_at: string;
  finished_at: string;
  message?: string;
}

export const AdminQuickStart = () => {
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [smokeLoading, setSmokeLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  const runDiagnostic = async () => {
    setDiagnosticLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-diagnostic');
      if (error) throw error;
      
      setDiagnosticResult(data);
      
      if (data.ok) {
        toast({
          title: "Configuration OK",
          description: "Votre configuration est fonctionnelle",
        });
      } else {
        toast({
          title: "Configuration incomplète",
          description: data.errors?.[0] || "Vérifiez la configuration",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur diagnostic",
        description: "Impossible de vérifier la configuration",
        variant: "destructive",
      });
      console.error('Diagnostic error:', error);
    } finally {
      setDiagnosticLoading(false);
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

      const result = data as SmokeResult;
      
      if (result.ok) {
        toast({
          title: "Smoke test réussi !",
          description: `${result.items_saved} produits ajoutés avec ${Math.round(result.error_rate * 100)}% d'erreurs`,
        });
        // Refresh diagnostic after successful smoke test
        setTimeout(() => runDiagnostic(), 1000);
      } else {
        toast({
          title: "Smoke test échoué",
          description: result.message || "Aucun produit sauvegardé",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur smoke test",
        description: "Impossible de lancer le scraping",
        variant: "destructive",
      });
      console.error('Smoke test error:', error);
    } finally {
      setSmokeLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshLoading(true);
    try {
      // Refresh diagnostic data
      await runDiagnostic();
      
      // Force refresh of debug endpoints
      await Promise.all([
        supabase.functions.invoke('debug-health'),
        supabase.functions.invoke('debug-brands'),
        supabase.functions.invoke('debug-retailers'),
      ]);

      toast({
        title: "Données rafraîchies",
        description: "Tous les compteurs ont été mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur rafraîchissement",
        description: "Impossible de rafraîchir les données",
        variant: "destructive",
      });
    } finally {
      setRefreshLoading(false);
    }
  };

  const StatusIcon = ({ condition }: { condition: boolean }) => (
    condition ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          QuickStart - Configuration & Données
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
         {/* Action Buttons */}
         <div className="flex flex-wrap gap-2">
           <Button 
             onClick={runDiagnostic}
             disabled={diagnosticLoading}
             variant="outline"
           >
             {diagnosticLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Vérifier ma configuration
           </Button>
           
           <Button 
             onClick={runSmokeTest}
             disabled={smokeLoading}
             variant="default"
           >
             {smokeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Remplir la base (Smoke test)
           </Button>

           {/* Debug quick actions */}
           <Button 
             onClick={async () => {
               try {
                 const { data, error } = await supabase.functions.invoke('admin-scrape', { body: { retailer: 'carrefour', debug: true, headful: true } });
                 if (error) throw error;
                 toast({ title: 'Debug Carrefour', description: data.message || 'Terminé' });
               } catch (e) {
                 toast({ title: 'Erreur debug Carrefour', description: 'Impossible de lancer le debug', variant: 'destructive' });
               }
             }}
             variant="secondary"
           >
             Scraper (debug) Carrefour
           </Button>
           <Button 
             onClick={async () => {
               try {
                 const { data, error } = await supabase.functions.invoke('admin-scrape', { body: { retailer: 'auchan', debug: true, headful: true } });
                 if (error) throw error;
                 toast({ title: 'Debug Auchan', description: data.message || 'Terminé' });
               } catch (e) {
                 toast({ title: 'Erreur debug Auchan', description: 'Impossible de lancer le debug', variant: 'destructive' });
               }
             }}
             variant="secondary"
           >
             Scraper (debug) Auchan
           </Button>
           <Button 
             onClick={async () => {
               try {
                 const { data, error } = await supabase.functions.invoke('admin-scrape', { body: { retailer: 'leclerc', debug: true, headful: true } });
                 if (error) throw error;
                 toast({ title: 'Debug Leclerc', description: data.message || 'Terminé' });
               } catch (e) {
                 toast({ title: 'Erreur debug Leclerc', description: 'Impossible de lancer le debug', variant: 'destructive' });
               }
             }}
             variant="secondary"
           >
             Scraper (debug) Leclerc
           </Button>
           
           <Button 
             onClick={refreshData}
             disabled={refreshLoading}
             variant="ghost"
           >
             {refreshLoading ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
               <RefreshCw className="mr-2 h-4 w-4" />
             )}
             Rafraîchir l'UI
           </Button>
         </div>

        {/* Diagnostic Results */}
        {diagnosticResult && (
          <div className="space-y-3">
            <h4 className="font-semibold">Résultats du diagnostic :</h4>
            
            {/* Environment Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                <StatusIcon condition={diagnosticResult.env.has_url} />
                <span className="text-sm">URL Supabase</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon condition={diagnosticResult.env.has_anon_key} />
                <span className="text-sm">Clé anonyme</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon condition={diagnosticResult.env.has_service_role_key} />
                <span className="text-sm">Clé service</span>
              </div>
            </div>

            {/* Data Counts */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold">{diagnosticResult.details.retailers_count}</div>
                <div className="text-xs text-muted-foreground">Enseignes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{diagnosticResult.details.active_retailers_count}</div>
                <div className="text-xs text-muted-foreground">Actives</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{diagnosticResult.details.prices_count}</div>
                <div className="text-xs text-muted-foreground">Prix</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{diagnosticResult.details.history_90d_count}</div>
                <div className="text-xs text-muted-foreground">Historique 90j</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{diagnosticResult.details.distinct_brands_count}</div>
                <div className="text-xs text-muted-foreground">Marques</div>
              </div>
              <div className="text-center">
                <div className="text-xs">
                  {diagnosticResult.details.last_scraped_at ? 
                    new Date(diagnosticResult.details.last_scraped_at).toLocaleDateString() : 
                    'Jamais'
                  }
                </div>
                <div className="text-xs text-muted-foreground">Dernier scraping</div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant={diagnosticResult.ok ? "default" : "destructive"}>
                {diagnosticResult.ok ? "Configuration OK" : "Configuration incomplète"}
              </Badge>
            </div>

            {/* Errors */}
            {diagnosticResult.errors && diagnosticResult.errors.length > 0 && (
              <div className="space-y-1">
                <h5 className="font-medium text-red-600">Problèmes détectés :</h5>
                {diagnosticResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};