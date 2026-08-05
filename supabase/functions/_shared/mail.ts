/**
 * The one place that talks SMTP, shared by `subscribe` and `dispatch`.
 *
 * Every credential is an environment secret set in the Supabase dashboard —
 * nothing here, and nothing in the repo, holds one.
 */
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

export const env = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`missing env: ${key}`);
  return value;
};

/** The site's origin without a trailing slash, so `${site()}/subscribed/` is safe. */
export const site = (): string => env('SITE_URL').replace(/\/+$/, '');

export const functionsUrl = (): string => `${env('SUPABASE_URL').replace(/\/+$/, '')}/functions/v1`;

interface Mail {
  to: string;
  subject: string;
  text: string;
  headers?: Record<string, string>;
}

/**
 * One connection per mail. Slower than pooling, and correct: a shared client
 * held across invocations of a function that can be frozen between requests is
 * a socket that dies in the middle of the next send.
 */
export const send = async ({ to, subject, text, headers }: Mail): Promise<void> => {
  const client = new SMTPClient({
    connection: {
      hostname: env('SMTP_HOST'),
      port: Number(Deno.env.get('SMTP_PORT') ?? '465'),
      tls: (Deno.env.get('SMTP_TLS') ?? 'true') !== 'false',
      auth: { username: env('SMTP_USER'), password: env('SMTP_PASS') },
    },
  });

  try {
    await client.send({ from: env('MAIL_FROM'), to, subject, content: text, headers });
  } finally {
    await client.close();
  }
};

/** RFC 8058: the one-click header pair every campaign mail carries. */
export const unsubscribeHeaders = (token: string): Record<string, string> => ({
  'List-Unsubscribe': `<${functionsUrl()}/unsubscribe?t=${token}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
});

/** 303 so the browser turns a form POST into a GET of the landing page. */
export const seeOther = (path: string): Response =>
  new Response(null, { status: 303, headers: { Location: `${site()}${path}` } });
