const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /\.select\('id, status, plan'\)/,
  ".select('id, status, plan, gender')"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
