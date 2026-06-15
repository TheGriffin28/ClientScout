import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function leadHasWebsite(website) {
  if (!website || typeof website !== "string") return false;
  const trimmed = website.trim().toLowerCase();
  if (!trimmed || ["n/a", "na", "none", "no", "no website", "-"].includes(trimmed)) {
    return false;
  }
  return true;
}

export const analyzeWebsite = async (url, businessName) => {
  try {
    // Switching to gemini-flash-latest which is confirmed to work
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are a senior digital conversion consultant specializing in website optimization and lead qualification. 
 
      Analyze the following business lead using their website and business name. 
 
      Business Name: ${businessName} 
      Website URL: ${url} 
 
      If a website is accessible, base your analysis primarily on the website’s structure, content, UX patterns, and conversion signals. 
      If the website is inaccessible or incomplete, infer cautiously from the business name and clearly mention assumptions. 
 
      Return ONLY valid JSON. Do not include markdown, explanations, or extra text. 
 
      The JSON object must contain the following fields: 
 
      { 
        "industry": "Specific industry or niche the business operates in", 
        "businessType": "Business type (e.g., B2C E-commerce, B2B Services, Local Business, SaaS, Manufacturing)", 
        "websiteObservations": { 
          "performanceIssues": [ 
            "Issues related to speed, mobile usability, image optimization, etc." 
          ], 
          "trustIssues": [ 
            "Missing or weak trust signals such as certifications, testimonials, compliance badges, reviews, etc." 
          ], 
          "conversionIssues": [ 
            "Issues related to CTAs, checkout flow, lead capture, messaging clarity, or friction points" 
          ] 
        }, 
        "keyPainPoints": [ 
          "Concrete business or website pain points that could directly impact conversions or revenue" 
        ], 
        "suggestedPitch": "A concise, professional outreach pitch explaining how digital improvements could realistically help this business grow revenue or conversions", 
        "leadScore": { 
          "value": 1, 
          "reason": "Short explanation of why this lead was scored at this level" 
        } 
      } 
 
      Lead score rules: 
      - 5 = Strong opportunity with clear website or conversion gaps 
      - 4 = Good opportunity with noticeable optimization potential 
      - 3 = Average opportunity, limited but possible improvements 
      - 2 = Weak opportunity, mostly optimized or low fit 
      - 1 = Poor fit or minimal digital opportunity 
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown if present (just in case)
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error calling Gemini AI:", error);
    throw new Error("Failed to analyze lead with AI");
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
  hasDesigns = false,
  website = null
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
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
${hasDesigns ? `- IMPORTANT: We already created 2 custom website design previews for this client. Mention that they can review both designs, but do NOT include any URLs or links in the email body (a review button will be added separately when sending). Also briefly note that images and text in the preview are placeholder samples that will be replaced with the client's real photos, branding, and content.` : ""}

Return ONLY valid JSON in this format:

{
  "subject": "Concise, non-spammy subject line",
  "body": "Email body text. Use \\n for line breaks."
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating email draft:", error);
    throw new Error("Failed to generate email draft");
  }
};

export const generateWhatsAppDraft = async (
  businessName,
  industry,
  contactName,
  painPoints,
  businessType,
  websiteObservations,
  hasDesigns = false,
  website = null
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
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
      ${hasDesigns ? `- IMPORTANT: We created 2 website design previews for this client. Mention they can review both designs, but do NOT include any URLs (the link will be shared separately). Also note that images and content in the preview are placeholders and will be updated with their real branding and photos.` : ""}
 
      Return ONLY the raw message text. 
      Do not use markdown, bullet points, or emojis. 
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating WhatsApp draft:", error);
    throw new Error("Failed to generate WhatsApp draft");
  }
};

