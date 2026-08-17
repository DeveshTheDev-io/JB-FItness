import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

const FALLBACK_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash"
];

export async function generateGeminiContent({
  contents,
  systemInstruction,
  responseMimeType
}: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
}) {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is missing in your Vercel Environment Variables. Please add GEMINI_API_KEY in Vercel settings.");
  }

  const bodyPayload: any = {
    contents: Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: String(contents) }] }]
  };

  if (systemInstruction) {
    bodyPayload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (responseMimeType) {
    bodyPayload.generationConfig = {
      responseMimeType: responseMimeType
    };
  }

  let lastError = "";

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { text };
      } else {
        lastError = await response.text();
        console.warn(`Model ${model} failed with ${response.status}. Trying next model...`);
      }
    } catch (err: any) {
      lastError = err.message || String(err);
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}
