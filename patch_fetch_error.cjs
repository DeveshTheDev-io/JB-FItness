const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /let \{ data: membersList, error: fetchError \} = await query\.limit\(1\);/,
  `let { data: membersList, error: fetchError } = await query.limit(1);
      if (fetchError) console.error('Error fetching member:', fetchError);`
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
