import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X, Dumbbell, MapPin } from 'lucide-react';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop';
const SECTION2_IMAGE = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop';
const SECTION3_IMG1 = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop';
const SECTION3_IMG2 = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop';
const SECTION3_BG = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop';

const featureBars = ['Advanced Equipment', 'Pro Coaching', 'Elite Community'];

const services = [
  { name: 'Strength\nTraining', num: '01', active: true },
  { name: 'Power\nLifting', num: '02', active: false },
  { name: 'CrossFit\nClasses', num: '03', active: false },
  { name: 'Personal\nTraining', num: '04', active: false },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

function useStaggeredReveal(count: number, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [threshold]);

  const getAnimStyle = (index: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms`
  });

  return { containerRef, getAnimStyle };
}

function useImageDimensions(src: string, sectionWidth: number, sectionHeight: number) {
  const [naturalDims, setNaturalDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setNaturalDims({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [src]);

  if (!sectionWidth || !sectionHeight || !naturalDims.width || !naturalDims.height) {
    return { width: 0, height: 0 };
  }

  const scale = Math.max(sectionWidth / naturalDims.width, sectionHeight / naturalDims.height);
  return { width: naturalDims.width * scale, height: naturalDims.height * scale };
}

function useMaskPositions(sectionRef: React.RefObject<HTMLElement | null>, cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>) {
  const [positions, setPositions] = useState<{x: number, y: number, sw: number, sh: number}[]>([]);

  useLayoutEffect(() => {
    const update = () => {
      if (!sectionRef.current) return;
      const sRect = sectionRef.current.getBoundingClientRect();
      const newPos = cardRefs.current.map(card => {
        if (!card) return { x: 0, y: 0, sw: 0, sh: 0 };
        const cRect = card.getBoundingClientRect();
        return {
          x: cRect.left - sRect.left,
          y: cRect.top - sRect.top,
          sw: sRect.width,
          sh: sRect.height
        };
      });
      setPositions(newPos);
    };
    
    update();
    const observer = new ResizeObserver(update);
    if (sectionRef.current) observer.observe(sectionRef.current);
    window.addEventListener('resize', update);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return positions;
}

function MaskedCard({ 
  bgImage, position, imageDims, focalX, className, children, cardRef, style 
}: { 
  bgImage: string, position: any, imageDims: { width: number, height: number }, focalX: number, className: string, children: React.ReactNode, cardRef: (el: HTMLDivElement | null) => void, style?: React.CSSProperties
}) {
  const overflowX = imageDims.width > (position?.sw || 0) ? imageDims.width - (position?.sw || 0) : 0;
  const overflowY = imageDims.height > (position?.sh || 0) ? imageDims.height - (position?.sh || 0) : 0;
  const focalOffsetX = overflowX * focalX;
  const focalOffsetY = overflowY * 0.5;

  const bgStyle: React.CSSProperties = position?.sh ? {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: `${imageDims.width}px ${imageDims.height}px`,
    backgroundPosition: `-${position.x + focalOffsetX}px -${position.y + focalOffsetY}px`,
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <div ref={cardRef} className={className} style={{ ...bgStyle, ...style }}>
      <div className="absolute inset-0 bg-black/10" />
      {children}
    </div>
  );
}

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => setExiting(true), 200);
        setTimeout(onComplete, 900);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-700 ${exiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-7xl md:text-9xl font-bold tabular-nums p-6 md:p-10 leading-none text-black">
        {count}
      </div>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<{role: string} | null>(null);
  
  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch(e) {}
    }
  }, []);

  const handleDashboardClick = () => {
    if (user?.role === 'admin') navigate('/admin');
    else navigate('/member');
  };

  const handleScroll = (id: string) => {
    setOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur-md">
        <div className="w-full flex items-center justify-between">
        <div className="flex flex-col cursor-pointer" onClick={() => handleScroll('home')}>
          <div className="flex items-center gap-1.5 md:gap-2">
            <Dumbbell className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-brand-primary)]" />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black uppercase leading-none text-black">JAI BALAJI</span>
              <span className="text-[9px] md:text-[10px] font-bold leading-none mt-1 tracking-[0.2em] uppercase text-[var(--color-brand-primary)]">Fitness</span>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          {['Home', 'About Us', 'Plans', 'Coaches', 'Community', 'Contact'].map((item) => (
            <button key={item} onClick={() => item === 'Community' ? navigate('/community') : item === 'About Us' ? navigate('/about') : handleScroll(item.toLowerCase())} className="text-sm font-bold text-black hover:opacity-70 transition-opacity uppercase">{item}</button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <button onClick={handleDashboardClick} className="px-5 py-2.5 bg-black rounded-full border border-black text-white text-sm font-bold hover:bg-neutral-800 transition-colors duration-200">
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login?mode=signin')} className="text-sm font-bold text-black hover:opacity-70 transition-opacity">Sign In</button>
              <button onClick={() => navigate('/login?mode=signup')} className="px-5 py-2.5 bg-black rounded-full border border-black text-white text-sm font-bold hover:bg-neutral-800 transition-colors duration-200">
                Sign Up
              </button>
            </>
          )}
        </div>

        <button className="w-10 h-10 flex items-center justify-center relative lg:hidden z-50" onClick={() => setOpen(!open)}>
          <span className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'rotate-45 translate-y-0' : '-translate-y-2'}`} />
          <span className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
          <span className={`absolute h-0.5 w-6 bg-black rounded-full transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? '-rotate-45 translate-y-0' : 'translate-y-2'}`} />
        </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col justify-center px-8 gap-1 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          {['Home', 'About Us', 'Plans', 'Coaches', 'Community', 'Contact'].map((item, i) => (
            <button key={item} onClick={() => { setOpen(false); item === 'Community' ? navigate('/community') : item === 'About Us' ? navigate('/about') : handleScroll(item.toLowerCase()); }} className="text-4xl font-bold text-black hover:text-neutral-500 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] text-left" style={{ opacity: open ? 1 : 0, transform: open ? 'translateX(0)' : 'translateX(32px)', transitionDelay: `${100 + i * 60}ms` }}>
              {item}
            </button>
          ))}
          <div className={`mt-8 pt-8 border-t border-neutral-200 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]`} style={{ opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '450ms' }}>
            <p className="text-sm font-bold text-black mb-4">{user ? 'Welcome back!' : 'Ready to start?'}</p>
            <div className="flex gap-3 mb-4">
              {user ? (
                <button onClick={handleDashboardClick} className="flex-1 py-3 bg-black rounded-full text-white text-sm font-bold hover:bg-neutral-800 transition-colors duration-200">
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/login?mode=signin')} className="flex-1 py-3 bg-transparent border-2 border-black rounded-full text-black text-sm font-bold hover:bg-neutral-100 transition-colors duration-200">
                    Sign In
                  </button>
                  <button onClick={() => navigate('/login?mode=signup')} className="flex-1 py-3 bg-black rounded-full text-white text-sm font-bold hover:bg-neutral-800 transition-colors duration-200">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LandingPage() {
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialForm, setTrialForm] = useState({ name: '', phone: '', email: '' });
  const [selectedTopic, setSelectedTopic] = useState<'muscle' | 'nutrition' | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', gender: 'Male', gym_status: 'Member', rating: 5, review_text: '' });

  const [user, setUser] = useState<{role: string} | null>(null);
  useEffect(() => {
    const fetchReviews = async () => {
      if (!supabase) return;
      try {
        const { data } = await supabase.from('gym_reviews').select('*').order('created_at', { ascending: false });
        if (data) setReviews(data);
      } catch (e) {}
    };
    fetchReviews();

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch(e) {}
    }
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supabase) {
      try {
        const { data } = await supabase.from('gym_reviews').insert([{ ...reviewForm }]).select();
        if (data) {
          setReviews([data[0], ...reviews]);
        }
      } catch (e) {}
    } else {
      setReviews([{ ...reviewForm, id: Math.random(), created_at: new Date().toISOString() }, ...reviews]);
    }
    setShowReviewModal(false);
    setReviewForm({ name: '', gender: 'Male', gym_status: 'Member', rating: 5, review_text: '' });
  };

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/member');
    } else {
      navigate(`/login?mode=${mode}`);
    }
  };

  const handleBuyPlan = async (plan: any) => {
    if (!user) {
      navigate('/login?mode=signup');
      return;
    }
    if (user.role === 'admin') {
      alert("Admins cannot buy plans.");
      return;
    }

    try {
      const stored = localStorage.getItem('currentUser');
      const currentUser = stored ? JSON.parse(stored) : null;
      if (!currentUser?.email) {
        alert("User email not found. Please log in again.");
        return;
      }

      const { error } = await supabase.from('plan_requests').insert({
        user_email: currentUser.email,
        plan_name: plan.months, // We're using 'months' as the plan name like '3 Months Pro'
        months: plan.months,
        price: plan.price,
        status: 'pending'
      });

      if (error) {
        console.error(error);
        alert("Error requesting plan.");
      } else {
        alert("Plan requested successfully! Admin will confirm your payment soon.");
      }
    } catch (err) {
      console.error(err);
      alert("Error requesting plan.");
    }
  };

  const section1Ref = useRef<HTMLElement>(null);
  const s1Cards = useRef<(HTMLDivElement | null)[]>([]);
  const s1Positions = useMaskPositions(section1Ref, s1Cards);
  const s1ImgDims = useImageDimensions(HERO_IMAGE, s1Positions[0]?.sw || 0, s1Positions[0]?.sh || 0);
  const s1Reveal = useStaggeredReveal(4);

  const section2Ref = useRef<HTMLElement>(null);
  const s2Cards = useRef<(HTMLDivElement | null)[]>([]);
  const s2Positions = useMaskPositions(section2Ref, s2Cards);
  const s2ImgDims = useImageDimensions(SECTION2_IMAGE, s2Positions[0]?.sw || 0, s2Positions[0]?.sh || 0);
  const s2Reveal = useStaggeredReveal(4);

  const s3Reveal = useStaggeredReveal(4);

  const s1FocalX = isMobile ? 0.7 : 0.8;
  const s2FocalX = isMobile ? 0.65 : 0.8;

  const handleBookTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supabase) {
      const { error } = await supabase
        .from('trial_requests')
        .insert([{ ...trialForm }]);
      
      if (error) {
        alert('Failed to send request. Please try again.');
        console.error(error);
        return;
      }
    } else {
      // Fallback for development if supabase isn't connected
      const existing = JSON.parse(localStorage.getItem('trial_requests') || '[]');
      localStorage.setItem('trial_requests', JSON.stringify([...existing, { ...trialForm, id: Date.now(), status: 'pending' }]));
    }
    
    setShowTrialModal(false);
    setTrialForm({ name: '', phone: '', email: '' });
    alert('Trial request sent to admin!');
  };

  return (
    <div className="bg-white">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Navbar />

      <section id="home" ref={(el) => { section1Ref.current = el; s1Reveal.containerRef.current = el; }} className="min-h-[100dvh] md:h-screen w-full overflow-hidden flex flex-col pt-24 md:pt-24 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2">
        {featureBars.map((bar, i) => (
          <MaskedCard
            key={i}
            bgImage={HERO_IMAGE}
            position={s1Positions[i]}
            imageDims={s1ImgDims}
            focalX={s1FocalX}
            cardRef={(el) => (s1Cards.current[i] = el)}
            className="w-full h-14 md:h-20 shrink-0 rounded-xl md:rounded-2xl overflow-hidden relative"
            style={s1Reveal.getAnimStyle(i)}
          >
            <div className="absolute inset-0 bg-black/40 z-0" />
            <span className="flex items-center justify-center h-full text-white/95 text-lg md:text-3xl font-black uppercase tracking-[0.2em] text-center relative z-10 drop-shadow-xl">{bar}</span>
          </MaskedCard>
        ))}

        <MaskedCard
          bgImage={HERO_IMAGE}
          position={s1Positions[3]}
          imageDims={s1ImgDims}
          focalX={s1FocalX}
          cardRef={(el) => (s1Cards.current[3] = el)}
          className="w-full flex-1 min-h-0 rounded-xl md:rounded-2xl overflow-hidden relative"
          style={s1Reveal.getAnimStyle(3)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-0" />
          <p className="absolute top-4 left-4 md:top-7 md:left-7 text-white text-xs md:text-sm font-semibold leading-4 md:leading-5 max-w-[200px] md:max-w-[300px] z-10 drop-shadow">
            We provide elite fitness training<br/>that matches current sports science.
          </p>
          <div className="absolute bottom-5 left-3 md:bottom-8 md:left-4 z-10">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-xl">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-white text-xs md:text-sm font-bold uppercase tracking-widest drop-shadow-lg max-w-[200px] md:max-w-none leading-snug opacity-90">
                3rd Floor, Shree Banke Bihari Plaza<br className="md:hidden" /> City Center, Gwalior
              </span>
            </div>
            <h1 className="text-white text-[clamp(3rem,11vw,11rem)] font-bold leading-[0.79] tracking-tight drop-shadow-lg">
              Sculpt<br/>Legacy
            </h1>
          </div>
          <p className="absolute bottom-6 right-4 md:bottom-10 md:right-8 text-white text-xs md:text-sm font-semibold z-10 drop-shadow">
            Free Trial Available
          </p>
        </MaskedCard>
      </section>

      <section id="gallery" ref={(el) => { section2Ref.current = el; s2Reveal.containerRef.current = el; }} className="min-h-[100dvh] md:h-[100dvh] w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2">
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_auto_auto_auto] md:grid-rows-[1fr_1fr_0.8fr] gap-1.5 md:gap-2">
          
          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={s2Positions[0]}
            imageDims={s2ImgDims}
            focalX={s2FocalX}
            cardRef={(el) => (s2Cards.current[0] = el)}
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
            style={s2Reveal.getAnimStyle(0)}
          >
            <div className="absolute inset-0 bg-black/40 z-0" />
          </MaskedCard>

          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={s2Positions[1]}
            imageDims={s2ImgDims}
            focalX={s2FocalX}
            cardRef={(el) => (s2Cards.current[1] = el)}
            className="md:row-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
            style={s2Reveal.getAnimStyle(1)}
          >
            <div className="absolute inset-0 bg-black/20 z-0" />
            <p className="absolute bottom-20 left-5 md:bottom-24 md:left-7 text-white text-xs md:text-sm font-semibold leading-4 md:leading-5 z-10 drop-shadow">
              If you want to achieve your peak physical condition,<br/>join us for a comprehensive assessment.
            </p>
            <button onClick={() => handleAuthClick('signup')} className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-black text-base md:text-xl font-bold z-10 hover:scale-105 transition-transform">
              Join Now
            </button>
          </MaskedCard>

          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={s2Positions[2]}
            imageDims={s2ImgDims}
            focalX={s2FocalX}
            cardRef={(el) => (s2Cards.current[2] = el)}
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
            style={s2Reveal.getAnimStyle(2)}
          >
             <div className="absolute inset-0 bg-black/30 z-0" />
            <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.9] z-10 drop-shadow-lg">
              Body<br/>makeover
            </h2>
          </MaskedCard>

          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={s2Positions[3]}
            imageDims={s2ImgDims}
            focalX={s2FocalX}
            cardRef={(el) => (s2Cards.current[3] = el)}
            className="col-span-1 md:col-span-2 rounded-xl md:rounded-2xl overflow-hidden relative min-h-[200px] md:min-h-0"
            style={s2Reveal.getAnimStyle(3)}
          >
            <div className="absolute inset-0 z-10 flex flex-wrap md:flex-nowrap gap-1.5 md:gap-2 p-2 md:p-3">
              {services.map((svc, i) => (
                <div key={i} className={`flex-1 min-w-[calc(50%-4px)] md:min-w-0 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between ${svc.active ? 'bg-white/90 backdrop-blur-md' : 'bg-black/40 backdrop-blur-xl'}`}>
                  <h3 className={`text-xl md:text-4xl font-bold leading-[1.05] whitespace-pre-line ${svc.active ? 'text-black' : 'text-white'}`}>{svc.name}</h3>
                  {svc.num && (
                    <div className={`self-end w-8 h-8 md:w-12 md:h-12 rounded-full border flex items-center justify-center text-xs md:text-sm font-semibold ${svc.active ? 'border-black text-black' : 'border-white text-white'}`}>
                      {svc.num}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </MaskedCard>

        </div>
      </section>

      {/* Coaches Section */}
      <section id="coaches" className="w-full flex flex-col px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2 pt-10">
        <div className="flex flex-col gap-1.5 md:gap-2">
          <div className="rounded-xl md:rounded-2xl bg-black p-5 md:p-10 flex flex-col justify-center items-center text-center">
            <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-white leading-tight">Expert Coaches</h2>
            <p className="text-white/70">Train with the best to achieve your ultimate goals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-2">
            {[ 
              { name: 'Sushant Agrawal', spec: 'Powerlifting Specialist', bio: 'With over a decade of experience, Sushant specializes in raw powerlifting, strength conditioning, and helping members reach peak physical performance.', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Sushant.jpeg_202608011758.jpeg' },
              { name: 'Nidhi Singh', spec: 'Functional Training', bio: 'Nidhi is an expert in HIIT, flexibility, and functional mobility. Her unique training approach ensures you build a strong, athletic, and resilient body.', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Nidhi.jpeg_202608011801.jpeg' },
              { name: 'Bhavendra', spec: 'Bodybuilding Pro', bio: 'A competitive bodybuilder, Bhavendra focuses on muscle hypertrophy, diet optimization, and stage prep for serious athletes looking to transform their physique.', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/WhatsApp_Image_2026-08-01_at_5.15.01_202608011759.jpeg' }
            ].map((coach, i) => (
              <div key={i} className="rounded-xl md:rounded-2xl overflow-hidden relative group cursor-pointer aspect-[3/4] md:aspect-auto md:h-[550px] xl:h-[650px] w-full" onClick={() => setSelectedCoach(coach)}>
                <img src={coach.img} alt={coach.name} className="absolute inset-0 w-full h-full object-cover object-[center_10%] grayscale transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white">{coach.name}</h3>
                  <p className="text-sm text-white/70 font-semibold">{coach.spec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" ref={s3Reveal.containerRef} className="min-h-[100dvh] md:h-[100dvh] w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2">
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
          
          <div className="flex flex-col gap-1.5 md:gap-2">
            <div className="rounded-xl md:rounded-2xl bg-stone-50 p-5 md:p-7 flex flex-col justify-between flex-[1.2] min-h-[180px] md:min-h-0" style={s3Reveal.getAnimStyle(0)}>
              <h2 className="text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.95] text-black">Performance<br/>Tracking</h2>
              <p className="text-xs md:text-sm font-semibold text-black">Log Every Rep, See Every Gain</p>
            </div>

            <div className="flex gap-1.5 md:gap-2 flex-1 min-h-[140px] md:min-h-0" style={s3Reveal.getAnimStyle(1)}>
              <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden">
                <img src={SECTION3_IMG1} alt="Gym training" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 rounded-xl md:rounded-2xl overflow-hidden">
                <img src={SECTION3_IMG2} alt="Dumbbells" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="rounded-xl md:rounded-2xl bg-zinc-200 p-5 md:p-7 flex items-end justify-between flex-[0.8] min-h-[160px] md:min-h-0" style={s3Reveal.getAnimStyle(2)}>
              <div>
                <p className="text-xs md:text-sm font-semibold text-black mb-2 md:mb-3">Consultation</p>
                <h3 className="text-xl md:text-3xl font-bold text-black leading-6 md:leading-8">Fitness<br/>Assessment<br/>Services</h3>
              </div>
              <button onClick={() => setShowTrialModal(true)} className="px-5 py-3 md:px-8 md:py-5 bg-white rounded-full text-black text-base md:text-xl font-bold hover:scale-105 transition-transform">
                Book Trial
              </button>
            </div>
          </div>

          <div className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[350px] md:min-h-0" style={s3Reveal.getAnimStyle(3)}>
            <img src={SECTION3_BG} alt="Gym interior" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            
            <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 flex gap-1.5 md:gap-2">
              
              <div onClick={() => setSelectedTopic('muscle')} className="flex-1 bg-white rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52 hover:-translate-y-2 transition-transform cursor-pointer">
                <h4 className="text-lg md:text-2xl font-bold text-black leading-5 md:leading-7">The Process<br/>of Building<br/>Muscle</h4>
                <div className="self-end w-9 h-9 md:w-12 md:h-12 rounded-full border border-black flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="-rotate-45">
                    <path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div onClick={() => setSelectedTopic('nutrition')} className="flex-1 bg-black/40 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52 hover:-translate-y-2 transition-transform cursor-pointer">
                <h4 className="text-lg md:text-2xl font-bold text-white leading-5 md:leading-7">Nutrition<br/>for Optimal<br/>Recovery</h4>
                <div className="self-end w-9 h-9 md:w-12 md:h-12 rounded-full border border-white flex items-center justify-center text-white">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="-rotate-45">
                    <path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="w-full flex flex-col px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2 pt-10">
        <div className="flex flex-col gap-1.5 md:gap-2">
          <div className="rounded-xl md:rounded-2xl bg-black p-5 md:p-10 flex flex-col justify-center items-center text-center">
            <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-white leading-tight">Membership Plans</h2>
            <p className="text-white/70">Transform your life with our flexible pricing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-2">
            {[
              { months: '1 Month', price: '₹2,000', desc: 'Kickstart your fitness journey.' },
              { months: '3 Months', price: '₹5,000', desc: 'Perfect for short-term goals.' },
              { months: '6 Months', price: '₹8,000', desc: 'Best value for serious commitment.' },
              { months: '12 Months', price: '₹13,000', desc: 'Ultimate transformation package.' }
            ].map((plan, i) => (
              <div key={i} className="rounded-xl md:rounded-2xl p-8 flex flex-col justify-between transition-colors border bg-stone-50 border-stone-100 hover:bg-stone-100">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold">{plan.months}</h3>
                  </div>
                  <p className="text-sm font-semibold mb-6 text-neutral-500">{plan.desc}</p>
                  <p className="text-5xl font-black mb-4">{plan.price}</p>
                </div>
                <button onClick={() => handleBuyPlan(plan)} className="mt-4 w-full py-4 rounded-full font-bold transition-colors shadow-lg bg-black text-white hover:bg-neutral-800">Select Plan</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      
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
                  gym_status: "Member",
                  review_text: "The equipment at Jai Balaji is unmatched. The environment pushes you to your absolute limits. Best gym in town without a doubt.",
                  rating: 5
                },
                {
                  name: "Priya Sharma",
                  gym_status: "Member",
                  review_text: "Love the atmosphere! The trainers completely changed my workout routine. Seeing progress faster than ever.",
                  rating: 5
                },
                {
                  name: "Vikas Patel",
                  gym_status: "Past Member",
                  review_text: "The community here is incredible. Professional coaches and state-of-the-art facilities. Wish I hadn't moved out of town!",
                  rating: 4
                },
                {
                  name: "Neha Gupta",
                  gym_status: "Member",
                  review_text: "Best gym experience I've had. The workout recommendations and guidance are spot on and super easy to follow.",
                  rating: 5
                },
                {
                  name: "Karan Singh",
                  gym_status: "Member",
                  review_text: "I booked a few personal training sessions with Sushant. My deadlift has gone up 30kg in a month. Incredible coaching.",
                  rating: 5
                },
                {
                  name: "Sanya Malhotra",
                  gym_status: "Member",
                  review_text: "The functional training area is spacious and well-equipped. Nidhi's classes are tough but totally worth it.",
                  rating: 5
                },
                {
                  name: "Rahul Desai",
                  gym_status: "Non-Member",
                  review_text: "Did a trial day yesterday. The facility is extremely clean and the staff is super welcoming. Definitely signing up.",
                  rating: 4
                },
                {
                  name: "Amit Kumar",
                  gym_status: "Member",
                  review_text: "Value for money is incredible. The 12-month plan is a steal for the results I'm getting.",
                  rating: 5
                }
              ]), ...(reviews.length > 0 ? reviews : [
                {
                  name: "Arjun Verma",
                  gym_status: "Member",
                  review_text: "The equipment at Jai Balaji is unmatched. The environment pushes you to your absolute limits. Best gym in town without a doubt.",
                  rating: 5
                },
                {
                  name: "Priya Sharma",
                  gym_status: "Member",
                  review_text: "Love the atmosphere! The trainers completely changed my workout routine. Seeing progress faster than ever.",
                  rating: 5
                },
                {
                  name: "Vikas Patel",
                  gym_status: "Past Member",
                  review_text: "The community here is incredible. Professional coaches and state-of-the-art facilities. Wish I hadn't moved out of town!",
                  rating: 4
                },
                {
                  name: "Neha Gupta",
                  gym_status: "Member",
                  review_text: "Best gym experience I've had. The workout recommendations and guidance are spot on and super easy to follow.",
                  rating: 5
                },
                {
                  name: "Karan Singh",
                  gym_status: "Member",
                  review_text: "I booked a few personal training sessions with Sushant. My deadlift has gone up 30kg in a month. Incredible coaching.",
                  rating: 5
                },
                {
                  name: "Sanya Malhotra",
                  gym_status: "Member",
                  review_text: "The functional training area is spacious and well-equipped. Nidhi's classes are tough but totally worth it.",
                  rating: 5
                },
                {
                  name: "Rahul Desai",
                  gym_status: "Non-Member",
                  review_text: "Did a trial day yesterday. The facility is extremely clean and the staff is super welcoming. Definitely signing up.",
                  rating: 4
                },
                {
                  name: "Amit Kumar",
                  gym_status: "Member",
                  review_text: "Value for money is incredible. The 12-month plan is a steal for the results I'm getting.",
                  rating: 5
                }
              ])].map((review, i) => (
                <div key={i} className="flex-shrink-0 w-80 md:w-96 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 text-left hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">{review.name}</h4>
                      <p className="text-sm text-[var(--color-brand-primary)] font-medium">{(review.gym_status || review.status) || review.role}</p>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(review.rating || 5)].map((_, j) => (
                        <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-300 text-sm leading-relaxed">"{(review.review_text || review.text)}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Footer / Contact */}
      <footer id="contact" className="w-full px-3 md:px-5 pb-3">
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
            <a href="#home" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Home</a>
            <a href="#plans" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Plans</a>
          </div>
        </div>
      </footer>

      {/* Trial Modal */}
      {showTrialModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowTrialModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12m0-12L1 13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <h3 className="text-2xl font-bold mb-2">Book a Trial</h3>
            <p className="text-sm text-neutral-500 mb-6">Enter your details and our team will get back to you.</p>
            
            <form onSubmit={handleBookTrial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Full Name</label>
                <input required type="text" value={trialForm.name} onChange={e => setTrialForm({...trialForm, name: e.target.value})} className="w-full px-4 py-3 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Phone Number</label>
                <input required type="tel" value={trialForm.phone} onChange={e => setTrialForm({...trialForm, phone: e.target.value})} className="w-full px-4 py-3 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Email</label>
                <input required type="email" value={trialForm.email} onChange={e => setTrialForm({...trialForm, email: e.target.value})} className="w-full px-4 py-3 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="john@example.com" />
              </div>
              <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-lg mt-4 hover:bg-neutral-800 transition-colors">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedTopic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTopic(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl p-6 md:p-10 shadow-2xl flex flex-col gap-6 transform transition-all">
            <button 
              onClick={() => setSelectedTopic(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
            >
              <X size={20} className="text-black" />
            </button>
            
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-3">
                {selectedTopic === 'muscle' ? 'The Process of Building Muscle' : 'Nutrition for Optimal Recovery'}
              </h3>
              <p className="text-stone-600 text-lg md:text-xl font-medium">
                {selectedTopic === 'muscle' 
                  ? 'Hypertrophy is the science of breaking down muscle fibers and rebuilding them stronger. This requires progressive overload, optimal recovery, and consistency.'
                  : 'What you eat determines how you rebuild. Proper macronutrient partitioning, hydration, and meal timing are crucial for muscle synthesis and CNS recovery.'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xl font-bold text-black flex items-center gap-2">
                <span className="text-indigo-600">✨</span> AI Features to Boost Your Progress
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTopic === 'muscle' ? (
                  <>
                    <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                      <div className="text-2xl mb-2">👁️</div>
                      <h5 className="font-bold text-black mb-1">AI Form Check Pro</h5>
                      <p className="text-sm text-stone-600 font-medium">Analyzes your lifting mechanics in real-time to ensure maximum muscle fiber recruitment and injury prevention.</p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                      <div className="text-2xl mb-2">🧠</div>
                      <h5 className="font-bold text-black mb-1">Smart AI Programming</h5>
                      <p className="text-sm text-stone-600 font-medium">Dynamically adjusts your volume and intensity based on your recovery metrics.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                      <div className="text-2xl mb-2">📸</div>
                      <h5 className="font-bold text-black mb-1">Snap & Count AI Diet</h5>
                      <p className="text-sm text-stone-600 font-medium">Instantly calculate macros and micros with computer vision, adjusting your daily targets based on workout intensity.</p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                      <div className="text-2xl mb-2">⌚</div>
                      <h5 className="font-bold text-black mb-1">AI Recovery Tracker</h5>
                      <p className="text-sm text-stone-600 font-medium">Synthesizes sleep data and workout strain to prescribe exact nutrient timing for your next meal.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => {
                setSelectedTopic(null);
                handleAuthClick('signup');
              }}
              className="w-full mt-2 py-4 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors text-lg shadow-lg"
            >
              Start Your AI Plan
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      
                  {/* Coach Modal */}
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
            <div className="w-full md:w-1/2 h-[400px] sm:h-[500px] md:h-auto shrink-0 relative bg-neutral-900">
              <img src={selectedCoach.img} alt={selectedCoach.name} className="w-full h-full object-contain" />
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col overflow-y-auto">
              <div className="my-auto">
                <p className="text-[var(--color-brand-primary)] font-bold tracking-widest uppercase text-xs md:text-sm mb-2">{selectedCoach.spec}</p>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">{selectedCoach.name}</h3>
                <p className="text-stone-300 text-base md:text-lg leading-relaxed mb-6 md:mb-8">{selectedCoach.bio}</p>
                <button 
                  onClick={() => setSelectedCoach(null)}
                  className="hidden md:block self-start px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-stone-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 text-black hover:opacity-70"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-black mb-6">Share Your Experience</h2>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input required type="text" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} className="w-full px-4 py-3 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Gender</label>
                  <select value={reviewForm.gender} onChange={e => setReviewForm({...reviewForm, gender: e.target.value})} className="w-full px-4 py-3 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Gym Status</label>
                  <select value={reviewForm.gym_status} onChange={e => setReviewForm({...reviewForm, gym_status: e.target.value})} className="w-full px-4 py-3 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none">
                    <option value="Member">Member</option>
                    <option value="Non-Member">Non-Member</option>
                    <option value="Past Member">Past Member</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Rating</label>
                <div className="flex gap-2 text-[var(--color-brand-primary)]">
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} onClick={() => setReviewForm({...reviewForm, rating: star})} className={`w-8 h-8 cursor-pointer ${star <= reviewForm.rating ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Review</label>
                <textarea required rows={4} value={reviewForm.review_text} onChange={e => setReviewForm({...reviewForm, review_text: e.target.value})} className="w-full px-4 py-3 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Tell us about your experience..." />
              </div>
              <button type="submit" className="mt-2 w-full py-4 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-colors">Submit Review</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
