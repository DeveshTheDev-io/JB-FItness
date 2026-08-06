const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /Be concise, engaging, and helpful\."/,
  'Be concise, engaging, and helpful. Format your responses in a highly professional, well-structured manner using markdown bullet points, bold text for emphasis, and short paragraphs to make it easily readable."'
);

fs.writeFileSync('server.ts', code);
