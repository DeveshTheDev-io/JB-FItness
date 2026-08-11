const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const profileCardHTML = `
        {/* User Profile Card */}
        <Card variant="flat" className="hidden md:flex items-center gap-4 p-4 mt-auto">
          <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
            {memberInfo?.photo_url ? (
              <img src={memberInfo.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-neutral-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">{memberInfo?.name || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).username : 'User')}</p>
            <p className="text-xs opacity-70 truncate">{memberInfo?.email || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).email : '')}</p>
          </div>
        </Card>

        {/* Mini Subscription Status */}
`;

code = code.replace(
  /\{\/\* Mini Subscription Status \*\/\}/,
  profileCardHTML
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
