const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Fix imports
code = code.replace(
  ", AlertTriangle, CheckCircle, Tool } from 'lucide-react';",
  ", AlertTriangle, Wrench } from 'lucide-react';"
);

// Fix TS errors by defining state
const stateCode = `
  const [userComplaints, setUserComplaints] = useState<any[]>([]);
  
  const fetchComplaints = () => {
    const existing = JSON.parse(localStorage.getItem('gymComplaints') || '[]');
    setUserComplaints(existing.reverse());
  };

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchComplaints();
    }
  }, [activeTab]);

  const resolveComplaint = (id: string) => {
    const existing = JSON.parse(localStorage.getItem('gymComplaints') || '[]');
    const updated = existing.map((c: any) => c.id === id ? { ...c, status: 'Resolved' } : c);
    localStorage.setItem('gymComplaints', JSON.stringify(updated));
    setUserComplaints(updated.reverse());
  };
`;

if (!code.includes('const [userComplaints')) {
  code = code.replace(
    "const [activeTab, setActiveTab] = useState('overview');",
    "const [activeTab, setActiveTab] = useState('overview');\n" + stateCode
  );
}

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
