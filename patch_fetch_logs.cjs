const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /if \(attendance\) setMyAttendance\(attendance\);\s*\}\s*};\s*fetchUserData\(\);/g,
  `if (attendance) setMyAttendance(attendance);
        
        const { data: wLogs } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('member_id', member.id)
          .order('completed_at', { ascending: false });
        
        if (wLogs) setWorkoutLogs(wLogs);
      }
    };
    fetchUserData();`
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
