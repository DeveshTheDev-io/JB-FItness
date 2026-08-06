const fs = require('fs');
let code = fs.readFileSync('src/components/GymChatbot.tsx', 'utf8');

code = code.replace(
  '<div className="fixed bottom-6 right-6 z-50">',
  '<div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end">'
);

code = code.replace(
  /className="mb-4"/g,
  'className="mb-4 origin-bottom-right"'
);

code = code.replace(
  /className="flex flex-col w-\[350px\] sm:w-\[400px\] h-\[500px\] p-0 overflow-hidden shadow-2xl border border-neutral-200"/g,
  'className="flex flex-col w-[calc(100vw-32px)] sm:w-[400px] h-[calc(100dvh-120px)] max-h-[600px] sm:h-[500px] p-0 overflow-hidden shadow-2xl border border-neutral-200"'
);

fs.writeFileSync('src/components/GymChatbot.tsx', code);
