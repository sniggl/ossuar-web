/**
 * The one place that talks SMTP, imported only by the two functions that send.
 *
 * Every credential is an environment secret set in the Supabase dashboard —
 * nothing here, and nothing in the repo, holds one.
 */
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';
import { env, unsubscribeUrl } from './env.ts';

interface Mail {
  to: string;
  subject: string;
  text: string;
  headers?: Record<string, string>;
}

/**
 * A live connection. `dispatch` holds one for a whole run rather than paying a
 * TCP, TLS and AUTH handshake per recipient; what must not happen is holding one
 * *across* invocations, since a function frozen between requests wakes up with a
 * socket the server has long since dropped.
 */
export const openMailer = () =>
  new SMTPClient({
    connection: {
      hostname: env('SMTP_HOST'),
      port: Number(env('SMTP_PORT')),
      tls: true,
      auth: { username: env('SMTP_USER'), password: env('SMTP_PASS') },
    },
  });

export const sendVia = (client: SMTPClient, { to, subject, text, headers }: Mail) =>
  client.send({ from: env('MAIL_FROM'), to, subject, content: text, headers });

/** One mail, one connection — for `subscribe`, which sends exactly one. */
export const send = async (mail: Mail): Promise<void> => {
  const client = openMailer();
  try {
    await sendVia(client, mail);
  } finally {
    await client.close();
  }
};

/** RFC 8058: the one-click header pair every campaign mail carries. */
export const unsubscribeHeaders = (token: string): Record<string, string> => ({
  'List-Unsubscribe': `<${unsubscribeUrl(token)}>`,
  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
});
