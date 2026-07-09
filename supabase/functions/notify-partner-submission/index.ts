import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  company_name: z.string().min(1).max(150),
  contact_name: z.string().min(1).max(150),
  email: z.string().email().max(255),
  website: z.string().max(500).optional().nullable(),
  product_category: z.string().max(100).optional().nullable(),
  message: z.string().min(1).max(2000),
});

const RECIPIENT = 'nth.orso@gmail.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      throw new Error('Missing API keys');
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const d = parsed.data;

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#2563eb;margin-bottom:8px;">Nouvelle demande partenaire — Goût de l'eau</h2>
        <p style="color:#6b7280;font-size:13px;margin-top:0;">Formulaire /gout-eau</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:8px;background:#f3f4f6;font-weight:600;width:35%;">Entreprise</td><td style="padding:8px;">${esc(d.company_name)}</td></tr>
          <tr><td style="padding:8px;background:#f3f4f6;font-weight:600;">Contact</td><td style="padding:8px;">${esc(d.contact_name)}</td></tr>
          <tr><td style="padding:8px;background:#f3f4f6;font-weight:600;">Email</td><td style="padding:8px;"><a href="mailto:${esc(d.email)}">${esc(d.email)}</a></td></tr>
          <tr><td style="padding:8px;background:#f3f4f6;font-weight:600;">Site web</td><td style="padding:8px;">${d.website ? `<a href="${esc(d.website)}">${esc(d.website)}</a>` : '—'}</td></tr>
          <tr><td style="padding:8px;background:#f3f4f6;font-weight:600;">Catégorie</td><td style="padding:8px;">${esc(d.product_category ?? '—')}</td></tr>
        </table>
        <h3 style="margin-top:20px;color:#111827;">Message</h3>
        <div style="background:#f9fafb;padding:12px;border-left:3px solid #22c55e;white-space:pre-wrap;">${esc(d.message)}</div>
      </div>
    `;

    const response = await fetch('https://connector-gateway.lovable.dev/resend/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'InfoEau <onboarding@resend.dev>',
        to: [RECIPIENT],
        reply_to: d.email,
        subject: `[InfoEau] Partenariat goût de l'eau — ${d.company_name}`,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Resend failed [${response.status}]:`, errorBody);
      return new Response(
        JSON.stringify({ error: 'Email send failed', status: response.status, details: errorBody }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('notify-partner-submission error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
