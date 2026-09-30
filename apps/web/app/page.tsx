'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, LayoutDashboard, UserCheck, Settings, PlayCircle, ArrowRight, Activity, MapPin } from 'lucide-react';

export default function HomePage() {
  const roles = [
    {
      title: 'Control Room Operations',
      role: 'CONTROL_ROOM',
      path: '/control-room',
      icon: LayoutDashboard,
      color: 'border-l-4 border-l-blue-600',
      description: 'Central command dashboard showcasing live map, active corridor, ETA monitoring, officer roster, and audit event logs.'
    },
    {
      title: 'Emergency Vehicle Interface',
      role: 'EMERGENCY_OPERATOR',
      path: '/emergency',
      icon: ShieldAlert,
      color: 'border-l-4 border-l-red-600',
      description: 'Ambulance / Fire Brigade mode activation, destination input, real-time GPS broadcast, and route status.'
    },
    {
      title: 'Traffic Officer Interface',
      role: 'TRAFFIC_OFFICER',
      path: '/officer',
      icon: UserCheck,
      color: 'border-l-4 border-l-emerald-600',
      description: 'Mobile-first field screen for junction officers to receive approaching alerts, acknowledge, and mark green corridor cleared.'
    },
    {
      title: 'System Administrator',
      role: 'ADMIN',
      path: '/admin',
      icon: Settings,
      color: 'border-l-4 border-l-purple-600',
      description: 'Manage emergency vehicles, junction assignments, officer availability, and system configurations.'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-8 shadow-xl border border-slate-700">
        <div className="flex items-center space-x-3 text-red-500 mb-3">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
          <span className="font-extrabold tracking-wider text-sm uppercase">College PBL Prototype</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Intelligent Emergency Corridor Management System
        </h1>
        <p className="mt-3 text-slate-300 text-sm max-w-3xl leading-relaxed">
          Real-time GPS coordination platform linking Emergency Vehicles (Ambulance, Fire Brigade, Police, NDRF), Control Room Command, and Traffic Officers at upcoming junctions. Features real-time Socket.IO synchronization, Mapbox route integration, and simulated GPS route playback for demonstration.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/control-room"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Launch Control Room Showcase</span>
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-slate-700 transition-all"
          >
            Role Login Screen
          </Link>
        </div>
      </div>

      {/* Demo Scenario Route Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Demo Scenario: Pune Emergency Corridor</h3>
              <p className="text-xs text-slate-500">Swargate Bus Station → Seven Loves Chowk → Station Chowk → Bund Garden → Ruby Hall Clinic</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
            5 Demo Junctions Ready
          </span>
        </div>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.path} className={`bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${r.color}`}>
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2.5 bg-slate-100 rounded-lg text-slate-800">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{r.title}</h3>
                    <span className="text-[11px] font-mono font-semibold text-slate-400">{r.role}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {r.description}
                </p>
              </div>

              <Link
                href={r.path}
                className="inline-flex items-center space-x-2 text-xs font-bold text-red-600 hover:text-red-700 pt-2 border-t border-slate-100 group"
              >
                <span>Enter Module</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
