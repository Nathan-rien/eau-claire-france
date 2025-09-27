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
    'Access-Control-Allow-Headers': 'content-type, x-admin-token, authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
    'X-Edge-Build-Id': buildId,
    'X-Edge-Function': fnName
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  try {
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

    const allow = Deno.env.get("ADMIN_IP_ALLOWLIST");
    if (allow) {
      const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
      const white = allow.split(",").map(s => s.trim());
      if (ip && !white.includes(ip)) {
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
        received: {
          method: req.method,
          url: req.url,
          origin: req.headers.get("origin"),
          headers: {
            x_admin_token: !!req.headers.get("x-admin-token"),
            authorization_present: !!req.headers.get("authorization"),
            content_type: req.headers.get("content-type")
          }
        },
        env: {
          project_url: Deno.env.get("SUPABASE_URL"),
          allowed_origins: Deno.env.get("ALLOWED_ORIGINS") ?? "",
          jwt_verify_disabled: true
        },
        time: Date.now(),
        via: 'edge'
      }),
      { headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    ;(globalThis as any).__ADMIN_LAST_ERROR = {
      message: (error as any)?.message || 'Unknown error',
      ts: Date.now(),
      stackRedacted: typeof (error as any)?.stack === 'string' ? (error as any).stack.split('\n').slice(0,2).join(' | ') : undefined
    };
    return new Response(
      JSON.stringify({
        ok: false,
        status: 200,
        code: 'UNEXPECTED_ERROR',
        message: 'Erreur serveur interne.',
        hint: 'Consulter les logs Edge Function.'
      }),
      { status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});