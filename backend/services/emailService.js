import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const defaultFrom = () =>
  process.env.EMAIL_FROM || "ClientScout <onboarding@resend.dev>";

/**
 * Send an email via Resend.
 * Requires RESEND_API_KEY and a verified EMAIL_FROM domain in production.
 */
export const sendEmail = async ({ to, subject, html, from, replyTo }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — cannot send email");
    throw new Error("Email service is not configured");
  }

  const payload = {
    from: from || defaultFrom(),
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };

  if (replyTo) {
    payload.replyTo = replyTo;
  }

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    console.error("Resend email error:", error);
    throw error;
  }

  return data;
};
