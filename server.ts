import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for generating AI workout tips for member
  app.post("/api/ai/workout-advice", async (req, res) => {
    try {
      const { goal, experience } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `I am a gym member with ${experience} experience. My goal is ${goal}. Give me a short 3-bullet point advice on my routine.`,
      });
      res.json({ advice: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Admin AI insights
  app.post("/api/ai/admin-insights", async (req, res) => {
    try {
      const { membersData, type } = req.body;
      let prompt = `You are an AI assistant for a gym owner. Here is the summary of some gym data: ${membersData}. Give a short 3-bullet point insight on how to improve gym retention and sales.`;
      
      if (type === 'forecast') {
        prompt = `You are a data analyst for a gym. Analyze this historical data: ${membersData}. Provide a concise prediction for peak hours for the upcoming week and revenue trends for the next month. Format as a short paragraph.`;
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });
      res.json({ insights: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Smart Workout & Diet Planner
  app.post("/api/ai/planner", async (req, res) => {
    try {
      const { goal, weight, diet } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Generate a 4-week workout and diet plan for a gym member. Goal: ${goal}. Current weight: ${weight}kg. Diet preference: ${diet}. Respond in valid JSON format with this structure: { "workoutPlan": [{ "week": 1, "focus": "...", "exercises": ["..."] }], "dietPlan": { "dailyCalories": 2000, "macros": "...", "meals": ["..."] } }`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for AI Form Checker
  app.post("/api/ai/form-check", async (req, res) => {
    try {
      const { fileData, mimeType, exercise } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            inlineData: {
              data: fileData, // base64 string
              mimeType: mimeType,
            }
          },
          `Analyze this user performing a ${exercise}. Give concise, real-time style feedback on their form. What are they doing right, and what needs correction (e.g., knees caving, back rounding)? Keep it to 2-3 sentences.`
        ]
      });
      res.json({ feedback: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Gym Receptionist Chatbot
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      const chat = ai.chats.create({
        model: "gemini-3.6-flash",
        history: [
          {
            role: "user",
            parts: [{ text: "System prompt: You are a friendly, 24/7 AI gym receptionist and personal coach for JB Fitness. You can answer questions about gym rules, class schedules (Yoga at 6 PM Tue/Thu, HIIT at 7 AM Mon/Wed), and general fitness advice. Be concise and helpful." }]
          },
          {
            role: "model",
            parts: [{ text: "Got it! I am ready to help JB Fitness members as their AI receptionist and coach." }]
          },
          ...formattedHistory
        ]
      });
      
      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
