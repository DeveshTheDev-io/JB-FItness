import { getAI } from "../_shared";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { goal, experience } = req.body || {};
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I am a gym member with ${experience} experience. My goal is ${goal}. Give me a short 3-bullet point advice on my routine.`,
    });
    res.status(200).json({ advice: response.text });
  } catch (error: any) {
    console.error("Workout advice error:", error);
    res.status(500).json({ error: error.message });
  }
}
