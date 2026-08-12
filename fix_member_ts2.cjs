const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');
if (!code.includes("import Markdown from 'react-markdown';")) {
  code = "import Markdown from 'react-markdown';\n" + code;
  fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
}
