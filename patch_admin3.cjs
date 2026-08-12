const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Insert confirmPTBooking if not there
if (!code.includes('const confirmPTBooking =')) {
  code = code.replace(
    '  return (',
    `  const confirmPTBooking = (id: string) => {
    const updated = ptBookings.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b);
    setPtBookings(updated);
    localStorage.setItem('ptBookings', JSON.stringify(updated));
  };
  return (`
  );
}

// And ensure UserCheck is imported
if (!code.includes('UserCheck')) {
  code = code.replace("XCircle } from 'lucide-react';", "XCircle, UserCheck } from 'lucide-react';");
}

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
