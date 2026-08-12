const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  "import { supabase } from '../lib/supabase';",
  "import { supabase } from '../lib/supabase';\nimport Markdown from 'react-markdown';"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
