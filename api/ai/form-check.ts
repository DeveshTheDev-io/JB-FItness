import { generateGeminiContent } from "../../lib/ai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { fileData, mimeType, exercise } = req.body || {};
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
              text: `Analyze this user performing a ${exercise}. Give concise, real-time style feedback on their form. What are they doing right, and what needs correction (e.g., knees caving, back rounding)? Keep it to 2-3 sentences in motivating Hinglish/English.`
            }
          ]
        }
      ]
    });
    res.status(200).json({ feedback: result.text });
  } catch (error: any) {
    console.error("Form check error:", error);
    res.status(500).json({ error: error.message });
  }
}
