const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  "setMemberInfo(member);",
  "setMemberInfo(member);\n        setProfileForm({ gender: member.gender || '', phone: member.phone || '', dob: member.dob || '', address: member.address || '', photo_url: member.photo_url || '' });"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
