import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationRequest {
  email: string;
  commune: string;
  message?: string;
  type: 'alert' | 'contact';
}

interface RateLimitData {
  count: number;
  lastReset: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { email, commune, message, type }: ValidationRequest = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';

    // Server-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const communeRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;

    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!communeRegex.test(commune) || commune.length < 1 || commune.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid commune format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (message && message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Server-side rate limiting
    const rateLimitKey = `rate_limit_${clientIP}_${type}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 5;

    // Check rate limit (in production, use Redis or similar)
    const { data: rateLimitData } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('key', rateLimitKey)
      .single();

    let currentData: RateLimitData = rateLimitData || { count: 0, lastReset: now };

    // Reset if window expired
    if (now - currentData.lastReset > windowMs) {
      currentData = { count: 0, lastReset: now };
    }

    if (currentData.count >= maxRequests) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update rate limit
    currentData.count++;
    await supabase
      .from('rate_limits')
      .upsert({ key: rateLimitKey, ...currentData });

    // Process based on type
    if (type === 'alert') {
      // Handle alert subscription
      const { error } = await supabase
        .from('alertes_utilisateurs')
        .insert({
          email: email.toLowerCase().trim(),
          commune: commune.trim(),
          consent_rgpd: true,
          actif: true,
        });

      if (error) {
        console.error('Database error:', error);
        if (error.code === '23505') { // Unique constraint violation
          return new Response(
            JSON.stringify({ error: 'You are already subscribed to alerts for this commune.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ error: 'Failed to subscribe to alerts' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Log security event (structured logging)
    console.log(JSON.stringify({
      event: 'form_validation_success',
      type,
      timestamp: new Date().toISOString(),
      ip: clientIP,
      email_domain: email.split('@')[1],
    }));

    return new Response(
      JSON.stringify({ success: true, message: 'Form processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});