// Enhanced audit logging service for security monitoring
export interface AuditEvent {
  type: 'auth' | 'data' | 'security' | 'error';
  action: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: number;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AuditService {
  private static readonly MAX_LOGS = 1000;
  private static readonly STORAGE_KEY = 'audit_logs';

  // Log security events with enhanced context
  static logEvent(event: Omit<AuditEvent, 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      // Note: IP is handled server-side for security
    };

    // Store locally for immediate access (development)
    if (process.env.NODE_ENV === 'development') {
      this.storeLocalEvent(auditEvent);
    }

    // Send to secure audit service
    this.sendToAuditService(auditEvent);
  }

  // Store events locally with rotation
  private static storeLocalEvent(event: AuditEvent): void {
    try {
      const logs = this.getLocalLogs();
      logs.push(event);
      
      // Rotate logs if too many
      if (logs.length > this.MAX_LOGS) {
        logs.splice(0, logs.length - this.MAX_LOGS);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to store audit log locally:', error);
    }
  }

  // Get local audit logs (for development/dashboard)
  static getLocalLogs(): AuditEvent[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.warn('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  // Send to secure audit service (server-side)
  private static async sendToAuditService(event: AuditEvent): Promise<void> {
    try {
      // Only send critical events to server in production
      if (event.severity === 'critical' || event.severity === 'high') {
        // Use Supabase edge function for secure logging
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.functions.invoke('audit-log', {
          body: { event }
        });
      }
    } catch (error) {
      // Silent fail for audit logging to not break user experience
      console.warn('Audit logging failed:', error);
    }
  }

  // Clear old logs
  static clearOldLogs(daysOld = 30): void {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const logs = this.getLocalLogs().filter(log => log.timestamp > cutoff);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
  }

  // Get security summary
  static getSecuritySummary(): {
    totalEvents: number;
    criticalEvents: number;
    recentEvents: number;
    suspiciousActivity: boolean;
  } {
    const logs = this.getLocalLogs();
    const lastHour = Date.now() - (60 * 60 * 1000);
    
    return {
      totalEvents: logs.length,
      criticalEvents: logs.filter(log => log.severity === 'critical').length,
      recentEvents: logs.filter(log => log.timestamp > lastHour).length,
      suspiciousActivity: logs.filter(log => 
        log.severity === 'critical' && log.timestamp > lastHour
      ).length > 5
    };
  }
}