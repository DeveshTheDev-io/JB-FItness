import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash"
];

// Anti-abuse IP rate limiter
const ipRateMap = new Map<string, { count: number; resetAt: number }>();
// Quick response cache for zero-token FAQ answers
const faqCache = new Map<string, { reply: string; expiresAt: number }>();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. IP Rate Limiting to prevent token draining bots
  const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket?.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const rateRecord = ipRateMap.get(clientIp);

  if (rateRecord && now < rateRecord.resetAt) {
    if (rateRecord.count >= 15) {
      const waitSec = Math.ceil((rateRecord.resetAt - now) / 1000);
      return res.status(429).json({ 
        text: `⏳ **Rate limit reached:** Token aur abuse protection ke liye, kripya ${waitSec} seconds wait karein. (Please wait ${waitSec}s before sending another message).` 
      });
    }
    rateRecord.count += 1;
  } else {
    ipRateMap.set(clientIp, { count: 1, resetAt: now + 5 * 60 * 1000 });
  }

  try {
    let { message, history, user } = req.body || {};
    
    // 2. Input sanitization & character length capping (Max 400 chars)
    let sanitizedMessage = String(message || '').trim().slice(0, 400);
    if (!sanitizedMessage) {
      return res.status(400).json({ text: "Please enter a valid message." });
    }

    // 3. Fast Zero-Token FAQ Cache Check
    const normalizedKey = sanitizedMessage.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cached = faqCache.get(normalizedKey);
    if (cached && now < cached.expiresAt && (!user || user.status !== 'Active')) {
      return res.status(200).json({ text: cached.reply });
    }

    // 4. Sliding Context Window (Keep only last 4 messages / 2 turns) to save 80% tokens
    const contents: any[] = [];
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-4);
      for (const msg of recentHistory) {
        if (msg && msg.text) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(msg.text).slice(0, 300) }]
          });
        }
      }
    }
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: sanitizedMessage }]
    });
    
    let memberStatusText = "Unsubscribed / Guest (No active purchased plan)";
    let isMemberActive = false;
    
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
          isMemberActive = true;
          memberStatusText = "Active Member with purchased " + data.plan + " plan";
        }
      } catch (e) {
        console.warn("Could not load member data for chat:", e);
      }
    } else if (user && user.plan && user.status === 'Active') {
      isMemberActive = true;
      memberStatusText = "Active Member with purchased " + user.plan + " plan";
    }
    
    const systemInstruction = `You are a friendly, energetic 24/7 AI gym coach and receptionist for JB Fitness (Jai Balaji Fitness) named JB Fitness A.I.

LANGUAGE RULES:
- Fluent in English & Hinglish. Reply in Hinglish when asked in Hindi/Hinglish, and English when asked in English. Keep answers concise and motivating.

CRITICAL ACCESS RULE (DIETS & WORKOUT PLANS):
- CURRENT USER STATUS: ${memberStatusText}
- Detailed diet plans, macro calculations, and custom workout routines are strictly reserved for Active Members.
- IF USER STATUS IS "Unsubscribed / Guest" (NO ACTIVE PLAN):
  - If user asks for ANY diet plan, meal split, calorie target, or workout routine:
    - Politely decline in Hinglish & English and prompt them to purchase a plan from the Plans section of our website to unlock full custom diet charts & workouts.
- IF USER STATUS IS "Active Member":
  - Provide full, structured workout routines and diet charts.

GENERAL GYM INFORMATION:
- Location: 3rd floor, Shree Banke Bihari Plaza, Kailash Vihar, income tax office road, City Center, Gwalior - 474002 (M.P)
- Contact: +91 8770483654 | Email: jbfitnesshubthegym@gmail.com | Instagram: @jai_balaji_fitness_gym_ (Link: https://www.instagram.com/jai_balaji_fitness_gym_?igsh=M2JlMzdxMWNlNno=)
- Coaches: Sushant Agrawal (Powerlifting), Nidhi Singh (Functional), Bhavendra (Bodybuilding), Tushant (Strength & Conditioning).
- Timings: Mon-Sat: 6:00 AM – 10:00 PM | Sun: 7:00 AM – 1:00 PM.`;

    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set in environment variables." });
    }

    let lastError = "";

    for (const model of MODELS) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              maxOutputTokens: isMemberActive ? 700 : 400,
              temperature: 0.7
            }
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that response.";
          
          // Cache common guest queries for 1 hour to save tokens
          if (!isMemberActive && sanitizedMessage.length < 50) {
            faqCache.set(normalizedKey, { reply: replyText, expiresAt: now + 60 * 60 * 1000 });
          }

          return res.status(200).json({ text: replyText });
        } else {
          lastError = await geminiRes.text();
          console.warn(`Model ${model} failed with ${geminiRes.status}. Trying fallback model...`);
        }
      } catch (err: any) {
        lastError = err.message || String(err);
      }
    }

    res.status(500).json({ error: `All Gemini models failed. Last error: ${lastError}` });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
}
