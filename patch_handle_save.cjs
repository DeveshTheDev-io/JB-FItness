const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  "if (!supabase || !memberInfo?.id) return;",
  "if (!supabase) return;\n    if (!memberInfo?.id) {\n      alert('User profile not loaded correctly. Please try logging in again.');\n      return;\n    }"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
