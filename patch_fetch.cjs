const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /let \{ data: member \} = await supabase\s*\.from\('members'\)\s*\.select\('id, name, email, status, plan, gender, photo_url, dob, phone, address'\)\s*\.or\(\`email\.eq\.\$\{user\.email\},name\.eq\.\$\{user\.username \|\| user\.email\}\`\)\s*\.single\(\);/g,
  `let { data: membersList, error: fetchError } = await supabase
        .from('members')
        .select('id, name, email, status, plan, gender, photo_url, dob, phone, address')
        .or(\`email.eq.\${user.email},name.eq.\${user.username || user.email}\`)
        .limit(1);
      
      let member = membersList?.[0] || null;`
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
