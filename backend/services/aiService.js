import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Uses GEMINI_MODEL if specified in .env, otherwise defaults to gemini-3.5-flash-lite (high-speed Gemini 3 series model)
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

function leadHasWebsite(website) {
  if (!website || typeof website !== "string") return false;
  const trimmed = website.trim().toLowerCase();
  if (!trimmed || ["n/a", "na", "none", "no", "no website", "-"].includes(trimmed)) {
    return false;
  }
  return true;
}

/**
 * Robust JSON parser that handles pure JSON, markdown fences, or embedded JSON blocks.
 */
function parseJsonFromResponse(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response received");
  }

  // 1. Try direct parse
  try {
    return JSON.parse(text.trim());
  } catch {}

  // 2. Strip code fences (e.g., ```json ... ```)
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 3. Extract JSON object substring between first { and last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  throw new Error(`Unable to parse valid JSON from AI response: ${text.slice(0, 120)}...`);
}

/**
 * Executes a Gemini request with automatic fallback across Gemini 3/Flash models.
 */
async function generateWithFallback(prompt, responseMimeType = "application/json") {
  const modelsToTry = [GEMINI_MODEL];
  if (!modelsToTry.includes("gemini-3.5-flash-lite")) {
    modelsToTry.push("gemini-3.5-flash-lite");
  }
  if (!modelsToTry.includes("gemini-flash-latest")) {
    modelsToTry.push("gemini-flash-latest");
  }

  let lastError;
  for (const modelName of modelsToTry) {
    try {
      const config = responseMimeType ? { responseMimeType } : {};
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: config,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.warn(`[AI Service] Model "${modelName}" failed: ${err.message}. Trying fallback if available...`);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to generate content with available Gemini models");
}

/**
 * Builds the lead analysis from a REAL audit.
 * - websiteObservations come straight from measured findings (never from the model)
 * - the model only classifies the business, explains business impact and writes the pitch
 */
export const analyzeWebsite = async (url, businessName, { audit = null, findings = null, mapsContext = null } = {}) => {
  try {
    const verifiedFindings = findings || { performanceIssues: [], trustIssues: [], conversionIssues: [] };

    const prompt = `
      You are a senior digital growth consultant helping a freelancer pitch a local business.

      Business Name: ${businessName}
      Website URL: ${url || "None"}
      ${mapsContext ? `Google Maps context: ${JSON.stringify(mapsContext)}` : ""}

      MEASURED WEBSITE AUDIT (real data collected by our crawler and Google PageSpeed):
      ${JSON.stringify(audit || { hasWebsite: false })}

      VERIFIED FINDINGS (the ONLY problems you may mention):
      ${JSON.stringify(verifiedFindings)}

      STRICT RULES:
      - Never invent website problems. Only use the VERIFIED FINDINGS and the measured audit numbers.
      - If a check is missing or "unavailable", do not mention it.
      - If the business has no website, focus on the cost of having no website (lost searches, no enquiries, no trust).
      - Use concrete numbers from the audit where available (e.g. "PageSpeed 34/100", "5.2s load time").
      - Be specific and professional. No hype, no fake statistics.

      Return ONLY valid JSON with exactly these fields:
      {
        "industry": "Specific industry or niche",
        "businessType": "e.g. Local Business, B2B Services, B2C E-commerce, Healthcare Clinic",
        "keyPainPoints": ["Business impact of the verified findings, max 5, each one sentence"],
        "suggestedPitch": "2-3 sentence pitch referencing the most important verified findings and the business outcome of fixing them",
        "leadScore": { "value": 1, "reason": "One sentence based on the verified findings" }
      }

      Lead score rules (opportunity for a web/marketing freelancer):
      - 5 = No website, broken/insecure site, or many serious verified problems
      - 4 = Several clear verified problems (poor speed, no CTAs, no tracking)
      - 3 = Some verified problems
      - 2 = Site is mostly fine, few problems
      - 1 = Site is well optimized, little to sell
    `;

    const text = await generateWithFallback(prompt, "application/json");
    const parsed = parseJsonFromResponse(text);
    return { ...parsed, websiteObservations: verifiedFindings };
  } catch (error) {
    console.error("Error calling Gemini AI in analyzeWebsite:", error);
    throw new Error(`Failed to analyze lead with AI: ${error.message}`);
  }
};


export const generateEmailDraft = async (
  businessName,
  industry,
  contactName,
  painPoints,
  aiSummary,
  businessType,
  websiteObservations,
  website = null
) => {
  try {
    const hasWebsite = leadHasWebsite(website);

    const websiteContext = hasWebsite
      ? `Website Insights:
- Performance Issues: ${websiteObservations?.performanceIssues?.join(", ") || "None"}
- Trust Issues: ${websiteObservations?.trustIssues?.join(", ") || "None"}
- Conversion Issues: ${websiteObservations?.conversionIssues?.join(", ") || "None"}`
      : `Online Presence: This business does NOT have an existing website yet.`;

    const instructions = hasWebsite
      ? `- Choose ONLY the most impactful 1–2 website observations.
- Position the message around website redesign + SEO + long-term digital growth.
- You may refer to their current website and how improvements could help.
- Explain how redesign + SEO improvements affect real business outcomes (qualified leads, authority, growth).`
      : `- CRITICAL: This client has NO existing website. Do NOT say you reviewed their website, current website, existing site, or any website they already have.
- Do NOT reference website performance, trust signals, or conversion issues from a site they do not have.
- Position the message around building their first professional online presence — being found on Google, looking credible, and capturing leads online.
- Focus on industry relevance and business growth opportunities instead of website audit findings.`;

    const prompt = `
You are a senior digital growth consultant specializing in website design, SEO, and conversion-focused structure.
Your role is to help businesses grow digitally through a strong online presence.

Write a professional, personalized cold outreach email.

Client Context:
- Business Name: ${businessName}
- Industry: ${industry || "Unknown"}
- Business Type: ${businessType || "N/A"}
- Has Existing Website: ${hasWebsite ? "Yes" : "No"}

${websiteContext}

Primary Business Pain Points:
${painPoints?.join(", ") || "General digital growth gaps"}

Strategic Insight:
${aiSummary || "N/A"}

Instructions:
${instructions}
- Do NOT list services or packages.
- Tone should be calm, advisory, and founder-friendly (not salesy).
- End with a low-friction CTA (short walkthrough, quick idea, brief chat).
- Keep the email under 150 words.

Return ONLY valid JSON in this format:

{
  "subject": "Concise, non-spammy subject line",
  "body": "Email body text. Use \\n for line breaks."
}
`;

    const text = await generateWithFallback(prompt, "application/json");
    return parseJsonFromResponse(text);
  } catch (error) {
    console.error("Error generating email draft:", error);
    throw new Error(`Failed to generate email draft: ${error.message}`);
  }
};

export const generateWhatsAppDraft = async (
  businessName,
  industry,
  contactName,
  painPoints,
  businessType,
  websiteObservations,
  website = null
) => {
  try {
    const hasWebsite = leadHasWebsite(website);

    const observationLine = hasWebsite
      ? `- One Key Website Observation: ${
          websiteObservations?.conversionIssues?.[0] ||
          websiteObservations?.trustIssues?.[0] ||
          websiteObservations?.performanceIssues?.[0] ||
          "a small optimization opportunity"
        }`
      : `- Online Presence: This business does NOT have an existing website yet.`;

    const instructions = hasWebsite
      ? `- Naturally mention that you can help improve their website, SEO, and online visibility, linking this to better leads.
      - You may reference ONE specific website observation if it helps make the message concrete.
      - End with a soft question, such as asking if they would like a quick free review or a few redesign ideas.`
      : `- CRITICAL: This client has NO website. Do NOT mention reviewing their website, current website, existing site, or redesigning what they already have.
      - Frame the offer around building a professional website and online presence so customers can find and trust them.
      - End with a soft question, such as asking if they would like to see a few website ideas for their business.`;

    const prompt = `
      You are a senior web design and digital growth consultant reaching out informally on WhatsApp. 
 
      Write a short, friendly, and respectful WhatsApp message to start a conversation and introduce how you can help them grow online. 
 
      Client Context: 
      - Business Name: ${businessName} 
      - Industry: ${industry || "their industry"} 
      - Contact Name (if available): ${contactName || "there"} 
      - Has Existing Website: ${hasWebsite ? "Yes" : "No"}
      ${observationLine} 
 
      Instructions: 
      - 2–3 sentences maximum. 
      - Friendly, human, and conversational. 
      ${instructions}
      - You may briefly mention related digital growth help, but keep it light. 
 
      Return ONLY the raw message text. 
      Do not use markdown, bullet points, or emojis. 
    `;

    const text = await generateWithFallback(prompt, null);
    return text.trim();
  } catch (error) {
    console.error("Error generating WhatsApp draft:", error);
    throw new Error(`Failed to generate WhatsApp draft: ${error.message}`);
  }
};
