const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  /<tab\.icon className="w-5 h-5" \/>\s*\{tab\.label\} \{isTabLocked\(tab\.id\) && <Lock className="w-4 h-4 ml-auto text-neutral-400" \/>\}/,
  '<tab.icon className="w-5 h-5 shrink-0" />\n              <span className="flex-1 flex items-center justify-between min-w-0">\n                <span className="truncate">{tab.label}</span>\n                {isTabLocked(tab.id) && <Lock className="w-4 h-4 text-neutral-400 ml-2 shrink-0" />}\n              </span>'
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
