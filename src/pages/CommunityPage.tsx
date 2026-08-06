import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function CommunityPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      <nav className="w-full flex items-center justify-between py-6 px-6 md:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <Button variant="default" onClick={() => navigate('/')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-black">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl leading-none tracking-tighter">JB</span>
            </div>
            <span className="text-lg font-black tracking-tight uppercase">Jai Balaji</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 md:px-8">
        <div className="rounded-xl md:rounded-2xl bg-black border border-stone-800 shadow-xl p-8 md:p-16 flex flex-col justify-center items-center text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-brand-primary)] mb-4">Our Community</p>
          <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-black text-white leading-[0.9] drop-shadow-md">Events & Stories</h1>
          <p className="text-white/70 max-w-2xl mt-6 text-lg md:text-xl font-medium">Stay updated with our latest gym events, competition results, and success stories from the JAI BALAJI family.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              img: 'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?q=80&w=1470&auto=format&fit=crop',
              title: 'Powerlifting Meet 2026',
              date: 'March 15, 2026',
              type: 'Event'
            },
            {
              img: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1485&auto=format&fit=crop',
              title: 'Member Spotlight: Rahul\'s Transformation',
              date: 'March 10, 2026',
              type: 'Story'
            },
            {
              img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop',
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
          ].map((blog, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square md:aspect-[3/4] xl:aspect-[4/5] w-full shadow-lg border border-stone-200">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10 transition-colors group-hover:from-black/90" />
              <img src={blog.img} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8">
                <div className="bg-[var(--color-brand-primary)] self-start px-3 py-1 rounded-full text-xs font-black text-black mb-4 uppercase tracking-widest">{blog.type}</div>
                <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">{blog.title}</h3>
                <p className="text-sm text-white/80 font-bold">{blog.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
