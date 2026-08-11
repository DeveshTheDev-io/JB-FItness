const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /<Button variant="ghost" size="sm" onClick=\{\(e\) => \{/g,
  '<Button variant="ghost" onClick={(e) => {'
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
