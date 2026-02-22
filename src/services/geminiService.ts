import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PluginResponse {
  pluginName: string;
  description: string;
  code: string;
  installationSteps: string[];
}

export async function generateWooCommercePlugin(prompt: string): Promise<PluginResponse> {
  const systemInstruction = `
    You are an expert WordPress and WooCommerce developer. 
    Your task is to generate a high-quality, secure, and functional WordPress plugin based on the user's request.
    
    Guidelines:
    1. Follow WordPress coding standards.
    2. Use appropriate WooCommerce hooks (actions and filters).
    3. Include a standard WordPress plugin header.
    4. Ensure the code is well-commented.
    5. Use a unique prefix for all functions and classes to avoid conflicts.
    6. Provide a clear explanation of what the plugin does and how to install it.
    
    Output format: JSON
    {
      "pluginName": "String",
      "description": "Short description",
      "code": "The full PHP code for the plugin",
      "installationSteps": ["Step 1", "Step 2", ...]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `User request: ${prompt}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return result as PluginResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Failed to generate plugin code. Please try again.");
  }
}
