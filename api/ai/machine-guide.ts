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
        `Analyze this image of a gym machine. Identify the machine and provide step-by-step instructions on how to use it safely and effectively. Provide the instructions in both English and Hinglish (Hindi written in English alphabet). Keep it concise, engaging, and easy to read. Use bullet points.`
      ]
    });
    res.status(200).json({ instructions: response.text });
  } catch (error: any) {
    console.error("Machine guide error:", error);
    res.status(500).json({ error: error.message });
  }
}
