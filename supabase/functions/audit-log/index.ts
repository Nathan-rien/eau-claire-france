import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event } = await req.json()

    // Validate event data
    if (!event || !event.type || !event.action) {
      return new Response(
        JSON.stringify({ error: 'Invalid event data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Only log high severity events to prevent spam
    if (!['high', 'critical'].includes(event.severity)) {
      return new Response(
        JSON.stringify({ success: true, logged: false }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get client IP from headers
    const clientIP = req.headers.get('CF-Connecting-IP') || 
                    req.headers.get('X-Forwarded-For') || 
                    req.headers.get('X-Real-IP') || 
                    'unknown'

    // Create audit log entry
    const auditEntry = {
      event_type: event.type,
      action: event.action,
      user_id: event.userId || null,
      ip_address: clientIP,
      user_agent: event.userAgent || req.headers.get('User-Agent'),
      severity: event.severity,
      details: event.details || {},
      timestamp: new Date(event.timestamp || Date.now()).toISOString()
    }

    // Store in database (you would need to create this table)
    const { error } = await supabaseClient
      .from('audit_logs')
      .insert([auditEntry])

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to store audit log' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, logged: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Audit log error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})