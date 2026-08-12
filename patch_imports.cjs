const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  "import {  Activity",
  "import { Menu, X, Activity"
);

code = code.replace(
  "const [activeTab, setActiveTab] = useState('workout');",
  "const [activeTab, setActiveTab] = useState('workout');\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
