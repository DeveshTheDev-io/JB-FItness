const fs = require('fs');

let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

// 1. We need a way to get memberId on the frontend
const oldGeneratePlanner = `  const generatePlanner = async () => {
    if (!plannerGoal || !plannerWeight) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: plannerGoal, weight: plannerWeight, diet: plannerDiet })
      });
      const data = await res.json();
      setGeneratedPlan(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan.");
    } finally {
      setIsAiLoading(false);
    }
  };`;

const newGeneratePlanner = `  const generatePlanner = async () => {
    if (!plannerGoal || !plannerWeight) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: plannerGoal, weight: plannerWeight, diet: plannerDiet })
      });
      const data = await res.json();
      setGeneratedPlan(data);
      
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        // Find member ID
        const { data: memberData } = await supabase.from('members').select('id').eq('email', user.email).single();
        if (memberData) {
          await supabase.from('ai_plans').insert({ member_id: memberData.id, workout_plan: data.workoutPlan, diet_plan: data.dietPlan });
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan.");
    } finally {
      setIsAiLoading(false);
    }
  };`;

code = code.replace(oldGeneratePlanner, newGeneratePlanner);

// 2. We need to pass memberId to the chat API
const oldSendMsg = `  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    setIsAiLoading(true);
    
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatMessage, history: chatHistory })
      });
      const data = await res.json();
      setChatHistory([...newHistory, { role: 'model', text: data.text }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };`;

const newSendMsg = `  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    setIsAiLoading(true);
    
    try {
      let memberId = null;
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        const { data: memberData } = await supabase.from('members').select('id').eq('email', user.email).single();
        if (memberData) memberId = memberData.id;
      }
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatMessage, history: chatHistory, memberId })
      });
      const data = await res.json();
      setChatHistory([...newHistory, { role: 'model', text: data.text }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };`;

code = code.replace(oldSendMsg, newSendMsg);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
