import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

export const apiRouter = express.Router();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

function getAI() {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is missing in your Vercel Environment Variables. Please add it and redeploy.");
  return new GoogleGenAI({ apiKey: key });
}

// Health Check
apiRouter.get(['/api/health', '/health', '/api'], (req, res) => {
  res.json({ status: 'ok', server: 'JB Fitness API', time: new Date().toISOString() });
});

// 1. Workout Advice
const handleWorkoutAdvice: express.RequestHandler = async (req, res) => {
  try {
    const { goal, experience } = req.body;
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I am a gym member with ${experience} experience. My goal is ${goal}. Give me a short 3-bullet point advice on my routine.`,
    });
    res.json({ advice: response.text });
  } catch (error: any) {
    console.error("Workout advice error:", error);
    res.status(500).json({ error: error.message });
  }
};
apiRouter.post("/api/ai/workout-advice", handleWorkoutAdvice);
apiRouter.post("/ai/workout-advice", handleWorkoutAdvice);

// 2. Admin Insights
const handleAdminInsights: express.RequestHandler = async (req, res) => {
  try {
    const { membersData, type } = req.body;
    let prompt = `You are an AI assistant for a gym owner. Here is the summary of some gym data: ${membersData}. Give a short 3-bullet point insight on how to improve gym retention and sales.`;
    
    if (type === 'forecast') {
      prompt = `You are a data analyst for a gym. Analyze this historical data: ${membersData}. Provide a concise prediction for peak hours for the upcoming week and revenue trends for the next month. Format as a short paragraph.`;
    }
    
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    res.json({ insights: response.text });
  } catch (error: any) {
    console.error("Admin insights error:", error);
    res.status(500).json({ error: error.message });
  }
};
apiRouter.post("/api/ai/admin-insights", handleAdminInsights);
apiRouter.post("/ai/admin-insights", handleAdminInsights);

// 3. AI Planner
const handlePlanner: express.RequestHandler = async (req, res) => {
  try {
    const { goal, weight, diet } = req.body;
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a 4-week workout and diet plan for a gym member. Goal: ${goal}. Current weight: ${weight}kg. Diet preference: ${diet}. Respond in valid JSON format with this structure: { "workoutPlan": [{ "week": 1, "focus": "...", "exercises": ["..."] }], "dietPlan": { "dailyCalories": 2000, "macros": "...", "meals": ["..."] } }`,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("Planner error:", error);
    res.status(500).json({ error: error.message });
  }
};
apiRouter.post("/api/ai/planner", handlePlanner);
apiRouter.post("/ai/planner", handlePlanner);

// 4. Machine Guide
const handleMachineGuide: express.RequestHandler = async (req, res) => {
  try {
    const { fileData, mimeType } = req.body;
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
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
    console.error("Machine guide error:", error);
    res.status(500).json({ error: error.message });
  }
};
apiRouter.post("/api/ai/machine-guide", handleMachineGuide);
apiRouter.post("/ai/machine-guide", handleMachineGuide);

// 5. Form Check
const handleFormCheck: express.RequestHandler = async (req, res) => {
  try {
    const { fileData, mimeType, exercise } = req.body;
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
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
    console.error("Form check error:", error);
    res.status(500).json({ error: error.message });
  }
};
apiRouter.post("/api/ai/form-check", handleFormCheck);
apiRouter.post("/ai/form-check", handleFormCheck);

