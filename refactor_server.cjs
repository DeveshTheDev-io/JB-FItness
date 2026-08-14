const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We want to create server/api.ts
let apiCode = code.replace(/async function startServer\(\) \{([\s\S]*?)if \(process\.env\.NODE_ENV !== "production"\)/, function(match, inner) {
  return `export const apiRouter = express.Router();\n\n` + inner.replace(/app\./g, 'apiRouter.');
});

// Now we need to remove the startServer wrapper and Vite stuff for apiCode
// Let's just do it cleanly by extracting the whole chunk
let startMatch = code.indexOf('app.post("/api/ai/workout-advice"');
let endMatch = code.indexOf('if (process.env.NODE_ENV !== "production")');

if (startMatch !== -1 && endMatch !== -1) {
    let routes = code.substring(startMatch, endMatch);
    routes = routes.replace(/app\./g, 'apiRouter.');
    
    let imports = `import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

export const apiRouter = express.Router();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.log("Gemini API not configured properly.");
}

apiRouter.use(express.json({ limit: '50mb' }));
apiRouter.use(express.urlencoded({ limit: '50mb', extended: true }));

`;

    fs.mkdirSync('server', { recursive: true });
    fs.writeFileSync('server/api.ts', imports + routes);
    
    // Now update server.ts
    let newServer = `import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./server/api";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(apiRouter);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();
`;
    fs.writeFileSync('server.ts', newServer);
}
