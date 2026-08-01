const fs = require('fs');
const adminCode = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
fs.writeFileSync('src/pages/AdminDashboard.tsx', adminCode.replace(/ size="sm"/g, ''));

const memberCode = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');
fs.writeFileSync('src/pages/MemberDashboard.tsx', memberCode.replace(/ size="sm"/g, ''));