// 6. AI Chatbot
const handleChat: express.RequestHandler = async (req, res) => {
  try {
    const { message, history, user } = req.body;
    
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    
    let memberStatusText = "Unsubscribed / Guest (No active purchased plan)";
    let memberData: any = null;
    
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
          memberData = data;
          memberStatusText = "Active Member with purchased " + data.plan + " plan";
        }
      } catch (e) {
        console.warn("Could not load member data for chat:", e);
      }
    } else if (user && user.plan && user.status === 'Active') {
      memberStatusText = "Active Member with purchased " + user.plan + " plan";
    }
    
    const systemInstruction = `You are a friendly, energetic 24/7 AI gym coach and receptionist for JB Fitness (Jai Balaji Fitness) named JB Fitness A.I.

LANGUAGE RULES:
- You are fluent in BOTH English and Hinglish (Hindi written in English alphabets, e.g. "Aapka workout routine...", "Agar aap diet chart chahte hain toh...", "Kaise madad kar sakta hoon aapki?").
- Reply dynamically in English or Hinglish depending on how the user talks to you. You can blend motivating Hinglish & English phrases naturally (e.g. "Namaste!", "Let's crush your goals!", "Aapka transformation hamari priority hai!").

CRITICAL ACCESS RULE (DIETS & WORKOUT PLANS):
- CURRENT USER STATUS: ${memberStatusText}
- STRICT CONDITION: Detailed diet plans, customized meal plans, calorie/macro breakdowns, exercise routines, and structured workout programs are strictly gated and ONLY available for Active Members who have purchased a membership plan.
- IF USER STATUS IS "Unsubscribed / Guest" (NO ACTIVE PLAN):
  - When the user asks for ANY diet plan, meal suggestions, calorie targets, workout routine, exercise split, or personal fitness programming:
    - YOU MUST NOT GIVE THE DIET OR WORKOUT ROUTINE.
    - Instead, politely explain in both English and Hinglish that personalized diet plans and custom workout routines are an exclusive premium benefit for JB Fitness active plan members.
    - Instruct them to go to the Plans section on the website to purchase a membership plan (e.g. 1 Month, 3 Months, 6 Months, 12 Months, or Pro/Elite AI plans) to unlock full personalized diet charts, custom workouts, vision form checking, and coach support.
    - Response Example (Hinglish/English):
      "Namaste! Personalized workout routines aur customized diet plans sirf hamare **Active JB Fitness Plan Members** ke liye exclusive hain.
      
      ✨ **Plan Unlock Karne Ke Liye:**
      Website ke **Plans** section mein jayein aur apna favorite membership plan (Basic, Pro, Elite, 3/6/12 Months) select karke buy karein. Jaise hi aapka plan activate hoga, aapko full custom diet charts, workout routines, aur AI coaching ka access mil jayega!
      
      Agar aapko gym timings, facilities, pricing ya class schedules ke baare mein jaanna hai, toh batayein, main madad karne ke liye tayar hoon!"
- IF USER STATUS IS "Active Member":
  - Provide full, detailed, expert-level workout routines, diet charts, calorie/macro targets, exercise guides, and recovery tips with clear markdown formatting, bold headers, and bullet points.

GENERAL GYM INFORMATION (Open to all):
- Location: 3rd floor, Shree Banke Bihari Plaza, Kailash Vihar, income tax office road, City Center, Gwalior - 474002 (M.P)
- Contact: +91 8770483654 | Email: jbfitnesshubthegym@gmail.com | Instagram: @jai_balaji_fitness_gym_ (Link: https://www.instagram.com/jai_balaji_fitness_gym_?igsh=M2JlMzdxMWNlNno=)
- Expert Coaches: Sushant Agrawal (Powerlifting), Nidhi Singh (Functional Training), Bhavendra (Bodybuilding Pro), Tushant (Strength & Conditioning).
- Timings: Monday to Saturday: 6:00 AM – 10:00 PM | Sunday: 7:00 AM – 1:00 PM
- Class Schedules: Yoga & Mobility (6:00 PM Tue/Thu), HIIT Cardio (7:00 AM Mon/Wed), Powerlifting 101.
- You have tools to retrieve workout history and book classes for logged-in members.`;

    const chat = getAI().chats.create({
      model: "gemini-2.5-flash",
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
          if (supabase && memberData && memberData.id) {
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
          if (supabase && memberData && memberData.id) {
            const { class_name, booking_time } = call.args as any;
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
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
};
apiRouter.post("/api/ai/chat", handleChat);
apiRouter.post("/ai/chat", handleChat);

// 7. Diet Tracker
const handleDietTracker: express.RequestHandler = async (req, res) => {
  try {
    const { fileData, mimeType } = req.body;
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
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
    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("Diet tracker error:", error);
    res.status(500).json({ error: error.message });
  }
};
apiRouter.post("/api/ai/diet-tracker", handleDietTracker);
apiRouter.post("/ai/diet-tracker", handleDietTracker);

// 8. Predictive Maintenance
const handlePredictiveMaintenance: express.RequestHandler = async (req, res) => {
  try {
    const { reports } = req.body;
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze these gym equipment fault reports: ${JSON.stringify(reports)}. Predict which high-use machines need maintenance. Respond in valid JSON format with this structure: { "predictions": [{ "machine": "...", "urgency": "High|Medium|Low", "reason": "..." }] }`,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error("Predictive maintenance error:", error);
    res.status(500).json({ error: error.message });
  }
};
apiRouter.post("/api/ai/predictive-maintenance", handlePredictiveMaintenance);
apiRouter.post("/ai/predictive-maintenance", handlePredictiveMaintenance);

app.use(apiRouter);

export default function handler(req: any, res: any) {
  return app(req, res);
}
