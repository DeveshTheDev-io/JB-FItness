const fs = require('fs');

function replaceInFile(file, oldStr, newStr) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.split(oldStr).join(newStr);
  fs.writeFileSync(file, code);
}

replaceInFile('src/pages/AdminDashboard.tsx', 'JAI BALAJI ELITE FITNESS', 'JAI BALAJI FITNESS');
replaceInFile('src/pages/AdminLogin.tsx', 'JAI BALAJI <span className="text-[var(--color-brand-primary)]">ELITE FITNESS</span>', 'JAI BALAJI <span className="text-[var(--color-brand-primary)]">FITNESS</span>');
replaceInFile('src/pages/LandingPage.tsx', 'JAI BALAJI ELITE FITNESS', 'JAI BALAJI FITNESS');
replaceInFile('src/pages/MemberDashboard.tsx', 'JAI BALAJI ELITE FITNESS', 'JAI BALAJI FITNESS');
