import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
  { name: 'Personal\nTraining', num: null, active: false },
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

function useImageWidth(src: string, sectionHeight: number) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!sectionHeight) return;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setWidth(img.naturalWidth * (sectionHeight / img.naturalHeight));
    };
  }, [src, sectionHeight]);
  return width;
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
  bgImage, position, imageWidth, focalX, className, children, cardRef, style 
}: { 
  bgImage: string, position: any, imageWidth: number, focalX: number, className: string, children: React.ReactNode, cardRef: (el: HTMLDivElement | null) => void, style?: React.CSSProperties
}) {
  const overflow = imageWidth > (position?.sw || 0) ? imageWidth - (position?.sw || 0) : 0;
  const focalOffset = overflow * focalX;

  const bgStyle: React.CSSProperties = position?.sh ? {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: `auto ${position.sh}px`,
    backgroundPosition: `-${position.x + focalOffset}px -${position.y}px`,
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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur-md">
        <div className="flex flex-col cursor-pointer" onClick={() => handleScroll('home')}>
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none">JAI</span>
          <span className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none -mt-1.5 md:-mt-2">BAJRANGI</span>
          <span className="text-[8px] md:text-[9px] font-medium leading-none mt-1.5 md:mt-2 uppercase">Elite Fitness</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          {['Home', 'Programs', 'Coaches', 'Gallery', 'Contact'].map((item) => (
            <button key={item} onClick={() => handleScroll(item.toLowerCase())} className="text-sm font-bold text-black hover:opacity-70 transition-opacity uppercase">{item}</button>
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
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col justify-center px-8 gap-1 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          {['Home', 'Programs', 'Coaches', 'Gallery', 'Contact'].map((item, i) => (
            <button key={item} onClick={() => handleScroll(item.toLowerCase())} className="text-4xl font-bold text-black hover:text-neutral-500 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] text-left" style={{ opacity: open ? 1 : 0, transform: open ? 'translateX(0)' : 'translateX(32px)', transitionDelay: `${100 + i * 60}ms` }}>
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
  const [showSplash, setShowSplash] = useState(true);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialForm, setTrialForm] = useState({ name: '', phone: '', email: '' });
  const isMobile = useIsMobile();
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

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/member');
    } else {
      navigate(`/login?mode=${mode}`);
    }
  };

  const section1Ref = useRef<HTMLElement>(null);
  const s1Cards = useRef<(HTMLDivElement | null)[]>([]);
  const s1Positions = useMaskPositions(section1Ref, s1Cards);
  const s1ImgWidth = useImageWidth(HERO_IMAGE, s1Positions[0]?.sh || 0);
  const s1Reveal = useStaggeredReveal(4);

  const section2Ref = useRef<HTMLElement>(null);
  const s2Cards = useRef<(HTMLDivElement | null)[]>([]);
  const s2Positions = useMaskPositions(section2Ref, s2Cards);
  const s2ImgWidth = useImageWidth(SECTION2_IMAGE, s2Positions[0]?.sh || 0);
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

      <section id="home" ref={(el) => { section1Ref.current = el; s1Reveal.containerRef.current = el; }} className="h-screen w-full overflow-hidden flex flex-col pt-24 md:pt-24 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2">
        {featureBars.map((bar, i) => (
          <MaskedCard
            key={i}
            bgImage={HERO_IMAGE}
            position={s1Positions[i]}
            imageWidth={s1ImgWidth}
            focalX={s1FocalX}
            cardRef={(el) => (s1Cards.current[i] = el)}
            className="w-full h-14 md:h-20 shrink-0 rounded-xl md:rounded-2xl overflow-hidden relative"
            style={s1Reveal.getAnimStyle(i)}
          >
            <span className="flex items-center justify-center h-full text-white text-lg md:text-3xl font-bold text-center relative z-10 drop-shadow-md">{bar}</span>
          </MaskedCard>
        ))}

        <MaskedCard
          bgImage={HERO_IMAGE}
          position={s1Positions[3]}
          imageWidth={s1ImgWidth}
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
            <span className="block text-white/90 text-xs md:text-sm font-semibold mb-1 md:mb-2 drop-shadow">Premier Gym in City Center</span>
            <h1 className="text-white text-[clamp(3rem,11vw,11rem)] font-bold leading-[0.79] tracking-tight drop-shadow-lg">
              Sculpt<br/>Legacy
            </h1>
          </div>
          <p className="absolute bottom-6 right-4 md:bottom-10 md:right-8 text-white text-xs md:text-sm font-semibold z-10 drop-shadow">
            Free Trial Available
          </p>
        </MaskedCard>
      </section>

      <section id="gallery" ref={(el) => { section2Ref.current = el; s2Reveal.containerRef.current = el; }} className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2">
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_auto_auto_auto] md:grid-rows-[1fr_1fr_0.8fr] gap-1.5 md:gap-2">
          
          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={s2Positions[0]}
            imageWidth={s2ImgWidth}
            focalX={s2FocalX}
            cardRef={(el) => (s2Cards.current[0] = el)}
            className="rounded-xl md:rounded-2xl overflow-hidden relative min-h-[160px] md:min-h-0"
            style={s2Reveal.getAnimStyle(0)}
          >
            <div className="absolute inset-0 bg-black/40 z-0" />
            <h2 className="absolute top-4 left-5 md:top-6 md:left-7 text-white text-2xl md:text-3xl font-bold z-10">Facility Gallery</h2>
            <p className="absolute bottom-4 left-5 md:bottom-6 md:left-7 text-white text-xs md:text-sm font-semibold z-10">State-of-the-art equipment</p>
          </MaskedCard>

          <MaskedCard
            bgImage={SECTION2_IMAGE}
            position={s2Positions[1]}
            imageWidth={s2ImgWidth}
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
            imageWidth={s2ImgWidth}
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
            imageWidth={s2ImgWidth}
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

      <section id="programs" ref={s3Reveal.containerRef} className="min-h-screen md:h-screen w-full overflow-hidden flex flex-col pt-1.5 md:pt-2 px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2">
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
              
              <div className="flex-1 bg-white rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52 hover:-translate-y-2 transition-transform cursor-pointer">
                <h4 className="text-lg md:text-2xl font-bold text-black leading-5 md:leading-7">The Process<br/>of Building<br/>Muscle</h4>
                <div className="self-end w-9 h-9 md:w-12 md:h-12 rounded-full border border-black flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="-rotate-45">
                    <path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between h-36 md:h-52 hover:-translate-y-2 transition-transform cursor-pointer">
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
        <div className="flex flex-col gap-1.5 md:gap-2 min-h-screen md:h-screen">
          <div className="rounded-xl md:rounded-2xl bg-black p-5 md:p-10 flex flex-col justify-center items-center text-center flex-[0.3]">
            <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-white leading-tight">Membership Plans</h2>
            <p className="text-white/70">Transform your life with our flexible pricing</p>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-2">
            {[
              { months: '1 Month', price: '₹2,000', desc: 'Kickstart your fitness journey.' },
              { months: '3 Months', price: '₹5,000', desc: 'Perfect for short-term goals.' },
              { months: '6 Months', price: '₹8,000', desc: 'Best value for serious commitment.' },
              { months: '12 Months', price: '₹13,000', desc: 'Ultimate transformation package.' }
            ].map((plan, i) => (
              <div key={i} className="rounded-xl md:rounded-2xl bg-stone-100 p-8 flex flex-col justify-between hover:bg-stone-200 transition-colors">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.months}</h3>
                  <p className="text-sm font-semibold text-neutral-500 mb-8">{plan.desc}</p>
                  <p className="text-5xl font-black">{plan.price}</p>
                </div>
                <button onClick={() => handleAuthClick('signup')} className="mt-8 w-full py-4 bg-black rounded-full text-white font-bold hover:bg-neutral-800 transition-colors">Select Plan</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section id="coaches" className="w-full flex flex-col px-3 md:px-5 pb-1.5 md:pb-2 gap-1.5 md:gap-2">
        <div className="flex flex-col gap-1.5 md:gap-2 min-h-screen md:h-screen">
          <div className="rounded-xl md:rounded-2xl bg-stone-100 p-5 md:p-10 flex justify-between items-end flex-[0.2]">
            <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-black leading-tight">Expert<br/>Coaches</h2>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-2">
            {[
              { name: 'Sushant Agrawal', spec: 'Powerlifting Specialist', img: 'https://images.unsplash.com/photo-1567598508481-65985588ce2a?q=80&w=800&auto=format&fit=crop' },
              { name: 'Nidhi Singh', spec: 'Functional Training', img: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=800&auto=format&fit=crop' },
              { name: 'Bhavendra', spec: 'Bodybuilding Pro', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop' }
            ].map((coach, i) => (
              <div key={i} className="rounded-xl md:rounded-2xl overflow-hidden relative group cursor-pointer">
                <img src={coach.img} alt={coach.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white">{coach.name}</h3>
                  <p className="text-sm text-white/70 font-semibold">{coach.spec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="w-full px-3 md:px-5 pb-3">
        <div className="rounded-xl md:rounded-2xl bg-black p-8 md:p-16 flex flex-col md:flex-row justify-between text-white gap-10">
          <div>
            <h2 className="text-3xl font-black mb-4">JAI BAJRANGI FITNESS</h2>
            <p className="text-sm font-semibold opacity-70 max-w-xs">Elevating fitness standards with elite equipment and professional coaching.</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold mb-2">Contact</h3>
            <p className="text-sm opacity-70">+91 8770483654</p>
            <p className="text-sm opacity-70">jbfitnesshubthegym@gmail.com</p>
            <p className="text-sm opacity-70">Instagram: @jb_fitness_gym</p>
            <p className="text-sm opacity-70 max-w-xs mt-2">3rd floor, Shree Banke Bihari Plaza, Kailash VIhar, income tax office road, City center, Gwalior - 474002(M.P)</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold mb-2">Links</h3>
            <a href="#home" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Home</a>
            <a href="#programs" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Programs</a>
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
    </div>
  );
}
