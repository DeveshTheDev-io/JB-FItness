const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

// Add selectedCoach state
code = code.replace(
  /const \[user, setUser\] = useState<\{role: string\} \| null>\(null\);/,
  `const [user, setUser] = useState<{role: string} | null>(null);\n  const [selectedCoach, setSelectedCoach] = useState<any>(null);`
);

// Update coaches mapping
code = code.replace(
  /\{\[\s*\{\s*name:\s*'Sushant Agrawal'[\s\S]*?\]\.map\(\(coach, i\) => \(/,
  `{[ 
              { name: 'Sushant Agrawal', spec: 'Powerlifting Specialist', bio: 'With over a decade of experience, Sushant specializes in raw powerlifting, strength conditioning, and helping members reach peak physical performance.', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Sushant.jpeg_202608011758.jpeg' },
              { name: 'Nidhi Singh', spec: 'Functional Training', bio: 'Nidhi is an expert in HIIT, flexibility, and functional mobility. Her unique training approach ensures you build a strong, athletic, and resilient body.', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Nidhi.jpeg_202608011801.jpeg' },
              { name: 'Bhavendra', spec: 'Bodybuilding Pro', bio: 'A competitive bodybuilder, Bhavendra focuses on muscle hypertrophy, diet optimization, and stage prep for serious athletes looking to transform their physique.', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/WhatsApp_Image_2026-08-01_at_5.15.01_202608011759.jpeg' }
            ].map((coach, i) => (`
);

code = code.replace(
  /className="rounded-xl md:rounded-2xl overflow-hidden relative group cursor-pointer aspect-square md:aspect-\[3\/4\] xl:aspect-\[4\/5\] w-full"/g,
  `className="rounded-xl md:rounded-2xl overflow-hidden relative group cursor-pointer h-[450px] md:h-[550px] xl:h-[650px] w-full" onClick={() => setSelectedCoach(coach)}`
);

// Add the modal rendering near the end, just before `return (` ? Wait, `return (` is at the beginning of the JSX. 
// I'll just append it right before the closing `</div>` of the main `return (`.
const modalCode = `
      {/* Coach Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCoach(null)} />
          <div className="relative w-full max-w-4xl bg-stone-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            <div className="w-full md:w-1/2 h-[400px] md:h-auto shrink-0">
              <img src={selectedCoach.img} alt={selectedCoach.name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
              <p className="text-[var(--color-brand-primary)] font-bold tracking-widest uppercase text-sm mb-2">{selectedCoach.spec}</p>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">{selectedCoach.name}</h3>
              <p className="text-stone-300 text-lg leading-relaxed mb-8">{selectedCoach.bio}</p>
              <button 
                onClick={() => setSelectedCoach(null)}
                className="self-start px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-stone-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/\{showReviewModal && \(/, modalCode + '\n      {showReviewModal && (');

fs.writeFileSync('src/pages/LandingPage.tsx', code);
