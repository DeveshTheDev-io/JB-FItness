import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'signin';
  
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role === 'admin') navigate('/admin');
        else navigate('/member');
      } catch(e) {}
    }
    setMode(initialMode);
  }, [initialMode, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      if ((username === 'admin' || username === '12345') && password === 'admin123') {
        localStorage.setItem('currentUser', JSON.stringify({ role: 'admin', username }));
        navigate('/admin');
            } else if (username && password) {
        if (supabase) {
          let query = supabase.from('members').select('*');
          if (username.includes('@')) {
            query = query.eq('email', username);
          } else {
            query = query.or(`name.eq.${username},email.eq.${username}`);
          }
          const { data: memberDataList } = await query.limit(1);
          const memberData = memberDataList?.[0] || null;
            
          if (memberData) {
            localStorage.setItem('currentUser', JSON.stringify({ role: 'member', username: memberData.name, email: memberData.email, gender: memberData.gender }));
            navigate('/member');
            return;
          }
        }
        // Fallback for mock login if DB fails or user not found but we still want to allow login for testing
        localStorage.setItem('currentUser', JSON.stringify({ role: 'member', username, email: username.includes('@') ? username : `${username}@example.com` }));
        navigate('/member');

      } else {
        setError('Please enter username and password');
      }
    } else {
      if (username && password && email) {
        if (supabase) {
          const { error: dbError } = await supabase
            .from('members')
            .insert([{ name: username, email: email, plan: 'Basic', status: 'Active', gender: gender }]);
          if (dbError) {
            console.error('Failed to create member', dbError);
            setError(dbError.message || 'Failed to create member account');
            return;
          }
        }
        localStorage.setItem('currentUser', JSON.stringify({ role: 'member', username, email, gender }));
        navigate('/member');
      } else {
        setError('Please fill in all fields to sign up');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-neu-base)] flex flex-col items-center justify-center p-6 relative">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center text-neutral-600 hover:text-black"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="neu-convex p-4 rounded-3xl mb-4">
            <Dumbbell className="text-[var(--color-brand-primary)] w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-[var(--color-brand-secondary)] text-center">
            JAI BALAJI <span className="text-[var(--color-brand-primary)]">ELITE FITNESS</span>
          </h1>
          <p className="opacity-70 mt-2 font-medium">{mode === 'signin' ? 'Secure Portal Access' : 'Create an Account'}</p>
        </div>

        <Card variant="flat" className="p-8">
          <div className="flex justify-between border-b border-neutral-200 mb-6 pb-2">
            <button 
              className={`flex-1 text-center font-bold pb-2 ${mode === 'signin' ? 'text-black border-b-2 border-black' : 'text-neutral-400'}`}
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 text-center font-bold pb-2 ${mode === 'signup' ? 'text-black border-b-2 border-black' : 'text-neutral-400'}`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                <label className="block text-sm font-bold mb-2 ml-2 opacity-70 uppercase tracking-widest">Email Address</label>
                <Input 
                  icon={<User className="w-5 h-5" />} 
                  placeholder="Enter email address" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </motion.div>
            )}
            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                <label className="block text-sm font-bold mb-2 ml-2 opacity-70 uppercase tracking-widest">Gender</label>
                <div className="flex gap-4">
                  <Button type="button" variant={gender === 'Male' ? 'primary' : 'default'} onClick={() => setGender('Male')} className="flex-1 py-3">Male</Button>
                  <Button type="button" variant={gender === 'Female' ? 'primary' : 'default'} onClick={() => setGender('Female')} className="flex-1 py-3">Female</Button>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2 ml-2 opacity-70 uppercase tracking-widest">{mode === 'signup' ? 'Username' : 'Username / Email'}</label>
              <Input 
                icon={<User className="w-5 h-5" />} 
                placeholder={mode === 'signup' ? 'Choose a username' : 'Enter username or email'} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2 ml-2 opacity-70 uppercase tracking-widest">Password</label>
              <Input 
                icon={<Lock className="w-5 h-5" />} 
                type="password"
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm font-bold ml-2">{error}</p>}

            <Button type="submit" variant="primary" className="w-full py-4 text-lg mt-4">
              {mode === 'signin' ? 'Login to Portal' : 'Create Account'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