export const generateWebsiteLayout = async (
  businessName,
  industry,
  businessType,
  painPoints,
  aiSummary,
  websiteObservations = null,
  hasWebsite = true
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const auditSection = hasWebsite && websiteObservations
      ? `Website Audit (issues found on their CURRENT site — the new design must fix these):
- Performance Issues: ${websiteObservations.performanceIssues?.join("; ") || "None noted"}
- Trust Issues: ${websiteObservations.trustIssues?.join("; ") || "None noted"}
- Conversion Issues: ${websiteObservations.conversionIssues?.join("; ") || "None noted"}`
      : hasWebsite
      ? `Website Audit: Client has an existing website but no detailed audit yet. Write copy that improves on a typical outdated business website.`
      : `Online Presence: Client has NO existing website. Write copy for a brand-new professional website launch.`;

    const contentRules = hasWebsite && websiteObservations
      ? `- Directly address the audit issues above in the copy (stronger CTAs if conversion issues, more trust signals if trust issues, concise sections if performance issues).
      - Hero headline and CTAs must be clearer and more action-oriented than a typical weak business website.
      - Include 3 testimonials that feel credible and build trust.
      - Services section must be scannable with clear benefits.`
      : `- Keep writing concrete and non-generic.
      - Keep testimonials realistic, short, and trust-building.
      - Services must match the business category.`;

    const prompt = `
      You are a senior web designer and conversion copywriter for local businesses.
      Generate a complete website DESIGN RECIPE and CONTENT for a unique, non-generic website.

      Business Name: ${businessName} 
      Industry: ${industry || "General"} 
      Business Type: ${businessType || "N/A"} 
      Pain Points: ${painPoints?.join(", ") || "N/A"} 
      Strategic Insight: ${aiSummary || "N/A"}

      ${auditSection}

      Rules:
      ${contentRules}
      - Create a completely unique design that feels custom to the business, not like a template.
      - Choose colors, fonts, and layout that match the business industry and vibe.
      - pitchMessage should mention we analyzed their situation${hasWebsite ? " and their current website" : ""} and created an improved design concept.

      Return ONLY valid JSON. Do not include markdown or extra text. 

      The JSON object must follow this exact structure: 

      { 
        "content": {
          "hero": {
            "headline": "Benefit-driven headline with business name",
            "tagline": "One short supporting line",
            "primaryCta": "Call Now / Book Now",
            "secondaryCta": "Get Free Quote / WhatsApp Us"
          },
          "about": {
            "title": "About heading",
            "description": "80-120 words trust-building description"
          }, 
          "services": [
            { "name": "Service 1", "description": "1-2 lines" },
            { "name": "Service 2", "description": "1-2 lines" },
            { "name": "Service 3", "description": "1-2 lines" }
          ],
          "testimonials": [
            { "name": "Customer 1", "quote": "Natural positive review rewrite." },
            { "name": "Customer 2", "quote": "Natural positive review rewrite." },
            { "name": "Customer 3", "quote": "Natural positive review rewrite." }
          ],
          "contact": {
            "phone": "Use placeholder if not known",
            "address": "Use placeholder if not known",
            "ctaText": "Call / WhatsApp CTA"
          }
        },
        "design": {
          "colors": {
            "primary": "#hexcolor",
            "secondary": "#hexcolor",
            "accent": "#hexcolor",
            "background": "#hexcolor",
            "surface": "#hexcolor",
            "text": "#hexcolor"
          },
          "typography": {
            "headingFont": "Font Name (e.g., 'Playfair Display', 'Poppins', 'Inter')",
            "bodyFont": "Font Name (e.g., 'Inter', 'Roboto', 'Open Sans')"
          },
          "layout": {
            "sections": ["hero", "stats", "features", "about", "services", "testimonials", "cta", "contact"],
            "heroVariant": "left-image" | "large-visual" | "centered" | "split",
            "cardStyle": "grid" | "overlap" | "list" | "cards",
            "spacing": "compact" | "regular" | "spacious"
          },
          "aesthetic": "modern" | "classic" | "bold" | "minimal" | "playful" | "elegant" | "technical" | "nature"
        },
        "pitchMessage": "A short outreach message saying we created this website preview and asking if they want to make it live."
      } 
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating website layout:", error);
    throw new Error("Failed to generate website layout");
  }
};
