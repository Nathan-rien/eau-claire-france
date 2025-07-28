import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { EnhancedSecurityService } from '@/services/enhancedSecurityService';
import { AuditService } from '@/services/auditService';
import Layout from '@/components/Layout';

interface SecurityReport {
  cspStatus: boolean;
  sessionValid: boolean;
  dataIntegrity: { valid: number; corrupted: number; keys: string[] };
  auditSummary: {
    totalEvents: number;
    criticalEvents: number;
    recentEvents: number;
    suspiciousActivity: boolean;
  };
  recommendations: string[];
  sessionIssues: string[];
}

const SecurityDashboard = () => {
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const rawReport = await EnhancedSecurityService.generateSecurityReport();
      const logs = AuditService.getLocalLogs().slice(-10); // Last 10 events
      
      // Transform the report to match our interface
      const report: SecurityReport = {
        cspStatus: rawReport.csp,
        sessionValid: rawReport.session.isValid,
        sessionIssues: rawReport.session.issues,
        dataIntegrity: rawReport.dataIntegrity,
        auditSummary: rawReport.auditSummary,
        recommendations: rawReport.recommendations
      };
      
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
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? CheckCircle : XCircle;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Generating security report...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!securityReport) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to generate security report. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Security Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage your application's security posture
            </p>
          </div>
          <Button onClick={generateReport} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Report
          </Button>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CSP Status</CardTitle>
              {React.createElement(getStatusIcon(securityReport.cspStatus), {
                className: `h-4 w-4 ${securityReport.cspStatus ? 'text-green-600' : 'text-red-600'}`
              })}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {securityReport.cspStatus ? 'Active' : 'Inactive'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Session</CardTitle>
              {React.createElement(getStatusIcon(securityReport.sessionValid), {
                className: `h-4 w-4 ${securityReport.sessionValid ? 'text-green-600' : 'text-red-600'}`
              })}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {securityReport.sessionValid ? 'Valid' : 'Issues'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Integrity</CardTitle>
              {React.createElement(getStatusIcon(securityReport.dataIntegrity.corrupted === 0), {
                className: `h-4 w-4 ${securityReport.dataIntegrity.corrupted === 0 ? 'text-green-600' : 'text-red-600'}`
              })}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {securityReport.dataIntegrity.valid}/{securityReport.dataIntegrity.valid + securityReport.dataIntegrity.corrupted}
              </div>
              <p className="text-xs text-muted-foreground">
                Valid entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${securityReport.auditSummary.criticalEvents > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {securityReport.auditSummary.totalEvents}
              </div>
              <p className="text-xs text-muted-foreground">
                {securityReport.auditSummary.criticalEvents} critical
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Recommendations */}
        {securityReport.recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Suggested improvements to enhance your security posture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {securityReport.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Session Issues */}
        {securityReport.sessionIssues.length > 0 && (
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Session Issues Detected:</strong>
              <ul className="mt-2 space-y-1">
                {securityReport.sessionIssues.map((issue, index) => (
                  <li key={index} className="text-sm">• {issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Logs</CardTitle>
            <CardDescription>
              Latest security events and system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No audit logs available
              </p>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <span className="font-medium text-sm">{log.action}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1 capitalize">{log.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SecurityDashboard;