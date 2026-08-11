const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /let \{ data: membersList, error: fetchError \} = await supabase\s*\.from\('members'\)\s*\.select\('id, name, email, status, plan, gender, photo_url, dob, phone, address'\)\s*\.or\(\`email\.eq\.\$\{user\.email\},name\.eq\.\$\{user\.username \|\| user\.email\}\`\)\s*\.limit\(1\);/g,
  `let query = supabase
        .from('members')
        .select('id, name, email, status, plan, gender, photo_url, dob, phone, address');
        
      if (user.email && user.email.includes('@')) {
        query = query.eq('email', user.email);
      } else {
        query = query.or(\`name.eq.\${user.username},email.eq.\${user.username}\`);
      }
      
      let { data: membersList, error: fetchError } = await query.limit(1);`
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
