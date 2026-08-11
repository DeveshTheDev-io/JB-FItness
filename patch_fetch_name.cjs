const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /\.select\('id, status, plan, gender, photo_url, dob, phone, address'\)/,
  ".select('id, name, email, status, plan, gender, photo_url, dob, phone, address')"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
