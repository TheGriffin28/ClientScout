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
      // Use explicit host and port instead of 'service' to avoid cloud networking issues
      const host = smtp.host || 'smtp.gmail.com';
      const port = parseInt(smtp.port) || 587; // Default to 587 for better cloud compatibility
      
      transporterConfig = {
        host: host,
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user: smtp.user,
          pass: smtp.pass,
        },
        tls: {
          // Do not fail on invalid certs and ensure STARTTLS is used if on 587
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        }
      };
      
      // Cloud-optimized connection settings
      Object.assign(transporterConfig, {
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 45000,
        dnsTimeout: 15000,
        family: 4, // Force IPv4
        logger: true, // Log to console
        debug: true   // Include SMTP traffic in logs
      });
    } else {
      // Default system email (fallback)
      transporterConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 30000,
        family: 4,
        logger: true,
        debug: true
      };
    }

    console.log(`Attempting SMTP connection to ${transporterConfig.host}:${transporterConfig.port}...`);
    const transporter = nodemailer.createTransport(transporterConfig);

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully!');
    } catch (verifyError) {
      console.error('SMTP Verification Detailed Error:', {
        message: verifyError.message,
        code: verifyError.code,
        command: verifyError.command,
        host: transporterConfig.host,
        port: transporterConfig.port
      });
      throw new Error(`SMTP connection failed: ${verifyError.message}. Try switching port to 587 if you are using 465.`);
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
