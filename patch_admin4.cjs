const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "AlertTriangle, Wrench } from 'lucide-react';",
  "AlertTriangle, Wrench, UserCheck } from 'lucide-react';"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
