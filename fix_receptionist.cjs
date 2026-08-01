const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const importReplacement = `import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
`;

code = code.replace(`import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();`, importReplacement);

const oldChatApi = `  app.post("/api/ai/chat", async (req, res) => {
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
  });`;

const newChatApi = `  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history, memberId } = req.body;
      
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      // We use systemInstruction for the persona
      const chat = ai.chats.create({
        model: "gemini-3.6-flash",
        config: {
          systemInstruction: "You are a friendly, 24/7 AI gym receptionist and personal coach for JB Fitness. You can answer questions about gym rules, class schedules (Yoga at 6 PM Tue/Thu, HIIT at 7 AM Mon/Wed), and general fitness advice. You have tools to check the user's workout history and book classes for them. Be concise and helpful. When booking a class, confirm the booking with them.",
          tools: [{
            functionDeclarations: [
              {
                name: "get_workout_history",
                description: "Retrieves the user's workout history (e.g., max bench press, recent logs).",
                parameters: {
                  type: "OBJECT",
                  properties: {},
                }
              },
              {
                name: "book_class",
                description: "Books a gym class for the user.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    class_name: { type: "STRING", description: "The name of the class to book (e.g., 'Yoga', 'HIIT')." },
                    booking_time: { type: "STRING", description: "The time of the class in ISO format." }
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
            if (memberId) {
              const { data, error } = await supabase.from('workout_logs').select('*').eq('member_id', memberId).order('completed_at', { ascending: false }).limit(10);
              if (error) {
                functionResponses.push({ name: call.name, response: { error: "Failed to fetch logs" } });
              } else {
                functionResponses.push({ name: call.name, response: { logs: data } });
              }
            } else {
               functionResponses.push({ name: call.name, response: { error: "User not logged in or memberId not provided." } });
            }
          } else if (call.name === "book_class") {
            if (memberId) {
              const { class_name, booking_time } = call.args;
              const { error } = await supabase.from('class_bookings').insert({ member_id: memberId, class_name, booking_time });
              if (error) {
                functionResponses.push({ name: call.name, response: { success: false, error: error.message } });
              } else {
                functionResponses.push({ name: call.name, response: { success: true, message: 'Successfully booked ' + class_name + ' at ' + booking_time } });
              }
            } else {
               functionResponses.push({ name: call.name, response: { success: false, error: "User not logged in." } });
            }
          }
        }
        
        response = await chat.sendMessage(functionResponses);
      }
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });`;

code = code.replace(oldChatApi, newChatApi);

fs.writeFileSync('server.ts', code);
