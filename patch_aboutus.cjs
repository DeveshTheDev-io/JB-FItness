const fs = require('fs');
let code = fs.readFileSync('src/pages/AboutUs.tsx', 'utf8');

// Replace Phone
code = code.replace(
  '<p className="text-stone-600 font-medium">+91 98765 43210</p>',
  '<p className="text-stone-600 font-medium">+91 8770483654</p>'
);

// Replace Email
code = code.replace(
  '<p className="text-stone-600 font-medium">support@jaibalajifitness.com</p>',
  '<p className="text-stone-600 font-medium">jbfitnesshubthegym@gmail.com</p>'
);

// Replace Location
code = code.replace(
  '<p className="text-stone-600 font-medium">123 Iron Avenue, Fitness District<br/>New Delhi, 110001, India</p>',
  '<p className="text-stone-600 font-medium">3rd floor, Shree Banke Bihari Plaza, Kailash VIhar,<br/>income tax office road, City center, Gwalior - 474002(M.P)</p>'
);

// Fix the AI Box design to match the others
code = code.replace(
  '<Card className="p-8 text-center bg-black text-white shadow-xl border border-stone-800">\\n              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">\\n                <span className="font-black text-[var(--color-brand-primary)]">AI</span>\\n              </div>\\n              <h3 className="text-xl font-bold mb-3">Smart Technology</h3>\\n              <p className="text-white/70 font-medium text-sm">From real-time form checking and diet tracking to predictive maintenance, our AI ecosystem ensures your fitness journey is optimized and safe.</p>\\n            </Card>',
  '<Card className="p-8 text-center bg-white shadow-xl border border-stone-200">\\n              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">\\n                <span className="font-black text-[var(--color-brand-primary)]">AI</span>\\n              </div>\\n              <h3 className="text-xl font-bold mb-3">Smart Technology</h3>\\n              <p className="text-stone-500 font-medium text-sm">From real-time form checking and diet tracking to predictive maintenance, our AI ecosystem ensures your fitness journey is optimized and safe.</p>\\n            </Card>'
);

fs.writeFileSync('src/pages/AboutUs.tsx', code);
