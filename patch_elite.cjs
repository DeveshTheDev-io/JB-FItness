const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

code = code.replace(
  '<span className="text-[9px] md:text-[10px] font-bold leading-none mt-1 tracking-[0.2em] uppercase text-[var(--color-brand-primary)]">Elite Fitness</span>',
  '<span className="text-[9px] md:text-[10px] font-bold leading-none mt-1 tracking-[0.2em] uppercase text-[var(--color-brand-primary)]">Fitness</span>'
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
