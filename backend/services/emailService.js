import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send an email using SMTP (Gmail)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body in HTML format
 * @param {string} [options.from] - Sender email address (e.g. "Name <email@gmail.com>")
 * @param {Object} [options.smtp] - Optional custom SMTP settings
 * @param {string} options.smtp.user - SMTP username
 * @param {string} options.smtp.pass - SMTP password
 * @param {string} [options.smtp.host] - SMTP host (default: gmail)
 * @param {number} [options.smtp.port] - SMTP port (default: 465)
 * @returns {Promise<Object>} - Nodemailer response
 */
export const sendEmail = async ({ to, subject, html, from, smtp }) => {
  try {
    const transporterConfig = smtp && smtp.user && smtp.pass 
      ? {
          host: smtp.host || 'smtp.gmail.com',
          port: smtp.port || 465,
          secure: (smtp.port || 465) === 465,
          auth: {
            user: smtp.user,
            pass: smtp.pass,
          },
        }
      : {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        };

    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: from || (smtp && smtp.user) || process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('SMTP email error:', error);
    throw new Error('Failed to send email via SMTP');
  }
};
