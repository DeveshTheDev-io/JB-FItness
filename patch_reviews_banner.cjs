const fs = require('fs');

let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const reviewsSection = `
      {/* Community Section */}
      <section className="w-full flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2 overflow-hidden">
        <div className="rounded-xl md:rounded-2xl bg-black py-10 md:py-16 text-center flex flex-col items-center relative overflow-hidden">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-brand-primary)] mb-4">Reviews</p>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-[0.9] mb-12">What Our<br/>Members Say</h2>
          
          <button onClick={() => setShowReviewModal(true)} className="absolute top-6 right-6 md:top-10 md:right-10 px-5 py-2.5 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-transform z-10">
            Share Your Experience
          </button>
          
          <div className="w-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
            
            <div className="animate-marquee flex gap-6 px-6">
              {[...(reviews.length > 0 ? reviews : [
                {
                  name: "Arjun Verma",
                  role: "Powerlifter",
                  text: "The equipment at Jai Balaji is unmatched. The environment pushes you to your absolute limits.",
                  status: "Member",
                  rating: 5
                },
                {
                  name: "Priya Sharma",
                  role: "Fitness Enthusiast",
                  text: "Love the AI features! The smart planner completely changed my workout routine.",
                  status: "Member",
                  rating: 5
                },
                {
                  name: "Vikas Patel",
                  role: "CrossFit Athlete",
                  text: "The community here is incredible. Professional coaches and state-of-the-art facilities.",
                  status: "Past Member",
                  rating: 4
                },
                {
                  name: "Neha Gupta",
                  role: "Yoga Practitioner",
                  text: "Best gym experience I've had. The smart AI diet recommendations are spot on.",
                  status: "Member",
                  rating: 5
                }
              ]), ...(reviews.length > 0 ? reviews : [
                {
                  name: "Arjun Verma",
                  role: "Powerlifter",
                  text: "The equipment at Jai Balaji is unmatched. The environment pushes you to your absolute limits.",
                  status: "Member",
                  rating: 5
                },
                {
                  name: "Priya Sharma",
                  role: "Fitness Enthusiast",
                  text: "Love the AI features! The smart planner completely changed my workout routine.",
                  status: "Member",
                  rating: 5
                },
                {
                  name: "Vikas Patel",
                  role: "CrossFit Athlete",
                  text: "The community here is incredible. Professional coaches and state-of-the-art facilities.",
                  status: "Past Member",
                  rating: 4
                },
                {
                  name: "Neha Gupta",
                  role: "Yoga Practitioner",
                  text: "Best gym experience I've had. The smart AI diet recommendations are spot on.",
                  status: "Member",
                  rating: 5
                }
              ])].map((review, i) => (
                <div key={i} className="flex-shrink-0 w-80 md:w-96 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 text-left hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">{review.name}</h4>
                      <p className="text-sm text-[var(--color-brand-primary)] font-medium">{review.status || review.role}</p>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(review.rating || 5)].map((_, j) => (
                        <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-300 text-sm leading-relaxed">"{review.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
`;

code = code.replace(
  /\{\/\* Community Section \*\/\}\s*<section className="w-full flex flex-col pt-1\.5 md:pt-2 px-3 md:px-5 pb-1\.5 md:pb-2 gap-1\.5 md:gap-2">[\s\S]*?(?=<\/section>)\s*<\/section>/,
  reviewsSection
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
