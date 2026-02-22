import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: `
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
  `
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonResponse = JSON.parse(text);
      res.status(200).json(jsonResponse);
    } catch (parseError) {
      // If not JSON, just send text
      res.status(200).send(text);
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
