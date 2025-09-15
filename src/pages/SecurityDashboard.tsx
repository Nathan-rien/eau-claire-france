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

  // Edge Functions configuration
  const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  const FN = (name: string) => `${EDGE_BASE}/${name}`;
  
  const getAdminToken = () => {
    return localStorage.getItem('admin-token') || 'your-admin-token-here';
  };

  const [networkDiagnostics, setNetworkDiagnostics] = useState<any>({});
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [proxyFallback, setProxyFallback] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const callSecurityEndpoint = async (endpoint: string, actionName: string) => {
    setLoading(true);
    setAuthError('');
    setErrorDetails(null);
    
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

  const callEdgeFunctionDirect = async (functionName: string, payload = {}) => {
    setErrorDetails(null);
    setProxyFallback(false);

    if (!import.meta.env.VITE_SUPABASE_URL) {
      setErrorDetails({
        type: 'config',
        message: 'VITE_SUPABASE_URL manquant (front)',
        url: 'N/A',
        method: 'N/A'
      });
      return null;
    }

    const url = FN(functionName);
    const headers = {
      'Content-Type': 'application/json',
      'X-Admin-Token': getAdminToken(),
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000)
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorDetails({
          type: 'api',
          status: response.status,
          code: data.code,
          message: data.message,
          hint: data.hint,
          url,
          method: 'POST',
          headers: Object.keys(headers).reduce((acc, key) => ({
            ...acc,
            [key]: key.includes('Token') || key.includes('Authorization') ? '***masked***' : headers[key]
          }), {})
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Direct fetch error:', error);
      
      // Try proxy fallback
      try {
        const proxyResponse = await fetch(`/api/admin/security/proxy?fn=${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': getAdminToken()
          },
          body: JSON.stringify(payload)
        });

        if (proxyResponse.ok) {
          const proxyData = await proxyResponse.json();
          setProxyFallback(true);
          return { ...proxyData, via: 'proxy' };
        }
      } catch (proxyError) {
        console.error('Proxy fallback failed:', proxyError);
      }

      setErrorDetails({
        type: 'network',
        message: error.name === 'TimeoutError' ? 'Timeout (8s)' : 'Impossible de joindre l\'Edge Function',
        details: error.message,
        url,
        method: 'POST',
        origin: window.location.origin,
        protocol: window.location.protocol,
        mixedContent: url.startsWith('http://') && window.location.protocol === 'https:',
        headers: Object.keys(headers).reduce((acc, key) => ({
          ...acc,
          [key]: key.includes('Token') || key.includes('Authorization') ? '***masked***' : headers[key]
        }), {})
      });
      return null;
    }
  };

  const loadEnvStatus = async () => {
    const result = await callEdgeFunctionDirect('admin-security-env-status');
    if (result?.envStatus) {
      setEnvStatus(result.envStatus);
      setFlags(result.flags || {});
      setEnvContent(result.envContent || '');
    }
  };

  const pingEdgeFunction = async () => {
    const startTime = Date.now();
    const result = await callEdgeFunctionDirect('admin-security-ping');
    const latency = Date.now() - startTime;
    
    setNetworkDiagnostics(prev => ({
      ...prev,
      ping: {
        ok: !!result,
        latency: result ? latency : null,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const testCORS = async () => {
    const result = await callEdgeFunctionDirect('admin-security-cors-test');
    setNetworkDiagnostics(prev => ({
      ...prev,
      cors: {
        result,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const showRequestDetails = () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      alert('VITE_SUPABASE_URL non configuré');
      return;
    }

    const details = {
      url: FN('admin-security-env-status'),
      method: 'POST',
      origin: window.location.origin,
      protocol: window.location.protocol,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': '***masked***',
        'Authorization': 'Bearer ***masked***'
      },
      payload: {}
    };

    alert(`Détails de la requête:\n${JSON.stringify(details, null, 2)}`);
  };

  const loadInitialData = async () => {
    await loadEnvStatus();
  };

  const copyEnvContent = async () => {
    if (envContent) {
      await navigator.clipboard.writeText(envContent);
      toast.success('Contenu .env copié dans le presse-papier');
    } else {
      const result = await callEdgeFunctionDirect('admin-security-env-sample');
      if (result?.envSample) {
        await navigator.clipboard.writeText(result.envSample);
        toast.success('Exemple .env copié dans le presse-papier');
      }
    }
  };

  const runRLSCheck = async () => {
    const result = await callSecurityEndpoint('admin-security-rls', 'Vérification RLS');
    setChecks(prev => ({ ...prev, rls: result }));
  };

  const runHardeningCheck = async () => {
    const result = await callSecurityEndpoint('admin-security-hardening', 'Vérification Hardening');
    setChecks(prev => ({ ...prev, hardening: result }));
  };

  const runDiagnostic = async () => {
    const result = await callSecurityEndpoint('admin-security-diagnostic', 'Diagnostic ENV');
    setChecks(prev => ({ ...prev, diagnostic: result }));
  };

  const runSmokeTest = async () => {
    const result = await callSecurityEndpoint('admin-security-smoke', 'Security Smoke Test');
    setChecks(prev => ({ ...prev, smoke: result }));
  };

  const getSecurityAlerts = async () => {
    const result = await callSecurityEndpoint('admin-security-alerts', 'Alertes de sécurité');
    setChecks(prev => ({ ...prev, alerts: result }));
  };

  const cleanSecurity = async () => {
    const result = await callSecurityEndpoint('admin-security-clean', 'Nettoyage sécurité');
    setChecks(prev => ({ ...prev, clean: result }));
  };

  const enableCron = async () => {
    const result = await callSecurityEndpoint('admin-security-cron-enable', 'Activation CRON');
    setChecks(prev => ({ ...prev, cronStatus: result }));
  };

  const disableCron = async () => {
    const result = await callSecurityEndpoint('admin-security-cron-disable', 'Désactivation CRON');
    setChecks(prev => ({ ...prev, cronStatus: result }));
  };

  const isAllChecksPassed = () => {
    return checks.rls?.ok && checks.hardening?.ok && checks.diagnostic?.ok && checks.smoke?.ok;
  };

  const getStatusBadge = (check: SecurityCheckResult | null) => {
    if (!check) return <Badge variant="outline">Non testé</Badge>;
    return (
      <Badge variant={check.ok ? "default" : "destructive"}>
        {check.ok ? '✅ PASS' : '❌ FAIL'}
      </Badge>
    );
  };

  const getOverallStatus = () => {
    const passedChecks = Object.values(checks).filter(check => check?.ok).length;
    const totalChecks = Object.values(checks).filter(check => check !== null).length;
    
    if (totalChecks === 0) return { status: 'UNKNOWN', color: 'text-gray-500' };
    if (passedChecks === totalChecks) return { status: 'SECURE', color: 'text-green-600' };
    if (passedChecks > totalChecks / 2) return { status: 'WARNING', color: 'text-orange-500' };
    return { status: 'CRITICAL', color: 'text-red-600' };
  };

  const overallStatus = getOverallStatus();

  return (
    <Layout>
      <Helmet>
        <title>Security Dashboard - InfoEau Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Auth Error Banner */}
        {authError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Accès Admin Requis</div>
              <p className="text-sm">{authError}</p>
              <Button 
                onClick={() => setShowEnvDialog(true)} 
                size="sm" 
                className="mt-2"
              >
                Voir configuration ENV
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-500" />
              Security Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Tableau de bord de sécurité et monitoring administrateur
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={`${overallStatus.color} text-lg px-4 py-2`}>
              Status: {overallStatus.status}
            </Badge>
            <Button 
              onClick={loadInitialData}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        <Tabs defaultValue="environment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="environment">ENV Helper</TabsTrigger>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="checks">Vérifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    RLS Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getStatusBadge(checks.rls)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Hardening
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getStatusBadge(checks.hardening)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Diagnostic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getStatusBadge(checks.diagnostic)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Smoke Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getStatusBadge(checks.smoke)}
                </CardContent>
              </Card>
            </div>

            {/* CRON Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Statut CRON
                  {isAllChecksPassed() ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                </CardTitle>
                <CardDescription>
                  Activation automatique des tâches de maintenance
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
                  <Button onClick={showRequestDetails} variant="outline" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    Tester appel
                  </Button>
                </div>

                {/* Network Diagnostics */}
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Diagnostics Réseau
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">VITE_SUPABASE_URL</span>
                        {import.meta.env.VITE_SUPABASE_URL ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> : 
                          <XCircle className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {import.meta.env.VITE_SUPABASE_URL || 'Non défini'}
                      </p>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Protocole</span>
                        {window.location.protocol === 'https:' ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> : 
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {window.location.protocol}
                      </p>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Mixed Content</span>
                        {import.meta.env.VITE_SUPABASE_URL?.startsWith('http://') && window.location.protocol === 'https:' ? 
                          <XCircle className="h-4 w-4 text-red-600" /> : 
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {import.meta.env.VITE_SUPABASE_URL?.startsWith('http://') && window.location.protocol === 'https:' ? 
                          'Bloqué' : 'OK'
                        }
                      </p>
                    </Card>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={pingEdgeFunction} variant="outline" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Ping Edge
                    </Button>
                    <Button onClick={testCORS} variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Tester CORS
                    </Button>
                    {proxyFallback && (
                      <Badge variant="secondary" className="ml-auto">
                        via proxy
                      </Badge>
                    )}
                  </div>

                  {/* Network Results */}
                  {networkDiagnostics.ping && (
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Ping Edge:</strong> {networkDiagnostics.ping.ok ? 
                          `✅ OK (${networkDiagnostics.ping.latency}ms)` : 
                          '❌ Échec'
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  {networkDiagnostics.cors?.result && (
                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        <strong>CORS Test:</strong> {networkDiagnostics.cors.result.isAllowed ? 
                          `✅ PASS - Origine ${networkDiagnostics.cors.result.origin} autorisée` : 
                          `❌ FAIL - Origine ${networkDiagnostics.cors.result.origin} NON autorisée`
                        }
                        {networkDiagnostics.cors.result.allowedOrigins?.length > 0 && (
                          <div className="mt-1 text-sm">
                            Origines autorisées: {networkDiagnostics.cors.result.allowedOrigins.join(', ')}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Error Details */}
                {errorDetails && (
                  <Alert variant={errorDetails.code === 'ADMIN_TOKEN_MISSING' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div><strong>Erreur:</strong> {errorDetails.message}</div>
                        {errorDetails.code && <div><strong>Code:</strong> {errorDetails.code}</div>}
                        {errorDetails.hint && <div><strong>Solution:</strong> {errorDetails.hint}</div>}
                        {errorDetails.type === 'network' && (
                          <div className="text-sm mt-2">
                            <div><strong>URL:</strong> {errorDetails.url}</div>
                            <div><strong>Origin:</strong> {errorDetails.origin}</div>
                            {errorDetails.mixedContent && (
                              <div className="text-red-600"><strong>⚠️ Mixed Content détecté</strong></div>
                            )}
                          </div>
                        )}
                        {errorDetails.code === 'ADMIN_TOKEN_MISSING' && (
                          <Button onClick={() => setShowEnvDialog(true)} size="sm" className="mt-2">
                            Copier .env
                          </Button>
                        )}
                        {errorDetails.code === 'IP_NOT_ALLOWED' && (
                          <div className="text-sm mt-1">
                            IPs autorisées: {envStatus.find(e => e.name === 'ADMIN_IP_ALLOWLIST')?.value || 'non défini'}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
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
                    Vérifier les politiques Row Level Security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(checks.rls)}
                    <Button onClick={runRLSCheck} disabled={loading} size="sm">
                      Exécuter
                    </Button>
                  </div>
                  {checks.rls && (
                    <p className="text-sm text-muted-foreground">
                      {checks.rls.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Hardening Check
                  </CardTitle>
                  <CardDescription>
                    Vérifications de durcissement sécuritaire
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(checks.hardening)}
                    <Button onClick={runHardeningCheck} disabled={loading} size="sm">
                      Exécuter
                    </Button>
                  </div>
                  {checks.hardening && (
                    <p className="text-sm text-muted-foreground">
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
                    Diagnostic des variables d'environnement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(checks.diagnostic)}
                    <Button onClick={runDiagnostic} disabled={loading} size="sm">
                      Exécuter
                    </Button>
                  </div>
                  {checks.diagnostic && (
                    <p className="text-sm text-muted-foreground">
                      {checks.diagnostic.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Security Smoke Test
                  </CardTitle>
                  <CardDescription>
                    Test complet de sécurité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(checks.smoke)}
                    <Button onClick={runSmokeTest} disabled={loading} size="sm">
                      Exécuter
                    </Button>
                  </div>
                  {checks.smoke && (
                    <p className="text-sm text-muted-foreground">
                      {checks.smoke.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Alertes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={getSecurityAlerts} disabled={loading} size="sm" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Voir Alertes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nettoyage</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={cleanSecurity} disabled={loading} size="sm" className="w-full" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Nettoyer
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">CRON</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={enableCron} 
                    disabled={loading || !isAllChecksPassed()} 
                    size="sm" 
                    className="w-full"
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Activer
                  </Button>
                  <Button onClick={disableCron} disabled={loading} size="sm" variant="outline" className="w-full">
                    <PowerOff className="h-4 w-4 mr-2" />
                    Désactiver
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ENV Sample Dialog */}
        <Dialog open={showEnvDialog} onOpenChange={setShowEnvDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Configuration .env</DialogTitle>
              <DialogDescription>
                Exemple de fichier .env avec les variables requises
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-96">
              <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                {envSample || envContent}
              </pre>
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button onClick={() => copyEnvContent()} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SecurityDashboard;