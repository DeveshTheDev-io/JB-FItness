const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminLogin.tsx', 'utf8');

code = code.replace(
  /const \[email, setEmail\] = useState\(''\);/,
  "const [email, setEmail] = useState('');\n  const [gender, setGender] = useState('Male');"
);

code = code.replace(
  /\.insert\(\[\{ name: username, email: email, plan: 'Basic', status: 'Active' \}\]\);/,
  ".insert([{ name: username, email: email, plan: 'Basic', status: 'Active', gender: gender }]);"
);

code = code.replace(
  /localStorage\.setItem\('currentUser', JSON\.stringify\(\{ role: 'member', username, email \}\)\);/,
  "localStorage.setItem('currentUser', JSON.stringify({ role: 'member', username, email, gender }));"
);

// Add the gender selector in the UI
const genderHTML = `            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                <label className="block text-sm font-bold mb-2 ml-2 opacity-70 uppercase tracking-widest">Gender</label>
                <div className="flex gap-4">
                  <Button type="button" variant={gender === 'Male' ? 'primary' : 'default'} onClick={() => setGender('Male')} className="flex-1 py-3">Male</Button>
                  <Button type="button" variant={gender === 'Female' ? 'primary' : 'default'} onClick={() => setGender('Female')} className="flex-1 py-3">Female</Button>
                </div>
              </motion.div>
            )}`;

code = code.replace(
  /\{mode === 'signup' && \(\s*<motion\.div initial=\{\{ opacity: 0, height: 0 \}\} animate=\{\{ opacity: 1, height: 'auto' \}\} className="mb-6">\s*<label className="block text-sm font-bold mb-2 ml-2 opacity-70 uppercase tracking-widest">Email Address<\/label>[\s\S]*?<\/motion\.div>\s*\)\}/,
  `{mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                <label className="block text-sm font-bold mb-2 ml-2 opacity-70 uppercase tracking-widest">Email Address</label>
                <Input 
                  icon={<User className="w-5 h-5" />} 
                  placeholder="Enter email address" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </motion.div>
            )}
${genderHTML}`
);

fs.writeFileSync('src/pages/AdminLogin.tsx', code);
