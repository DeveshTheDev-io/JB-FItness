import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Activity, Users, IndianRupee, TrendingUp, Bell, Search, Settings, ArrowUpRight, ArrowDownRight, ClipboardList, CheckCircle, XCircle, Database } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [trialRequests, setTrialRequests] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [memberForm, setMemberForm] = useState({ name: '', plan: 'Basic', status: 'Active' });
  const [searchMember, setSearchMember] = useState('');

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
    
    fetchRequests();
    fetchMembers();
    fetchAttendance();
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
            <p className="text-sm opacity-70">Admin Console</p>
          </div>
        </div>

        <nav className="flex md:flex-col gap-4 overflow-x-auto pb-4 md:pb-0">
          {[
            { id: 'overview', icon: TrendingUp, label: 'Analytics & Trends' },
            { id: 'ai-insights', icon: Search, label: 'AI Business Insights' },
            { id: 'members', icon: Users, label: 'Member CRM' },
            { id: 'dues', icon: IndianRupee, label: 'Dues & Payments' },
            { id: 'trials', icon: ClipboardList, label: 'Trial Requests' },
            { id: 'logout', icon: XCircle, label: 'Log Out' },
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

        <div className="mt-auto hidden md:flex flex-col gap-4">
           <div className="flex items-center gap-4">
             <Button variant="icon"><Bell className="w-5 h-5" /></Button>
             <Button variant="icon"><Settings className="w-5 h-5" /></Button>
           </div>
           <Button variant="default" className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
             localStorage.removeItem('currentUser');
             navigate('/');
           }}>
             Log Out
           </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
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

              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--color-neu-dark)]/20">
                        <th className="p-4 font-bold opacity-70">Name</th>
                        <th className="p-4 font-bold opacity-70">Plan</th>
                        <th className="p-4 font-bold opacity-70">Status</th>
                        <th className="p-4 font-bold opacity-70">Churn Risk (AI)</th>
                        <th className="p-4 font-bold opacity-70">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {membersWithChurnRisk.filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase())).map((member) => (
                        <tr key={member.id} className="border-b border-[var(--color-neu-dark)]/10 last:border-0 hover:bg-[var(--color-neu-light)]/30 transition-colors">
                          <td className="p-4 font-bold">{member.name}</td>
                          <td className="p-4"><span className="neu-pressed px-3 py-1 rounded-full text-sm font-medium">{member.plan}</span></td>
                          <td className="p-4">
                            <span className={`flex items-center gap-2 text-sm font-bold ${member.status === 'Active' ? 'text-green-500' : 'text-[var(--color-brand-primary)]'}`}>
                              <div className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-[var(--color-brand-primary)]'}`}></div>
                              {member.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${member.churnRisk === 'High' ? 'bg-red-100 text-red-700' : member.churnRisk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                              {member.churnRisk}
                            </span>
                            {member.churnRisk === 'High' && (
                              <button onClick={() => alert(`Sent automated 'We miss you' offer to ${member.name}!`)} className="ml-2 text-xs underline text-red-700 hover:text-red-800">
                                Send Offer
                              </button>
                            )}
                          </td>
                          <td className="p-4 flex gap-2">
                            <Button className="px-3 py-1 text-sm bg-green-500 text-white border-green-500 hover:bg-green-600" onClick={() => markAttendance(member.id)}>Mark Present</Button>
                            <Button className="px-3 py-1 text-sm" onClick={() => {
                              setEditingMember(member);
                              setMemberForm({ name: member.name, plan: member.plan, status: member.status });
                              setShowMemberModal(true);
                            }}>Edit</Button>
                            <Button variant="primary" className="px-3 py-1 text-sm" onClick={() => handleUpgradeMember(member.id)}>Upgrade</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

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
                        </select>
                      </div>
                      <Button variant="primary" className="w-full mt-4 py-4" type="submit">Save</Button>
                    </form>
                  </Card>
                </div>
              )}
            </>
          )}

          {activeTab === 'dues' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">Dues & Payments</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Pending Dues</div>
                  <div className="text-4xl font-black text-[var(--color-brand-primary)]">₹32,500</div>
                  <div className="text-sm opacity-70 mt-2">Across 24 members</div>
                </Card>
                <Card className="md:col-span-2 flex flex-col justify-center px-8">
                  <h3 className="text-xl font-bold mb-4">Automated Reminders</h3>
                  <p className="opacity-70 mb-6">System currently sends automated SMS and Push Notifications 3 days before expiry, and on the day of expiry.</p>
                  <div className="flex gap-4">
                    <Button variant="primary">Send Manual Push Now</Button>
                    <Button>Configure Reminders</Button>
                  </div>
                </Card>
              </div>

              <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {[
                  { name: 'Vikas Patel', type: 'Pro Renewal', amount: '₹2,499', date: 'Today, 9:00 AM', status: 'Success' },
                  { name: 'Anjali Desai', type: 'Elite Plan', amount: '₹4,999', date: 'Yesterday', status: 'Success' },
                  { name: 'Karan Singh', type: 'Basic Plan', amount: '₹1,499', date: 'Jul 21, 2026', status: 'Failed' },
                ].map((tx, i) => (
                  <Card key={i} variant="pressed" className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="neu-convex p-3 rounded-xl hidden sm:block">
                        <IndianRupee className="w-5 h-5 text-[var(--color-brand-secondary)]" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{tx.name}</p>
                        <p className="text-sm opacity-70">{tx.type} • {tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl">{tx.amount}</p>
                      <p className={`text-sm font-bold ${tx.status === 'Success' ? 'text-green-500' : 'text-[var(--color-brand-primary)]'}`}>{tx.status}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

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

        </motion.div>
      </main>
    </div>
  );
}
