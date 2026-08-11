const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminLogin.tsx', 'utf8');

code = code.replace(
  /const \{ data: memberDataList \} = await supabase\s*\.from\('members'\)\s*\.select\('\*'\)\s*\.or\(\`name\.eq\.\$\{username\},email\.eq\.\$\{username\}\`\)\s*\.limit\(1\);/g,
  `let query = supabase.from('members').select('*');
          if (username.includes('@')) {
            query = query.eq('email', username);
          } else {
            query = query.or(\`name.eq.\${username},email.eq.\${username}\`);
          }
          const { data: memberDataList } = await query.limit(1);`
);

fs.writeFileSync('src/pages/AdminLogin.tsx', code);
