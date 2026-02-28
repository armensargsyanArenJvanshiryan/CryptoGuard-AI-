import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskReason: string;
  isScamLikely: boolean;
  scamWarning: string;
  keyTakeaways: string[];
}

export async function analyzeCryptoNews(newsText: string, imageBase64?: string): Promise<AnalysisResult> {
  const parts: any[] = [];
  
  if (newsText) {
    parts.push({ text: `Analyze the following crypto news or project description: "${newsText}"` });
  }
  
  if (imageBase64) {
    // Extract mime type and data from base64 string
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      });
      parts.push({ text: "Also analyze this image for any crypto-related information, charts, or project details." });
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: "You are a professional crypto analyst and security expert. Your goal is to simplify complex crypto news for beginners, assess the risk level of the mentioned project or news, and detect potential scams or red flags. You can analyze text and images in ANY language. IMPORTANT: Provide the response (summary, reasons, takeaways) in the SAME language as the input news/image. Be objective and cautious.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A simple, easy-to-understand explanation of the news in the same language as the input.",
          },
          riskLevel: {
            type: Type.STRING,
            enum: ["LOW", "MEDIUM", "HIGH"],
            description: "The overall risk level associated with this news or project.",
          },
          riskReason: {
            type: Type.STRING,
            description: "The reason for the assigned risk level in the same language as the input.",
          },
          isScamLikely: {
            type: Type.BOOLEAN,
            description: "Whether the news or project shows signs of being a scam.",
          },
          scamWarning: {
            type: Type.STRING,
            description: "Specific red flags or warnings if a scam is suspected in the same language as the input.",
          },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 key points from the news in the same language as the input.",
          },
        },
        required: ["summary", "riskLevel", "riskReason", "isScamLikely", "scamWarning", "keyTakeaways"],
      },
    },
  });

  const result = JSON.parse(response.text || "{}");
  return result as AnalysisResult;
}
