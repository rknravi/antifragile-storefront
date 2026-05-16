import { Resend } from "resend";

export type OrderEmailPayload = {
  sourceOrderId: string;
  gateway: string;
  customerEmail: string;
  customerName: string;
  total: number;
  items: { name: string; qty: number }[];
};

/** # SECURITY-REVIEW: External email API — keys from env only; do not log email bodies with PII in production. */
export async function sendOrderConfirmationEmail(
  data: OrderEmailPayload
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) {
    return { ok: false, skipped: true, error: "RESEND_API_KEY / RESEND_FROM_EMAIL not set" };
  }

  const rows = data.items.map((i) => `<tr><td>${escapeHtml(i.name)}</td><td>${i.qty}</td></tr>`).join("");

  const html = `
    <p>Hi ${escapeHtml(data.customerName)},</p>
    <p>Thanks for your order. Here is a summary:</p>
    <p><strong>Order:</strong> ${escapeHtml(data.sourceOrderId)}<br/>
    <strong>Gateway:</strong> ${escapeHtml(data.gateway)}<br/>
    <strong>Total:</strong> ₹${data.total.toFixed(0)}</p>
    <table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Item</th><th>Qty</th></tr></thead><tbody>${rows}</tbody></table>
    <p style="margin-top:24px;font-size:12px;color:#666;">This is an automated message from ANTIFRAGILE storefront.</p>
  `;

  try {
    const resend = new Resend(key);
    await resend.emails.send({
      from,
      to: data.customerEmail,
      subject: `ANTIFRAGILE order ${data.sourceOrderId}`,
      html,
    });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "send_failed";
    return { ok: false, error: message };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
