const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

// 1. Update imports
code = code.replace(
  "Award , Lock, User, Camera } from 'lucide-react';",
  "Award , Lock, User, Camera, UserPlus, Clock3, CheckCircle2 } from 'lucide-react';"
);

// 2. Add PT Booking to Sidebar
code = code.replace(
  "{ id: 'classes', icon: Calendar, label: 'Book Classes' },",
  "{ id: 'classes', icon: Calendar, label: 'Book Classes' },\n            { id: 'ptbooking', icon: UserPlus, label: 'Book PT Session' },"
);

// 3. Add state for PT Booking
const ptState = `
  // PT Booking State
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [selectedPtTime, setSelectedPtTime] = useState('');
  const [ptBookingSuccess, setPtBookingSuccess] = useState(false);

  const ptTrainers = [
    { id: 1, name: 'Vikram Singh', spec: 'Powerlifting / Strength', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop', rate: '₹1500/hr' },
    { id: 2, name: 'Anita Desai', spec: 'Mobility / HIIT', img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop', rate: '₹1200/hr' },
    { id: 3, name: 'Rahul Sharma', spec: 'Bodybuilding / Prep', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', rate: '₹1800/hr' }
  ];

  const handlePtBooking = (e: any) => {
    e.preventDefault();
    if (!selectedTrainer || !selectedPtTime) return;
    // Simulate booking
    setPtBookingSuccess(true);
    setTimeout(() => {
      setPtBookingSuccess(false);
      setSelectedTrainer(null);
      setSelectedPtTime('');
    }, 4000);
  };
`;

code = code.replace(
  "const [generatedPlan, setGeneratedPlan] = useState<any>(null);",
  "const [generatedPlan, setGeneratedPlan] = useState<any>(null);\n" + ptState
);

// 4. Add the PT Booking Tab Content right before 'classes'
const ptTabContent = `
          {activeTab === 'ptbooking' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">Personal Training</h2>
              
              {ptBookingSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Session Booked!</h3>
                  <p className="font-medium">Your request for {selectedPtTime} with {selectedTrainer?.name} has been confirmed. See you on the gym floor!</p>
                  <Button variant="default" className="mt-6" onClick={() => setPtBookingSuccess(false)}>Book Another</Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-stone-500 font-medium">Select a certified trainer below to schedule your 1-on-1 coaching session.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ptTrainers.map(trainer => (
                      <div 
                        key={trainer.id} 
                        onClick={() => setSelectedTrainer(trainer)}
                        className={\`p-4 rounded-2xl border-2 cursor-pointer transition-all \${selectedTrainer?.id === trainer.id ? 'border-black bg-stone-50' : 'border-stone-200 hover:border-stone-300 bg-white'}\`}
                      >
                        <img src={trainer.img} alt={trainer.name} className="w-full h-40 object-cover rounded-xl mb-4 grayscale hover:grayscale-0 transition-all" />
                        <h3 className="text-xl font-bold">{trainer.name}</h3>
                        <p className="text-sm font-bold text-[var(--color-brand-primary)] uppercase tracking-wider mb-2">{trainer.spec}</p>
                        <p className="text-sm font-bold opacity-60">{trainer.rate}</p>
                      </div>
                    ))}
                  </div>

                  {selectedTrainer && (
                    <Card className="p-8 bg-stone-50 border-stone-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <h3 className="text-xl font-bold mb-6">Schedule with {selectedTrainer.name}</h3>
                      <form onSubmit={handlePtBooking} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-sm font-bold opacity-70 mb-2">Preferred Time Slot</label>
                          <select 
                            required
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-black font-medium"
                            value={selectedPtTime}
                            onChange={(e) => setSelectedPtTime(e.target.value)}
                          >
                            <option value="">Select a time...</option>
                            <option value="Tomorrow 08:00 AM">Tomorrow 08:00 AM</option>
                            <option value="Tomorrow 10:30 AM">Tomorrow 10:30 AM</option>
                            <option value="Tomorrow 05:00 PM">Tomorrow 05:00 PM</option>
                            <option value="Wednesday 07:00 AM">Wednesday 07:00 AM</option>
                            <option value="Wednesday 06:00 PM">Wednesday 06:00 PM</option>
                          </select>
                        </div>
                        <Button variant="primary" type="submit" className="w-full md:w-auto px-8 h-[50px] shrink-0">
                          Confirm Booking
                        </Button>
                      </form>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
`;

code = code.replace(
  "{activeTab === 'classes' && (",
  ptTabContent + "\n          {activeTab === 'classes' && ("
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
