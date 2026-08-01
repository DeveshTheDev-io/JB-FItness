import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Calendar, Clock, CreditCard, Play, Plus, History, Users, Dumbbell, Wind, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { routines } from '../data/routines';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workout');
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI Planner State
  const [plannerGoal, setPlannerGoal] = useState('');
  const [plannerWeight, setPlannerWeight] = useState('');
  const [plannerDiet, setPlannerDiet] = useState('Any');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  // Form Checker State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [exerciseType, setExerciseType] = useState('Squat');
  const [formFeedback, setFormFeedback] = useState('');

  // Receptionist State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const generatePlanner = async () => {
    if (!plannerGoal || !plannerWeight) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: plannerGoal, weight: plannerWeight, diet: plannerDiet })
      });
      const data = await res.json();
      setGeneratedPlan(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const checkForm = async () => {
    if (!videoFile || !videoPreview) return;
    setIsAiLoading(true);
    try {
      // Get base64 from data URL (remove prefix)
      const base64Data = videoPreview.split(',')[1];
      const res = await fetch('/api/ai/form-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: base64Data, mimeType: videoFile.type, exercise: exerciseType })
      });
      const data = await res.json();
      setFormFeedback(data.feedback);
    } catch (error) {
      console.error(error);
      setFormFeedback("Failed to analyze form.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = { role: 'user', text: chatMessage };
    const newHistory = [...chatHistory, newMessage];
    setChatHistory(newHistory);
    setChatMessage('');
    setIsAiLoading(true);
    
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.text, history: chatHistory })
      });
      const data = await res.json();
      setChatHistory([...newHistory, { role: 'model', text: data.text }]);
    } catch (error) {
      console.error(error);
      setChatHistory([...newHistory, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-neu-base)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-80 p-6 flex flex-col gap-8"
      >
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="neu-convex p-3 rounded-xl">
            <Activity className="text-[var(--color-brand-primary)]" />
          </div>
          <div>
            <h2 className="font-bold text-xl">JB Fitness</h2>
            <p className="text-sm opacity-70">Member Portal</p>
          </div>
        </div>

        <nav className="flex md:flex-col gap-4 overflow-x-auto pb-4 md:pb-0">
          {[
            { id: 'workout', icon: Play, label: 'Workout Tracker' },
            { id: 'aicoach', icon: Wind, label: 'Smart Planner' },
            { id: 'formchecker', icon: Activity, label: 'Form Checker' },
            { id: 'receptionist', icon: Users, label: '24/7 Front Desk' },
            { id: 'classes', icon: Calendar, label: 'Book Classes' },
            { id: 'subscription', icon: CreditCard, label: 'Subscription' },
            { id: 'logout', icon: ArrowLeft, label: 'Log Out' },
          ].map((tab) => (
            <Button 
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'default'}
              className={`justify-start gap-4 flex-shrink-0 ${tab.id === 'logout' ? 'text-red-600' : ''}`}
              onClick={() => {
                if (tab.id === 'logout') {
                  localStorage.removeItem('currentUser');
                  navigate('/');
                } else {
                  setActiveTab(tab.id);
                }
              }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </Button>
          ))}
        </nav>

        {/* Mini Subscription Status */}
        <Card variant="pressed" className="mt-auto hidden md:block">
          <h4 className="text-sm font-bold mb-2">Active Plan</h4>
          <p className="text-2xl font-black text-[var(--color-brand-primary)]">Pro</p>
          <p className="text-xs opacity-70 mt-1">Renews in 5 days</p>
          <Button variant="primary" className="w-full mt-4 py-2 text-sm">Renew Now</Button>
          <Button variant="default" className="w-full mt-2 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
            localStorage.removeItem('currentUser');
            navigate('/');
          }}>Log Out</Button>
        </Card>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {activeTab === 'workout' && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tight">Workout Programs</h2>
                <p className="font-medium opacity-70">{new Date().toLocaleDateString()}</p>
              </div>

              {!selectedRoutine ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {Object.entries(routines).map(([key, routine]) => {
                      const Icon = routine.icon;
                      return (
                        <Card key={key} className="flex flex-col p-8 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => setSelectedRoutine(key)}>
                          <div className="neu-pressed w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <Icon className="w-8 h-8 text-[var(--color-brand-primary)]" />
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{routine.title}</h3>
                          <p className="opacity-70 mb-6">{routine.desc}</p>
                          <Button variant="primary" className="mt-auto w-full">Start Routine</Button>
                        </Card>
                      );
                    })}
                  </div>

                  <Card variant="pressed" className="mt-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-[var(--color-brand-primary)]" /> Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Squats', weight: '100kg', reps: 8, time: '10:45 AM' },
                        { name: 'Deadlift', weight: '140kg', reps: 5, time: '11:10 AM' },
                        { name: 'Pull-ups', weight: 'Body', reps: 12, time: '11:30 AM' },
                      ].map((log, i) => (
                        <div key={i} className="flex justify-between items-center p-4 neu-flat rounded-xl">
                          <div>
                            <p className="font-bold">{log.name}</p>
                            <p className="text-sm opacity-70">{log.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{log.weight} × {log.reps}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              ) : (
                <div className="space-y-6">
                  <Button variant="icon" className="mb-4" onClick={() => setSelectedRoutine(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h3 className="text-2xl font-black mb-6">{routines[selectedRoutine as keyof typeof routines].title}</h3>
                  
                  {routines[selectedRoutine as keyof typeof routines].exercises.map((ex, idx) => (
                    <Card key={idx} className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1 space-y-4">
                        <h4 className="text-xl font-bold text-[var(--color-brand-primary)]">{ex.name}</h4>
                        <div className="flex items-start gap-3 bg-stone-100 p-4 rounded-xl">
                          <AlertCircle className="w-5 h-5 mt-0.5 text-neutral-500 shrink-0" />
                          <div>
                            <span className="font-bold block text-sm mb-1">Posture Guide</span>
                            <span className="text-sm opacity-80">{ex.posture}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 bg-stone-100 p-4 rounded-xl">
                          <Wind className="w-5 h-5 mt-0.5 text-neutral-500 shrink-0" />
                          <div>
                            <span className="font-bold block text-sm mb-1">Breathing</span>
                            <span className="text-sm opacity-80">{ex.breathing}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-64 bg-stone-100 p-6 rounded-2xl flex flex-col justify-center">
                        <div className="flex justify-between mb-4">
                          <span className="font-bold opacity-70 uppercase tracking-widest text-xs">Target</span>
                          <span className="font-bold text-sm">{ex.sets} Sets × {ex.reps} Reps</span>
                        </div>
                        <div className="space-y-3">
                          <Input placeholder="Weight (kg)" type="number" />
                          <Input placeholder="Reps Done" type="number" />
                          <Button variant="primary" className="w-full">Log Set</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'aicoach' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">AI Smart Planner</h2>
              <Card className="flex flex-col gap-6 mb-8">
                <div>
                  <h3 className="font-bold mb-2">What is your primary fitness goal?</h3>
                  <Input 
                    placeholder="e.g. Muscle gain, fat loss, endurance" 
                    value={plannerGoal} 
                    onChange={e => setPlannerGoal(e.target.value)} 
                  />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Current Weight (kg)</h3>
                  <Input 
                    placeholder="e.g. 75" 
                    type="number"
                    value={plannerWeight} 
                    onChange={e => setPlannerWeight(e.target.value)} 
                  />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Dietary Preference</h3>
                  <div className="flex gap-4 flex-wrap">
                    {['Any', 'Vegetarian', 'Vegan', 'Keto', 'High Protein'].map(diet => (
                      <Button 
                        key={diet} 
                        variant={plannerDiet === diet ? 'primary' : 'default'}
                        onClick={() => setPlannerDiet(diet)}
                      >
                        {diet}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button variant="primary" className="py-4" onClick={generatePlanner} disabled={isAiLoading || !plannerGoal || !plannerWeight}>
                  {isAiLoading ? 'Generating Custom Plan...' : 'Generate 4-Week Plan'}
                </Button>
              </Card>

              {generatedPlan && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Your Custom AI Plan</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card variant="pressed" className="space-y-4">
                      <h4 className="text-xl font-bold flex items-center gap-2"><Dumbbell className="text-[var(--color-brand-primary)] w-5 h-5" /> Workout Plan</h4>
                      {generatedPlan.workoutPlan?.map((week: any, i: number) => (
                        <div key={i} className="neu-flat p-4 rounded-xl">
                          <p className="font-bold mb-2">Week {week.week}: {week.focus}</p>
                          <ul className="list-disc list-inside space-y-1 text-sm opacity-80">
                            {week.exercises?.map((ex: string, j: number) => (
                              <li key={j}>{ex}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </Card>
                    <Card variant="pressed" className="space-y-4">
                      <h4 className="text-xl font-bold flex items-center gap-2"><Wind className="text-[var(--color-brand-primary)] w-5 h-5" /> Diet Plan</h4>
                      <div className="neu-flat p-4 rounded-xl">
                        <p className="font-bold mb-2">Daily Target: {generatedPlan.dietPlan?.dailyCalories} kcal</p>
                        <p className="text-sm opacity-80 mb-4">{generatedPlan.dietPlan?.macros}</p>
                        <p className="font-bold mb-2">Sample Meals:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm opacity-80">
                          {generatedPlan.dietPlan?.meals?.map((meal: string, j: number) => (
                            <li key={j}>{meal}</li>
                          ))}
                        </ul>
                      </div>
                      <Button variant="primary" className="w-full mt-4" onClick={() => alert('Plan saved to your profile (Supabase simulated)!')}>Save Plan to Profile</Button>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'formchecker' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">AI Vision Form Checker</h2>
              <Card className="flex flex-col gap-6">
                <p className="opacity-80">Upload a short video (under 10MB) or an image of your lift. Our AI will analyze your posture and provide real-time corrections.</p>
                <div>
                  <h3 className="font-bold mb-2">Select Exercise</h3>
                  <div className="flex gap-4 flex-wrap">
                    {['Squat', 'Deadlift', 'Bench Press', 'Overhead Press'].map(ex => (
                      <Button 
                        key={ex} 
                        variant={exerciseType === ex ? 'primary' : 'default'}
                        onClick={() => setExerciseType(ex)}
                      >
                        {ex}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center neu-pressed relative">
                  <input type="file" accept="image/*,video/mp4" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleVideoUpload} />
                  {videoPreview ? (
                    <div className="w-full h-48 bg-neutral-200 rounded-lg overflow-hidden flex items-center justify-center">
                      <span className="font-bold">Media Uploaded Successfully</span>
                    </div>
                  ) : (
                    <>
                      <Activity className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                      <p className="font-bold">Tap to upload video or image</p>
                      <p className="text-sm opacity-60">MP4 or JPEG, Max 10MB</p>
                    </>
                  )}
                </div>

                <Button variant="primary" className="py-4" onClick={checkForm} disabled={isAiLoading || !videoFile}>
                  {isAiLoading ? 'Analyzing Form...' : 'Analyze Form'}
                </Button>
              </Card>

              {formFeedback && (
                <Card variant="pressed" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border-l-4 border-[var(--color-brand-primary)]">
                  <h3 className="text-xl font-bold mb-4">Feedback</h3>
                  <p className="font-medium opacity-90">{formFeedback}</p>
                </Card>
              )}
            </>
          )}

          {activeTab === 'receptionist' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">24/7 Front Desk</h2>
              <Card className="flex flex-col h-[600px] p-0 overflow-hidden">
                <div className="bg-[var(--color-brand-secondary)] p-6 text-white flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">JB Fitness Assistant</h3>
                    <p className="text-sm opacity-80">Ask about rules, classes, or tips</p>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[var(--color-neu-light)]">
                  {chatHistory.length === 0 ? (
                    <div className="text-center opacity-50 mt-10 font-medium">
                      Start a conversation...<br/>e.g. "When is the next Yoga class?"
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl font-medium ${msg.role === 'user' ? 'bg-[var(--color-brand-primary)] text-black rounded-tr-sm' : 'bg-white rounded-tl-sm shadow-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-4 rounded-2xl font-medium bg-white rounded-tl-sm shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                        <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white border-t border-neutral-100 flex gap-2">
                  <Input 
                    placeholder="Type your message..." 
                    className="flex-1"
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  />
                  <Button variant="primary" onClick={sendMessage} disabled={isAiLoading}>Send</Button>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'classes' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">Book a Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'HIIT Cardio', trainer: 'Rahul Sharma', time: '18:00 Today', spots: 5 },
                  { title: 'Powerlifting 101', trainer: 'Vikram Singh', time: '19:00 Today', spots: 2 },
                  { title: 'Yoga & Mobility', trainer: 'Anita Desai', time: '07:00 Tomorrow', spots: 12 },
                  { title: 'Personal Training', trainer: 'Any Available', time: 'Flexible', spots: 'Custom' },
                ].map((c, i) => (
                  <Card key={i} className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{c.title}</h3>
                      <p className="opacity-70 mb-4">{c.trainer}</p>
                      <div className="flex gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-[var(--color-brand-primary)]" /> {c.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-[var(--color-brand-primary)]" /> {c.spots} Spots
                        </div>
                      </div>
                    </div>
                    <Button variant="primary" className="w-full">Book Slot</Button>
                  </Card>
                ))}
              </div>
            </>
          )}

          {activeTab === 'subscription' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">Your Subscription</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card variant="convex" className="border-t-4 border-[var(--color-brand-primary)]">
                  <h3 className="text-xl font-bold mb-2">Current Plan</h3>
                  <div className="text-4xl font-black text-[var(--color-brand-primary)] mb-4">Pro Tier</div>
                  <p className="mb-6 opacity-70">Access to all equipment, 3 classes/week, locker room.</p>
                  <div className="neu-pressed p-4 rounded-xl flex justify-between items-center mb-6">
                    <span className="font-medium">Status</span>
                    <span className="text-green-500 font-bold">Active</span>
                  </div>
                  <div className="neu-pressed p-4 rounded-xl flex justify-between items-center">
                    <span className="font-medium">Valid Until</span>
                    <span className="font-bold">July 28, 2026</span>
                  </div>
                </Card>

                <Card className="flex flex-col justify-center items-center text-center">
                  <CreditCard className="w-16 h-16 text-[var(--color-brand-primary)] mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Renewal Due Soon</h3>
                  <p className="opacity-70 mb-8">Your plan expires in 5 days. Renew now to avoid interruption.</p>
                  <Button variant="primary" className="w-full text-lg py-4">Pay ₹2,499 Now</Button>
                </Card>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
