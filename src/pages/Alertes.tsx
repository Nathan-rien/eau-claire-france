import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Droplet, AlertCircle, Users, Calendar, Shield, RefreshCw } from "lucide-react";
import AlertSubscriptionForm from "@/components/AlertSubscriptionForm";
import SEOHead from "@/components/SEOHead";
import { useWaterAlerts, groupAlertsByRegion } from "@/hooks/useWaterAlerts";
import { DataFreshnessIndicator } from "@/components/DataFreshnessIndicator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'bg-destructive text-destructive-foreground';
    case 'medium': return 'bg-orange-500 text-white';
    case 'low': return 'bg-blue-500 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high': return AlertTriangle;
    case 'medium': return AlertCircle;
    case 'low': return Droplet;
    default: return AlertCircle;
  }
};

export default function Alertes() {
  const { data, isLoading, error, refetch, isFetching } = useWaterAlerts();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    toast.info("Actualisation des données en cours...");
    await queryClient.invalidateQueries({ queryKey: ['waterAlerts'] });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <SEOHead 
          title="Alertes qualité de l'eau - InfoEau"
          description="Suivez les alertes sanitaires concernant la qualité de l'eau potable en France"
          canonical="https://infoeau.fr/alertes"
        />
        <div className="container mx-auto px-4 py-12 space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <SEOHead 
          title="Alertes qualité de l'eau - InfoEau"
          description="Suivez les alertes sanitaires concernant la qualité de l'eau potable en France"
          canonical="https://infoeau.fr/alertes"
        />
        <div className="container mx-auto px-4 py-12">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Erreur lors du chargement des alertes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { alerts, lastUpdate, source } = data || { alerts: [], lastUpdate: new Date(), source: 'mock' as const };
  const groupedAlerts = groupAlertsByRegion(alerts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <SEOHead 
        title="Alertes qualité de l'eau - InfoEau"
        description="Suivez en temps réel les alertes sanitaires concernant la qualité de l'eau potable en France. Informations officielles de l'API Hub'Eau."
        canonical="https://infoeau.fr/alertes"
      />

      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Alertes en cours</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Alertes Qualité de l'Eau
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Suivez en temps réel les alertes sanitaires concernant la qualité de l'eau potable
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <DataFreshnessIndicator lastUpdate={lastUpdate} source={source} />
          <Button 
            onClick={handleRefresh} 
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Formulaire d'abonnement */}
        <AlertSubscriptionForm />

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alertes critiques</p>
                  <p className="text-3xl font-bold text-destructive">
                    {alerts.filter(a => a.severity === 'high').length}
                  </p>
                </div>
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alertes modérées</p>
                  <p className="text-3xl font-bold text-orange-500">
                    {alerts.filter(a => a.severity === 'medium').length}
                  </p>
                </div>
                <AlertCircle className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Population affectée</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {(alerts.reduce((sum, a) => sum + a.affectedPopulation, 0) / 1000).toFixed(0)}k
                  </p>
                </div>
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des alertes par région */}
        <div className="space-y-8">
          {Object.entries(groupedAlerts).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Droplet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune alerte active en ce moment</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedAlerts).map(([region, regionAlerts]) => (
              <div key={region}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold">{region}</h2>
                  <Badge variant="secondary">
                    {regionAlerts.length} alerte{regionAlerts.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {regionAlerts.map(alert => {
                    const SeverityIcon = getSeverityIcon(alert.severity);
                    return (
                      <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <SeverityIcon className="h-5 w-5 mt-1" />
                                <div>
                                  <h3 className="font-semibold text-lg">{alert.city}</h3>
                                  <p className="text-sm text-muted-foreground">{alert.type}</p>
                                </div>
                              </div>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity === 'high' ? 'Critique' : alert.severity === 'medium' ? 'Modérée' : 'Faible'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">Date</p>
                                  <p className="font-medium">{new Date(alert.date).toLocaleDateString('fr-FR')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">Population affectée</p>
                                  <p className="font-medium">{alert.affectedPopulation.toLocaleString('fr-FR')}</p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 p-3 bg-muted/50 rounded-md">
                              <div className="flex items-start gap-2">
                                <Shield className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium mb-1">Mesures prises :</p>
                                  <p className="text-sm text-muted-foreground">{alert.measures}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
