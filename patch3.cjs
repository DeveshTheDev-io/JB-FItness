const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

// Remove from Navbar
code = code.replace(
  /const \[selectedCoach, setSelectedCoach\] = useState<any>\(null\);\n/,
  ''
);

// Add to LandingPage
code = code.replace(
  /export default function LandingPage\(\) \{\n/,
  `export default function LandingPage() {\n  const [selectedCoach, setSelectedCoach] = useState<any>(null);\n`
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
