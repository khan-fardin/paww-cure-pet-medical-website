import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { pass, user },
  });
}

export async function sendNotificationEmail({
  body,
  email,
  title,
}: {
  body: string;
  email?: string;
  title: string;
}) {
  const transport = getTransport();
  if (!transport || !email) return;

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: `${title} | pawwcure`,
      text: `${body}\n\nOpen pawwcure to view details.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#1a1a1a">
          <div style="font-size:22px;font-weight:700;color:#059669">pawwcure</div>
          <h1 style="font-size:22px;margin:24px 0 12px">${title}</h1>
          <p style="font-size:15px;line-height:1.7;color:#475569">${body}</p>
          <p style="margin-top:28px;font-size:12px;color:#94a3b8">This is an automated pawwcure notification.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[notification-email] delivery failed:", error);
  }
}
