/**
 * Email abstraction. Phase 2 MVP logs every email to the server console.
 * To send for real, implement `EmailProvider` (Resend, Postmark, SMTP via
 * Hostinger mail…) and set EMAIL_PROVIDER — nothing else changes.
 */
import { siteConfig } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailProvider {
  id: string;
  send(message: EmailMessage): Promise<void>;
}

const consoleProvider: EmailProvider = {
  id: "console",
  async send(m) {
    const line = "─".repeat(64);
    console.info(`\n${line}\n✉  EMAIL (console provider — not actually sent)\nTo: ${m.to}\nSubject: ${m.subject}\n${line}\n${m.text}\n${line}\n`);
  },
};

function provider(): EmailProvider {
  // Phase 3: switch on process.env.EMAIL_PROVIDER ("resend" | "smtp" …)
  return consoleProvider;
}

export async function sendEmail(message: EmailMessage) {
  try {
    await provider().send(message);
  } catch (err) {
    // Never fail a checkout or sign-up because an email couldn't go out.
    console.error("[email] send failed", err);
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#F8F5F0;font-family:Poppins,Arial,sans-serif;color:#0B2545">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-size:24px;font-weight:700;letter-spacing:-1px;margin:0 0 24px">Truth<span style="color:#1E5AA8">Pitch</span></p>
<h1 style="font-size:28px;line-height:1.1;margin:0 0 16px">${esc(title)}</h1>
${body}
<p style="margin-top:32px;font-size:12px;color:#4a5a70">TruthPitch · Say it straight. · ${esc(siteConfig.url)}</p>
</div></body></html>`;
}

export interface OrderEmailData {
  number: string;
  email: string;
  url: string;
  totalCents: number;
  shippingMethod: string;
  items: { name: string; quantity: number; unitPriceCents: number; size: string; colorName: string }[];
  shipTo: string;
  isGift: boolean;
  giftMessage?: string | null;
}

export async function sendOrderConfirmation(o: OrderEmailData) {
  const lines = o.items.map((i) => `${i.quantity}× ${i.name} (${i.colorName}, ${i.size}) — ${formatPrice((i.unitPriceCents * i.quantity) / 100)}`);
  const text = [
    `Order ${o.number} is in. No fine print.`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(o.totalCents / 100)}`,
    `Delivery: ${o.shippingMethod}`,
    `Shipping to${o.isGift ? " (gift)" : ""}:`,
    o.shipTo,
    o.isGift && o.giftMessage ? `\nGift note: “${o.giftMessage}”` : "",
    "",
    "We print to order, so expect tracking in 2–4 days.",
    `View your order: ${o.url}`,
  ].join("\n");
  const html = layout(
    `Order ${o.number} is in.`,
    `<p>No fine print. We print to order, so expect tracking in 2–4 days.</p>
<ul style="padding-left:18px">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
<p><strong>Total: ${formatPrice(o.totalCents / 100)}</strong></p>
<p style="white-space:pre-line">Shipping to${o.isGift ? " (gift)" : ""}:\n${esc(o.shipTo)}</p>
${o.isGift && o.giftMessage ? `<p>Gift note: “${esc(o.giftMessage)}”</p>` : ""}
<p><a href="${esc(o.url)}" style="display:inline-block;background:#0B2545;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">View your order</a></p>`,
  );
  await sendEmail({ to: o.email, subject: `Your TruthPitch order ${o.number}`, text, html });
}

export async function sendPasswordReset(to: string, url: string) {
  const text = `Someone (hopefully you) asked to reset your TruthPitch password.\n\nReset it here (valid for 1 hour): ${url}\n\nDidn't ask? Ignore this — your password stays the same.`;
  const html = layout(
    "Reset your password",
    `<p>Someone (hopefully you) asked to reset your TruthPitch password. This link is valid for 1 hour.</p>
<p><a href="${esc(url)}" style="display:inline-block;background:#0B2545;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">Choose a new password</a></p>
<p>Didn't ask? Ignore this — your password stays the same.</p>`,
  );
  await sendEmail({ to, subject: "Reset your TruthPitch password", text, html });
}

export async function sendDesignDecision(to: string, opts: { title: string; approved: boolean; reason?: string | null; url: string }) {
  const subject = opts.approved ? `“${opts.title}” is live on TruthPitch` : `“${opts.title}” needs another pass`;
  const text = opts.approved
    ? `Straight answer: it's approved. “${opts.title}” is now live in the marketplace.\n\n${opts.url}`
    : `Straight answer: “${opts.title}” isn't approved yet.\n\nWhy: ${opts.reason ?? "—"}\n\nEdit and resubmit from your dashboard: ${opts.url}`;
  const html = layout(
    opts.approved ? "It's live." : "Not yet — here's why.",
    opts.approved
      ? `<p>“${esc(opts.title)}” is approved and live in the marketplace.</p><p><a href="${esc(opts.url)}">See it live</a></p>`
      : `<p>“${esc(opts.title)}” isn't approved yet.</p><p><strong>Why:</strong> ${esc(opts.reason ?? "—")}</p><p><a href="${esc(opts.url)}">Edit and resubmit</a></p>`,
  );
  await sendEmail({ to, subject, text, html });
}
