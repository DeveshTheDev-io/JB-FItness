import Markdown from 'react-markdown';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Activity, Calendar, Clock, CreditCard, Play, Plus, History, Users, Dumbbell, Wind, AlertCircle, ArrowLeft, ClipboardList, Bell, LineChart as LineChartIcon, TrendingUp, Award , Lock, User, Camera, UserPlus, Clock3, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { routines } from '../data/routines';
import { supabase } from "../lib/supabase";

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workout');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI Planner State
  const [plannerGoal, setPlannerGoal] = useState('');
  const [plannerWeight, setPlannerWeight] = useState('');
  const [plannerDiet, setPlannerDiet] = useState('Any');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  // PT Booking State
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [selectedPtTime, setSelectedPtTime] = useState('');
  const [ptBookingSuccess, setPtBookingSuccess] = useState(false);

  const ptTrainers = [
    { id: 1, name: 'Sushant Agrawal', spec: 'Powerlifting Specialist', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Sushant.jpeg_202608011758.jpeg', rate: '₹1500/hr' },
    { id: 2, name: 'Nidhi Singh', spec: 'Functional Training', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Nidhi.jpeg_202608011801.jpeg', rate: '₹1200/hr' },
    { id: 3, name: 'Bhavendra', spec: 'Bodybuilding Pro', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/WhatsApp_Image_2026-08-01_at_5.15.01_202608011759.jpeg', rate: '₹1800/hr' }
  ];

  const handlePtBooking = (e: any) => {
    e.preventDefault();
    if (!selectedTrainer || !selectedPtTime) return;
    
    // Save booking to localStorage for admin panel
    const existing = JSON.parse(localStorage.getItem('ptBookings') || '[]');
    const userStr = localStorage.getItem('currentUser');
    const userEmail = userStr ? JSON.parse(userStr).email : 'member@example.com';
    
    existing.push({
      id: Date.now().toString(),
      user_email: userEmail,
      trainer_name: selectedTrainer.name,
      time_slot: selectedPtTime,
      status: 'Pending',
      created_at: new Date().toISOString()
    });
    localStorage.setItem('ptBookings', JSON.stringify(existing));

    setPtBookingSuccess(true);
    setTimeout(() => {
      setPtBookingSuccess(false);
      setSelectedTrainer(null);
      setSelectedPtTime('');
    }, 4000);
  };


  // Form Checker State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [exerciseType, setExerciseType] = useState('Squat');
  const [formFeedback, setFormFeedback] = useState('');
  const [machineFile, setMachineFile] = useState<File | null>(null);
  const [machinePreview, setMachinePreview] = useState<string | null>(null);
  const [machineInstructions, setMachineInstructions] = useState('');
  const [isMachineLoading, setIsMachineLoading] = useState(false);

  // Diet Tracker State
  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [foodPreview, setFoodPreview] = useState<string | null>(null);
  const [dietInfo, setDietInfo] = useState<any>(null);
  
  // Buddy Matcher State
  const [buddies, setBuddies] = useState<any[]>([]);

  // User Plans & Attendance State
  const [myPlans, setMyPlans] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [myMessages, setMyMessages] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [logForms, setLogForms] = useState<Record<number, {weight: string, reps: string}>>({});
  const [isLoggingSet, setIsLoggingSet] = useState<number | null>(null);
    const [memberInfo, setMemberInfo] = useState<any>(null);
  
  // Profile Settings State
  const [profileForm, setProfileForm] = useState({ gender: '', phone: '', dob: '', address: '', photo_url: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Custom Routines State
  const [customRoutines, setCustomRoutines] = useState<any>({});
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutine, setNewRoutine] = useState<any>({ title: '', desc: '', exercises: [] });
  const [newExercise, setNewExercise] = useState({ name: '', sets: '', reps: '', posture: '', breathing: '' });

  useEffect(() => {
    if (memberInfo?.email) {
      const saved = localStorage.getItem(`customRoutines_${memberInfo.email}`);
      if (saved) setCustomRoutines(JSON.parse(saved));
    }
  }, [memberInfo]);


  const dbCurrentPlan = myPlans.find(plan => new Date(plan.start_date) <= new Date() && new Date(plan.end_date) >= new Date());
  
  // Use admin assigned plan if no active plan is found in user_plans
  const adminPlan = (!dbCurrentPlan && memberInfo?.plan && memberInfo.plan !== 'None' && memberInfo.status === 'Active')
    ? {
        id: 'admin_assigned',
        plan_name: memberInfo.plan + ' Plan',
        months: 'Admin Assigned',
        start_date: memberInfo.created_at || new Date().toISOString(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        active: true
      }
    : null;

  const currentPlan = dbCurrentPlan || adminPlan;
  
  // Ensure the UI shows the admin plan in the list if they have it
  const displayPlans = adminPlan ? [adminPlan, ...myPlans] : myPlans;

  const isPro = currentPlan?.plan_name?.includes('Pro');
  const isElite = currentPlan?.plan_name?.includes('Elite');
  const hasBasicAI = isPro || isElite;
  const hasFullAI = isElite;

  const getRequiredPlan = (tabId: string) => {
    if (['aicoach', 'diettracker'].includes(tabId)) return 'Elite';
    if (['formchecker', 'machineguide', 'buddymatcher'].includes(tabId)) return 'Pro or Elite';
    return 'Active Plan';
  };

  const isTabLocked = (tabId: string) => {
    if (['aicoach', 'diettracker'].includes(tabId)) return !hasFullAI;
    if (['formchecker', 'machineguide', 'buddymatcher'].includes(tabId)) return !hasBasicAI;
    return false;
  };


  useEffect(() => {
    const fetchUserData = async () => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr || !supabase) return;
      const user = JSON.parse(currentUserStr);

      const { data: plans } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_email', user.email)
        .order('start_date', { ascending: false });
      
      if (plans) setMyPlans(plans);

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });
        
      if (messages) setMyMessages(messages);

      let query = supabase
        .from('members')
        .select('*');
        
      if (user.email && user.email.includes('@')) {
        query = query.eq('email', user.email);
      } else {
        query = query.or(`name.eq.${user.username},email.eq.${user.username}`);
      }
      
      let { data: membersList, error: fetchError } = await query.limit(1);
      if (fetchError) console.error('Error fetching member:', fetchError);
      
      let member = membersList?.[0] || null;
        
      if (!member && supabase) {
        // Auto-create member if not exists
        const newMember = { 
          name: user.username || user.email.split('@')[0], 
          email: user.email, 
          status: 'Active', 
          plan: 'Basic',
          gender: user.gender || 'Male'
        };
        const { data: createdMember } = await supabase.from('members').insert([newMember]).select().single();
        if (createdMember) {
          member = createdMember;
        }
      }
        
      if (member) {
        setMemberInfo(member);
        setProfileForm({ gender: member.gender || '', phone: member.phone || '', dob: member.dob || '', address: member.address || '', photo_url: member.photo_url || '' });
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('member_id', member.id)
          .order('check_in_time', { ascending: false });
        
        if (attendance) setMyAttendance(attendance);
        
        const { data: wLogs } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('member_id', member.id)
          .order('completed_at', { ascending: false });
        
        if (wLogs) setWorkoutLogs(wLogs);
      }
    };
    fetchUserData();
  }, []);

  const checkFood = async () => {
    if (!foodImage || !foodPreview) return;
    setIsAiLoading(true);
    try {
      const base64Data = foodPreview.split(',')[1];
      const res = await fetch('/api/ai/diet-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: base64Data, mimeType: foodImage.type })
      });
      const data = await res.json();
      setDietInfo(data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze food.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFoodUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoodImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoodPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const findBuddies = async () => {
    setIsAiLoading(true);
    // Simulating matching API
    setTimeout(() => {
      setBuddies([
        { name: "Alex R.", match: "98%", goal: "Hypertrophy", times: "6 AM - 8 AM" },
        { name: "Sarah M.", match: "92%", goal: "Powerlifting", times: "6 AM - 8 AM" }
      ]);
      setIsAiLoading(false);
    }, 1500);
  };

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
      
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        // Find member ID
        const { data: memberData } = await supabase.from('members').select('id').or(`email.eq.${user.email},name.eq.${user.username || user.email}`).single();
        if (memberData) {
          await supabase.from('ai_plans').insert({ member_id: memberData.id, workout_plan: data.workoutPlan, diet_plan: data.dietPlan });
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleMachineFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMachineFile(file);
      setMachinePreview(URL.createObjectURL(file));
      setMachineInstructions('');
    }
  };

  const handleMachineGuideSubmit = async () => {
    if (!machineFile) return;
    setIsMachineLoading(true);
    setMachineInstructions('');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/ai/machine-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: machineFile.type,
          })
        });
        const data = await res.json();
        if (data.instructions) {
          setMachineInstructions(data.instructions);
        } else {
          setMachineInstructions('Failed to analyze the machine. Please try again.');
        }
      };
      reader.readAsDataURL(machineFile);
    } catch (e) {
      setMachineInstructions('An error occurred during analysis.');
    } finally {
      setIsMachineLoading(false);
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


  const handleSaveProfile = async () => {
    if (!supabase) return;
    if (!memberInfo?.id) {
      alert('User profile not loaded correctly. Please try logging in again.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const { data: updatedData, error } = await supabase
        .from('members')
        .update({ 
          gender: profileForm.gender, 
          phone: profileForm.phone, 
          dob: profileForm.dob, 
          address: profileForm.address,
          photo_url: profileForm.photo_url
        })
        .eq('id', memberInfo.id)
        .select();
        
      if (error) throw error;
      if (!updatedData || updatedData.length === 0) {
        throw new Error('Could not update the database. Row Level Security (RLS) policies might be blocking the update, or the user ID was not found.');
      }
      
      setMemberInfo({ ...memberInfo, ...profileForm });
      
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        user.gender = profileForm.gender;
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      alert('Profile updated successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  
  const handleLogSet = async (ex: any, idx: number) => {
    if (!supabase || !memberInfo) return;
    const logData = logForms[idx];
    if (!logData?.weight || !logData?.reps) {
      alert("Please enter weight and reps");
      return;
    }
    
    setIsLoggingSet(idx);
    
    try {
      const newLog = {
        member_id: memberInfo.id,
        exercise_name: ex.name,
        weight: parseFloat(logData.weight),
        reps: parseInt(logData.reps, 10)
      };
      
      const { data, error } = await supabase
        .from('workout_logs')
        .insert([newLog])
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setWorkoutLogs(prev => [data, ...prev]);
        
        setLogForms(prev => {
          const newState = { ...prev };
          delete newState[idx];
          return newState;
        });
        
        // Streak Logic
        const todayStr = new Date().toISOString().split('T')[0];
        let newStreak = memberInfo.streak_count || 0;
        let shouldUpdateStreak = false;
        
        if (memberInfo.last_workout_date !== todayStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (memberInfo.last_workout_date === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          
          shouldUpdateStreak = true;
        }

        if (shouldUpdateStreak) {
          const { data: updatedMember, error: streakError } = await supabase
            .from('members')
            .update({ streak_count: newStreak, last_workout_date: todayStr })
            .eq('id', memberInfo.id)
            .select()
            .single();
            
          if (!streakError && updatedMember) {
            setMemberInfo(updatedMember);
          }
        }
        
        alert('Set logged successfully!');

      }
    } catch (e: any) {
      alert('Failed to log set: ' + (e.message || 'Unknown error'));
    } finally {
      setIsLoggingSet(null);
    }
  };

const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, photo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-neu-base)] flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 sticky top-0 z-40 bg-[var(--color-neu-base)] shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="neu-convex p-2 rounded-lg">
            <Activity className="text-[var(--color-brand-primary)] w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">FITNESS</h2>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 neu-flat rounded-lg">
          <Menu className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`fixed md:sticky top-0 left-0 h-screen w-72 md:w-80 p-6 flex flex-col gap-8 bg-[var(--color-neu-base)] z-50 transition-transform duration-300 md:translate-x-0 overflow-y-auto shadow-2xl md:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="neu-convex p-3 rounded-xl">
              <Activity className="text-[var(--color-brand-primary)]" />
            </div>
            <div>
              <h2 className="font-bold text-xl">FITNESS</h2>
              <p className="text-sm opacity-70">Member Portal</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 neu-flat rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-4 pb-4 md:pb-0">
          {[
            { id: 'workout', icon: Play, label: 'Workout Tracker' },
            { id: 'progress', icon: LineChartIcon, label: 'Progress Tracking' },
            { id: 'messages', icon: Bell, label: `Messages ${myMessages.filter(m => !m.is_read).length > 0 ? `(${myMessages.filter(m => !m.is_read).length})` : ''}` },
            { id: 'myplans', icon: ClipboardList, label: 'My Plans & Attendance' },
            { id: 'classes', icon: Calendar, label: 'Book Classes' },
            { id: 'ptbooking', icon: UserPlus, label: 'Book PT Session' },
            { id: 'profile', icon: User, label: 'Profile Settings' },
            { id: 'subscription', icon: CreditCard, label: 'Subscription' },
            { id: 'logout', icon: ArrowLeft, label: 'Log Out' },
          ].map((tab) => (
            <Button 
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'default'}
              className={`justify-start gap-4 flex-shrink-0 ${tab.id === 'logout' ? 'text-red-600' : ''}`}
              onClick={async () => {
                setIsMobileMenuOpen(false);
                if (tab.id === 'logout') {
                  localStorage.removeItem('currentUser');
                  navigate('/');
                } else {
                  setActiveTab(tab.id);
                  if (tab.id === 'messages' && myMessages.some(m => !m.is_read)) {
                    const unreadIds = myMessages.filter(m => !m.is_read).map(m => m.id);
                    if (supabase && unreadIds.length > 0) {
                      await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
                      setMyMessages(myMessages.map(m => ({ ...m, is_read: true })));
                    }
                  }
                }
              }}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              <span className="flex-1 flex items-center justify-between min-w-0">
                <span className="truncate">{tab.label}</span>
              </span>
            </Button>
          ))}
        </nav>
        
        {/* User Profile Card */}
        <Card variant="flat" className="flex items-center gap-4 p-4 mt-auto">
          <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
            {memberInfo?.photo_url ? (
              <img src={memberInfo.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-neutral-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">{memberInfo?.name || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).username : 'User')}</p>
            <p className="text-xs opacity-70 truncate">{memberInfo?.email || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).email : '')}</p>
          </div>
        </Card>

        {/* Mini Subscription Status */}

        <Card variant="pressed" className="mt-auto hidden md:block">
          <h4 className="text-sm font-bold mb-2">Membership Status</h4>
          <p className="text-2xl font-black text-[var(--color-brand-primary)]">{memberInfo?.plan || 'None'}</p>
          <p className={`text-sm mt-1 font-bold ${memberInfo?.status === 'Active' ? 'text-green-500' : memberInfo?.status === 'Paused' ? 'text-yellow-500' : 'text-red-500'}`}>
            {memberInfo?.status || 'Inactive'}
          </p>
          <Button variant="primary" className="w-full mt-4 py-2 text-sm" onClick={() => setActiveTab('subscription')}>View Plans</Button>
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
          {isTabLocked(activeTab) ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <Lock className="w-20 h-20 text-[var(--color-brand-primary)] mb-6 opacity-80" />
              <h2 className="text-3xl font-black mb-4">Feature Locked</h2>
              <p className="text-lg opacity-70 mb-8 max-w-md mx-auto">
                This feature requires the <strong>{getRequiredPlan(activeTab)}</strong> plan. Upgrade your subscription to unlock it.
              </p>
              <Button variant="primary" className="px-8 py-3" onClick={() => window.location.href = '/#plans'}>Upgrade Plan</Button>
            </div>
          ) : (
            <>
              {activeTab === 'progress' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">Progress Tracking</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-[var(--color-brand-primary)]" />
                    <h3 className="text-xl font-bold">Weight History</h3>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { month: 'Jan', weight: 85 },
                        { month: 'Feb', weight: 83 },
                        { month: 'Mar', weight: 81 },
                        { month: 'Apr', weight: 82 },
                        { month: 'May', weight: 79 },
                        { month: 'Jun', weight: 78 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="month" stroke="var(--color-brand-secondary)" fontSize={12} />
                        <YAxis stroke="var(--color-brand-secondary)" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--color-neu-base)', borderRadius: '12px', border: '1px solid var(--color-neu-border)', fontWeight: 'bold' }}
                          itemStyle={{ color: 'var(--color-brand-primary)' }}
                        />
                        <Line type="monotone" dataKey="weight" stroke="var(--color-brand-primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--color-brand-primary)' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-6 h-6 text-[var(--color-brand-primary)]" />
                    <h3 className="text-xl font-bold">Attendance Streak</h3>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { week: 'W1', days: 3 },
                        { week: 'W2', days: 5 },
                        { week: 'W3', days: 4 },
                        { week: 'W4', days: 6 },
                        { week: 'W5', days: 5 },
                        { week: 'W6', days: 6 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                        <XAxis dataKey="week" stroke="var(--color-brand-secondary)" fontSize={12} />
                        <YAxis stroke="var(--color-brand-secondary)" fontSize={12} />
                        <Tooltip 
                          cursor={{ fill: 'var(--color-neu-border)', opacity: 0.4 }}
                          contentStyle={{ backgroundColor: 'var(--color-neu-base)', borderRadius: '12px', border: '1px solid var(--color-neu-border)', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="days" fill="var(--color-brand-primary)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-6 h-6 text-[var(--color-brand-primary)]" />
                  <h3 className="text-xl font-bold">Milestone Achievements</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: '1 Month Streak', desc: 'Attended 4 weeks consistently', achieved: true },
                    { title: 'Weight Goal', desc: 'Dropped 5kg from start', achieved: true },
                    { title: 'Strength Master', desc: 'Lifted 100kg total volume', achieved: false },
                    { title: 'Early Bird', desc: '5 workouts before 8 AM', achieved: true },
                  ].map((milestone, i) => (
                    <div key={i} className={`p-4 rounded-xl border-2 transition-all ${milestone.achieved ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5' : 'border-[var(--color-neu-border)] bg-[var(--color-neu-base)] opacity-60'}`}>
                      <Award className={`w-8 h-8 mb-2 ${milestone.achieved ? 'text-[var(--color-brand-primary)]' : 'text-neutral-400'}`} />
                      <div className="font-bold mb-1">{milestone.title}</div>
                      <div className="text-xs opacity-70 leading-tight">{milestone.desc}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {activeTab === 'messages' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">Messages & Notifications</h2>
              </div>
              <div className="space-y-4">
                {myMessages.length === 0 ? (
                  <Card className="text-center py-12">
                    <p className="text-neutral-500 font-bold">No messages right now.</p>
                  </Card>
                ) : (
                  myMessages.map(msg => (
                    <Card key={msg.id} variant="pressed" className={!msg.is_read ? 'border border-[var(--color-brand-primary)]' : ''}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{msg.title}</h3>
                        <span className="text-xs opacity-70">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="opacity-80">{msg.message}</p>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'myplans' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">My Plans & Attendance</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <h3 className="text-xl font-bold mb-4">Purchased Plans</h3>
                  <div className="space-y-4">
                    {displayPlans.length === 0 ? (
                      <p className="opacity-70">No plans purchased yet.</p>
                    ) : (
                      displayPlans.map((plan) => {
                        const start = new Date(plan.start_date);
                        const end = new Date(plan.end_date);
                        // Count attendance within this plan's period
                        const daysAttended = myAttendance.filter(a => {
                          const attDate = new Date(a.check_in_time);
                          return attDate >= start && attDate <= end;
                        }).length;

                        return (
                          <Card key={plan.id} variant="pressed" className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                              <p className="font-bold text-lg">{plan.plan_name}</p>
                              <p className="text-sm opacity-70">Duration: {plan.months}</p>
                              <p className="text-sm opacity-70">{start.toLocaleDateString()} to {end.toLocaleDateString()}</p>
                            </div>
                            <div className="text-left md:text-right">
                              <p className="font-black text-2xl text-[var(--color-brand-primary)]">{daysAttended}</p>
                              <p className="text-sm opacity-70 font-bold uppercase tracking-wider">Days Attended</p>
                              <p className={`text-sm mt-1 font-bold ${plan.active ? 'text-green-500' : 'text-red-500'}`}>
                                {plan.active ? 'ACTIVE' : 'EXPIRED'}
                              </p>
                            </div>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-xl font-bold mb-4">Recent Attendance</h3>
                  <div className="space-y-2">
                    {myAttendance.length === 0 ? (
                      <p className="opacity-70">No attendance records found.</p>
                    ) : (
                      myAttendance.slice(0, 10).map((att) => (
                        <div key={att.id} className="flex justify-between items-center py-2 border-b border-[var(--color-neu-dark)]/10 last:border-0">
                          <p className="font-bold">{new Date(att.check_in_time).toLocaleDateString()}</p>
                          <p className="opacity-70 text-sm">{new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'workout' && (
            <>
                            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black tracking-tight">Workout Programs</h2>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] px-4 py-2 rounded-full font-bold">
                    <Award className="w-5 h-5" />
                    <span>{memberInfo?.streak_count || 0} Day Streak</span>
                  </div>
                  <Button variant="secondary" onClick={() => setIsCreatingRoutine(true)}>
                    <Plus className="w-5 h-5 mr-2" /> Create Custom
                  </Button>
                  <p className="font-medium opacity-70 hidden lg:block">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {isCreatingRoutine ? (
                <Card variant="flat" className="mt-8 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Create Custom Routine</h3>
                    <Button variant="ghost" onClick={() => setIsCreatingRoutine(false)}>Cancel</Button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2">Routine Title</label>
                      <Input 
                        placeholder="e.g., Leg Day Crusher" 
                        value={newRoutine.title}
                        onChange={e => setNewRoutine({ ...newRoutine, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2">Description</label>
                      <Input 
                        placeholder="Short description of the routine" 
                        value={newRoutine.desc}
                        onChange={e => setNewRoutine({ ...newRoutine, desc: e.target.value })}
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-neutral-100">
                      <h4 className="text-lg font-bold mb-4">Add Exercises</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Input placeholder="Exercise Name" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} />
                        <Input placeholder="Sets (e.g., 4)" value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })} />
                        <Input placeholder="Reps (e.g., 8-12)" value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })} />
                        <Input className="md:col-span-3" placeholder="Posture / Instructions" value={newExercise.posture} onChange={e => setNewExercise({ ...newExercise, posture: e.target.value })} />
                        <Input className="md:col-span-3" placeholder="Breathing Instructions" value={newExercise.breathing} onChange={e => setNewExercise({ ...newExercise, breathing: e.target.value })} />
                      </div>
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          if (newExercise.name) {
                            setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, newExercise] });
                            setNewExercise({ name: '', sets: '', reps: '', posture: '', breathing: '' });
                          }
                        }}
                      >
                        Add Exercise
                      </Button>
                    </div>

                    {newRoutine.exercises.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="font-bold opacity-70">Added Exercises:</h4>
                        {newRoutine.exercises.map((ex: any, idx: number) => (
                          <div key={idx} className="flex justify-between p-3 neu-flat rounded-lg">
                            <span>{ex.name}</span>
                            <span className="opacity-70">{ex.sets} sets x {ex.reps}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-6">
                      <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={() => {
                          if (!newRoutine.title || newRoutine.exercises.length === 0) {
                            alert('Please enter a title and add at least one exercise.');
                            return;
                          }
                          const key = 'custom_' + Date.now();
                          const updatedCustom = { ...customRoutines, [key]: newRoutine };
                          setCustomRoutines(updatedCustom);
                          if (memberInfo?.email) {
                            localStorage.setItem(`customRoutines_${memberInfo.email}`, JSON.stringify(updatedCustom));
                          }
                          setIsCreatingRoutine(false);
                          setNewRoutine({ title: '', desc: '', exercises: [] });
                        }}
                      >
                        Save Routine
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : !selectedRoutine ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {Object.entries({ ...routines, ...customRoutines }).filter(([key]) => {
                      if (key.startsWith('custom_')) return true;
                      const userGenderRaw = memberInfo?.gender || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).gender : null);
                      const userGender = userGenderRaw ? String(userGenderRaw).trim().toLowerCase() : 'male';
                      if (userGender === 'male') return key.startsWith('mens');
                      if (userGender === 'female') return key.startsWith('womens');
                      return true;
                    }).map(([key, routine]: [string, any]) => {
                      const Icon = routine.icon || Dumbbell;
                      return (
                        <Card key={key} className="flex flex-col p-8 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => setSelectedRoutine(key)}>
                          <div className="flex justify-between items-start mb-6">
                            <div className="neu-pressed w-16 h-16 rounded-full flex items-center justify-center">
                              <Icon className="w-8 h-8 text-[var(--color-brand-primary)]" />
                            </div>
                            {key.startsWith('custom_') && (
                              <Button variant="ghost" onClick={(e) => {
                                e.stopPropagation();
                                const newCustoms = { ...customRoutines };
                                delete newCustoms[key];
                                setCustomRoutines(newCustoms);
                                if (memberInfo?.email) {
                                  localStorage.setItem(`customRoutines_${memberInfo.email}`, JSON.stringify(newCustoms));
                                }
                              }}>Delete</Button>
                            )}
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
                      {workoutLogs.length === 0 ? (
                        <div className="text-center opacity-70 p-4">No recent activity</div>
                      ) : workoutLogs.slice(0, 5).map((log, i) => (
                        <div key={i} className="flex justify-between items-center p-4 neu-flat rounded-xl">
                          <div>
                            <p className="font-bold">{log.exercise_name}</p>
                            <p className="text-sm opacity-70">{new Date(log.completed_at).toLocaleDateString()} {new Date(log.completed_at).toLocaleTimeString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{log.weight}kg × {log.reps}</p>
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
                  <h3 className="text-2xl font-black mb-6">{({ ...routines, ...customRoutines })[selectedRoutine]?.title}</h3>
                  
                  {({ ...routines, ...customRoutines })[selectedRoutine]?.exercises?.map((ex: any, idx: number) => (
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
                          <Input 
                            placeholder="Weight (kg)" 
                            type="number" 
                            value={logForms[idx]?.weight || ''}
                            onChange={(e) => setLogForms({...logForms, [idx]: {...(logForms[idx] || {reps: ''}), weight: e.target.value}})}
                          />
                          <Input 
                            placeholder="Reps Done" 
                            type="number" 
                            value={logForms[idx]?.reps || ''}
                            onChange={(e) => setLogForms({...logForms, [idx]: {...(logForms[idx] || {weight: ''}), reps: e.target.value}})}
                          />
                          <Button 
                            variant="primary" 
                            className="w-full"
                            onClick={() => handleLogSet(ex, idx)}
                            disabled={isLoggingSet === idx}
                          >
                            {isLoggingSet === idx ? 'Logging...' : 'Log Set'}
                          </Button>
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

                    {activeTab === 'machineguide' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">AI Machine Guide</h2>
              <Card className="flex flex-col gap-6 mb-8">
                <div>
                  <h3 className="font-bold mb-2">Upload or Take a Photo of a Machine</h3>
                  <p className="text-sm opacity-70 mb-4">Our AI will identify the machine and tell you how to use it safely in both English and Hinglish.</p>
                  
                  <div className="border-2 border-dashed border-[var(--color-brand-primary)] rounded-xl p-8 text-center bg-[var(--color-neu-light)] relative">
                    {machinePreview ? (
                      <div className="flex flex-col items-center z-10 relative">
                        <img src={machinePreview} alt="Machine preview" className="max-h-64 object-contain rounded-xl mb-4 shadow-sm" />
                        <Button variant="default" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMachineFile(null); setMachinePreview(null); setMachineInstructions(''); }}>
                          Clear Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera className="w-12 h-12 text-[var(--color-brand-primary)] mb-4" />
                        <p className="font-medium mb-4">Click to upload or capture</p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          onChange={handleMachineFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full py-4 text-lg font-bold" 
                  onClick={handleMachineGuideSubmit}
                  disabled={!machineFile || isMachineLoading}
                >
                  {isMachineLoading ? 'Analyzing Machine...' : 'Analyze Machine'}
                </Button>

                {machineInstructions && (
                  <div className="mt-4 p-6 bg-[var(--color-neu-base)] border border-[var(--color-neu-border)] rounded-2xl shadow-sm">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <Wind className="w-5 h-5 text-[var(--color-brand-primary)]" />
                      AI Instructions
                    </h4>
                    <div className="markdown-body space-y-4">
                      <Markdown>{machineInstructions}</Markdown>
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}

          
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
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTrainer?.id === trainer.id ? 'border-black bg-stone-50' : 'border-stone-200 hover:border-stone-300 bg-white'}`}
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

          {activeTab === 'diettracker' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Snap & Count AI Diet Tracker</h2>
                <p className="text-neutral-500">Take a picture of your food. Gemini AI instantly estimates calories, protein, carbs, and fats directly to your log.</p>
              </div>
              <Card className="p-6 space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-semibold mb-2">Upload Meal Image</label>
                  <input type="file" accept="image/*" onChange={handleFoodUpload} className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {foodPreview && (
                    <img src={foodPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-4" />
                  )}
                  <Button onClick={checkFood} disabled={isAiLoading || !foodImage} className="w-full">
                    {isAiLoading ? 'Analyzing...' : 'Analyze Meal'}
                  </Button>
                </div>
                {dietInfo && (
                  <div className="p-4 bg-green-50 rounded-xl mt-4 border border-green-200">
                    <h3 className="font-bold text-lg mb-2">Meal Analysis</h3>
                    <p><strong>Food:</strong> {dietInfo.foodName}</p>
                    <p><strong>Calories:</strong> {dietInfo.calories} kcal</p>
                    <div className="flex gap-4 mt-2">
                      <div><span className="text-sm font-medium text-neutral-500">Protein</span><br/>{dietInfo.protein}g</div>
                      <div><span className="text-sm font-medium text-neutral-500">Carbs</span><br/>{dietInfo.carbs}g</div>
                      <div><span className="text-sm font-medium text-neutral-500">Fats</span><br/>{dietInfo.fats}g</div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'buddymatcher' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Gym Buddy Matcher</h2>
                <p className="text-neutral-500">Find your perfect training partner. Our AI matches you based on goals and attendance times.</p>
              </div>
              <Card className="p-6 space-y-4 max-w-xl">
                <Button onClick={findBuddies} disabled={isAiLoading} className="w-full">
                  {isAiLoading ? 'Finding Matches...' : 'Find My Gym Buddy'}
                </Button>
                
                {buddies.length > 0 && (
                  <div className="space-y-4 mt-6">
                    {buddies.map((buddy, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                        <div>
                          <h4 className="font-bold">{buddy.name}</h4>
                          <p className="text-sm text-neutral-500">{buddy.goal} • {buddy.times}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full text-sm">{buddy.match} Match</span>
                          <Button variant="default" className="mt-2 block w-full">Connect</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Achievements & Milestones</h2>
                <p className="text-neutral-500">Track your progress and earn custom AI-generated badges.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                <Card className="p-6 flex items-center gap-6">
                  <div className="text-5xl">🔥</div>
                  <div>
                    <h3 className="font-bold text-lg">7-Day Streak</h3>
                    <p className="text-sm text-neutral-500 mb-2">You've hit the gym 7 days in a row!</p>
                    <Button variant="default">Share to Story</Button>
                  </div>
                </Card>
                <Card className="p-6 flex items-center gap-6 opacity-60 grayscale">
                  <div className="text-5xl">🏋️</div>
                  <div>
                    <h3 className="font-bold text-lg">100kg Deadlift</h3>
                    <p className="text-sm text-neutral-500">Unlock by lifting 100kg.</p>
                  </div>
                </Card>
                <Card className="p-6 flex items-center gap-6">
                  <div className="text-5xl">🚀</div>
                  <div>
                    <h3 className="font-bold text-lg">Early Bird</h3>
                    <p className="text-sm text-neutral-500 mb-2">5 check-ins before 7 AM.</p>
                    <Button variant="default">Share to Story</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

                    {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Profile Settings</h2>
                <p className="text-neutral-500">Manage your personal information and preferences.</p>
              </div>
              <Card className="max-w-2xl p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center border-4 border-white shadow-lg">
                        {profileForm.photo_url ? (
                          <img src={profileForm.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-neutral-400" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 p-3 bg-black text-white rounded-full cursor-pointer hover:bg-neutral-800 transition-colors shadow-lg">
                        <Camera className="w-5 h-5" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Gender</label>
                      <select 
                        value={profileForm.gender} 
                        onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Date of Birth</label>
                      <Input 
                        type="date" 
                        value={profileForm.dob} 
                        onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Phone Number</label>
                      <Input 
                        placeholder="+91 9876543210" 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Address</label>
                      <textarea 
                        className="w-full p-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/5 resize-none h-24"
                        placeholder="Enter your full address"
                        value={profileForm.address}
                        onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-100 flex justify-end">
                    <Button type="submit" variant="primary" className="px-8 py-3" disabled={isSavingProfile}>
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
          {activeTab === 'subscription' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">Your Subscription</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card variant="convex" className="border-t-4 border-[var(--color-brand-primary)]">
                  <h3 className="text-xl font-bold mb-2">Current Plan</h3>
                  {currentPlan ? (
                    <>
                      <div className="text-4xl font-black text-[var(--color-brand-primary)] mb-4">{currentPlan.plan_name}</div>
                      <p className="mb-6 opacity-70">Access to facilities based on your plan tier.</p>
                      <div className="neu-pressed p-4 rounded-xl flex justify-between items-center mb-6">
                        <span className="font-medium">Status</span>
                        <span className="text-green-500 font-bold">Active</span>
                      </div>
                      <div className="neu-pressed p-4 rounded-xl flex justify-between items-center">
                        <span className="font-medium">Valid Until</span>
                        <span className="font-bold">{new Date(currentPlan.end_date).toLocaleDateString()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-black text-neutral-500 mb-4">No Active Plan</div>
                      <p className="mb-6 opacity-70">You currently do not have an active membership plan.</p>
                    </>
                  )}
                </Card>
                <Card className="flex flex-col justify-center items-center text-center">
                  <CreditCard className="w-16 h-16 text-[var(--color-brand-primary)] mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{currentPlan ? 'Renew Your Plan' : 'Purchase a Plan'}</h3>
                  <p className="opacity-70 mb-8">{currentPlan ? 'Extend your membership to avoid interruption.' : 'Get access to our facilities and features by purchasing a plan.'}</p>
                  <Button variant="primary" className="w-full text-lg py-4" onClick={() => window.location.href = '/#plans'}>View Plans</Button>
                </Card>
              </div>
            </>
          )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
