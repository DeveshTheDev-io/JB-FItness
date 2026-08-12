const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Remove redundant 'Maintenance Issues' sidebar link
code = code.replace(
  "{ id: 'reviews', icon: Star, label: 'Reviews' },\n            { id: 'complaints', icon: AlertTriangle, label: 'Maintenance Issues' },",
  "{ id: 'reviews', icon: Star, label: 'Reviews' },"
);

// Remove the complaints tab block
const complaintsTabRegex = /\{activeTab === 'complaints' && \([\s\S]*?<\/Card>\s*\)\s*:\s*\([\s\S]*?<\/div>\s*\)\s*\}\s*<\/>\s*\)\}/;
code = code.replace(complaintsTabRegex, '');

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
