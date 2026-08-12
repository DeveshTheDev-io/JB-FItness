const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

if (!code.includes('UserCheck')) {
  code = code.replace(
    "XCircle, Database, Star, MessageSquare, Trash2, Edit2, AlertTriangle, Wrench } from 'lucide-react';",
    "XCircle, Database, Star, MessageSquare, Trash2, Edit2, AlertTriangle, Wrench, UserCheck } from 'lucide-react';"
  );
}

const confirmFnOld = `const confirmPTBooking = (id: string) => {
    const updated = ptBookings.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b);
    setPtBookings(updated);
    localStorage.setItem('ptBookings', JSON.stringify(updated));
  };`;
  
if (!code.includes('const confirmPTBooking')) {
  // Need to inject it
  code = code.replace(
    /const resolveIssue = \([^)]+\) => \{[\s\S]*?\};\s*$/,
    `const resolveIssue = (id: string) => {
    const updated = issues.map(issue => issue.id === id ? { ...issue, status: 'Resolved' } : issue);
    setIssues(updated);
    localStorage.setItem('gymComplaints', JSON.stringify(updated));
  };

  const confirmPTBooking = (id: string) => {
    const updated = ptBookings.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b);
    setPtBookings(updated);
    localStorage.setItem('ptBookings', JSON.stringify(updated));
  };`
  );
}

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
