import express from "express";
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

apiRouter.post("/api/ai/workout-advice", async (req, res) => {
    try {
      const { goal, experience } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `I am a gym member with ${experience} experience. My goal is ${goal}. Give me a short 3-bullet point advice on my routine.`,
      });
      res.json({ advice: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post("/api/ai/admin-insights", async (req, res) => {
    try {
      const { membersData, type } = req.body;
      let prompt = `You are an AI assistant for a gym owner. Here is the summary of some gym data: ${membersData}. Give a short 3-bullet point insight on how to improve gym retention and sales.`;
      
      if (type === 'forecast') {
        prompt = `You are a data analyst for a gym. Analyze this historical data: ${membersData}. Provide a concise prediction for peak hours for the upcoming week and revenue trends for the next month. Format as a short paragraph.`;
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });
      res.json({ insights: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post("/api/ai/planner", async (req, res) => {
    try {
      const { goal, weight, diet } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Generate a 4-week workout and diet plan for a gym member. Goal: ${goal}. Current weight: ${weight}kg. Diet preference: ${diet}. Respond in valid JSON format with this structure: { "workoutPlan": [{ "week": 1, "focus": "...", "exercises": ["..."] }], "dietPlan": { "dailyCalories": 2000, "macros": "...", "meals": ["..."] } }`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

    apiRouter.post("/api/ai/machine-guide", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          {
            inlineData: {
              data: fileData,
              mimeType: mimeType,
            }
          },
          `Analyze this image of a gym machine. Identify the machine and provide step-by-step instructions on how to use it safely and effectively. Provide the instructions in both English and Hinglish (Hindi written in English alphabet). Keep it concise, engaging, and easy to read. Use bullet points.`
        ]
      });
      res.json({ instructions: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post("/api/ai/form-check", async (req, res) => {
    try {
      const { fileData, mimeType, exercise } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          {
            inlineData: {
              data: fileData,
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

  apiRouter.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history, user } = req.body;
      
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      let memberStatusText = "Guest (Not logged in or no active plan)";
      let memberData = null;
      
      if (user && (user.email || user.username)) {
        let query = supabase.from('members').select('*');
        if (user.email) {
          query = query.eq('email', user.email);
        } else {
          query = query.eq('name', user.username);
        }
        const { data, error } = await query.single();
        if (data && data.status === 'Active' && data.plan) {
          memberData = data;
          memberStatusText = "Active Member (" + data.plan + " plan)";
        }
      }
      
      const systemInstruction = "You are a friendly, 24/7 AI gym receptionist and personal coach for JB Fitness named JB Fitness A.I. You understand and can reply fluently in both Hinglish (Hindi written in English alphabet) and English, depending on what language the user speaks. You can answer questions about website plans, community events, gym rules, class schedules (Yoga at 6 PM Tue/Thu, HIIT at 7 AM Mon/Wed), and general fitness advice. IMPORTANT RULE: Information specifically about diet and workouts MUST ONLY be given to members having an active plan purchased. Current User Status: " + memberStatusText + ". If the user's status is 'Guest' or 'Expired' and they ask for diet plans, workout routines, or specific exercise/diet advice, politely inform them that they need to purchase or renew a plan to access premium diet and workout features. You can still talk about general topics like gym timings, prices, and features. You have tools to check the user's workout history and book classes for them. Be concise, engaging, and helpful. Format your responses in a highly professional, well-structured manner using markdown bullet points, bold text for emphasis, and short paragraphs to make it easily readable.";

      const chat = ai.chats.create({
        model: "gemini-3.1-flash-lite",
        config: {
          systemInstruction,
          tools: [{
            functionDeclarations: [
              {
                name: "get_workout_history",
                description: "Retrieves the user's workout history (e.g., max bench press, recent logs).",
                parameters: {
                  type: Type.OBJECT,
                  properties: {},
                }
              },
              {
                name: "book_class",
                description: "Books a gym class for the user.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    class_name: { type: Type.STRING, description: "The name of the class to book (e.g., 'Yoga', 'HIIT')." },
                    booking_time: { type: Type.STRING, description: "The time of the class in ISO format." }
                  },
                  required: ["class_name", "booking_time"]
                }
              }
            ]
          }]
        },
        history: formattedHistory
      });
      
      let response = await chat.sendMessage({ message });
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        const calls = response.functionCalls;
        const functionResponses = [];
        
        for (const call of calls) {
          if (call.name === "get_workout_history") {
            if (memberData && memberData.id) {
              const { data, error } = await supabase.from('workout_logs').select('*').eq('member_id', memberData.id).order('completed_at', { ascending: false }).limit(10);
              if (error) {
                functionResponses.push({ name: call.name, response: { error: "Failed to fetch logs" } });
              } else {
                functionResponses.push({ name: call.name, response: { logs: data } });
              }
            } else {
               functionResponses.push({ name: call.name, response: { error: "User not logged in or member doesn't exist." } });
            }
          } else if (call.name === "book_class") {
            if (memberData && memberData.id) {
              const { class_name, booking_time } = call.args;
              const { error } = await supabase.from('class_bookings').insert({ member_id: memberData.id, class_name, booking_time });
              if (error) {
                functionResponses.push({ name: call.name, response: { success: false, error: error.message } });
              } else {
                functionResponses.push({ name: call.name, response: { success: true, message: "Successfully booked " + class_name + " at " + booking_time } });
              }
            } else {
               functionResponses.push({ name: call.name, response: { success: false, error: "User not logged in or member doesn't exist." } });
            }
          }
        }
        
        response = await chat.sendMessage({ message: functionResponses as any });
      }
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post("/api/ai/diet-tracker", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          {
            inlineData: {
              data: fileData,
              mimeType: mimeType,
            }
          },
          `Analyze this food image. Estimate the calories, protein (g), carbs (g), and fats (g). Respond in valid JSON format with this structure: { "foodName": "...", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }`
        ],
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post("/api/ai/predictive-maintenance", async (req, res) => {
    try {
      const { reports } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Analyze these gym equipment fault reports: ${JSON.stringify(reports)}. Predict which high-use machines need maintenance. Respond in valid JSON format with this structure: { "predictions": [{ "machine": "...", "urgency": "High|Medium|Low", "reason": "..." }] }`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  