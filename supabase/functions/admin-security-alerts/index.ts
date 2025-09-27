import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || req.headers.get('referer');
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS');
  
  let allowOrigin = '*';
  if (allowedOrigins && origin) {
    const allowed = allowedOrigins.split(',').map(o => o.trim());
    if (allowed.includes(origin) || allowed.includes('*')) {
      allowOrigin = origin;
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'content-type, x-admin-token, authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  try {
    // Verify admin authentication
    const adminToken = req.headers.get('x-admin-token');
    const expectedToken = Deno.env.get('ADMIN_DASHBOARD_TOKEN');
    
    if (!adminToken || !expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 401, 
          code: "ADMIN_TOKEN_MISSING", 
          message: "X-Admin-Token requis.", 
          hint: "Définir ADMIN_DASHBOARD_TOKEN côté serveur et renvoyer le header X-Admin-Token." 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 403, 
          code: "ADMIN_TOKEN_INVALID", 
          message: "Jeton admin invalide.", 
          hint: "Vérifier ADMIN_DASHBOARD_TOKEN." 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check IP allowlist if configured
    const ipAllowlist = Deno.env.get('ADMIN_IP_ALLOWLIST');
    if (ipAllowlist) {
      const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
      const allowedIps = ipAllowlist.split(',').map(ip => ip.trim());
      if (!allowedIps.includes(clientIp)) {
        return new Response(
          JSON.stringify({ 
            ok: false, 
            status: 403, 
            code: "IP_NOT_ALLOWED", 
            message: "IP non autorisée.", 
            hint: "Vérifier ADMIN_IP_ALLOWLIST." 
          }),
          { 
            status: 403, 
            headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Get recent security events from audit logs
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('timestamp', fiveMinutesAgo.toISOString())
      .in('event_type', ['admin_access', 'rate_limit', 'security_violation'])
      .order('timestamp', { ascending: false });

    if (auditError) {
      console.error('Error fetching audit logs:', auditError);
    }

    // Analyze events and create alerts
    const alerts = [];

    if (auditLogs) {
      // Count 401/403 admin attempts
      const adminFailures = auditLogs.filter(log => 
        log.event_type === 'admin_access' && 
        (log.action === 'unauthorized' || log.action === 'forbidden')
      );

      if (adminFailures.length > 10) {
        alerts.push({
          id: `admin_403_${Date.now()}`,
          type: 'admin_403',
          count: adminFailures.length,
          window: '5 minutes',
          timestamp: new Date(),
          severity: 'high',
          message: `${adminFailures.length} tentatives d'accès admin refusées`,
          details: {
            unique_ips: [...new Set(adminFailures.map(log => log.ip_address))].length,
            user_agents: [...new Set(adminFailures.map(log => log.user_agent))]
          }
        });
      }

      // Count rate limit violations
      const rateLimitViolations = auditLogs.filter(log => 
        log.event_type === 'rate_limit' && log.action === 'exceeded'
      );

      if (rateLimitViolations.length > 50) {
        alerts.push({
          id: `rate_limit_${Date.now()}`,
          type: 'rate_limit',
          count: rateLimitViolations.length,
          window: '5 minutes',
          timestamp: new Date(),
          severity: 'medium',
          message: `${rateLimitViolations.length} violations de rate limiting`,
          details: {
            affected_endpoints: [...new Set(rateLimitViolations.map(log => log.details?.endpoint))],
            unique_ips: [...new Set(rateLimitViolations.map(log => log.ip_address))].length
          }
        });
      }
    }

    // Check for low quality scores in recent runs
    const { data: recentRuns, error: runsError } = await supabase
      .from('runs')
      .select('quality_score, retailer_id, finished_at')
      .gte('started_at', fiveMinutesAgo.toISOString())
      .lt('quality_score', 0.6)
      .not('quality_score', 'is', null);

    if (!runsError && recentRuns && recentRuns.length > 0) {
      alerts.push({
        id: `quality_${Date.now()}`,
        type: 'quality_score',
        count: recentRuns.length,
        window: '5 minutes',
        timestamp: new Date(),
        severity: 'medium',
        message: `${recentRuns.length} runs avec score qualité < 0.6`,
        details: {
          average_score: recentRuns.reduce((sum, run) => sum + (run.quality_score || 0), 0) / recentRuns.length,
          affected_retailers: recentRuns.length
        }
      });
    }

    // Check webhook configuration
    const webhookEnabled = !!Deno.env.get('ALERT_WEBHOOK_URL');

    // If webhook is enabled and we have high-severity alerts, send webhook
    if (webhookEnabled && alerts.some(alert => alert.severity === 'high')) {
      const webhookUrl = Deno.env.get('ALERT_WEBHOOK_URL');
      const highSeverityAlerts = alerts.filter(alert => alert.severity === 'high');
      
      try {
        await fetch(webhookUrl!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 InfoEau Security Alert: ${highSeverityAlerts.length} high-severity events detected`,
            attachments: highSeverityAlerts.map(alert => ({
              color: 'danger',
              title: alert.message,
              fields: [
                { title: 'Count', value: alert.count, short: true },
                { title: 'Window', value: alert.window, short: true },
                { title: 'Severity', value: alert.severity, short: true }
              ]
            }))
          })
        });
        console.log('Webhook notification sent for high-severity alerts');
      } catch (webhookError) {
        console.error('Failed to send webhook notification:', webhookError);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        webhookEnabled,
        alerts,
        summary: {
          total_alerts: alerts.length,
          high_severity: alerts.filter(a => a.severity === 'high').length,
          medium_severity: alerts.filter(a => a.severity === 'medium').length,
          low_severity: alerts.filter(a => a.severity === 'low').length,
          window: '5 minutes'
        },
        monitoring: {
          admin_access_attempts: auditLogs?.filter(log => log.event_type === 'admin_access').length || 0,
          rate_limit_events: auditLogs?.filter(log => log.event_type === 'rate_limit').length || 0,
          quality_issues: recentRuns?.length || 0
        }
      }),
      { 
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Security alerts error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: 'Internal server error',
        message: (error as any)?.message || 'Unknown error',
        alerts: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } 
      }
    );
  }
})