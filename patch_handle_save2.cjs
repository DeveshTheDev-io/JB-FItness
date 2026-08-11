const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /const \{ error \} = await supabase\s*\.from\('members'\)\s*\.update\(\{\s*gender: profileForm\.gender,\s*phone: profileForm\.phone,\s*dob: profileForm\.dob,\s*address: profileForm\.address,\s*photo_url: profileForm\.photo_url\s*\}\)\s*\.eq\('id', memberInfo\.id\);\s*if \(error\) throw error;/g,
  `const { data: updatedData, error } = await supabase
        .from('members')
        .update({ 
          gender: profileForm.gender, 
          phone: profileForm.phone, 
          dob: profileForm.dob, 
          address: profileForm.address,
          photo_url: profileForm.photo_url
        })
        .eq('id', memberInfo.id)
        .select();
        
      if (error) throw error;
      if (!updatedData || updatedData.length === 0) {
        throw new Error('Could not update the database. Row Level Security (RLS) policies might be blocking the update, or the user ID was not found.');
      }`
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
