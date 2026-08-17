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

// 1. In-Memory Anti-Abuse Rate Limiter (IP-based)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(clientIp: string, maxRequests = 12, windowMs = 5 * 60 * 1000): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  // Clean old entries if map grows
  if (rateLimitMap.size > 2000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true };
}

// 2. In-Memory Response Cache for Frequently Asked Questions
interface CacheEntry {
  response: string;
  expiresAt: number;
}
const queryCache = new Map<string, CacheEntry>();

export function getCachedResponse(normalizedQuery: string): string | null {
  const entry = queryCache.get(normalizedQuery);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.response;
  }
  if (entry) queryCache.delete(normalizedQuery);
  return null;
}

export function setCachedResponse(normalizedQuery: string, response: string, ttlMs = 60 * 60 * 1000) {
  if (queryCache.size > 500) {
    queryCache.clear();
  }
  queryCache.set(normalizedQuery, {
    response,
    expiresAt: Date.now() + ttlMs
  });
}

// 3. Ultra-Optimized Gemini Content Generation
export async function generateGeminiContent({
  contents,
  systemInstruction,
  responseMimeType,
  maxOutputTokens = 600
}: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  maxOutputTokens?: number;
}) {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is missing in your Vercel Environment Variables.");
  }

  const bodyPayload: any = {
    contents: Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: String(contents) }] }],
    generationConfig: {
      maxOutputTokens: maxOutputTokens,
      temperature: 0.7
    }
  };

  if (systemInstruction) {
    bodyPayload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (responseMimeType) {
    bodyPayload.generationConfig.responseMimeType = responseMimeType;
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
        console.warn(`Model ${model} returned ${response.status}. Falling back...`);
      }
    } catch (err: any) {
      lastError = err.message || String(err);
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}
