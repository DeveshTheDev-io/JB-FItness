const fs = require('fs');
let code = fs.readFileSync('src/pages/CommunityPage.tsx', 'utf8');

// Replace the image variables with the explicit strings.
// But first, just replace the array in the grid directly.

const arrayStartRegex = /\[\s*\{\s*img: sample0,/m;
const arrayContentOld = `[
            {
              img: sample0,
              title: 'Powerlifting Meet 2026',
              date: 'March 15, 2026',
              type: 'Event'
            },
            {
              img: sample1,
              title: 'Member Spotlight: Rahul\\'s Transformation',
              date: 'March 10, 2026',
              type: 'Story'
            },
            {
              img: sample3,
              title: 'New CrossFit Classes Added',
              date: 'March 5, 2026',
              type: 'News'
            },
            {
              img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop',
              title: 'Summer Shred Challenge Winners',
              date: 'February 28, 2026',
              type: 'Event'
            },
            {
              img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop',
              title: 'Nutrition Workshop with Dr. Sharma',
              date: 'February 20, 2026',
              type: 'Workshop'
            },
            {
              img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop',
              title: 'New Elite Equipment Installed',
              date: 'February 10, 2026',
              type: 'News'
            }
          ]`;

const arrayContentNew = `[
            {
              img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/community/sample0.jpeg',
              title: 'Powerlifting Meet 2026',
              date: 'March 15, 2026',
              type: 'Event'
            },
            {
              img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/community/sample1.jpeg',
              title: 'Member Spotlight: Rahul\\'s Transformation',
              date: 'March 10, 2026',
              type: 'Story'
            },
            {
              img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/community/sample3.jpeg',
              title: 'New CrossFit Classes Added',
              date: 'March 5, 2026',
              type: 'News'
            }
          ]`;

if (code.includes('img: sample0,')) {
  const startIndex = code.indexOf('[');
  // Actually, string replacement is safer by just regexing the block
  code = code.replace(arrayContentOld, arrayContentNew);
} else {
  // If exact whitespace matching failed, let's just do regex
  const regex = /\\[\\s*\\{[\\s\\S]*?type: 'News'\\s*\\}\\s*\\]/g;
  code = code.replace(regex, arrayContentNew);
}

// Remove the sample0, sample1, sample3 variables since they aren't needed anymore
code = code.replace(/const sample0 = [^;]+;/g, '');
code = code.replace(/const sample1 = [^;]+;/g, '');
code = code.replace(/const sample3 = [^;]+;/g, '');

// Append Footer
const footerHtml = `
      {/* Footer / Contact */}
      <footer id="contact" className="w-full px-3 md:px-5 pb-3 mt-auto">
        <div className="rounded-xl md:rounded-2xl bg-black p-8 md:p-16 flex flex-col md:flex-row justify-between text-white gap-10">
          <div>
            <h2 className="text-3xl font-black mb-4">JAI BALAJI FITNESS</h2>
            <p className="text-sm font-semibold opacity-70 max-w-xs mb-4">Elevating fitness standards with elite equipment and professional coaching.</p>
            <p className="text-sm font-bold text-neutral-400">
              Powered by <a href="https://dev-ai-agency.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-primary)] hover:underline hover:opacity-80 transition-all">Devscosmic A.I Agency</a>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold mb-2">Contact</h3>
            <a href="tel:+918770483654" className="text-sm opacity-70 hover:opacity-100 transition-opacity">+91 8770483654</a>
            <p className="text-sm opacity-70">jbfitnesshubthegym@gmail.com</p>
            <p className="text-sm opacity-70">Instagram: @jb_fitness_gym</p>
            <p className="text-sm opacity-70 max-w-xs mt-2">3rd floor, Shree Banke Bihari Plaza, Kailash VIhar, income tax office road, City center, Gwalior - 474002(M.P)</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold mb-2">Links</h3>
            <a onClick={() => navigate('/')} className="cursor-pointer text-sm opacity-70 hover:opacity-100 transition-opacity">Home</a>
            <a onClick={() => navigate('/about')} className="cursor-pointer text-sm opacity-70 hover:opacity-100 transition-opacity">About Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}`;

code = code.replace(/<\/div>\s*<\/div>\s*\);\s*\}/, '      </div>\n' + footerHtml);

fs.writeFileSync('src/pages/CommunityPage.tsx', code);
