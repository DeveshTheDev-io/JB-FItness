const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

code = code.replace(
  "{['Home', 'Plans', 'Coaches', 'Community', 'Contact'].map((item) => (",
  "{['Home', 'About Us', 'Plans', 'Coaches', 'Community', 'Contact'].map((item) => ("
);

code = code.replace(
  "onClick={() => item === 'Community' ? navigate('/community') : handleScroll(item.toLowerCase())}",
  "onClick={() => item === 'Community' ? navigate('/community') : item === 'About Us' ? navigate('/about') : handleScroll(item.toLowerCase())}"
);

code = code.replace(
  "{['Home', 'Plans', 'Coaches', 'Community', 'Contact'].map((item, i) => (",
  "{['Home', 'About Us', 'Plans', 'Coaches', 'Community', 'Contact'].map((item, i) => ("
);

code = code.replace(
  "onClick={() => { setOpen(false); item === 'Community' ? navigate('/community') : handleScroll(item.toLowerCase()); }}",
  "onClick={() => { setOpen(false); item === 'Community' ? navigate('/community') : item === 'About Us' ? navigate('/about') : handleScroll(item.toLowerCase()); }}"
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
