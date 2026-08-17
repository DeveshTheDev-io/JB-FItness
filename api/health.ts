import { generateGeminiContent, supabase } from "../lib/ai";

export default async function handler(req: any, res: any) {
  let aiStatus = "unknown";
  let aiError = null;
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  try {
    const result = await generateGeminiContent({
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
    hasGeminiKey: Boolean(key),
    hasSupabase: Boolean(supabase),
    aiStatus,
    aiError,
    time: new Date().toISOString() 
  });
}
