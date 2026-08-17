import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./server/api";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
  });
  
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  app.get(['/health', '/api/health'], (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
  app.use(apiRouter);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      if (req.method !== 'GET') return next();
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
