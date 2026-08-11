const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  "export default function MemberDashboard() {\n  const [activeTab, setActiveTab] = useState('workout');",
  "export default function MemberDashboard() {\n  const navigate = useNavigate();\n  const [activeTab, setActiveTab] = useState('workout');"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
