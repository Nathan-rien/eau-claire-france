// Security dashboard for monitoring and alerts
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { EnhancedSecurityService } from '@/services/enhancedSecurityService';
import { AuditService } from '@/services/auditService';

const SecurityDashboard = () => {
  const [securityReport, setSecurityReport] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const report = EnhancedSecurityService.generateSecurityReport();
      const logs = AuditService.getLocalLogs().slice(-10); // Last 10 events
      
      setSecurityReport(report);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to generate security report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Génération du rapport de sécurité...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Tableau de bord sécurité</h2>
        </div>
        <Button onClick={generateReport} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CSP Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            {getStatusIcon(securityReport?.csp)}
            <span className="text-sm">
              {securityReport?.csp ? 'Activé' : 'Désactivé'}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Session</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            {getStatusIcon(securityReport?.session?.isValid)}
            <span className="text-sm">
              {securityReport?.session?.isValid ? 'Valide' : 'Problème'}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Intégrité données</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="text-green-600">{securityReport?.dataIntegrity?.valid} OK</div>
              <div className="text-red-600">{securityReport?.dataIntegrity?.corrupted} Corrompus</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Événements audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>Total: {securityReport?.auditSummary?.totalEvents}</div>
              <div className="text-red-600">Critiques: {securityReport?.auditSummary?.criticalEvents}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {securityReport?.recommendations?.length > 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Recommandations de sécurité:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {securityReport.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Session Issues */}
      {!securityReport?.session?.isValid && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Problèmes de session détectés:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {securityReport.session.issues.map((issue: string, index: number) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Journaux d'audit récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun événement d'audit enregistré</p>
            ) : (
              auditLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getSeverityColor(log.severity)} text-white text-xs`}>
                      {log.severity}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium">{log.action}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {log.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;