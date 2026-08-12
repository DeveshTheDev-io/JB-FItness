const fs = require('fs');

let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const streakUpdateLogic = `
        setLogForms(prev => {
          const newState = { ...prev };
          delete newState[idx];
          return newState;
        });
        
        // Streak Logic
        const todayStr = new Date().toISOString().split('T')[0];
        let newStreak = memberInfo.streak_count || 0;
        let shouldUpdateStreak = false;
        
        if (memberInfo.last_workout_date !== todayStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (memberInfo.last_workout_date === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          
          shouldUpdateStreak = true;
        }

        if (shouldUpdateStreak) {
          const { data: updatedMember, error: streakError } = await supabase
            .from('members')
            .update({ streak_count: newStreak, last_workout_date: todayStr })
            .eq('id', memberInfo.id)
            .select()
            .single();
            
          if (!streakError && updatedMember) {
            setMemberInfo(updatedMember);
          }
        }
        
        alert('Set logged successfully!');
`;

code = code.replace(
  /setLogForms\(prev => \{\s*const newState = \{ \.\.\.prev \};\s*delete newState\[idx\];\s*return newState;\s*\}\);\s*alert\('Set logged successfully!'\);/,
  streakUpdateLogic
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
