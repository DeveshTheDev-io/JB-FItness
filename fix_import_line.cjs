const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const importRegex = /import \{([^\}]+)\} from 'lucide-react';/;
const match = code.match(importRegex);
if (match) {
  const items = match[1].split(',').map(s => s.trim()).filter(s => s);
  const uniqueItems = [...new Set(items)];
  code = code.replace(importRegex, "import { " + uniqueItems.join(', ') + " } from 'lucide-react';");
  fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
}
