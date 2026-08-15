import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Menu, X, Plus, Activity, Users, IndianRupee, TrendingUp, Bell, Search, Settings, ArrowUpRight, ArrowDownRight, ClipboardList, CheckCircle, XCircle, Database, Star, MessageSquare, Trash2, Edit2, AlertTriangle, Wrench, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [userComplaints, setUserComplaints] = useState<any[]>([]);
  
  const fetchComplaints = () => {
    const existing = JSON.parse(localStorage.getItem('gymComplaints') || '[]');
    setUserComplaints(existing.reverse());
  };

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchComplaints();
    }
  }, [activeTab]);

  const resolveComplaint = (id: string) => {
    const existing = JSON.parse(localStorage.getItem('gymComplaints') || '[]');
    const updated = existing.map((c: any) => c.id === id ? { ...c, status: 'Resolved' } : c);
    localStorage.setItem('gymComplaints', JSON.stringify(updated));
    setUserComplaints(updated.reverse());
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trialRequests, setTrialRequests] = useState<any[]>([]);
  const [planRequests, setPlanRequests] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ptBookings, setPtBookings] = useState<any[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [memberForm, setMemberForm] = useState({ name: '', plan: 'Basic', status: 'Active' });
  const [searchMember, setSearchMember] = useState('');
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushTarget, setPushTarget] = useState('all');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    beforeExpiry: true,
    onExpiry: true,
    overdueDues: true
  });

  const peakHourData = useMemo(() => {
    const hours = {
      '6 AM': 0, '8 AM': 0, '10 AM': 0, '12 PM': 0, '2 PM': 0, '4 PM': 0, '6 PM': 0, '8 PM': 0
    };
    
    attendance.forEach(record => {
      const date = new Date(record.check_in_time);
      const h = date.getHours();
      if (h >= 5 && h < 7) hours['6 AM']++;
      else if (h >= 7 && h < 9) hours['8 AM']++;
      else if (h >= 9 && h < 11) hours['10 AM']++;
      else if (h >= 11 && h < 13) hours['12 PM']++;
      else if (h >= 13 && h < 15) hours['2 PM']++;
      else if (h >= 15 && h < 17) hours['4 PM']++;
      else if (h >= 17 && h < 19) hours['6 PM']++;
      else hours['8 PM']++;
    });

    if (attendance.length === 0) {
      return [
        { time: '6 AM', visitors: 0 }, { time: '8 AM', visitors: 0 }, { time: '10 AM', visitors: 0 },
        { time: '12 PM', visitors: 0 }, { time: '2 PM', visitors: 0 }, { time: '4 PM', visitors: 0 },
        { time: '6 PM', visitors: 0 }, { time: '8 PM', visitors: 0 }
      ];
    }
    return Object.keys(hours).map(time => ({ time, visitors: hours[time as keyof typeof hours] }));
  }, [attendance]);

  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) {
        m += 12;
        y -= 1;
      }
      const monthStr = months[m];
      
      let monthRevenue = 0;
      members.forEach(member => {
        const joinDate = new Date(member.created_at);
        const joinMonth = joinDate.getMonth();
        const joinYear = joinDate.getFullYear();
        
        // Count member if they joined before or during this month, and they are Active
        if ((joinYear < y || (joinYear === y && joinMonth <= m)) && member.status === 'Active') {
           if (member.plan === 'Basic') monthRevenue += 2000;
           else if (member.plan === 'Pro') monthRevenue += 4000;
           else if (member.plan === 'Elite') monthRevenue += 6000;
        }
      });
      
      result.push({ month: monthStr, amount: monthRevenue });
    }
    
    if (members.length === 0) {
      return result.map(r => ({ ...r, amount: 0 }));
    }
    return result;
  }, [members]);

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const expiredMembers = members.filter(m => m.status === 'Expired').length;
  const currentMonthRevenue = revenueData.length > 0 ? revenueData[revenueData.length - 1].amount : 0;
  const previousMonthRevenue = revenueData.length > 1 ? revenueData[revenueData.length - 2].amount : 0;
  const revenueTrend = previousMonthRevenue ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100) : (currentMonthRevenue > 0 ? 100 : 0);

  const getAiForecast = async () => {
    setIsAiLoading(true);
    try {
      const summary = `Monthly Revenue: ${JSON.stringify(revenueData)}. Hourly peak visitors: ${JSON.stringify(peakHourData)}.`;
      const res = await fetch('/api/ai/admin-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membersData: summary, type: 'forecast' })
      });
      const data = await res.json();
      setAiInsights(data.insights);
    } catch (error) {
      console.error(error);
      setAiInsights("Failed to fetch AI forecast. Please try again later.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const membersWithChurnRisk = useMemo(() => {
    return members.map(m => {
      const memberVisits = attendance.filter(a => a.member_id === m.id);
      if (memberVisits.length === 0) return { ...m, churnRisk: 'High' };
      
      const lastVisit = new Date(Math.max(...memberVisits.map(a => new Date(a.check_in_time).getTime())));
      const daysSinceLastVisit = (new Date().getTime() - lastVisit.getTime()) / (1000 * 3600 * 24);
      
      if (daysSinceLastVisit > 10) return { ...m, churnRisk: 'High' };
      if (daysSinceLastVisit > 5) return { ...m, churnRisk: 'Medium' };
      return { ...m, churnRisk: 'Low' };
    });
  }, [members, attendance]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('trial_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setTrialRequests(data);
      }
    };

    const fetchPlanRequests = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('plan_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setPlanRequests(data);
      }
    };

    const fetchMembers = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setMembers(data);
      }
    };

    const fetchAttendance = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('attendance')
        .select('*');
      
      if (!error && data) {
        setAttendance(data);
      }
    };
    
    const fetchReviews = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setReviews(data);
      }
    };
    
    fetchRequests();
    fetchPlanRequests();
    fetchMembers();
    fetchAttendance();
    fetchReviews();
  }, []);

  const updateTrialStatus = async (id: number, status: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('trial_requests')
      .update({ status })
      .eq('id', id);
      
    if (!error) {
      setTrialRequests(trialRequests.map(req => req.id === id ? { ...req, status } : req));
    }
  };

  
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', gender: 'Male', status: 'Member', rating: 5, text: '' });

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setReviews([{ id: Date.now(), ...newReview, created_at: new Date().toISOString() }, ...reviews]);
      setShowAddReview(false);
      setNewReview({ name: '', gender: 'Male', status: 'Member', rating: 5, text: '' });
      return;
    }
    const { data, error } = await supabase.from('reviews').insert([newReview]).select().single();
    if (!error && data) {
      setReviews([data, ...reviews]);
      setShowAddReview(false);
      setNewReview({ name: '', gender: 'Male', status: 'Member', rating: 5, text: '' });
    }
  };

  const deleteReview = async (id: number) => {
    if (!supabase) {
      setReviews(reviews.filter(r => r.id !== id));
      return;
    }
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const editReview = async (review: any) => {
    const newText = window.prompt("Edit review text:", review.text);
    if (newText && newText !== review.text) {
      if (!supabase) {
        setReviews(reviews.map(r => r.id === review.id ? { ...r, text: newText } : r));
        return;
      }
      const { error } = await supabase.from('reviews').update({ text: newText }).eq('id', review.id);
      if (!error) {
        setReviews(reviews.map(r => r.id === review.id ? { ...r, text: newText } : r));
      }
    }
  };

  const updatePlanRequestStatus = async (request: any, status: string) => {
    if (!supabase) return;

    if (status === 'approved') {
      const startDate = new Date();
      let monthsToAdd = 1;
      
      if (request.months.includes('3')) monthsToAdd = 3;
      else if (request.months.includes('6')) monthsToAdd = 6;
      else if (request.months.includes('9')) monthsToAdd = 9;
      else if (request.months.includes('12') || request.months.includes('1 Year')) monthsToAdd = 12;

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + monthsToAdd);

      const { error: insertError } = await supabase.from('user_plans').insert({
        user_email: request.user_email,
        plan_name: request.plan_name,
        months: request.months,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        active: true
      });

      if (insertError) {
        console.error("Error creating user plan:", insertError);
        alert("Failed to confirm plan. Check console.");
        return;
      }
      
      // Update member status and plan
      await supabase.from('members').update({
        status: 'Active',
        plan: request.plan_name
      }).eq('email', request.user_email);
    }

    const { error } = await supabase
      .from('plan_requests')
      .update({ status })
      .eq('id', request.id);

    if (!error) {
      setPlanRequests(planRequests.map(req => req.id === request.id ? { ...req, status } : req));
    }
  };

    const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    let targetEmails = [];
    if (pushTarget === 'all') {
       targetEmails = members.filter(m => m.email).map(m => m.email);
    } else {
       targetEmails = [pushTarget];
    }
    
    if (targetEmails.length === 0) {
       alert("No target members found with a valid email.");
       return;
    }

    const messages = targetEmails.map(email => ({
      user_email: email,
      title: pushTitle,
      message: pushMessage
    }));
    
    await supabase.from('messages').insert(messages);
    setIsPushModalOpen(false);
    setPushTitle('');
    setPushMessage('');
    alert(`Push notification sent successfully to ${targetEmails.length} member(s)!`);
  };

  const handleMemberSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (editingMember) {
      const { error } = await supabase
        .from('members')
        .update({ name: memberForm.name, plan: memberForm.plan, status: memberForm.status, updated_at: new Date().toISOString() })
        .eq('id', editingMember.id);

      if (!error) {
        setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...memberForm } : m));
      }
    } else {
      const { data, error } = await supabase
        .from('members')
        .insert([{ name: memberForm.name, plan: memberForm.plan, status: memberForm.status }])
        .select();

      if (!error && data) {
        setMembers([...data, ...members]);
      }
    }
    setShowMemberModal(false);
  };

  const handleUpgradeMember = async (id: number) => {
    if (!supabase) return;
    const member = members.find(m => m.id === id);
    if (!member) return;
    const newPlan = member.plan === 'Basic' ? 'Pro' : 'Elite';
    
    const { error } = await supabase
      .from('members')
      .update({ plan: newPlan, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setMembers(members.map(m => m.id === id ? { ...m, plan: newPlan } : m));
    }
  };

  const markAttendance = async (id: number) => {
    if (!supabase) return;
    const now = new Date();
    
    const { error } = await supabase
      .from('attendance')
      .insert([{ member_id: id }]);

    if (!error) {
      setMembers(members.map(m => m.id === id ? { ...m, visit: `Today, ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` } : m));
    }
  };

  const confirmPTBooking = (id: string) => {
    const updated = ptBookings.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b);
    setPtBookings(updated);
    localStorage.setItem('ptBookings', JSON.stringify(updated));
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
              <p className="text-sm opacity-70">Admin Console</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 neu-flat rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-4 pb-4 md:pb-0">
          {[
            { id: 'overview', icon: TrendingUp, label: 'Analytics & Trends' },
            { id: 'members', icon: Users, label: 'Member CRM' },
            { id: 'dues', icon: IndianRupee, label: 'Dues & Payments' },
            { id: 'trials', icon: ClipboardList, label: 'Trial Requests' },
            { id: 'ptrequests', icon: UserCheck, label: 'PT Requests' },
            { id: 'reviews', icon: Star, label: 'Reviews' },
            { id: 'logout', icon: XCircle, label: 'Log Out' },
          ].map((tab) => (
            <Button 
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'default'}
              className={`justify-start gap-4 flex-shrink-0 ${tab.id === 'logout' ? 'text-red-600' : ''}`}
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (tab.id === 'logout') {
                  localStorage.removeItem('currentUser');
                  navigate('/');
                } else {
                  setActiveTab(tab.id);
                }
              }}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </Button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full md:w-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {activeTab === 'overview' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">Analytics Overview</h2>
                <div className="flex gap-4">
                  <span className="neu-pressed px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Live: {attendance.filter(a => new Date().getTime() - new Date(a.check_in_time).getTime() < 1000 * 60 * 60).length} Members
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Members', value: totalMembers, trend: 'All Time', up: true },
                  { label: 'Active Members', value: activeMembers, trend: `${Math.round(totalMembers ? (activeMembers/totalMembers)*100 : 0)}% of total`, up: true },
                  { label: 'Monthly Rev.', value: `₹${(currentMonthRevenue/1000).toFixed(1)}K`, trend: `${revenueTrend > 0 ? '+' : ''}${revenueTrend}%`, up: revenueTrend >= 0 },
                  { label: 'Expired Plans', value: expiredMembers, trend: 'Action Needed', up: false },
                ].map((stat, i) => (
                  <Card key={i} className="flex flex-col">
                    <span className="text-sm opacity-70 font-medium mb-2">{stat.label}</span>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-black">{stat.value}</span>
                      <span className={`flex items-center text-sm font-bold ${stat.up ? 'text-green-500' : 'text-[var(--color-brand-primary)]'}`}>
                        {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {stat.trend}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <h3 className="text-xl font-bold mb-6">Peak Hour Attendance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHourData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#a3b1c6" opacity={0.2} vertical={false} />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#2f3542', opacity: 0.7}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#2f3542', opacity: 0.7}} />
                        <RechartsTooltip cursor={{fill: '#a3b1c6', opacity: 0.1}} contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#e0e5ec', boxShadow: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff'}} />
                        <Bar dataKey="visitors" fill="var(--color-brand-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-xl font-bold mb-6">Revenue Trend (6 Mos)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#a3b1c6" opacity={0.2} vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#2f3542', opacity: 0.7}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#2f3542', opacity: 0.7}} />
                        <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#e0e5ec', boxShadow: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff'}} />
                        <Line type="monotone" dataKey="amount" stroke="var(--color-brand-secondary)" strokeWidth={3} dot={{r: 4, fill: 'var(--color-brand-secondary)'}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'ai-insights' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">AI Business Insights & Forecast</h2>
              </div>
              <Card className="flex flex-col gap-6">
                <p className="opacity-80">Our AI analyzes attendance patterns, membership statuses, and financial data to provide actionable advice on growing your gym business and predicting trends.</p>
                <Button variant="primary" className="w-fit py-4 px-8" onClick={getAiForecast} disabled={isAiLoading}>
                  {isAiLoading ? 'Analyzing Data...' : 'Generate AI Report'}
                </Button>
              </Card>

              {aiInsights && (
                <Card variant="pressed" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Search className="w-6 h-6 text-[var(--color-brand-primary)]" />
                    Growth Recommendations
                  </h3>
                  <div className="prose prose-neutral prose-p:font-medium prose-p:opacity-80 max-w-none">
                    {aiInsights.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line.replace(/[*#]/g, '')}</p>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {activeTab === 'members' && (
            <>
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h2 className="text-3xl font-black tracking-tight">Member CRM</h2>
                <div className="w-full md:w-auto flex gap-4">
                  <Input 
                    icon={<Search className="w-5 h-5" />} 
                    placeholder="Search members..." 
                    className="w-full md:w-64" 
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                  />
                  <Button variant="primary" onClick={() => {
                    setEditingMember(null);
                    setMemberForm({ name: '', plan: 'Basic', status: 'Active' });
                    setShowMemberModal(true);
                  }}>Add Member</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {membersWithChurnRisk.filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase())).map((member) => (
                  <Card key={member.id} className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="opacity-70 text-sm font-medium">{member.email || 'No email'}</p>
                      </div>
                      <span className="neu-pressed px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">{member.plan}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`flex items-center gap-2 font-bold ${member.status === 'Active' ? 'text-green-500' : 'text-[var(--color-brand-primary)]'}`}>
                        <div className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-[var(--color-brand-primary)]'}`}></div>
                        {member.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${member.churnRisk === 'High' ? 'bg-red-100 text-red-700' : member.churnRisk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        Risk: {member.churnRisk}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-[var(--color-neu-dark)]/10 flex flex-wrap gap-2">
                      <Button className="flex-1 min-w-[80px] py-2 text-sm bg-green-500 text-white border-green-500 hover:bg-green-600" onClick={() => markAttendance(member.id)}>Present</Button>
                      <Button className="flex-1 min-w-[80px] py-2 text-sm" onClick={() => {
                        setEditingMember(member);
                        setMemberForm({ name: member.name, plan: member.plan, status: member.status });
                        setShowMemberModal(true);
                      }}>Edit</Button>
                      <Button variant="primary" className="flex-1 min-w-[80px] py-2 text-sm" onClick={() => handleUpgradeMember(member.id)}>Upgrade</Button>
                    </div>
                    {member.churnRisk === 'High' && (
                      <Button variant="default" className="w-full text-red-600 border-red-200 hover:bg-red-50 text-sm py-2" onClick={() => alert(`Sent automated 'We miss you' offer to ${member.name}!`)}>
                        Send Retention Offer
                      </Button>
                    )}
                  </Card>
                ))}
              </div>

              {showMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <Card className="w-full max-w-md">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">{editingMember ? 'Edit Member' : 'Add Member'}</h3>
                      <Button variant="icon" onClick={() => setShowMemberModal(false)}><XCircle className="w-5 h-5" /></Button>
                    </div>
                    <form onSubmit={handleMemberSave} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-1 opacity-70">Name</label>
                        <Input required value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1 opacity-70">Plan</label>
                        <select className="w-full h-[52px] px-6 rounded-2xl neu-inset bg-[var(--color-neu-base)] focus:outline-none" value={memberForm.plan} onChange={e => setMemberForm({...memberForm, plan: e.target.value})}>
                          <option>Basic</option>
                          <option>Pro</option>
                          <option>Elite</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1 opacity-70">Status</label>
                        <select className="w-full h-[52px] px-6 rounded-2xl neu-inset bg-[var(--color-neu-base)] focus:outline-none" value={memberForm.status} onChange={e => setMemberForm({...memberForm, status: e.target.value})}>
                          <option>Active</option>
                          <option>Expired</option>
                          <option>Paused</option>
                        </select>
                      </div>
                      <Button variant="primary" className="w-full mt-4 py-4" type="submit">Save</Button>
                    </form>
                  </Card>
                </div>
              )}
            </>
          )}

          {activeTab === 'dues' && (() => {
            const pendingRequests = planRequests.filter(req => req.status === 'pending');
            const pendingAmount = pendingRequests.reduce((sum, req) => {
              const priceNum = parseInt(req.price.replace(/[^0-9]/g, '')) || 0;
              return sum + priceNum;
            }, 0);
            const pendingCount = pendingRequests.length;

            return (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">Dues & Payments</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Pending Dues</div>
                  <div className="text-4xl font-black text-[var(--color-brand-primary)]">₹{pendingAmount.toLocaleString('en-IN')}</div>
                  <div className="text-sm opacity-70 mt-2">Across {pendingCount} member{pendingCount !== 1 ? 's' : ''}</div>
                </Card>
                <Card className="md:col-span-2 flex flex-col justify-center px-8">
                  <h3 className="text-xl font-bold mb-4">Automated Reminders</h3>
                  <p className="opacity-70 mb-6">System currently sends automated SMS and Push Notifications 3 days before expiry, and on the day of expiry.</p>
                  <div className="flex gap-4">
                    <Button variant="primary" onClick={() => setIsPushModalOpen(true)}>Send Manual Push Now</Button>
                    <Button onClick={() => setIsReminderModalOpen(true)}>Configure Reminders</Button>
                  </div>
                </Card>
              </div>

              <h3 className="text-xl font-bold mb-4">Plan Purchase Requests</h3>
              <div className="space-y-4">
                {planRequests.length === 0 ? (
                  <p className="opacity-70">No plan requests found.</p>
                ) : (
                  planRequests.map((req) => (
                    <Card key={req.id} variant="pressed" className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
                      <div className="flex gap-4 items-center">
                        <div className="neu-convex p-3 rounded-xl hidden sm:block">
                          <IndianRupee className="w-5 h-5 text-[var(--color-brand-secondary)]" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{req.user_email}</p>
                          <p className="text-sm opacity-70">{req.plan_name} • {req.price}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col md:items-end gap-2">
                        <p className={`text-sm font-bold uppercase tracking-wider ${req.status === 'approved' ? 'text-green-500' : req.status === 'rejected' ? 'text-red-500' : 'text-yellow-600'}`}>
                          {req.status}
                        </p>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button className="px-3 py-1 bg-green-500 text-white border-green-500 text-sm hover:bg-green-600" onClick={() => updatePlanRequestStatus(req, 'approved')}>Confirm</Button>
                            <Button className="px-3 py-1 bg-red-500 text-white border-red-500 text-sm hover:bg-red-600" onClick={() => updatePlanRequestStatus(req, 'rejected')}>Reject</Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
            );
          })()}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Predictive Equipment Maintenance</h2>
                <p className="text-neutral-500">AI predictions for equipment faults based on user reports and attendance.</p>
              </div>
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">AI Predicted Faults</h3>
                  <Button variant="default" onClick={async () => {
                     // Simulate refresh
                  }}>Refresh Predictions</Button>
                </div>
                <div className="space-y-4">
                  {[
                    { machine: 'Cable Crossover Station', urgency: 'High', reason: 'Multiple reports of frayed cables + high daily usage.' },
                    { machine: 'Treadmill #4', urgency: 'Medium', reason: 'Motor temperature anomalies reported over last 3 days.' },
                    { machine: 'Leg Press', urgency: 'Low', reason: 'Squeaking noise reported, track needs lubrication.' }
                  ].map((pred, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-200">
                      <div>
                        <h4 className="font-bold">{pred.machine}</h4>
                        <p className="text-sm text-neutral-500 max-w-lg mt-1">{pred.reason}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${pred.urgency === 'High' ? 'bg-red-100 text-red-700' : pred.urgency === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {pred.urgency} Urgency
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-lg">Member Issue Reports</h3>
                    <p className="text-sm opacity-60">Reported via Community page</p>
                  </div>
                  <Button variant="default" onClick={fetchComplaints}>Refresh List</Button>
                </div>
                
                {userComplaints.length === 0 ? (
                  <div className="text-center py-8 opacity-60 font-medium">
                    No issues reported by members.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userComplaints.map(complaint => (
                      <div key={complaint.id} className={`p-4 rounded-xl border ${complaint.status === 'Resolved' ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-white border-red-200'}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold">{complaint.equipment}</h4>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {complaint.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-2">{complaint.description}</p>
                            <p className="text-xs opacity-60">Reported by {complaint.user_email} • {new Date(complaint.date).toLocaleString()}</p>
                          </div>
                          {complaint.status !== 'Resolved' && (
                            <Button variant="primary" className="shrink-0 flex items-center gap-2" onClick={() => resolveComplaint(complaint.id)}>
                              <CheckCircle className="w-4 h-4" /> Mark Fixed
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

          )}

          {activeTab === 'trials' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">Trial Requests</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {trialRequests.length === 0 ? (
                  <Card className="text-center py-12">
                    <p className="text-neutral-500 font-bold">No trial requests yet.</p>
                  </Card>
                ) : (
                  trialRequests.map(req => (
                    <Card key={req.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-xl">{req.name}</h3>
                        <div className="text-sm opacity-70 mt-1 flex flex-col sm:flex-row sm:gap-4">
                          <span>{req.phone}</span>
                          <span>{req.email}</span>
                          <span>Requested: {new Date(req.id).toLocaleDateString()}</span>
                        </div>
                        <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {req.status}
                        </span>
                      </div>
                      
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button variant="default" className="text-red-500 hover:text-red-700" onClick={() => updateTrialStatus(req.id, 'rejected')}>
                            <XCircle className="w-5 h-5 mr-2" /> Reject
                          </Button>
                          <Button variant="primary" className="bg-green-600 hover:bg-green-700 border-green-600" onClick={() => updateTrialStatus(req.id, 'approved')}>
                            <CheckCircle className="w-5 h-5 mr-2" /> Approve
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </>
          )}

          
          {activeTab === 'ptrequests' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">Personal Trainer Requests</h2>
              <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-sm font-bold opacity-70 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Member Email</th>
                        <th className="p-4">Trainer</th>
                        <th className="p-4">Time Slot</th>
                        <th className="p-4">Requested On</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {ptBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-stone-500">No PT requests found.</td>
                        </tr>
                      ) : (
                        ptBookings.slice().reverse().map((booking, i) => (
                          <tr key={i} className="hover:bg-stone-50 transition-colors">
                            <td className="p-4">{booking.user_email}</td>
                            <td className="p-4 font-bold text-[var(--color-brand-primary)]">{booking.trainer_name}</td>
                            <td className="p-4">{booking.time_slot}</td>
                            <td className="p-4 text-stone-500">{new Date(booking.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className={"px-3 py-1 rounded-full text-xs font-bold " + (booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="p-4">
                              {booking.status !== 'Confirmed' && (
                                <button 
                                  onClick={() => confirmPTBooking(booking.id)} 
                                  className="px-4 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-neutral-800 transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              
                        <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">Review Management</h2>
                <Button variant="primary" onClick={() => setShowAddReview(true)}>
                  <Plus className="w-5 h-5 mr-2" /> Add Review
                </Button>
              </div>

              {showAddReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddReview(false)} />
                  <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4">Add Review</h3>
                    <form onSubmit={handleAddReview} className="flex flex-col gap-4">
                      <Input placeholder="Name" required value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} />
                      <select className="px-4 py-3 bg-[var(--color-neu-bg)] border-2 border-transparent rounded-xl font-bold text-sm w-full outline-none" value={newReview.gender} onChange={e => setNewReview({...newReview, gender: e.target.value})}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <Input placeholder="Status (e.g., Member, Pro)" value={newReview.status} onChange={e => setNewReview({...newReview, status: e.target.value})} />
                      <Input type="number" min="1" max="5" placeholder="Rating (1-5)" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})} />
                      <textarea required rows={4} placeholder="Review text" className="px-4 py-3 bg-[var(--color-neu-bg)] border-2 border-transparent rounded-xl font-bold text-sm w-full outline-none resize-none" value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})} />
                      <div className="flex gap-2">
                        <Button type="button" variant="default" className="flex-1" onClick={() => setShowAddReview(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" className="flex-1">Save</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {reviews.length === 0 ? (
                  <Card className="text-center py-12">
                    <p className="text-neutral-500 font-bold">No reviews found.</p>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-xl text-black">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{review.name}</h4>
                            <div className="flex gap-2 text-sm text-neutral-500 font-medium mb-1">
                              <span>{review.status || 'Member'}</span> • 
                              <span>{review.gender || 'Not specified'}</span> •
                              <span>{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</span>
                            </div>
                            <div className="flex text-[var(--color-brand-primary)]">
                              {[...Array(review.rating || 5)].map((_, j) => (
                                <Star key={j} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="default" className="text-blue-500 hover:text-blue-700 px-3 py-2 h-auto" onClick={() => editReview(review)}>
                            <Edit2 className="w-5 h-5" />
                          </Button>
                          <Button variant="default" className="text-red-500 hover:text-red-700 px-3 py-2 h-auto" onClick={() => deleteReview(review.id)}>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm font-medium bg-[var(--color-neu-bg)] p-4 rounded-xl">"{review.text}"</p>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}

        </motion.div>
      </main>

      {/* Push Notification Modal */}
            {isPushModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-2xl font-black mb-6">Send Push Notification</h3>
            <form onSubmit={handleSendPush} className="space-y-4">
              <div>
                <label className="block text-sm font-bold opacity-70 mb-2">Target Audience</label>
                <select 
                  className="w-full px-4 py-3 bg-[var(--color-neu-bg)] border border-[var(--color-neu-border)] rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)]"
                  value={pushTarget}
                  onChange={(e) => setPushTarget(e.target.value)}
                >
                  <option value="all">All Members</option>
                  {members.filter(m => m.email).map(member => (
                    <option key={member.id} value={member.email}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold opacity-70 mb-2">Title</label>
                <Input
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="e.g. Action Required: Plan Expiring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold opacity-70 mb-2">Message</label>
                <textarea
                  className="w-full px-4 py-3 bg-[var(--color-neu-bg)] border border-[var(--color-neu-border)] rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)]"
                  rows={4}
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  placeholder="Type your notification message here..."
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="default" className="flex-1" type="button" onClick={() => setIsPushModalOpen(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1" type="submit">Send Now</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isReminderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-2xl font-black mb-6">Automated Reminders Setup</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[var(--color-neu-light)] rounded-xl cursor-pointer">
                <span className="font-bold">Send 3 days before expiry</span>
                <input type="checkbox" className="w-5 h-5 accent-[var(--color-brand-primary)]" checked={reminderSettings.beforeExpiry} onChange={(e) => setReminderSettings({...reminderSettings, beforeExpiry: e.target.checked})} />
              </label>
              <label className="flex items-center justify-between p-4 bg-[var(--color-neu-light)] rounded-xl cursor-pointer">
                <span className="font-bold">Send on expiry day</span>
                <input type="checkbox" className="w-5 h-5 accent-[var(--color-brand-primary)]" checked={reminderSettings.onExpiry} onChange={(e) => setReminderSettings({...reminderSettings, onExpiry: e.target.checked})} />
              </label>
              <label className="flex items-center justify-between p-4 bg-[var(--color-neu-light)] rounded-xl cursor-pointer">
                <span className="font-bold">Automated Overdue Reminders</span>
                <input type="checkbox" className="w-5 h-5 accent-[var(--color-brand-primary)]" checked={reminderSettings.overdueDues} onChange={(e) => setReminderSettings({...reminderSettings, overdueDues: e.target.checked})} />
              </label>
              <div className="flex gap-4 pt-4">
                <Button variant="default" className="flex-1" onClick={() => setIsReminderModalOpen(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={() => {
                  alert("Reminder configuration saved and active!");
                  setIsReminderModalOpen(false);
                }}>Save Configuration</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
