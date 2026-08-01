const fs = require('fs');

// 1. Fix server.ts
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('import { GoogleGenAI } from "@google/genai";', 'import { GoogleGenAI, Type } from "@google/genai";');
code = code.replace(/type: "OBJECT"/g, 'type: Type.OBJECT');
code = code.replace(/type: "STRING"/g, 'type: Type.STRING');
code = code.replace('response = await chat.sendMessage(functionResponses);', 'response = await chat.sendMessage(functionResponses as any);');

fs.writeFileSync('server.ts', code);

// 2. Fix AdminDashboard.tsx & MemberDashboard.tsx Button variants
const adminCode = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
fs.writeFileSync('src/pages/AdminDashboard.tsx', adminCode.replace(/variant="outline"/g, 'variant="default"'));

const memberCode = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');
fs.writeFileSync('src/pages/MemberDashboard.tsx', memberCode.replace(/variant="outline"/g, 'variant="default"'));

