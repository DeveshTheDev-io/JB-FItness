import { getAI } from "../_shared";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { fileData, mimeType, exercise } = req.body || {};
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType,
          }
        },
        `Analyze this user performing a ${exercise}. Give concise, real-time style feedback on their form. What are they doing right, and what needs correction (e.g., knees caving, back rounding)? Keep it to 2-3 sentences.`
      ]
    });
    res.status(200).json({ feedback: response.text });
  } catch (error: any) {
    console.error("Form check error:", error);
    res.status(500).json({ error: error.message });
  }
}
