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
          port: parseInt(smtp.port) || 465,
          secure: parseInt(smtp.port) === 465,
          auth: {
            user: smtp.user,
            pass: smtp.pass,
          },
          tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: false
          },
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 10000,
          socketTimeout: 10000,
        }
      : {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
        };

    const transporter = nodemailer.createTransport(transporterConfig);

    // Verify connection configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP Verification Error:', verifyError);
      throw new Error(`SMTP connection failed: ${verifyError.message}`);
    }

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
    throw error; // Throw the original error to get more detail in the controller
  }
};
