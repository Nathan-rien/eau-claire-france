import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  
  const url = new URL(req.url);
  const fnName = url.pathname.split('/').pop() || 'unknown';
  const buildId = Deno.env.get('VERCEL_GIT_COMMIT_SHA') ?? Deno.env.get('BUILD_ID') ?? 'dev';
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'content-type, authorization, x-admin-token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
    'X-Edge-Build-Id': buildId,
    'X-Edge-Function': fnName
  };
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  try {
    // Admin token authentication
    const token = req.headers.get("x-admin-token") ?? "";
    const expected = Deno.env.get("ADMIN_DASHBOARD_TOKEN") ?? "";
    if (!expected || !token) {
      return new Response(
        JSON.stringify({
          ok: false,
          status: 401,
          code: "ADMIN_TOKEN_MISSING",
          message: "X-Admin-Token requis.",
          hint: "Définir ADMIN_DASHBOARD_TOKEN côté serveur."
        }),
        { status: 401, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }
    if (token !== expected) {
      return new Response(
        JSON.stringify({
          ok: false,
          status: 403,
          code: "ADMIN_TOKEN_INVALID",
          message: "Jeton admin invalide.",
          hint: "Vérifier ADMIN_DASHBOARD_TOKEN."
        }),
        { status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // IP allowlist check
    const allowlist = Deno.env.get("ADMIN_IP_ALLOWLIST");
    if (allowlist) {
      const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
      const whitelist = allowlist.split(",").map(s => s.trim());
      if (ip && !whitelist.includes(ip)) {
        return new Response(
          JSON.stringify({
            ok: false,
            status: 403,
            code: "IP_NOT_ALLOWED",
            message: "IP non autorisée.",
            hint: `Autoriser ${ip} dans ADMIN_IP_ALLOWLIST.`
          }),
          { status: 403, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
        );
      }
    }
    return new Response(
      JSON.stringify({ 
        ok: true, 
        status: 200,
        ts: Date.now(),
        message: 'Edge Function disponible',
        timestamp: new Date().toISOString(),
        via: 'edge'
      }),
      { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ping function:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        status: 500, 
        code: 'UNEXPECTED_ERROR', 
        message: 'Erreur serveur interne.', 
        hint: 'Consulter logs Edge Function.',
        details: (error as any)?.message || 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});