const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const filterLogic = `const userGenderRaw = memberInfo?.gender || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).gender : null);
                      const userGender = userGenderRaw ? String(userGenderRaw).trim().toLowerCase() : 'male';
                      if (userGender === 'male') return key.includes('mens');
                      if (userGender === 'female') return key.includes('womens');
                      return true;`;

code = code.replace(
  /const userGender = memberInfo\?\.gender \|\| \(localStorage\.getItem\('currentUser'\) \? JSON\.parse\(localStorage\.getItem\('currentUser'\)!\)\.gender : null\) \|\| 'Male';\s*if \(userGender === 'Male'\) return key\.includes\('mens'\);\s*if \(userGender === 'Female'\) return key\.includes\('womens'\);\s*return true;/g,
  filterLogic
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
