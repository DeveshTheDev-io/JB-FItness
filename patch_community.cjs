const fs = require('fs');
let code = fs.readFileSync('src/pages/CommunityPage.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { Button } from '../components/ui/Button';",
  "import { Button } from '../components/ui/Button';\nimport { Input } from '../components/ui/Input';\nimport { supabase } from '../lib/supabase';\nimport { AlertCircle, CheckCircle2 } from 'lucide-react';"
);

// We need to add state for the complaint form
const stateCode = `  const [complaintEquipment, setComplaintEquipment] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const sample0 = supabase ? supabase.storage.from('community').getPublicUrl('sample0').data.publicUrl : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop';
  const sample1 = supabase ? supabase.storage.from('community').getPublicUrl('sample1').data.publicUrl : 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop';
  const sample3 = supabase ? supabase.storage.from('community').getPublicUrl('sample3').data.publicUrl : 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop';

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
  };`;

code = code.replace(
  "const navigate = useNavigate();",
  "const navigate = useNavigate();\n" + stateCode
);

// Update the posts to use the uploaded images
code = code.replace(
  "img: 'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?q=80&w=1470&auto=format&fit=crop',",
  "img: sample0,"
);
code = code.replace(
  "img: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1485&auto=format&fit=crop',",
  "img: sample1,"
);
code = code.replace(
  "img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop',",
  "img: sample3,"
);

// Add the Complaint Form UI
const complaintUI = `
        <div className="mb-16 bg-white rounded-2xl shadow-xl p-8 border border-stone-200">
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
`;

code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">',
  complaintUI + '\n        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">'
);

fs.writeFileSync('src/pages/CommunityPage.tsx', code);
