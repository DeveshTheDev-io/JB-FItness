const fs = require('fs');
let code = fs.readFileSync('src/components/ui/Button.tsx', 'utf8');

code = code.replace(
  /variant\?: 'default' \| 'primary' \| 'icon';/,
  "variant?: 'default' | 'primary' | 'icon' | 'secondary' | 'ghost';"
);

code = code.replace(
  /icon: 'neu-flat active:neu-pressed p-3 rounded-full transition-all duration-300 text-brand-secondary',/,
  "icon: 'neu-flat active:neu-pressed p-3 rounded-full transition-all duration-300 text-brand-secondary',\n    secondary: 'neu-flat active:neu-pressed px-6 py-3',\n    ghost: 'hover:bg-black/5 active:bg-black/10 px-4 py-2 rounded-xl transition-colors',"
);

fs.writeFileSync('src/components/ui/Button.tsx', code);
