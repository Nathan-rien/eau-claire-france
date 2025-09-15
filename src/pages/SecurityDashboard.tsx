import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw, Download, Eye, Settings, Clock, Database, Copy, Globe, Server, Zap, Info, Power, PowerOff, Activity } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface SecurityCheckResult {
  ok: boolean;
  message: string;
  details?: any;
  timestamp?: string;
}

interface EnvStatus {
  name: string;
  value?: string;
  maskedValue?: string;
  isDefined: boolean;
  isRequired: boolean;
}

interface SecurityChecks {
  rls: SecurityCheckResult | null;
  hardening: SecurityCheckResult | null;
  diagnostic: SecurityCheckResult | null;
  smoke: SecurityCheckResult | null;
  alerts: SecurityCheckResult | null;
  envSample: SecurityCheckResult | null;
  clean: SecurityCheckResult | null;
  cronStatus: SecurityCheckResult | null;
  envStatus: SecurityCheckResult | null;
  corsTest: SecurityCheckResult | null;
}

const SecurityDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState<SecurityChecks>({
    rls: null,
    hardening: null,
    diagnostic: null,
    smoke: null,
    alerts: null,
    envSample: null,
    clean: null,
    cronStatus: null,
    envStatus: null,
    corsTest: null,
  });
  const [envSample, setEnvSample] = useState<string>('');
  const [showEnvDialog, setShowEnvDialog] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>([]);
  const [flags, setFlags] = useState<any>({});
  const [envContent, setEnvContent] = useState<string>('');
  const [showEnvStatusDialog, setShowEnvStatusDialog] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const callSecurityEndpoint = async (endpoint: string, actionName: string) => {
    setLoading(true);
    setAuthError('');
    
    try {
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {}
      });

      if (error) {
        // Check for authentication errors
        if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
          setAuthError('Accès admin requis — définissez ADMIN_DASHBOARD_TOKEN côté serveur et envoyez l\'entête X-Admin-Token.');
          toast.error('Accès non autorisé - Token admin requis');
          return null;
        }
        
        toast.error(`Erreur ${actionName}: ${error.message}`);
        return null;
      }

      toast.success(`${actionName} terminé avec succès`);
      return data;
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      
      // Check for network/auth errors
      if (error.message?.includes('401') || error.message?.includes('403')) {
        setAuthError('Accès admin requis — définissez ADMIN_DASHBOARD_TOKEN côté serveur et envoyez l\'entête X-Admin-Token.');
        toast.error('Accès non autorisé - Token admin requis');
      } else {
        toast.error(`Erreur ${actionName}: ${error.message}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    // Try to load diagnostic to check auth status
    const diagnosticResult = await callSecurityEndpoint('admin-security-diagnostic', 'Diagnostic initial');
    if (diagnosticResult) {
      setChecks(prev => ({ ...prev, diagnostic: diagnosticResult }));
    }
    
    // Load environment status
    await loadEnvStatus();
  };

  const loadEnvStatus = async () => {
    const result = await callSecurityEndpoint('admin-security-env-status', 'Status ENV');
    if (result) {
      setChecks(prev => ({ ...prev, envStatus: result }));
      setEnvStatus(result.envStatus || []);
      setFlags(result.flags || {});
      setEnvContent(result.envContent || '');
    }
  };

  const runRLSCheck = async () => {
    const result = await callSecurityEndpoint('admin-security-rls', 'Vérification RLS');
    if (result) {
      setChecks(prev => ({ ...prev, rls: result }));
    }
  };

  const runHardeningCheck = async () => {
    const result = await callSecurityEndpoint('admin-security-hardening', 'Vérification Hardening');
    if (result) {
      setChecks(prev => ({ ...prev, hardening: result }));
    }
  };

  const runDiagnostic = async () => {
    const result = await callSecurityEndpoint('admin-security-diagnostic', 'Diagnostic Environnement');
    if (result) {
      setChecks(prev => ({ ...prev, diagnostic: result }));
    }
  };

  const runSecuritySmoke = async () => {
    const result = await callSecurityEndpoint('admin-security-smoke', 'Security Smoke Test');
    if (result) {
      setChecks(prev => ({ ...prev, smoke: result }));
      // Refresh other checks if smoke test passed
      if (result.ok) {
        await Promise.all([
          runRLSCheck(),
          runHardeningCheck(),
          runDiagnostic()
        ]);
      }
    }
  };

  const runCleanup = async () => {
    const result = await callSecurityEndpoint('admin-security-clean', 'Nettoyage');
    if (result) {
      setChecks(prev => ({ ...prev, clean: result }));
    }
  };

  const checkAlerts = async () => {
    const result = await callSecurityEndpoint('admin-security-alerts', 'Vérification Alertes');
    if (result) {
      setChecks(prev => ({ ...prev, alerts: result }));
    }
  };

  const loadEnvSample = async () => {
    const result = await callSecurityEndpoint('admin-security-env-sample', 'Chargement ENV Sample');
    if (result && result.content) {
      setEnvSample(result.content);
      setShowEnvDialog(true);
    }
  };

  const enableCron = async () => {
    const result = await callSecurityEndpoint('admin-security-cron-enable', 'Activation CRON');
    if (result) {
      setChecks(prev => ({ ...prev, cronStatus: result }));
    }
  };

  const disableCron = async () => {
    const result = await callSecurityEndpoint('admin-security-cron-disable', 'Désactivation CRON');
    if (result) {
      setChecks(prev => ({ ...prev, cronStatus: result }));
      await updateSecurityReport();
    }
  };

  const testCors = async () => {
    const result = await callSecurityEndpoint('admin-security-cors-test', 'Test CORS');
    if (result) {
      setChecks(prev => ({ ...prev, corsTest: result }));
    }
  };

  const updateSecurityReport = async () => {
    // This would call a function to update RAPPORT_SÉCURITÉ.md
    console.log('Updating security report...');
  };

  const copyEnvContent = () => {
    navigator.clipboard.writeText(envContent);
    toast.success('Contenu .env copié dans le presse-papier');
  };

  const isAllChecksPassed = () => {
    return checks.rls?.ok && 
           checks.hardening?.ok && 
           checks.diagnostic?.ok && 
           checks.smoke?.ok;
  };

  const getStatusBadge = (check: SecurityCheckResult | null) => {
    if (!check) return <Badge variant="outline">Non testé</Badge>;
    if (check.ok) return <Badge variant="default" className="bg-green-600">✅ PASS</Badge>;
    return <Badge variant="destructive">❌ FAIL</Badge>;
  };

  const getStatusIcon = (check: SecurityCheckResult | null) => {
    if (!check) return <Clock className="h-4 w-4 text-muted-foreground" />;
    return check.ok ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Layout>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <title>Security Dashboard - InfoEau Admin</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Security Dashboard
              </h1>
              <p className="text-muted-foreground">
                Tableau de bord de sécurité InfoEau - Contrôles et surveillance
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runSecuritySmoke} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Security Smoke Test
              </Button>
              <Dialog open={showEnvDialog} onOpenChange={setShowEnvDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={loadEnvSample}>
                    <Download className="h-4 w-4 mr-2" />
                    Copier .env
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Configuration Environnement</DialogTitle>
                    <DialogDescription>
                      Copiez ce contenu dans votre fichier .env
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh]">
                    <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
                      {envSample}
                    </pre>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Auth Error Alert */}
        {authError && (
          <Alert className="mb-6 border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{authError}</span>
              <Button variant="outline" size="sm" onClick={() => setShowEnvDialog(true)}>
                Voir ENV_SAMPLE.md
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="environment">ENV Helper</TabsTrigger>
            <TabsTrigger value="checks">Tests détaillés</TabsTrigger>
            <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">RLS Policies</CardTitle>
                  {getStatusIcon(checks.rls)}
                </CardHeader>
                <CardContent>
                  {getStatusBadge(checks.rls)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {checks.rls?.message || 'Vérification des politiques de sécurité'}
                  </p>
                   {checks.rls && !checks.rls.ok && (checks.rls as any).hint && (
                     <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                       <p><strong>Code:</strong> {(checks.rls as any).code}</p>
                       <p><strong>Conseil:</strong> {(checks.rls as any).hint}</p>
                     </div>
                   )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Hardening</CardTitle>
                  {getStatusIcon(checks.hardening)}
                </CardHeader>
                <CardContent>
                  {getStatusBadge(checks.hardening)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {checks.hardening?.message || 'Durcissement de sécurité'}
                  </p>
                   {checks.hardening && !checks.hardening.ok && (checks.hardening as any).hint && (
                     <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                       <p><strong>Code:</strong> {(checks.hardening as any).code}</p>
                       <p><strong>Conseil:</strong> {(checks.hardening as any).hint}</p>
                     </div>
                   )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Environment</CardTitle>
                  {getStatusIcon(checks.diagnostic)}
                </CardHeader>
                <CardContent>
                  {getStatusBadge(checks.diagnostic)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {checks.diagnostic?.message || 'Configuration environnement'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CRON Status</CardTitle>
                  {getStatusIcon(checks.cronStatus)}
                </CardHeader>
                <CardContent>
                  {getStatusBadge(checks.cronStatus)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {checks.cronStatus?.message || 'Statut du scheduler'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Global Smoke Test Result */}
            {checks.smoke && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Smoke Test
                  </CardTitle>
                  <CardDescription>
                    Test de fumée global - Statut de sécurité général
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(checks.smoke)}
                      <div>
                        <p className="font-medium">{checks.smoke.message}</p>
                        <p className="text-sm text-muted-foreground">
                          Dernière vérification: {checks.smoke.timestamp || 'Maintenant'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(checks.smoke)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CORS Test & CRON Activation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Test CORS
                  </CardTitle>
                  <CardDescription>
                    Vérifie que l'origine courante est autorisée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(checks.corsTest)}
                    <Button onClick={testCors} disabled={loading} size="sm">
                      Tester CORS
                    </Button>
                  </div>
                  {checks.corsTest && (
                    <p className="text-sm text-muted-foreground">
                      {checks.corsTest.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Activation CRON
                  </CardTitle>
                  <CardDescription>
                    Active le scheduler automatique (nécessite tous les checks PASS)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(checks.cronStatus)}
                    <Button 
                      onClick={enableCron} 
                      disabled={loading || !isAllChecksPassed()} 
                      size="sm"
                      className={!isAllChecksPassed() ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      Activer CRON
                    </Button>
                  </div>
                  {!isAllChecksPassed() && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Tous les checks (RLS, Hardening, Diagnostic, Smoke) doivent être PASS avant d'activer le CRON.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="environment" className="space-y-6">
            {/* ENV Helper */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Variables d'Environnement
                </CardTitle>
                <CardDescription>
                  État des variables critiques pour la sécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {envStatus.map((env) => (
                    <div key={env.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {env.isDefined ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> : 
                          <XCircle className="h-4 w-4 text-red-600" />
                        }
                        <div>
                          <p className="font-medium">{env.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {env.maskedValue || env.value || 'Non défini'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={env.isDefined ? 'default' : 'destructive'}>
                        {env.isDefined ? '✅ Défini' : '❌ Manquant'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Feature Flags
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(flags).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{key}</span>
                        <Badge variant={value ? 'default' : 'secondary'}>
                          {value ? 'ON' : 'OFF'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={copyEnvContent} className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copier .env complet
                  </Button>
                  <Button onClick={loadEnvStatus} variant="outline" disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checks" className="space-y-6">
            {/* Individual Check Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Vérification RLS
                  </CardTitle>
                  <CardDescription>
                    Teste les politiques Row Level Security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(checks.rls)}
                    <Button onClick={runRLSCheck} disabled={loading} size="sm">
                      Vérifier RLS
                    </Button>
                  </div>
                  {checks.rls && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {checks.rls.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Vérification Hardening
                  </CardTitle>
                  <CardDescription>
                    Contrôle la configuration de sécurité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(checks.hardening)}
                    <Button onClick={runHardeningCheck} disabled={loading} size="sm">
                      Vérifier Hardening
                    </Button>
                  </div>
                  {checks.hardening && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {checks.hardening.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Diagnostic ENV
                  </CardTitle>
                  <CardDescription>
                    Vérifie les variables d'environnement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(checks.diagnostic)}
                    <Button onClick={runDiagnostic} disabled={loading} size="sm">
                      Diagnostic
                    </Button>
                  </div>
                  {checks.diagnostic && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {checks.diagnostic.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Nettoyage
                  </CardTitle>
                  <CardDescription>
                    Supprime les artefacts de debug
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(checks.clean)}
                    <Button onClick={runCleanup} disabled={loading} size="sm" variant="outline">
                      Nettoyer
                    </Button>
                  </div>
                  {checks.clean && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {checks.clean.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* CRON Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Contrôle CRON
                </CardTitle>
                <CardDescription>
                  Activation/désactivation du scheduler automatique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(checks.cronStatus)}
                  <div className="flex gap-2">
                    <Button onClick={disableCron} disabled={loading} size="sm" variant="outline">
                      Désactiver
                    </Button>
                    <Button onClick={enableCron} disabled={loading} size="sm">
                      Activer
                    </Button>
                  </div>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Le CRON ne peut être activé que si tous les tests de sécurité sont PASS.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            {/* Alerts Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Surveillance Alertes
                </CardTitle>
                <CardDescription>
                  Monitoring des événements de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(checks.alerts)}
                  <Button onClick={checkAlerts} disabled={loading} size="sm">
                    Vérifier Alertes
                  </Button>
                </div>
                {checks.alerts?.details && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Webhook: {checks.alerts.details.webhookEnabled ? '✅ Activé' : '❌ Désactivé'}
                    </p>
                    {checks.alerts.details.alerts && checks.alerts.details.alerts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Alertes récentes:</p>
                        {checks.alerts.details.alerts.map((alert: any, index: number) => (
                          <div key={index} className="p-2 bg-muted rounded text-sm">
                            <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                              {alert.severity}
                            </Badge>
                            <span className="ml-2">{alert.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SecurityDashboard;