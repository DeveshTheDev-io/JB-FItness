const fs = require('fs');
let code = fs.readFileSync('src/components/GymChatbot.tsx', 'utf8');

if (!code.includes('import Markdown')) {
  code = code.replace(
    /import \{ Button \} from '\.\/ui\/Button';/,
    "import { Button } from './ui/Button';\nimport Markdown from 'react-markdown';"
  );
}

code = code.replace(
  /\{msg\.text\}/g,
  '<div className="markdown-body space-y-2"><Markdown>{msg.text}</Markdown></div>'
);

fs.writeFileSync('src/components/GymChatbot.tsx', code);
