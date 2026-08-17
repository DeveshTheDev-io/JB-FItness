import { getAI } from "../_shared";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { fileData, mimeType } = req.body || {};
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType,
          }
        },
        `Analyze this food image. Estimate the calories, protein (g), carbs (g), and fats (g). Respond in valid JSON format with this structure: { "foodName": "...", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }`
      ],
      config: { responseMimeType: "application/json" }
    });
    res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("Diet tracker error:", error);
    res.status(500).json({ error: error.message });
  }
}
