import type { Email } from "./email";

export type Mailer = (email: Email) => Promise<void>;

/** Sends one email through Resend's HTTP API (no SDK needed). Throws when Resend refuses it. */
export function resendMailer(apiKey: string, fetcher: typeof fetch = fetch): Mailer {
  return async (email) => {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: email.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Resend responded ${response.status}`);
  };
}
