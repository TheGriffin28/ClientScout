import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Sends an email via Gmail SMTP using either per-user credentials or global fallback.
 * 
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Subject line
 * @param {string} [options.html] - HTML body
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.from] - Custom from header
 * @param {string} [options.replyTo] - Custom reply-to header
 * @param {Object} [options.userConfig] - User document or settings object containing smtpSettings
 */
export const sendSmtpEmail = async ({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
  userConfig,
}) => {
  // Determine if user has custom SMTP configured
  const userSmtp = userConfig?.smtpSettings;
  const hasUserSmtp = Boolean(userSmtp?.user && userSmtp?.pass);

  const smtpUser = hasUserSmtp ? userSmtp.user.trim() : (process.env.EMAIL_USER || "").trim();
  const smtpPass = hasUserSmtp ? userSmtp.pass.trim() : (process.env.EMAIL_PASS || "").trim();
  const smtpHost = (hasUserSmtp ? userSmtp.host : process.env.SMTP_HOST) || "smtp.gmail.com";
  const smtpPort = Number((hasUserSmtp ? userSmtp.port : process.env.SMTP_PORT) || 465);
  const fromName = (hasUserSmtp ? userSmtp.fromName : "") || userConfig?.name || "ClientScout Outreach";

  if (!smtpUser || !smtpPass) {
    throw new Error(
      "Gmail SMTP is not configured. Please enter your Gmail address and 16-character App Password in Settings > Outreach Channels."
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000, // 10s connection timeout
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const mailOptions = {
    from: from || `"${fromName}" <${smtpUser}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject: subject || "Business Inquiry",
    html: html || undefined,
    text: text || undefined,
    replyTo: replyTo || userConfig?.email || smtpUser,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      sender: smtpUser,
    };
  } catch (error) {
    console.error("SMTP send error:", error);
    const errMsg = error.message || "";
    if (errMsg.includes("Username and Password not accepted") || errMsg.includes("535-5.7.8") || errMsg.includes("EAUTH")) {
      throw new Error(
        "Gmail authentication failed. Please make sure you are using a 16-character Google App Password (not your standard password). Generate one at https://myaccount.google.com/apppasswords"
      );
    }
    if (errMsg.includes("ETIMEDOUT") || errMsg.includes("ESOCKETTIMEDOUT") || errMsg.includes("ECONNECTION") || error.code === "ETIMEDOUT") {
      throw new Error(
        "SMTP connection timed out. Note: Render's Free Tier blocks outbound SMTP traffic (ports 25, 465, 587) by default. Upgrading Render to a paid plan ($7/mo Starter) unblocks outbound SMTP, or host on a VPS/DigitalOcean/Railway."
      );
    }
    throw new Error(`Failed to send email via SMTP: ${errMsg}`);
  }
};
