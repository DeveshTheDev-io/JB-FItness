const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /\.eq\('email', user\.email\)/g,
  ".or(`email.eq.${user.email},name.eq.${user.username || user.email}`)"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
