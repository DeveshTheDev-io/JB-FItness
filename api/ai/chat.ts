import { Type } from "@google/genai";
import { getAI, supabase } from "../_shared";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { message, history, user } = req.body || {};
    
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    
    let memberStatusText = "Guest (Not logged in or no active plan)";
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
          memberStatusText = "Active Member (" + data.plan + " plan)";
        }
      } catch (e) {
        console.warn("Could not load member data for chat:", e);
      }
    }
    
    const systemInstruction = "You are a friendly, 24/7 AI gym receptionist and personal coach for JB Fitness named JB Fitness A.I. You understand and can reply fluently in both Hinglish (Hindi written in English alphabet) and English, depending on what language the user speaks. You can answer questions about website plans, community events, gym rules, class schedules (Yoga at 6 PM Tue/Thu, HIIT at 7 AM Mon/Wed), and general fitness advice. IMPORTANT RULE: Information specifically about diet and workouts MUST ONLY be given to members having an active plan purchased. Current User Status: " + memberStatusText + ". If the user's status is 'Guest' or 'Expired' and they ask for diet plans, workout routines, or specific exercise/diet advice, politely inform them that they need to purchase or renew a plan to access premium diet and workout features. You can still talk about general topics like gym timings, prices, and features. You have tools to check the user's workout history and book classes for them. Be concise, engaging, and helpful. Format your responses in a highly professional, well-structured manner using markdown bullet points, bold text for emphasis, and short paragraphs to make it easily readable.";

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
    
    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
}
