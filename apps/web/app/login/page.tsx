'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, UserCheck, LayoutDashboard, Settings, Key, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { resetSocket } from '@/lib/socket';

const demoAccounts = [
  { name: 'Emergency Operator', email: 'demo-emergency@example.com', role: 'EMERGENCY_OPERATOR', redirect: '/emergency', icon: ShieldAlert, color: 'bg-red-50 text-red-700 border-red-200' },
  { name: 'Control Room Specialist', email: 'demo-control@example.com', role: 'CONTROL_ROOM', redirect: '/control-room', icon: LayoutDashboard, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Traffic Officer (Seven Loves)', email: 'demo-officer@example.com', role: 'TRAFFIC_OFFICER', redirect: '/officer', icon: UserCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'System Administrator', email: 'demo-admin@example.com', role: 'ADMIN', redirect: '/admin', icon: Settings, color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo-emergency@example.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (targetEmail = email, targetRole?: string, redirect?: string) => {
    setLoading(true); setError('');
    try {
      const res = await api.login(targetEmail, password, targetRole);
      localStorage.setItem('corridor_user', JSON.stringify(res.user));
      localStorage.setItem('corridor_token', res.accessToken || res.token);
      resetSocket();
      const dest = redirect || (res.user.role === 'EMERGENCY_OPERATOR' ? '/emergency' : res.user.role === 'CONTROL_ROOM' ? '/control-room' : res.user.role === 'TRAFFIC_OFFICER' ? '/officer' : '/admin');
      router.push(dest);
    } catch (err: any) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2"><div className="inline-flex p-3 bg-red-600 text-white rounded-2xl shadow-md"><ShieldAlert className="w-8 h-8 animate-pulse" /></div><h1 className="text-2xl font-extrabold text-slate-900">System Portal Login</h1><p className="text-xs text-slate-500">Intelligent Emergency Corridor Management Platform</p></div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div><label className="text-xs font-semibold text-slate-600">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
        <div><label className="text-xs font-semibold text-slate-600">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
        {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
        <button disabled={loading} onClick={() => handleLogin()} className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-bold">{loading ? 'SIGNING IN...' : 'SIGN IN'}</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5"><Key className="w-4 h-4 text-amber-500" /><span>Quick Demo Login Presets</span></h3>
        {demoAccounts.map(acc => { const Icon = acc.icon; return <button key={acc.email} onClick={() => { setEmail(acc.email); setPassword('Password123!'); handleLogin(acc.email, acc.role, acc.redirect); }} disabled={loading} className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between hover:shadow-sm ${acc.color}`}><div className="flex items-center space-x-3"><Icon className="w-5 h-5" /><div><div className="text-xs font-bold">{acc.name}</div><div className="text-[11px] font-mono opacity-80">{acc.email}</div></div></div><ArrowRight className="w-4 h-4 opacity-75" /></button>; })}
      </div>
    </div>
  );
}
