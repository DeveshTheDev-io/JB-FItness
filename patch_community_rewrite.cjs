const fs = require('fs');
let code = fs.readFileSync('src/pages/CommunityPage.tsx', 'utf8');

// Replace the main wrapper and hero to look more glassmorphic
code = code.replace(
  '<div className="min-h-screen bg-stone-100 flex flex-col font-sans">',
  `<div className="min-h-screen bg-[#F5F5F4] flex flex-col font-sans relative overflow-hidden">
      {/* Soft abstract background blobs for glassmorphism effect */}
      <div className="fixed top-[-10%] left-[-20%] w-[60%] h-[60%] bg-stone-300/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-stone-200/50 rounded-full blur-[150px] pointer-events-none z-0"></div>
`
);

code = code.replace(
  '<nav className="w-full flex items-center justify-between py-6 px-6 md:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">',
  '<nav className="w-full flex items-center justify-between py-6 px-6 md:px-12 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-white/50 shadow-sm">'
);

code = code.replace(
  '<div className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 md:px-8">',
  '<div className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 md:px-8 relative z-10">'
);

code = code.replace(
  '<div className="rounded-xl md:rounded-2xl bg-black border border-stone-800 shadow-xl p-8 md:p-16 flex flex-col justify-center items-center text-center mb-12">',
  `<div className="rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-20 flex flex-col justify-center items-center text-center mb-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
          <div className="relative z-10">`
);

code = code.replace(
  '<p className="text-sm font-bold uppercase tracking-widest text-[var(--color-brand-primary)] mb-4">Our Community</p>\n          <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-black text-white leading-[0.9] drop-shadow-md">Events & Stories</h1>\n          <p className="text-white/70 max-w-2xl mt-6 text-lg md:text-xl font-medium">Stay updated with our latest gym events, competition results, and success stories from the JAI BALAJI family.</p>\n        </div>',
  `<p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-stone-500 mb-6">Our Community</p>
            <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-black text-black leading-[0.9] tracking-tighter mb-6">Events & Stories</h1>
            <p className="text-stone-600 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">Stay updated with our latest gym events, competition results, and success stories from the JAI BALAJI family.</p>
          </div>
        </div>`
);

// Update Report an issue box
code = code.replace(
  '<div className="mb-16 bg-white rounded-2xl shadow-xl p-8 border border-stone-200">',
  '<div className="mb-20 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_20px_40px_rgb(0,0,0,0.03)] p-8 md:p-12">'
);

// Update Grid elements
code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">',
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">'
);

code = code.replace(
  /className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square md:aspect-\[3\/4\] xl:aspect-\[4\/5\] w-full shadow-lg border border-stone-200"/g,
  'className="group relative rounded-[2rem] overflow-hidden cursor-pointer aspect-square md:aspect-[3/4] xl:aspect-[4/5] w-full shadow-[0_20px_40px_rgb(0,0,0,0.08)] border-4 border-white/40 transform transition-all duration-500 hover:-translate-y-2"'
);

fs.writeFileSync('src/pages/CommunityPage.tsx', code);
