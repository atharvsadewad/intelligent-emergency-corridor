'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Activity, Radio, UserCheck, RefreshCw, LayoutDashboard } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { api, clearAuth } from '@/lib/api';
import { resetSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<boolean>(false);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleCorridorUpdate = (data: any) => {
      setActiveEmergency(!!data?.activeTrip && data?.activeTrip?.status === 'IN_PROGRESS');
    };

    if (socket.connected) setIsConnected(true);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('corridor:updated', handleCorridorUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('corridor:updated', handleCorridorUpdate);
    };
  }, []);

  const handleLogout = () => { clearAuth(); resetSocket(); router.replace('/login'); };

  const handleResetSimulation = async () => {
    try {
      const socket = getSocket();
      socket.emit('simulation:reset');
      await api.deactivateEmergency('veh_amb_042');
    } catch (err) {
      console.warn('Reset error:', err);
    }
  };

  const navItems = [
    { name: 'Control Room', path: '/control-room', icon: LayoutDashboard },
    { name: 'Emergency Vehicle', path: '/emergency', icon: ShieldAlert },
    { name: 'Traffic Officer', path: '/officer', icon: UserCheck },
    { name: 'Admin', path: '/admin', icon: Activity },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Title */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="p-2 bg-red-600 rounded-lg text-white shadow-md">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">SmartCorridor</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full border border-red-200">
                  PBL MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Intelligent Emergency Corridor Management System</p>
            </div>
          </Link>

          {/* Role Navigation Bar */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status Controls */}
          <div className="flex items-center space-x-3">
            {/* Live Socket Connection Badge */}
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">{isConnected ? 'SYSTEM LIVE' : 'CONNECTING...'}</span>
            </div>

            {/* Active Emergency Alert Badge */}
            {activeEmergency && (
              <span className="flex items-center space-x-1 px-2.5 py-1 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>EMERGENCY ACTIVE</span>
              </span>
            )}

            <button onClick={handleLogout} className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg">Logout</button>

            {/* Global Reset Button */}
            <button
              onClick={handleResetSimulation}
              title="Reset System & Demo State"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
