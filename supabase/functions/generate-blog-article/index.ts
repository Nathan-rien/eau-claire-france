// Generate a blog article ("Lettre de l'eau") from recent water-related news.
// Flow: Firecrawl search -> dedupe -> Lovable AI write -> Lovable AI image -> Supabase insert.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

async function firecrawlSearch(query: string, tbs?: string) {
  const r = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit: 10,
      lang: "fr",
      country: "fr",
      ...(tbs ? { tbs } : {}),
    }),
  });
  if (!r.ok) throw new Error(`Firecrawl search ${r.status}: ${await r.text()}`);
  return r.json();
}

async function firecrawlScrape(url: string) {
  const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
  });
  if (!r.ok) return null;
  return r.json();
}

async function callGeminiTextDirect(systemInstruction: string, userPrompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  });
  if (!r.ok) throw new Error(`Gemini direct ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

async function callLovableAiText(systemInstruction: string, userPrompt: string): Promise<string> {
  const r = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });
  if (!r.ok) {
    const body = await r.text();
    if (r.status === 429) throw new Error(`Lovable AI rate-limited (429): ${body}`);
    if (r.status === 402) throw new Error(`Lovable AI credits exhausted (402): ${body}`);
    throw new Error(`Lovable AI ${r.status}: ${body}`);
  }
  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Empty Lovable AI response");
  return text;
}

async function callText(systemInstruction: string, userPrompt: string): Promise<string> {
  if (LOVABLE_API_KEY) return callLovableAiText(systemInstruction, userPrompt);
  if (GEMINI_API_KEY) return callGeminiTextDirect(systemInstruction, userPrompt);
  throw new Error("No AI key configured (LOVABLE_API_KEY or GEMINI_API_KEY)");
}

async function generateCoverImage(prompt: string): Promise<string | null> {
  try {
    if (LOVABLE_API_KEY) {
      const r = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });
      if (!r.ok) {
        console.error("Lovable AI image failed:", r.status, await r.text());
        return null;
      }
      const data = await r.json();
      const images = data?.choices?.[0]?.message?.images;
      const url = images?.[0]?.image_url?.url;
      if (typeof url === "string" && url.startsWith("data:")) return url;
      return null;
    }
    // Fallback: direct Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    });
    if (!r.ok) {
      console.error("Gemini image failed:", r.status, await r.text());
      return null;
    }
    const data = await r.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      const inline = p?.inlineData ?? p?.inline_data;
      if (inline?.data) {
        const mime = inline.mimeType ?? inline.mime_type ?? "image/png";
        return `data:${mime};base64,${inline.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image gen error:", e);
    return null;
  }
}

async function uploadImage(base64DataUrl: string, slug: string): Promise<string | null> {
  try {
    const match = base64DataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) return null;
    const mime = match[1];
    const ext = mime.split("/")[1] || "png";
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
    const path = `${new Date().toISOString().slice(0, 10)}/${slug}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error("Upload exception:", e);
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeCover(prompt: string, slug: string, attempts = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const dataUrl = await generateCoverImage(prompt);
    if (dataUrl) {
      const url = await uploadImage(dataUrl, slug);
      if (url) return url;
      console.error(`Cover attempt ${attempt}/${attempts} failed (upload) for ${slug}`);
    } else {
      console.error(`Cover attempt ${attempt}/${attempts} failed (generation) for ${slug}`);
    }
    if (attempt < attempts) await sleep(1500 * attempt);
  }
  return null;
}

const VISUAL_ANGLES = [
  "plan large d'un paysage de rivière ou de barrage à l'aube",
  "gros plan sur des mains et un équipement de prélèvement ou de laboratoire",
  "vue d'une station de traitement ou d'un château d'eau",
  "scène de rue ou de village avec des habitants vus de loin",
  "détail macro de tuyaux, de vannes ou d'une surface mouillée",
  "zone agricole, champs et canaux d'irrigation",
  "bord de mer ou de plage, ambiance de baignade",
  "intérieur de cuisine ou de salle de bain, vue du quotidien",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function angleFor(slug: string): string {
  return VISUAL_ANGLES[hashString(slug) % VISUAL_ANGLES.length];
}

function buildCoverPrompt(base: string, slug: string): string {
  return `Photographie éditoriale haute qualité, 16:9, lumineuse : ${base}. Angle de prise de vue : ${angleFor(slug)}. Éviter les clichés (goutte d'eau, robinet, verre d'eau) sauf si le sujet l'exige. Pas de texte, pas de logo, aucune personne reconnaissable. Ambiance journalistique.`;
}

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

