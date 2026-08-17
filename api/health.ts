import { getAI, supabase } from "./_shared";

export default async function handler(req: any, res: any) {
  let aiStatus = "unknown";
  let aiError = null;
  let hasKey = false;
  
  try {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    hasKey = Boolean(key);
    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hi in one word"
    });
    aiStatus = "ok: " + result.text;
  } catch (err: any) {
    aiStatus = "error";
    aiError = err?.message || String(err);
  }

  res.status(200).json({ 
    status: "ok", 
    server: "JB Fitness API", 
    hasGeminiKey: hasKey,
    hasSupabase: Boolean(supabase),
    aiStatus,
    aiError,
    time: new Date().toISOString() 
  });
}
