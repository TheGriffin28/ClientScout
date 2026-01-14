import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeWebsite = async (url, businessName) => {
  try {
    // Switching to gemini-flash-latest which is confirmed to work
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Analyze the following business lead based on their website URL and business name.
      
      Business Name: ${businessName}
      Website URL: ${url}

      Please provide a detailed analysis in valid JSON format ONLY. Do not include any markdown formatting (like \`\`\`json).
      
      The JSON object must have the following fields:
      - "industry": The specific industry the business operates in.
      - "businessType": The type of business (e.g., B2B SaaS, E-commerce, Local Service).
      - "weaknesses": An array of strings listing potential website weaknesses or areas for improvement (e.g., "Slow load time", "No clear CTA", "Outdated design").
      - "pitch": A suggested sales pitch or value proposition tailored to this business based on their weaknesses.
      - "score": A lead score from 1 to 5 (integer), where 5 is a high-quality lead and 1 is low quality.

      If the website URL is missing or invalid, try to infer details from the Business Name, but note that in the analysis.
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

export const generateEmailDraft = async (businessName, industry, contactName, painPoints, aiSummary) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      Write a cold outreach email to a potential client.
      
      Client Details:
      - Business Name: ${businessName}
      - Contact Name: ${contactName || "Decision Maker"}
      - Industry: ${industry || "Unknown"}
      - Identified Pain Points: ${painPoints ? painPoints.join(", ") : "General improvement"}
      - AI Insight: ${aiSummary || "N/A"}

      The email should be:
      1. Professional but conversational.
      2. Focus on solving their specific pain points.
      3. Short and concise (under 150 words).
      4. Include a clear Call to Action (CTA).

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

export const generateWhatsAppDraft = async (businessName, contactName, painPoints) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      Write a short, casual WhatsApp message to a potential client.

      Client Details:
      - Business Name: ${businessName}
      - Contact Name: ${contactName || "Decision Maker"}
      - Pain Points: ${painPoints ? painPoints.join(", ") : "Growth"}

      The message should be:
      1. Friendly and casual (suitable for WhatsApp).
      2. 2-3 sentences maximum.
      3. Non-spammy.
      4. End with a soft question or CTA.

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
