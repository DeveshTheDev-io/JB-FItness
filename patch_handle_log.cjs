const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const handleLogSetCode = `
  const handleLogSet = async (ex: any, idx: number) => {
    if (!supabase || !memberInfo) return;
    const logData = logForms[idx];
    if (!logData?.weight || !logData?.reps) {
      alert("Please enter weight and reps");
      return;
    }
    
    setIsLoggingSet(idx);
    
    try {
      const newLog = {
        member_id: memberInfo.id,
        exercise_name: ex.name,
        weight: parseFloat(logData.weight),
        reps: parseInt(logData.reps, 10)
      };
      
      const { data, error } = await supabase
        .from('workout_logs')
        .insert([newLog])
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setWorkoutLogs(prev => [data, ...prev]);
        setLogForms(prev => {
          const newState = { ...prev };
          delete newState[idx];
          return newState;
        });
        alert('Set logged successfully!');
      }
    } catch (e: any) {
      alert('Failed to log set: ' + (e.message || 'Unknown error'));
    } finally {
      setIsLoggingSet(null);
    }
  };

`;

code = code.replace(
  "const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {",
  handleLogSetCode + "const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
