const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "} AlertTriangle, CheckCircle, Tool } from 'lucide-react';",
  ", AlertTriangle, CheckCircle, Tool } from 'lucide-react';"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
