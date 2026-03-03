import { GoogleGenAI, Type } from "@google/genai";

export interface AnalysisResult {
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskReason: string;
  isScamLikely: boolean;
  scamWarning: string;
  keyTakeaways: string[];
  generatedImage?: string;
}

export async function analyzeCryptoNews(newsText: string, imageBase64?: string, targetLanguage: string = "Auto-detect"): Promise<AnalysisResult> {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API key is not set. Please select an API key or check your environment variables.");
  }
  const ai = new GoogleGenAI({ apiKey });
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

  const languageInstruction = targetLanguage === "Auto-detect" 
    ? "Provide the response (summary, reasons, takeaways) in the SAME language as the input news/image."
    : `Provide the response (summary, reasons, takeaways) in ${targetLanguage}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: `You are a professional crypto analyst and security expert. Your goal is to simplify complex crypto news for beginners, assess the risk level of the mentioned project or news, and detect potential scams or red flags. You can analyze text and images in ANY language. IMPORTANT: ${languageInstruction} Be objective and cautious.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A simple, easy-to-understand explanation of the news in the target language.",
          },
          riskLevel: {
            type: Type.STRING,
            enum: ["LOW", "MEDIUM", "HIGH"],
            description: "The overall risk level associated with this news or project.",
          },
          riskReason: {
            type: Type.STRING,
            description: "The reason for the assigned risk level in the target language.",
          },
          isScamLikely: {
            type: Type.BOOLEAN,
            description: "Whether the news or project shows signs of being a scam.",
          },
          scamWarning: {
            type: Type.STRING,
            description: "Specific red flags or warnings if a scam is suspected in the target language.",
          },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 key points from the news in the target language.",
          },
        },
        required: ["summary", "riskLevel", "riskReason", "isScamLikely", "scamWarning", "keyTakeaways"],
      },
    },
  });

  const result = JSON.parse(response.text || "{}") as AnalysisResult;

  // Generate illustrative image
  try {
    let promptPrefix = "A futuristic 3D render of a cryptocurrency coin or token.";
    if (result.riskLevel === 'HIGH' || result.isScamLikely) {
      promptPrefix = "A dramatic, warning visualization of a crypto scam, red neon, danger, digital security threat, glitch effect.";
    } else {
      promptPrefix = "A high-quality, futuristic digital art illustration of a promising cryptocurrency project, blue and purple neon, success, blockchain technology, clean 3D render.";
    }
    
    // Truncate summary to avoid token limits and keep prompt focused
    const imagePrompt = `${promptPrefix} Context: ${result.summary.slice(0, 200)}`;

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imagePrompt }] },
    });

    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        result.generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }
  } catch (e) {
    console.error("Image generation failed", e);
    // Continue without image if generation fails
  }

  return result;
}
