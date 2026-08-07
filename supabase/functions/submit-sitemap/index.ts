// Submits the project sitemap to Google Search Console for every verified
// property covering infoeau.fr (domain property + URL-prefix properties).
// Routes via the Lovable connector gateway for google_search_console.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

const SITES: { siteUrl: string; sitemap: string }[] = [
  {
    siteUrl: "sc-domain:infoeau.fr",
    sitemap: "https://infoeau.fr/sitemap.xml",
  },
  {
    siteUrl: "https://infoeau.fr/",
    sitemap: "https://infoeau.fr/sitemap.xml",
  },
  {
    siteUrl: "https://infoeau.lovable.app/",
    sitemap: "https://infoeau.lovable.app/sitemap.xml",
  },
];

function authHeaders() {
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  const gsc = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lovable || !gsc) throw new Error("Missing gateway credentials");
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": gsc,
  } as Record<string, string>;
}

async function submitOne(siteUrl: string, sitemap: string) {
  // PUT (re)submits the sitemap and asks Google to recrawl it.
  const path = `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemap)}`;
  const put = await fetch(`${GATEWAY}${path}`, {
    method: "PUT",
    headers: authHeaders(),
  });
  const putBody = await put.text();
  if (!put.ok) {
    console.error(`submit-sitemap ${siteUrl} failed [${put.status}]: ${putBody}`);
  }

  return {
    siteUrl,
    sitemap,
    submit_status: put.status,
    submit_ok: put.ok,
    submit_body: put.ok ? "ok" : putBody.slice(0, 500),
  };
}

async function statusOne(siteUrl: string, sitemap: string) {
  const path = `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemap)}`;
  const res = await fetch(`${GATEWAY}${path}`, { headers: authHeaders() });
  const body = await res.text();
  if (!res.ok) {
    console.error(`sitemap status ${siteUrl} failed [${res.status}]: ${body}`);
    return { siteUrl, status: res.status, error: body.slice(0, 500) };
  }
  const json = JSON.parse(body);
  return {
    siteUrl,
    status: res.status,
    lastDownloaded: json.lastDownloaded,
    lastSubmitted: json.lastSubmitted,
    isPending: json.isPending,
    warnings: json.warnings,
    errors: json.errors,
    contents: json.contents,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const results = await Promise.all(
      SITES.map((s) => submitOne(s.siteUrl, s.sitemap).catch((e) => ({
        siteUrl: s.siteUrl,
        sitemap: s.sitemap,
        error: String(e),
      }))),
    );
    const statuses = await Promise.all(
      SITES.map((s) => statusOne(s.siteUrl, s.sitemap).catch((e) => ({
        siteUrl: s.siteUrl,
        error: String(e),
      }))),
    );
    console.log("submit-sitemap result:", JSON.stringify({ results, statuses }));
    return new Response(
      JSON.stringify({ ok: true, submitted_at: new Date().toISOString(), results, statuses }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("submit-sitemap error", e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
