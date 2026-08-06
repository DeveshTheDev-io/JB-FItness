const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const newModal = `      {/* Coach Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCoach(null)} />
          <div className="relative w-full max-w-4xl bg-stone-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            <button 
                onClick={() => setSelectedCoach(null)}
                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-colors z-20 md:hidden"
              >
                <X className="w-6 h-6" />
            </button>
            <div className="w-full md:w-1/2 h-[400px] md:h-auto shrink-0">
              <img src={selectedCoach.img} alt={selectedCoach.name} className="w-full h-full object-cover object-top" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
              <p className="text-[var(--color-brand-primary)] font-bold tracking-widest uppercase text-sm mb-2">{selectedCoach.spec}</p>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">{selectedCoach.name}</h3>
              <p className="text-stone-300 text-lg leading-relaxed mb-8">{selectedCoach.bio}</p>
              <button 
                onClick={() => setSelectedCoach(null)}
                className="hidden md:block self-start px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-stone-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}`;

const oldModalRegex = /\{\/\* Coach Modal \*\/\}[\s\S]*?\{\/\* Review Modal \*\/\}|\{\/\* Coach Modal \*\/\}[\s\S]*?\{showReviewModal && \(/;

if (code.match(oldModalRegex)) {
  code = code.replace(/\{\/\* Coach Modal \*\/\}[\s\S]*?(?=\{showReviewModal && \()/, newModal + '\n\n      ');
  fs.writeFileSync('src/pages/LandingPage.tsx', code);
} else {
  console.log("Could not find Coach Modal to replace");
}
