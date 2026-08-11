const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  "{ id: 'classes', icon: Calendar, label: 'Book Classes' },",
  "{ id: 'classes', icon: Calendar, label: 'Book Classes' },\n            { id: 'profile', icon: User, label: 'Profile Settings' },"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
