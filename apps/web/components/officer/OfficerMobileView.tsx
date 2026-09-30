'use client';

import React, { useState } from 'react';
import { TrafficOfficer, Junction, EmergencyVehicle, EmergencyTrip } from '@/types';
import { AlertTriangle, CheckCircle2, ShieldAlert, Navigation, Clock, UserCheck, PhoneCall, Volume2 } from 'lucide-react';
import { formatEta, formatDistance, getJunctionBadgeColor } from '@/lib/utils';
import { api } from '@/lib/api';

interface OfficerMobileViewProps {
  officer: TrafficOfficer;
  assignedJunction: Junction | null;
  vehicle: EmergencyVehicle | null;
  trip: EmergencyTrip | null;
  onRefresh?: () => void;
}

export const OfficerMobileView: React.FC<OfficerMobileViewProps> = ({
  officer,
  assignedJunction,
  vehicle,
  trip,
  onRefresh
}) => {
  const [loading, setLoading] = useState(false);

  const isEmergencyActive = vehicle?.status === 'EMERGENCY_ACTIVE' && trip?.status === 'IN_PROGRESS';
  const isTargetedAlert = assignedJunction?.status === 'ALERTED' || assignedJunction?.status === 'ACKNOWLEDGED';

  const handleAcknowledge = async () => {
    if (!assignedJunction) return;
    setLoading(true);
    try {
      await api.updateJunctionStatus(assignedJunction.id, 'ACKNOWLEDGED', officer.id);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClearJunction = async () => {
    if (!assignedJunction) return;
    setLoading(true);
    try {
      await api.updateJunctionStatus(assignedJunction.id, 'CLEARED', officer.id);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Officer Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
              <UserCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-base">{officer.userName || 'Traffic Officer'}</h2>
              <p className="text-xs text-slate-400">Junction: {assignedJunction?.name || 'Assigned Post'}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
            ON DUTY
          </span>
        </div>
      </div>

      {/* Emergency Approaching Alert Banner */}
      {isEmergencyActive ? (
        <div className={`rounded-2xl p-5 border-2 transition-all shadow-md ${
          assignedJunction?.status === 'CLEARED'
            ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
            : isTargetedAlert
            ? 'bg-red-50 border-red-500 text-red-950 animate-pulse'
            : 'bg-amber-50 border-amber-400 text-amber-950'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className={`w-6 h-6 ${assignedJunction?.status === 'CLEARED' ? 'text-emerald-600' : 'text-red-600 animate-bounce'}`} />
              <span className="font-extrabold tracking-wide text-sm">
                {assignedJunction?.status === 'CLEARED' ? 'CORRIDOR CLEARED' : 'EMERGENCY VEHICLE APPROACHING'}
              </span>
            </div>
            <Volume2 className="w-5 h-5 text-red-500 animate-pulse" />
          </div>

          <div className="bg-white/90 rounded-xl p-4 border border-slate-200/80 space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Vehicle:</span>
              <span className="font-mono font-bold text-slate-900 text-base">{vehicle?.vehicleNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Emergency Type:</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-800 rounded-full">{vehicle?.vehicleType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">ETA to Your Post:</span>
              <span className="font-extrabold text-slate-900 text-sm">{formatEta(trip?.eta || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Distance Remaining:</span>
              <span className="font-bold text-slate-800 text-xs">{formatDistance(trip?.distanceRemaining || 0)}</span>
            </div>
          </div>

          {/* Officer Action Buttons */}
          <div className="space-y-2.5">
            {assignedJunction?.status === 'ALERTED' && (
              <button
                onClick={handleAcknowledge}
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>ACKNOWLEDGE ALERT</span>
              </button>
            )}

            {assignedJunction?.status !== 'CLEARED' && assignedJunction?.status !== 'PASSED' && (
              <button
                onClick={handleClearJunction}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-200 transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>MARK JUNCTION CLEAR</span>
              </button>
            )}

            {assignedJunction?.status === 'CLEARED' && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 font-bold text-center text-xs flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Green Corridor Cleared & Ready</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Junction Normal</h3>
          <p className="text-xs text-slate-500">No active emergency vehicle dispatched on this route currently.</p>
        </div>
      )}

      {/* Junction Details Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Assigned Post</h3>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{assignedJunction?.name || 'Swargate Junction'}</h4>
            <p className="text-xs text-slate-500">{assignedJunction?.area || 'Pune Central'}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getJunctionBadgeColor(assignedJunction?.status || 'IDLE')}`}>
            {assignedJunction?.status || 'IDLE'}
          </span>
        </div>
      </div>
    </div>
  );
};
