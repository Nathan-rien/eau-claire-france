// Generate a blog article ("Lettre de l'eau") from recent water-related news.
// Flow: Firecrawl search -> dedupe -> Lovable AI write -> Lovable AI image -> Supabase insert.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
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

async function callGeminiText(systemInstruction: string, userPrompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
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
  if (!r.ok) throw new Error(`Gemini text ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

async function generateCoverImage(prompt: string): Promise<string | null> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`;
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const logPayload: any = { status: "started" };

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY missing");

    // 0. Parse optional forced topic
    const body = await req.json().catch(() => ({} as any));
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

    const writeRes = await callLovableAI([
      {
        role: "system",
        content: `Tu es journaliste pour "Lettre de l'eau", la rubrique actualités d'InfoEau.fr (qualité de l'eau en France). Tu écris des articles factuels, fouillés, accessibles, en français, basés UNIQUEMENT sur les sources fournies. Date du jour: ${today}. Tu réponds STRICTEMENT en JSON valide, sans markdown autour.`,
      },
      {
        role: "user",
        content: `Rédige un article d'environ 1500 mots sur le sujet ci-dessous, en t'appuyant sur les sources.

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
  "content_md": "Article complet en Markdown ~1500 mots. Structure: introduction, plusieurs sections avec ## titres, citations en blockquote si pertinent, conclusion. Pas de titre H1 au début (déjà affiché). Sois précis, cite les sources entre parenthèses (Source 1), (Source 2).",
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
}`,
      },
    ], { response_format: { type: "json_object" } });

    const raw = writeRes.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty AI response");
    let article: any;
    try {
      article = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      article = JSON.parse(m![0]);
    }

    const slug = slugify(article.slug || article.title);

    // 5. Generate cover image
    let coverUrl: string | null = null;
    if (article.image_prompt) {
      const dataUrl = await generateCoverImage(
        `Photographie éditoriale haute qualité, 16:9, lumineuse: ${article.image_prompt}. Pas de texte. Ambiance journalistique.`
      );
      if (dataUrl) coverUrl = await uploadImage(dataUrl, slug);
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
      payload: { query, sources_count: sources.length, has_cover: !!coverUrl },
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
