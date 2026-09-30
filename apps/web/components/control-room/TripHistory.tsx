'use client';
import React from 'react';
import { EmergencyTrip } from '@/types';
import { Clock3, MapPin, Route } from 'lucide-react';
import { formatEta, formatDistance } from '@/lib/utils';

export function TripHistory({ trips }: { trips: EmergencyTrip[] }) {
  return <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4"><div><h3 className="font-bold text-slate-900">Emergency Trip History</h3><p className="text-xs text-slate-500">Persistent corridor records</p></div><Route className="w-5 h-5 text-slate-400" /></div>
    {trips.length === 0 ? <div className="py-8 text-center text-sm text-slate-500">No trips recorded yet.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500"><th className="py-2 pr-4">Trip</th><th className="py-2 pr-4">Vehicle</th><th className="py-2 pr-4">Destination</th><th className="py-2 pr-4">Started</th><th className="py-2 pr-4">Duration</th><th className="py-2">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{trips.slice(0,10).map(t => { const duration = t.endedAt ? Math.max(0, Math.round((new Date(t.endedAt).getTime()-new Date(t.startedAt).getTime())/1000)) : t.eta; return <tr key={t.id}><td className="py-3 pr-4 font-mono text-xs text-slate-600">{t.id.slice(-12)}</td><td className="py-3 pr-4 font-semibold">{t.vehicleNumber || t.vehicleId}</td><td className="py-3 pr-4 text-slate-600">{t.destination}</td><td className="py-3 pr-4 text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{new Date(t.startedAt).toLocaleString()}</span></td><td className="py-3 pr-4 text-slate-600">{formatEta(duration)}</td><td className="py-3"><span className={`px-2 py-1 rounded-full text-[11px] font-bold ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : t.status === 'CANCELLED' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>{t.status}</span></td></tr>})}</tbody></table></div>}
  </section>;
}
