const fs = require('fs');
let code = fs.readFileSync('src/components/GymChatbot.tsx', 'utf8');

code = code.replace(
  '<motion.div\n            initial={{ opacity: 0, y: 20, scale: 0.95 }}\n            animate={{ opacity: 1, y: 0, scale: 1 }}\n            exit={{ opacity: 0, y: 20, scale: 0.95 }}\n            transition={{ duration: 0.2 }}\n            className="mb-20 sm:mb-24 origin-bottom-right pointer-events-auto"\n          >',
  '<motion.div\n            initial={{ opacity: 0, y: 20, scale: 0.95 }}\n            animate={{ opacity: 1, y: 0, scale: 1 }}\n            exit={{ opacity: 0, y: 20, scale: 0.95 }}\n            transition={{ duration: 0.2 }}\n            className="fixed bottom-20 right-4 left-4 top-4 sm:left-auto sm:top-auto sm:bottom-24 sm:right-6 origin-bottom-right pointer-events-auto flex flex-col justify-end"\n          >'
);

code = code.replace(
  '<Card className="flex flex-col w-[calc(100vw-32px)] sm:w-[400px] h-[calc(100dvh-120px)] max-h-[600px] sm:h-[500px] p-0 overflow-hidden shadow-2xl border border-neutral-200">',
  '<Card className="flex flex-col w-full h-full sm:w-[400px] sm:h-[500px] sm:max-h-[600px] p-0 overflow-hidden shadow-2xl border border-neutral-200">'
);

fs.writeFileSync('src/components/GymChatbot.tsx', code);
