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
    let transporterConfig;

    if (smtp && smtp.user && smtp.pass) {
      const isGmail = (smtp.host || "").toLowerCase().includes("gmail");
      
      if (isGmail) {
        // Use service: 'gmail' for Gmail-specific optimizations
        transporterConfig = {
          service: 'gmail',
          auth: {
            user: smtp.user,
            pass: smtp.pass,
          },
        };
      } else {
        transporterConfig = {
          host: smtp.host,
          port: parseInt(smtp.port) || 465,
          secure: parseInt(smtp.port) === 465,
          auth: {
            user: smtp.user,
            pass: smtp.pass,
          },
          tls: {
            rejectUnauthorized: false
          }
        };
      }
      
      // Add common cloud-friendly settings
      Object.assign(transporterConfig, {
        connectionTimeout: 20000, // Increase to 20s for Render
        greetingTimeout: 20000,
        socketTimeout: 25000,
        dnsTimeout: 10000,
        // Force IPv4 as many cloud providers have issues with IPv6 and SMTP
        family: 4, 
      });
    } else {
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 25000,
        family: 4,
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // Verify connection configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP Verification Error details:', {
        code: verifyError.code,
        command: verifyError.command,
        response: verifyError.response,
        host: transporterConfig.host || transporterConfig.service
      });
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
    throw error;
  }
};
