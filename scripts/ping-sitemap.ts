// Pings the submit-sitemap edge function so Google Search Console re-crawls
// the sitemap for every verified property at deploy time.
// Runs as a postbuild hook — failures never break the build.

const URL_ENDPOINT =
  "https://xblogttmomuogdhmaztf.supabase.co/functions/v1/submit-sitemap";

async function main() {
  try {
    const res = await fetch(URL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const text = await res.text();
    console.log(`[postbuild] submit-sitemap → HTTP ${res.status}`);
    console.log(text.slice(0, 800));
  } catch (e) {
    console.warn("[postbuild] submit-sitemap ping failed (non-fatal):", e);
  }
}

main();
