import { getAI } from "../_shared";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { reports } = req.body || {};
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze these gym equipment fault reports: ${JSON.stringify(reports)}. Predict which high-use machines need maintenance. Respond in valid JSON format with this structure: { "predictions": [{ "machine": "...", "urgency": "High|Medium|Low", "reason": "..." }] }`,
      config: { responseMimeType: "application/json" }
    });
    res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("Predictive maintenance error:", error);
    res.status(500).json({ error: error.message });
  }
}
