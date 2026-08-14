const fs = require('fs');
let code = fs.readFileSync('server/api.ts', 'utf8');

// Replace ai instantiation with lazy initialization
code = code.replace(
  /let ai;\s*try {\s*ai = new GoogleGenAI\({ apiKey: process\.env\.GEMINI_API_KEY }\);\s*} catch \(e\) {\s*console\.log\("Gemini API not configured properly\."\);\s*}/g,
  `function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is missing in your Vercel Environment Variables. Please add it and redeploy.");
  return new GoogleGenAI({ apiKey: key });
}`
);

// Replace ai.models or ai.chats with getAI().models or getAI().chats
code = code.replace(/ai\.models\.generateContent/g, "getAI().models.generateContent");
code = code.replace(/ai\.chats\.create/g, "getAI().chats.create");

fs.writeFileSync('server/api.ts', code);
