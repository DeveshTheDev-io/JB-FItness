import { generateGeminiContent } from "../_shared";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { membersData, type } = req.body || {};
    let prompt = `You are an AI assistant for a gym owner. Here is the summary of some gym data: ${membersData}. Give a short 3-bullet point insight on how to improve gym retention and sales.`;
    
    if (type === 'forecast') {
      prompt = `You are a data analyst for a gym. Analyze this historical data: ${membersData}. Provide a concise prediction for peak hours for the upcoming week and revenue trends for the next month. Format as a short paragraph.`;
    }
    
    const result = await generateGeminiContent({
      contents: prompt,
      systemInstruction: "You are an expert gym analytics consultant."
    });
    res.status(200).json({ insights: result.text });
  } catch (error: any) {
    console.error("Admin insights error:", error);
    res.status(500).json({ error: error.message });
  }
}
