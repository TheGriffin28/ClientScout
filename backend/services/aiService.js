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

export const generateEmailDraft = async (businessName, industry, contactName, painPoints, aiSummary, businessType, websiteObservations) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      You are a senior digital conversion consultant. Write a professional, highly personalized cold outreach email to a potential client.
      
      Client Details:
      - Business Name: ${businessName}
      - Business Type: ${businessType || "N/A"}
      - Contact Name: ${contactName || "Decision Maker"}
      - Industry: ${industry || "Unknown"}
      - Identified Pain Points: ${painPoints ? painPoints.join(", ") : "General improvement"}
      - Website Observations: 
        * Performance: ${websiteObservations?.performanceIssues?.join(", ") || "None noted"}
        * Trust: ${websiteObservations?.trustIssues?.join(", ") || "None noted"}
        * Conversion: ${websiteObservations?.conversionIssues?.join(", ") || "None noted"}
      - AI Strategy Insight: ${aiSummary || "N/A"}

      The email should:
      1. Have a compelling, non-spammy subject line.
      2. Start with a personalized opening that mentions their business.
      3. Briefly mention 1-2 specific observations about their website (performance, trust, or conversion) to show you've done your research.
      4. Pivot to how these issues are likely affecting their revenue or growth.
      5. Offer a clear, low-friction Call to Action (CTA) like a "quick 5-minute video" or a "brief chat".
      6. Be professional but conversational, under 150 words.

      Return ONLY a valid JSON object with this format:
      {
        "subject": "The email subject line",
        "body": "The email body content (use \\n for line breaks)"
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

export const generateWhatsAppDraft = async (businessName, contactName, painPoints, businessType, websiteObservations) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      You are a senior digital conversion consultant. Write a short, casual, and friendly WhatsApp message to a potential client.

      Client Details:
      - Business Name: ${businessName}
      - Business Type: ${businessType || "N/A"}
      - Contact Name: ${contactName || "Decision Maker"}
      - Key Website Issue: ${websiteObservations?.conversionIssues?.[0] || websiteObservations?.performanceIssues?.[0] || "General optimization"}

      The message should be:
      1. Very brief (2-3 sentences).
      2. Friendly and casual (suitable for WhatsApp).
      3. Mention one specific "quick win" or observation about their website to grab attention.
      4. End with a soft question to start a conversation.
      5. No spammy links or heavy sales pitch.

      Return ONLY the raw text of the message. Do not use Markdown or JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating WhatsApp draft:", error);
    throw new Error("Failed to generate WhatsApp draft");
  }
};
