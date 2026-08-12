import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CommunityPage() {
  const navigate = useNavigate();
  const [complaintEquipment, setComplaintEquipment] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  
  
  

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!complaintEquipment || !complaintDesc) return;
    setIsSubmitting(true);
    
    // Fallback to localStorage for complaints to ensure it works without db schema changes
    setTimeout(() => {
      const existing = JSON.parse(localStorage.getItem('gymComplaints') || '[]');
      const userStr = localStorage.getItem('currentUser');
      const userEmail = userStr ? JSON.parse(userStr).email : 'anonymous';
      
      existing.push({
        id: Date.now().toString(),
        user_email: userEmail,
        equipment: complaintEquipment,
        description: complaintDesc,
        status: 'Open',
        date: new Date().toISOString()
      });
      localStorage.setItem('gymComplaints', JSON.stringify(existing));
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setComplaintEquipment('');
      setComplaintDesc('');
      
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 600);
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F4] flex flex-col font-sans relative overflow-hidden">
      {/* Soft abstract background blobs for glassmorphism effect */}
      <div className="fixed top-[-10%] left-[-20%] w-[60%] h-[60%] bg-stone-300/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-stone-200/50 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <nav className="w-full flex items-center justify-between py-6 px-6 md:px-12 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-white/50 shadow-sm">
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

      <div className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 md:px-8 relative z-10">
        <div className="rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-20 flex flex-col justify-center items-center text-center mb-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
          <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-stone-500 mb-6">Our Community</p>
            <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-black text-black leading-[0.9] tracking-tighter mb-6">Events & Stories</h1>
            <p className="text-stone-600 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">Stay updated with our latest gym events, competition results, and success stories from the JAI BALAJI family.</p>
          </div>
        </div>

        
        <div className="mb-20 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_20px_40px_rgb(0,0,0,0.03)] p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-8 h-8 text-[var(--color-brand-primary)]" />
            <h2 className="text-3xl font-black tracking-tight">Report an Issue</h2>
          </div>
          <p className="text-stone-500 mb-8 font-medium">Notice a broken machine, missing weights, or any other issue? Let us know so our maintenance team can fix it right away.</p>
          
          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl flex items-center gap-3 font-bold">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Thank you! Your report has been submitted to the admin team.
            </div>
          ) : (
            <form onSubmit={handleComplaintSubmit} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-bold opacity-70 mb-2">Equipment or Area Name</label>
                <Input 
                  placeholder="e.g. Leg Press Machine #2, Men's Locker Room"
                  value={complaintEquipment}
                  onChange={(e) => setComplaintEquipment(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold opacity-70 mb-2">Issue Description</label>
                <textarea 
                  className="w-full px-4 py-3 bg-[var(--color-neu-bg)] border border-[var(--color-neu-border)] rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)]"
                  rows={4}
                  placeholder="Describe the problem in detail..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  required
                />
              </div>
              <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full md:w-auto px-8 py-4 text-lg">
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {[
            {
              img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/community/sample0.jpeg',
              title: 'Powerlifting Meet 2026',
              date: 'March 15, 2026',
              type: 'Event'
            },
            {
              img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/community/sample1.jpeg',
              title: 'Member Spotlight: Rahul\'s Transformation',
              date: 'March 10, 2026',
              type: 'Story'
            },
            {
              img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/community/sample3.jpeg',
              title: 'New CrossFit Classes Added',
              date: 'March 5, 2026',
              type: 'News'
            }
          ].map((blog, i) => (
            <div key={i} className="group relative rounded-[2rem] overflow-hidden cursor-pointer aspect-square md:aspect-[3/4] xl:aspect-[4/5] w-full shadow-[0_20px_40px_rgb(0,0,0,0.08)] border-4 border-white/40 transform transition-all duration-500 hover:-translate-y-2">
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
}
