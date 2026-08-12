const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import CommunityPage from './pages/CommunityPage';",
  "import CommunityPage from './pages/CommunityPage';\nimport AboutUs from './pages/AboutUs';"
);

code = code.replace(
  '<Route path="/community" element={<CommunityPage />} />',
  '<Route path="/community" element={<CommunityPage />} />\n        <Route path="/about" element={<AboutUs />} />'
);

fs.writeFileSync('src/App.tsx', code);
