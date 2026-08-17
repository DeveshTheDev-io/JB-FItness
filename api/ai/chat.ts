import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { message, history, user } = req.body || {};
    
    // Format history for Gemini API
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      }
    }
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: String(message || '') }]
    });
    
    let memberStatusText = "Unsubscribed / Guest (No active purchased plan)";
    
    if (supabase && user && (user.email || user.username)) {
      try {
        let query = supabase.from('members').select('*');
        if (user.email) {
          query = query.eq('email', user.email);
        } else {
          query = query.eq('name', user.username);
        }
        const { data } = await query.single();
        if (data && data.status === 'Active' && data.plan) {
          memberStatusText = "Active Member with purchased " + data.plan + " plan";
        }
      } catch (e) {
        console.warn("Could not load member data for chat:", e);
      }
    } else if (user && user.plan && user.status === 'Active') {
      memberStatusText = "Active Member with purchased " + user.plan + " plan";
    }
    
    const systemInstruction = `You are a friendly, energetic 24/7 AI gym coach and receptionist for JB Fitness (Jai Balaji Fitness) named JB Fitness A.I.

LANGUAGE RULES:
- You are fluent in BOTH English and Hinglish (Hindi written in English alphabets, e.g. "Aapka workout routine...", "Agar aap diet chart chahte hain toh...", "Kaise madad kar sakta hoon aapki?").
- Reply dynamically in English or Hinglish depending on how the user talks to you. You can blend motivating Hinglish & English phrases naturally (e.g. "Namaste!", "Let's crush your goals!", "Aapka transformation hamari priority hai!").

CRITICAL ACCESS RULE (DIETS & WORKOUT PLANS):
- CURRENT USER STATUS: ${memberStatusText}
- STRICT CONDITION: Detailed diet plans, customized meal plans, calorie/macro breakdowns, exercise routines, and structured workout programs are strictly gated and ONLY available for Active Members who have purchased a membership plan.
- IF USER STATUS IS "Unsubscribed / Guest" (NO ACTIVE PLAN):
  - When the user asks for ANY diet plan, meal suggestions, calorie targets, workout routine, exercise split, or personal fitness programming:
    - YOU MUST NOT GIVE THE DIET OR WORKOUT ROUTINE.
    - Instead, politely explain in both English and Hinglish that personalized diet plans and custom workout routines are an exclusive premium benefit for JB Fitness active plan members.
    - Instruct them to go to the Plans section on the website to purchase a membership plan (e.g. 1 Month, 3 Months, 6 Months, 12 Months, or Pro/Elite AI plans) to unlock full personalized diet charts, custom workouts, vision form checking, and coach support.
    - Response Example (Hinglish/English):
      "Namaste! Personalized workout routines aur customized diet plans sirf hamare **Active JB Fitness Plan Members** ke liye exclusive hain.
      
      ✨ **Plan Unlock Karne Ke Liye:**
      Website ke **Plans** section mein jayein aur apna favorite membership plan (Basic, Pro, Elite, 3/6/12 Months) select karke buy karein. Jaise hi aapka plan activate hoga, aapko full custom diet charts, workout routines, aur AI coaching ka access mil jayega!
      
      Agar aapko gym timings, facilities, pricing ya class schedules ke baare mein jaanna hai, toh batayein, main madad karne ke liye tayar hoon!"
- IF USER STATUS IS "Active Member":
  - Provide full, detailed, expert-level workout routines, diet charts, calorie/macro targets, exercise guides, and recovery tips with clear markdown formatting, bold headers, and bullet points.

GENERAL GYM INFORMATION (Open to all):
- Location: 3rd floor, Shree Banke Bihari Plaza, Kailash Vihar, income tax office road, City Center, Gwalior - 474002 (M.P)
- Contact: +91 8770483654 | Email: jbfitnesshubthegym@gmail.com | Instagram: @jai_balaji_fitness_gym_ (Link: https://www.instagram.com/jai_balaji_fitness_gym_?igsh=M2JlMzdxMWNlNno=)
- Expert Coaches: Sushant Agrawal (Powerlifting), Nidhi Singh (Functional Training), Bhavendra (Bodybuilding Pro), Tushant (Strength & Conditioning).
- Timings: Monday to Saturday: 6:00 AM – 10:00 PM | Sunday: 7:00 AM – 1:00 PM
- Class Schedules: Yoga & Mobility (6:00 PM Tue/Thu), HIIT Cardio (7:00 AM Mon/Wed), Powerlifting 101.`;

    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set in environment variables." });
    }

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return res.status(500).json({ error: `Gemini error (${geminiRes.status}): ${errText}` });
    }

    const data = await geminiRes.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that response.";
    res.status(200).json({ text: replyText });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
}
