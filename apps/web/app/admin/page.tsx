'use client';

import React, { useEffect, useState } from 'react';
import { EmergencyVehicle, Junction, TrafficOfficer } from '@/types';
import { api } from '@/lib/api';
import { Settings, ShieldAlert, MapPin, UserCheck, Server, Database, Key } from 'lucide-react';

export default function AdminPage() {
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([]);
  const [junctions, setJunctions] = useState<Junction[]>([]);
  const [officers, setOfficers] = useState<TrafficOfficer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [vList, jList, oList] = await Promise.all([
          api.getVehicles().catch(() => []),
          api.getJunctions().catch(() => []),
          api.getOfficers().catch(() => [])
        ]);
        setVehicles(vList);
        setJunctions(jList);
        setOfficers(oList);
      } catch (err) {
        console.warn('Admin load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm font-medium">
        Loading System Management Console...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
        <p className="text-xs text-slate-500">Fleet Roster, Junction Configurations, & System Health</p>
      </div>

      {/* System Infrastructure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Backend API & Socket</div>
            <div className="text-sm font-bold text-slate-900">http://localhost:5001</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Database Connection</div>
            <div className="text-sm font-bold text-slate-900">PostgreSQL / Seed Active</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Map Service</div>
            <div className="text-sm font-bold text-slate-900">Mapbox GL JS + Canvas Fallback</div>
          </div>
        </div>
      </div>

      {/* Registered Vehicles Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>Registered Emergency Vehicles</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase bg-slate-50">
                <th className="py-2.5 px-3">Vehicle Number</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{v.vehicleNumber}</td>
                  <td className="py-3 px-3 text-slate-700 font-semibold">{v.vehicleType}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${v.status === 'EMERGENCY_ACTIVE' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{v.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officer Junction Roster */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-emerald-600" />
          <span>Traffic Officer Duty Roster</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {officers.map((o) => (
            <div key={o.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-sm">{o.userName}</div>
              <div className="text-xs text-slate-500">Post: {o.junctionName}</div>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                {o.availabilityStatus}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