async function handleBackfillCovers(req: Request, body: any): Promise<Response> {
  if (req.headers.get("Authorization") !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ success: false, error: "unauthorized" }), { status: 401, headers: jsonHeaders });
  }
  try {
    const limit = Math.min(Math.max(Number(body?.limit) || 3, 1), 5);
    const { data: rows, error } = await supabase
      .from("blog_articles")
      .select("id, slug, title, excerpt, category")
      .eq("status", "published")
      .is("cover_image_url", null)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Select: ${error.message}`);

    const updated: { slug: string; url: string }[] = [];
    const failed: { slug: string; reason: string }[] = [];

    for (const row of rows ?? []) {
      let reason: string | null = null;
      try {
        const base = `Sujet : ${row.title}. ${row.excerpt ?? ""}`.slice(0, 400);
        const url = await makeCover(buildCoverPrompt(base, row.slug), row.slug);
        if (!url) {
          reason = "cover generation failed";
        } else {
          const { error: upErr } = await supabase
            .from("blog_articles")
            .update({ cover_image_url: url })
            .eq("id", row.id)
            .is("cover_image_url", null);
          if (upErr) reason = `update: ${upErr.message}`;
          else updated.push({ slug: row.slug, url });
        }
      } catch (e) {
        reason = e instanceof Error ? e.message : String(e);
      }
      if (reason) failed.push({ slug: row.slug, reason });

      try {
        const { error: logErr } = await supabase.from("blog_generation_log").insert({
          status: reason ? "error" : "success",
          topic: row.title,
          article_id: row.id,
          payload: { mode: "backfill_covers" },
          ...(reason ? { error: reason } : {}),
        });
        if (logErr) console.error("Backfill log insert error:", logErr.message);
      } catch (e) {
        console.error("Backfill log insert exception:", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: (rows ?? []).length, updated, failed }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("backfill_covers error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500, headers: jsonHeaders });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const logPayload: any = { status: "started" };

  try {
    // 0. Parse body first (needed to route the backfill mode)
    const body = await req.json().catch(() => ({} as any));

    if (!LOVABLE_API_KEY && !GEMINI_API_KEY) throw new Error("Missing LOVABLE_API_KEY (and no GEMINI_API_KEY fallback)");

    if (body?.mode === "backfill_covers") {
      return await handleBackfillCovers(req, body);
    }

    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY missing");

    // Optional forced topic
    const forcedTopic: string | undefined = body?.topic;
    const skipDedupe: boolean = !!body?.skipDedupe || !!forcedTopic;

    // 1. Search recent water news
    const queries = [
      "actualité eau potable France scandale",
      "pollution eau France 2026",
      "qualité eau robinet PFAS pesticides",
      "eau minérale Nestlé Perrier Vittel",
    ];
    const query = forcedTopic ?? queries[Math.floor(Math.random() * queries.length)];
    console.log("Searching:", query, "forced:", !!forcedTopic);
    let search = await firecrawlSearch(query, forcedTopic ? "qdr:m" : "qdr:w");
    let results = (search?.data?.web ?? search?.data ?? [])
      .filter((r: any) => r?.url && r?.title);
    if (!results.length) {
      console.log("No results last week, falling back to last month");
      search = await firecrawlSearch(query, "qdr:m");
      results = (search?.data?.web ?? search?.data ?? [])
        .filter((r: any) => r?.url && r?.title);
    }
    if (!results.length) {
      search = await firecrawlSearch(query);
      results = (search?.data?.web ?? search?.data ?? [])
        .filter((r: any) => r?.url && r?.title);
    }
    results = results.slice(0, 8);

    if (!results.length) throw new Error("No search results");

    // 2. Dedupe against last 90 days (unless forced)
    let fresh: any = results[0];
    if (!skipDedupe) {
      const { data: recent } = await supabase
        .from("blog_articles")
        .select("title")
        .gte("published_at", new Date(Date.now() - 90 * 86400000).toISOString());
      const usedTitles = new Set((recent ?? []).map((r: any) => r.title.toLowerCase()));
      fresh = results.find((r: any) =>
        ![...usedTitles].some((t) => t.includes(r.title.toLowerCase().slice(0, 25)))
      ) ?? results[0];
    }

    logPayload.topic = fresh.title;
    console.log("Selected topic:", fresh.title, fresh.url);

    // 3. Scrape top 2-3 sources for context
    const scraped: any[] = [];
    for (const r of results.slice(0, 3)) {
      const s = await firecrawlScrape(r.url);
      const md = s?.data?.markdown ?? s?.markdown;
      if (md) scraped.push({ url: r.url, title: r.title, content: md.slice(0, 4000) });
    }

    // 4. Generate article JSON
    const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const sourcesPrompt = scraped
      .map((s, i) => `### Source ${i + 1}: ${s.title}\nURL: ${s.url}\n${s.content}`)
      .join("\n\n---\n\n");

    const systemPrompt = `Tu es journaliste pour "Lettre de l'eau", la rubrique actualités d'InfoEau.fr (qualité de l'eau en France). Tu écris des articles factuels, fouillés, accessibles, en français, basés UNIQUEMENT sur les sources fournies. Date du jour: ${today}. Tu réponds STRICTEMENT en JSON valide, sans markdown autour.`;

    const userPrompt = `Rédige un article d'environ 1500 mots sur le sujet ci-dessous, en t'appuyant sur les sources.

Sujet principal: ${fresh.title}
URL principale: ${fresh.url}

SOURCES:
${sourcesPrompt}

Réponds UNIQUEMENT avec un JSON valide de cette forme:
{
  "title": "Titre éditorial accrocheur (60-80 caractères)",
  "slug": "slug-court-en-tirets",
  "excerpt": "Chapeau de 2-3 phrases (max 280 caractères) qui donne envie de lire",
  "category": "scandale|reglementation|qualite|sante|environnement|economie",
  "content_md": "Article complet en Markdown ~1500 mots. Structure: introduction, plusieurs sections avec ## titres, citations en blockquote si pertinent, conclusion. Pas de titre H1 au début (déjà affiché). Sois précis et factuel. IMPORTANT: n'ajoute AUCUNE mention de source inline du type (Source 1), (Source 2), (Sources 1 et 2), (source 1), etc. Les sources cliquables sont déjà affichées en bas de l'article — ne les répète pas dans le texte.",
  "seo_title": "Titre SEO (max 60 car)",
  "seo_description": "Méta-description (max 155 car)",
  "reading_time_min": 7,
  "image_prompt": "Description visuelle éditoriale pour image de couverture (style photographique réaliste, sans texte). Lié au sujet eau.",
  "infographic": null
}

Si l'article contient des chiffres comparatifs intéressants (ex: contaminations par marque, évolution prix, pourcentages par région), remplace "infographic": null par:
{
  "type": "bar",
  "title": "Titre du graphique",
  "data": [{"label":"X","value":12},{"label":"Y","value":8}],
  "unit": "%"
}`;

    const raw = await callText(systemPrompt, userPrompt);
    let article: any;
    try {
      article = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      article = JSON.parse(m![0]);
    }

    // Strip residual inline source mentions like (Source 1), (Sources 1, 2 et 3), (source 2)
    if (typeof article.content_md === "string") {
      article.content_md = article.content_md
        .replace(/\s*\(\s*sources?\s*\d+(?:\s*(?:,|et)\s*\d+)*\s*\)/gi, "")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\s+([,.;:!?])/g, "$1");
    }

    const slug = slugify(article.slug || article.title);

    // 5. Generate cover image (with retries + title-based fallback prompt)
    let coverUrl: string | null = null;
    if (article.image_prompt) {
      coverUrl = await makeCover(buildCoverPrompt(article.image_prompt, slug), slug);
      if (!coverUrl) {
        coverUrl = await makeCover(buildCoverPrompt(`Sujet : ${article.title}`, slug), slug);
      }
    }

    // 6. Insert article
    const sources = scraped.map((s) => ({ url: s.url, title: s.title }));
    const { data: inserted, error: insErr } = await supabase
      .from("blog_articles")
      .insert({
        slug,
        title: article.title,
        excerpt: article.excerpt,
        content_md: article.content_md,
        cover_image_url: coverUrl,
        category: article.category || "actualite",
        sources,
        infographic: article.infographic ?? null,
        reading_time_min: article.reading_time_min || 7,
        seo_title: article.seo_title,
        seo_description: article.seo_description,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insErr) throw new Error(`Insert: ${insErr.message}`);

    await supabase.from("blog_generation_log").insert({
      status: "success",
      topic: fresh.title,
      article_id: inserted.id,
      payload: { query, sources_count: sources.length, has_cover: !!coverUrl, cover_failed: !coverUrl },
    });

    return new Response(
      JSON.stringify({ success: true, article: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("generate-blog-article error:", msg);
    await supabase.from("blog_generation_log").insert({
      status: "error",
      topic: logPayload.topic ?? null,
      error: msg,
      payload: logPayload,
    });
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
