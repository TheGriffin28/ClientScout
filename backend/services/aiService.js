import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  websiteObservations
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
You are a senior digital growth consultant specializing in website redesign, SEO, and conversion-focused structure.
Your role is to help businesses grow digitally by turning their websites into high-performing growth assets.

Write a professional, personalized cold outreach email.

Client Context:
- Business Name: ${businessName}
- Industry: ${industry || "Unknown"}
- Business Type: ${businessType || "N/A"}

Website Insights:
- Performance Issues: ${websiteObservations?.performanceIssues?.join(", ") || "None"}
- Trust Issues: ${websiteObservations?.trustIssues?.join(", ") || "None"}
- Conversion Issues: ${websiteObservations?.conversionIssues?.join(", ") || "None"}

Primary Business Pain Points:
${painPoints?.join(", ") || "General digital growth gaps"}

Strategic Insight:
${aiSummary || "N/A"}

Instructions:
- Choose ONLY the most impactful 1–2 website observations.
- Position the message around website redesign + SEO + long-term digital growth.
- Clearly imply that the current website may not fully support visibility, credibility, or lead generation.
- Explain how redesign + SEO improvements affect real business outcomes (qualified leads, authority, growth).
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

export const generateWhatsAppDraft = async (businessName, industry, contactName, painPoints, businessType, websiteObservations) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      You are a senior web design and digital growth consultant reaching out informally on WhatsApp. 
 
      Write a short, friendly, and respectful WhatsApp message to start a conversation and introduce how you can help by redesigning their website and improving their online performance. 
 
      Client Context: 
      - Business Name: ${businessName} 
      - Industry: ${industry || "their industry"} 
      - Contact Name (if available): ${contactName || "there"} 
      - One Key Website Observation: ${
        websiteObservations?.conversionIssues?.[0] ||
        websiteObservations?.trustIssues?.[0] ||
        websiteObservations?.performanceIssues?.[0] ||
        "a small optimization opportunity"
      } 
 
      Instructions: 
      - 2–3 sentences maximum. 
      - Friendly, human, and conversational. 
      - Naturally mention that you can redesign their website and improve SEO and loading speed, linking this to better visibility and more leads. 
      - You may briefly mention that you can also help with other related digital growth services, but keep it light. 
      - Reference ONE specific observation or quick win if it helps make the message more concrete. 
      - End with a soft question (easy to reply yes/no), such as asking if they would like a quick free review or a few redesign ideas. 
 
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
