import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client safely
let ai: GoogleGenAI | null = null;
try {
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    }
} catch (error) {
    console.error("Failed to initialize GoogleGenAI", error);
}

export const generateProductDescription = async (productName: string, format: string): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Please check your environment variables.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Write a compelling, high-converting product description for a digital product named "${productName}". The format is ${format}. Target audience is Mozambique. Keep it professional yet persuasive, around 100 words. Use Portuguese language.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error connecting to AI service.";
  }
};