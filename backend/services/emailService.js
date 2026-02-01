import dotenv from 'dotenv';
import { Resend } from 'resend';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body in HTML format
 * @param {string} [options.from] - Sender email address (e.g. "Name <email@example.com>")
 * @param {string} [options.replyTo] - Email address to use for replies
 * @returns {Promise<Object>} - Resend response
 */
export const sendEmail = async ({ to, subject, html, from, replyTo }) => {
  try {
    const payload = {
      from: from || process.env.EMAIL_FROM,
      to,
      subject,
      html,
      reply_to: replyTo,
    };
    

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error('Resend email error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
};
