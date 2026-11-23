/**
 * Cloudflare Pages Function: POST /api/contact
 * Sends contact-form submissions through Resend (https://resend.com).
 *
 * Setup (Cloudflare dashboard → Pages → pendley-dev → Settings → Variables):
 *   RESEND_API_KEY   secret   your Resend API key
 *   CONTACT_TO       text     bradley@pendley.dev
 *   CONTACT_FROM     text     "pendley.dev <contact@pendley.dev>"  (domain verified in Resend)
 */

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
}

const MAX = { name: 120, email: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const reply = (ok: boolean, status: number, error?: string) =>
    wantsJson
      ? Response.json(ok ? { ok } : { ok, error }, { status })
      : Response.redirect(new URL(ok ? '/?sent=1#contact' : '/?sent=0#contact', request.url).toString(), 303);

  // Same-origin only.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return reply(false, 403, 'forbidden');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(false, 400, 'invalid body');
  }

  // Honeypot: pretend success so bots learn nothing.
  if (String(form.get('company') ?? '').trim()) return reply(true, 200);

  const name = String(form.get('name') ?? '').trim().slice(0, MAX.name);
  const email = String(form.get('email') ?? '').trim().slice(0, MAX.email);
  const message = String(form.get('message') ?? '').trim().slice(0, MAX.message);

  if (!name || !EMAIL_RE.test(email) || message.length < 2) return reply(false, 422, 'missing fields');
  if (!env.RESEND_API_KEY) return reply(false, 503, 'not configured');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `pendley.dev: message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>`,
    }),
  });

  return res.ok ? reply(true, 200) : reply(false, 502, 'send failed');
};
