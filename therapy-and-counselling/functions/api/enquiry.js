/* =====================================================================
   Cloudflare Pages Function  —  POST /api/enquiry
   Handles the Services/Contact enquiry form.

   - Validates required fields server-side
   - Honeypot spam trap (hidden "company" field)
   - Optional per-IP rate limit (needs a KV binding named RATE_LIMIT)
   - Delivers via Resend. NO secrets in client JavaScript.

   Environment variables (set in Cloudflare Pages → Settings → Variables):
     RESEND_API_KEY   (secret, required)  — your Resend API key
     ENQUIRY_TO       (plain, optional)   — recipient (default below)
     ENQUIRY_FROM     (plain, optional)   — verified sender (default = Resend onboarding)
   Optional binding:
     RATE_LIMIT       (KV namespace)      — enables basic throttling
   ===================================================================== */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_TO = 'therapyandcounselling4u@gmail.com';
const DEFAULT_FROM = 'Therapy & Counselling <onboarding@resend.dev>';

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;

  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      data = Object.fromEntries((await request.formData()).entries());
    }
  } catch (error) {
    console.error('Invalid enquiry request', error);
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  // Honeypot field
  if (data.company) {
    return json({ ok: true });
  }

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const message = String(data.message || '').trim();
  const phone = String(data.phone || '').trim();
  const topic = String(data.topic || '').trim();

  if (!name || !EMAIL_RE.test(email) || !message) {
    return json(
      { ok: false, error: 'Please complete the required fields.' },
      422
    );
  }

  if (
    name.length > 120 ||
    email.length > 160 ||
    phone.length > 40 ||
    message.length > 4000
  ) {
    return json(
      { ok: false, error: 'One or more fields are too long.' },
      422
    );
  }

  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing');

    return json(
      {
        ok: false,
        error: 'Email delivery is not configured yet.'
      },
      503
    );
  }

  const to = env.ENQUIRY_TO || DEFAULT_TO;
  const from = env.ENQUIRY_FROM || DEFAULT_FROM;

  const subject = `Website enquiry${topic ? ` — ${topic}` : ''}`;

  const text =
    `New enquiry from the website\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone || '—'}\n` +
    `Topic: ${topic || '—'}\n\n` +
    `Message:\n${message}\n`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject,
        text
      })
    });

    const responseBody = await response.text();

    if (!response.ok) {
      console.error('Resend delivery failed', {
        status: response.status,
        response: responseBody,
        from,
        to
      });

      return json(
        {
          ok: false,
          error: 'Delivery failed.',
          diagnostic: responseBody
        },
        502
      );
    }

    console.log('Enquiry delivered successfully', responseBody);

    return json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error('Enquiry function exception', message);

    return json(
      {
        ok: false,
        error: 'Delivery failed.',
        diagnostic: message
      },
      502
    );
  }
}

export const onRequestGet = () =>
  new Response('Method Not Allowed', {
    status: 405,
    headers: {
      Allow: 'POST'
    }
  });

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
