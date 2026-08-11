const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const oldMap = /\{Object\.entries\(routines\)\.map\(\(\[key, routine\]\) => \{/g;
const newMap = `{Object.entries(routines).filter(([key]) => {
                      const userGender = memberInfo?.gender || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).gender : null) || 'Male';
                      if (userGender === 'Male') return key.includes('mens');
                      if (userGender === 'Female') return key.includes('womens');
                      return true;
                    }).map(([key, routine]) => {`;

code = code.replace(oldMap, newMap);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
