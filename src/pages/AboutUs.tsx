import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Award, Users, Dumbbell, Zap, Instagram } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AboutUs() {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F4] flex flex-col font-sans relative overflow-hidden">
      {/* Soft abstract background blobs for glassmorphism effect */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-stone-300/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-stone-200/50 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <nav className="w-full flex items-center justify-between py-6 px-6 md:px-12 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-white/50 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="default" onClick={() => navigate('/')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-white shadow-sm border border-stone-200 hover:bg-stone-50 text-black">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xl leading-none tracking-tighter">JB</span>
            </div>
            <span className="text-lg font-black tracking-tight uppercase">Jai Balaji</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 md:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-20 flex flex-col justify-center items-center text-center mb-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-stone-500 mb-6">Our Story</p>
            <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-black text-black leading-[0.9] tracking-tighter mb-8">
              Built on Strength.<br/>Driven by AI.
            </h1>
            <p className="text-stone-600 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
              Jai Balaji Fitness is more than just a gym. It's a sanctuary for those dedicated to pushing their limits, combining old-school iron with cutting-edge artificial intelligence to build the ultimate athlete.
            </p>
          </div>
        </div>

        {/* Vision & Mission - 3D Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-10 md:p-12 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_20px_40px_rgb(0,0,0,0.03)] hover:-translate-y-2 transition-transform duration-500">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-stone-100">
              <Award className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-black mb-5 tracking-tight">Our Mission</h2>
            <p className="text-stone-500 font-medium leading-relaxed text-lg">
              To provide a premium, judgment-free environment where individuals can transform their bodies and minds. We strive to offer world-class equipment alongside personalized AI coaching, making elite fitness accessible to everyone.
            </p>
          </div>

          <div className="p-10 md:p-12 rounded-[2rem] bg-black/90 backdrop-blur-xl border border-stone-800 shadow-[0_20px_40px_rgb(0,0,0,0.1)] hover:-translate-y-2 transition-transform duration-500 text-white">
            <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-stone-700">
              <Users className="w-8 h-8 text-[var(--color-brand-primary)]" />
            </div>
            <h2 className="text-3xl font-black mb-5 tracking-tight text-white">Our Community</h2>
            <p className="text-stone-400 font-medium leading-relaxed text-lg">
              We believe that fitness is a collective journey. At Jai Balaji, you aren't just buying a membership; you are joining a family. We celebrate every PR, support every setback, and grow stronger together every single day.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-4">The Jai Balaji Difference</h2>
            <p className="text-stone-500 font-medium max-w-xl mx-auto">Experience the perfect synergy of heavy metal and smart technology.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-8 md:p-10 text-center rounded-[2rem] bg-white/60 backdrop-blur-lg border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/80 transition-colors">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-stone-100">
                <Dumbbell className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Premium Equipment</h3>
              <p className="text-stone-500 font-medium text-sm leading-relaxed">State-of-the-art machines, competition-grade plates, and extensive free weights to cater to absolute beginners and professional athletes alike.</p>
            </div>
            
            <div className="p-8 md:p-10 text-center rounded-[2rem] bg-white/60 backdrop-blur-lg border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/80 transition-colors">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md border border-stone-800">
                <Zap className="w-6 h-6 text-[var(--color-brand-primary)]" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Smart Technology</h3>
              <p className="text-stone-500 font-medium text-sm leading-relaxed">From real-time form checking and diet tracking to predictive maintenance, our AI ecosystem ensures your fitness journey is optimized and safe.</p>
            </div>
            
            <div className="p-8 md:p-10 text-center rounded-[2rem] bg-white/60 backdrop-blur-lg border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/80 transition-colors">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-stone-100">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">Expert Coaches</h3>
              <p className="text-stone-500 font-medium text-sm leading-relaxed">Our trainers don't just count reps. They are certified professionals dedicated to building customized roadmaps for your success.</p>
            </div>

          </div>
        </div>

        {/* Location & Contact - Glass Pane */}
        <div className="rounded-[2rem] bg-white/70 backdrop-blur-2xl border border-white shadow-[0_20px_40px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-black mb-10 tracking-tight">Visit Us Today</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-lg mb-1">Location</h4>
                    <p className="text-stone-500 font-medium leading-relaxed">3rd floor, Shree Banke Bihari Plaza,<br/>Kailash VIhar, income tax office road,<br/>City center, Gwalior - 474002(M.P)</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-black" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-lg mb-1">Contact</h4>
                    <p className="text-stone-500 font-medium leading-relaxed">+91 8770483654</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-lg mb-1">Email</h4>
                    <p className="text-stone-500 font-medium leading-relaxed">jbfitnesshubthegym@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center shrink-0">
                    <Instagram className="w-6 h-6 text-[var(--color-brand-primary)]" />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-lg mb-1">Instagram</h4>
                    <a 
                      href="https://www.instagram.com/jai_balaji_fitness_gym_?igsh=M2JlMzdxMWNlNno=" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-stone-700 hover:text-[var(--color-brand-primary)] font-bold leading-relaxed transition-colors"
                    >
                      @jai_balaji_fitness_gym_
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-80 md:h-auto bg-stone-200 relative">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1474&auto=format&fit=crop" alt="Map Location" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40 grayscale" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3 border border-white">
                  <MapPin className="w-6 h-6 text-[var(--color-brand-primary)]" /> 
                  <span className="text-lg">Jai Balaji Fitness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
