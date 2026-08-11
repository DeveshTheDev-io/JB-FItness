const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const profileStates = `  const [memberInfo, setMemberInfo] = useState<any>(null);
  
  // Profile Settings State
  const [profileForm, setProfileForm] = useState({ gender: '', phone: '', dob: '', address: '', photo_url: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
`;

code = code.replace(
  "const [memberInfo, setMemberInfo] = useState<any>(null);",
  profileStates
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
