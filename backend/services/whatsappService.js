import dotenv from "dotenv";

dotenv.config();

/**
 * Normalizes phone numbers for WhatsApp messaging.
 * Removes formatting characters (+, -, space, parentheses).
 * If a 10-digit number is passed (e.g. standard Indian mobile), prepends '91'.
 */
export const normalizeWhatsAppPhone = (rawPhone) => {
  if (!rawPhone) return "";
  let digits = String(rawPhone).replace(/\D/g, "");
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
};

/**
 * Sends a WhatsApp message using the provided API endpoint.
 * Supports per-user API key/URL with fallback to environment configuration.
 *
 * @param {Object} options
 * @param {string} options.phone - Recipient phone number
 * @param {string} options.message - Message content
 * @param {Object} [options.userConfig] - User document or settings containing whatsappSettings
 */
export const sendWhatsAppMessage = async ({ phone, message, userConfig }) => {
  if (!phone || !phone.trim()) {
    throw new Error("Recipient phone number is required");
  }

  if (!message || !message.trim()) {
    throw new Error("Message body cannot be empty");
  }

  const cleanedPhone = normalizeWhatsAppPhone(phone);
  if (!cleanedPhone || cleanedPhone.length < 8) {
    throw new Error(`Invalid phone number for WhatsApp: "${phone}"`);
  }

  // Resolve API credentials (User override -> .env fallback -> system default)
  const userSettings = userConfig?.whatsappSettings;
  const apiUrl =
    (userSettings?.apiUrl && userSettings.apiUrl.trim()) ||
    (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_URL.trim()) ||
    "https://3bgvriotyazubuqc8a6sclta.140.238.254.100.sslip.io/api/send";

  const apiKey =
    (userSettings?.apiKey && userSettings.apiKey.trim()) ||
    (process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_API_KEY.trim());

  if (!apiKey) {
    throw new Error(
      "WhatsApp API key is missing. Please configure it in Settings > Outreach Channels or backend .env"
    );
  }

  const payload = {
    phone: cleanedPhone,
    message: message.trim(),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok || responseData.success === false) {
      const errMsg =
        responseData.error ||
        responseData.message ||
        `WhatsApp API error (${response.status})`;
      throw new Error(errMsg);
    }

    return {
      success: true,
      recipient: cleanedPhone,
      data: responseData,
    };
  } catch (error) {
    console.error("WhatsApp sending error:", error);
    if (error.name === "AbortError") {
      throw new Error("WhatsApp API timed out after 15 seconds");
    }
    throw error;
  }
};
