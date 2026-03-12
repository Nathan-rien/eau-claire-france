import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Droplet, AlertCircle, Users, Calendar as CalendarIcon, Shield, RefreshCw, Filter, X } from "lucide-react";
import AlertSubscriptionForm from "@/components/AlertSubscriptionForm";
import SEOHead from "@/components/SEOHead";
import { useWaterAlerts, groupAlertsByRegion } from "@/hooks/useWaterAlerts";
import { DataFreshnessIndicator } from "@/components/DataFreshnessIndicator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const { data, isLoading, error, refetch, isFetching } = useWaterAlerts();
  const queryClient = useQueryClient();
  
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const { alerts = [], lastUpdate = new Date(), source = 'mock' as const } = data || {};
  
  // Filtrer les alertes - MUST be before any early returns
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const alertDate = new Date(alert.date);
      
      // Filtre par date de début
      if (startDate && alertDate < startDate) {
        return false;
      }
      
      // Filtre par date de fin
      if (endDate && alertDate > endDate) {
        return false;
      }
      
      // Filtre par sévérité
      if (severityFilter !== "all" && alert.severity !== severityFilter) {
        return false;
      }
      
      return true;
    });
  }, [alerts, startDate, endDate, severityFilter]);

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

  const groupedAlerts = groupAlertsByRegion(filteredAlerts);

  return (
    <Layout>
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

        {/* Bannière explicative délai Hub'Eau */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5 mb-4">
          <svg className="h-5 w-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" /></svg>
          <p className="text-sm text-foreground">
            <span className="font-semibold">Données actualisées en temps réel depuis l'API Hub'Eau.</span>{" "}
            Les résultats d'analyses sont publiés par les laboratoires agréés avec un délai réglementaire de 4 à 8 semaines. Les dates affichées correspondent aux <span className="font-medium">dates de prélèvement sur le terrain</span> — il est normal que les échantillons les plus récents datent de fin décembre ou janvier.
          </p>
        </div>

        {/* Filtres */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Filtres</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtre date de début */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de début</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {startDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStartDate(undefined)}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Effacer
                  </Button>
                )}
              </div>

              {/* Filtre date de fin */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {endDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEndDate(undefined)}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Effacer
                  </Button>
                )}
              </div>

              {/* Filtre sévérité */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sévérité</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="high">Critique</SelectItem>
                    <SelectItem value="medium">Modérée</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                  </SelectContent>
                </Select>
                {severityFilter !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSeverityFilter("all")}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Effacer
                  </Button>
                )}
              </div>
            </div>

            {/* Indicateur de filtres actifs */}
            {(startDate || endDate || severityFilter !== "all") && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{filteredAlerts.length}</span>
                alerte{filteredAlerts.length > 1 ? 's' : ''} trouvée{filteredAlerts.length > 1 ? 's' : ''} sur {alerts.length}
              </div>
            )}
          </CardContent>
        </Card>

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
                    {filteredAlerts.filter(a => a.severity === 'high').length}
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
                    {filteredAlerts.filter(a => a.severity === 'medium').length}
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
                    {(filteredAlerts.reduce((sum, a) => sum + a.affectedPopulation, 0) / 1000).toFixed(0)}k
                  </p>
                </div>
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des alertes par région */}
        {Object.entries(groupedAlerts).length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Droplet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune alerte active en ce moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {Object.entries(groupedAlerts).map(([region, regionAlerts]) => (
              <Card key={region} className="overflow-hidden h-full">

                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">{region}</h3>
                    <Badge variant="secondary" className="text-sm">
                      {regionAlerts.length} alerte{regionAlerts.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {regionAlerts.map(alert => {
                    const SeverityIcon = getSeverityIcon(alert.severity);
                    return (
                      <div key={alert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Prélevé le</p>
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
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}
