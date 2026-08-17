import { generateGeminiContent } from "../_shared";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { fileData, mimeType } = req.body || {};
    const result = await generateGeminiContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: fileData,
                mimeType: mimeType,
              }
            },
            {
              text: `Analyze this food image. Estimate the calories, protein (g), carbs (g), and fats (g). Respond in valid JSON format with this structure: { "foodName": "...", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }`
            }
          ]
        }
      ],
      responseMimeType: "application/json"
    });
    res.status(200).json(JSON.parse(result.text || '{}'));
  } catch (error: any) {
    console.error("Diet tracker error:", error);
    res.status(500).json({ error: error.message });
  }
}
