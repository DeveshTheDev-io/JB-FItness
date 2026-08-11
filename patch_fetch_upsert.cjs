const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /const \{ data: member \} = await supabase\s*\.from\('members'\)\s*\.select\('id, name, email, status, plan, gender, photo_url, dob, phone, address'\)\s*\.or\(\`email\.eq\.\$\{user\.email\},name\.eq\.\$\{user\.username \|\| user\.email\}\`\)\s*\.single\(\);/g,
  `let { data: member } = await supabase
        .from('members')
        .select('id, name, email, status, plan, gender, photo_url, dob, phone, address')
        .or(\`email.eq.\${user.email},name.eq.\${user.username || user.email}\`)
        .single();
        
      if (!member && supabase) {
        // Auto-create member if not exists
        const newMember = { 
          name: user.username || user.email.split('@')[0], 
          email: user.email, 
          status: 'Active', 
          plan: 'Basic',
          gender: user.gender || 'Male'
        };
        const { data: createdMember } = await supabase.from('members').insert([newMember]).select().single();
        if (createdMember) {
          member = createdMember;
        }
      }`
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
