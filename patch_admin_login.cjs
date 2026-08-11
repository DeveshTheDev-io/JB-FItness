const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminLogin.tsx', 'utf8');

code = code.replace(
  /const \{ data: memberData \} = await supabase\s*\.from\('members'\)\s*\.select\('\*'\)\s*\.or\(\`name\.eq\.\$\{username\},email\.eq\.\$\{username\}\`\)\s*\.single\(\);/g,
  `const { data: memberDataList } = await supabase
            .from('members')
            .select('*')
            .or(\`name.eq.\${username},email.eq.\${username}\`)
            .limit(1);
          const memberData = memberDataList?.[0] || null;`
);

fs.writeFileSync('src/pages/AdminLogin.tsx', code);
