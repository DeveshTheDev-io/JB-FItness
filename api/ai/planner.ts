import { generateGeminiContent } from "../_shared";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { goal, weight, diet } = req.body || {};
    const result = await generateGeminiContent({
      contents: `Generate a 4-week workout and diet plan for a gym member. Goal: ${goal}. Current weight: ${weight}kg. Diet preference: ${diet}. Respond in valid JSON format with this structure: { "workoutPlan": [{ "week": 1, "focus": "...", "exercises": ["..."] }], "dietPlan": { "dailyCalories": 2000, "macros": "...", "meals": ["..."] } }`,
      responseMimeType: "application/json"
    });
    res.status(200).json(JSON.parse(result.text || '{}'));
  } catch (error: any) {
    console.error("Planner error:", error);
    res.status(500).json({ error: error.message });
  }
}
