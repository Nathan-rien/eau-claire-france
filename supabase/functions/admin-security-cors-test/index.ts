import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-admin-token, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Vary': 'Origin'
};

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Verify admin token
    const adminToken = req.headers.get('x-admin-token');
    const expectedToken = Deno.env.get('ADMIN_DASHBOARD_TOKEN');
    
    if (!expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 401, 
          code: 'ADMIN_TOKEN_MISSING', 
          message: 'X-Admin-Token requis.', 
          hint: 'Définir ADMIN_DASHBOARD_TOKEN côté serveur.' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!adminToken || adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          status: 403, 
          code: 'ADMIN_TOKEN_INVALID', 
          message: 'Jeton admin invalide.', 
          hint: 'Vérifier ADMIN_DASHBOARD_TOKEN.' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check IP allowlist if defined
    const allowlist = Deno.env.get('ADMIN_IP_ALLOWLIST');
    if (allowlist) {
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
      const allowedIPs = allowlist.split(',').map(ip => ip.trim());
      
      if (!allowedIPs.includes(clientIP)) {
        return new Response(
          JSON.stringify({ 
            ok: false, 
            status: 403, 
            code: 'IP_NOT_ALLOWED', 
            message: `IP ${clientIP} non autorisée.`, 
            hint: `IPs autorisées: ${allowedIPs.join(', ')}` 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get request origin
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Check allowed origins
    const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS') || '';
    const allowedOriginsList = allowedOrigins.split(',').map(o => o.trim()).filter(o => o.length > 0);
    
    let isAllowed = false;
    let matchedOrigin = '';
    
    if (allowedOrigins === '*') {
      isAllowed = true;
      matchedOrigin = '*';
    } else if (allowedOriginsList.length > 0) {
      for (const allowedOrigin of allowedOriginsList) {
        if (allowedOrigin.includes('*')) {
          // Handle wildcards like https://*.infoeau.fr
          const pattern = allowedOrigin.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(origin)) {
            isAllowed = true;
            matchedOrigin = allowedOrigin;
            break;
          }
        } else if (origin === allowedOrigin) {
          isAllowed = true;
          matchedOrigin = allowedOrigin;
          break;
        }
      }
    }

    // Analyze CORS security
    const corsAnalysis = {
      hasWildcard: allowedOrigins.includes('*'),
      allowedOriginsCount: allowedOriginsList.length,
      isSecure: !allowedOrigins.includes('*') && allowedOriginsList.length > 0
    };

    const result = {
      ok: true,
      origin,
      isAllowed,
      matchedOrigin,
      allowedOrigins: allowedOriginsList,
      corsAnalysis,
      userAgent,
      message: isAllowed 
        ? `Origine ${origin} autorisée (match: ${matchedOrigin})`
        : `Origine ${origin} NON autorisée. Origines autorisées: ${allowedOriginsList.join(', ')}`,
      timestamp: new Date().toISOString()
    };

    console.log('CORS test completed:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cors-test function:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        status: 500, 
        code: 'UNEXPECTED_ERROR', 
        message: 'Erreur serveur interne.', 
        hint: 'Consulter logs Edge Function.',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});