'use client';

import React, { useState } from 'react';
import { EmergencyVehicle, EmergencyTrip, Junction } from '@/types';
import { ShieldAlert, Navigation, MapPin, Radio, Clock, CheckCircle2 } from 'lucide-react';
import { formatEta, formatDistance, getJunctionBadgeColor } from '@/lib/utils';
import { api } from '@/lib/api';

interface EmergencyVehiclePanelProps {
  vehicle: EmergencyVehicle;
  activeTrip: EmergencyTrip | null;
  junctions: Junction[];
  onRefresh?: () => void;
}

export const EmergencyVehiclePanel: React.FC<EmergencyVehiclePanelProps> = ({
  vehicle,
  activeTrip,
  junctions,
  onRefresh
}) => {
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState(vehicle.destination || 'Ruby Hall Clinic, Pune');

  const isEmergencyActive = vehicle.status === 'EMERGENCY_ACTIVE' && activeTrip?.status === 'IN_PROGRESS';
  const isTripCompleted = activeTrip?.status === 'COMPLETED' || vehicle.status === 'COMPLETED';

  const handleToggleEmergency = async () => {
    setLoading(true);
    try {
      if (isEmergencyActive) {
        await api.deactivateEmergency(vehicle.id);
      } else {
        await api.activateEmergency(vehicle.id, destination);
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Operational Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${isEmergencyActive ? 'bg-red-600 text-white animate-pulse' : isTripCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">{vehicle.vehicleNumber}</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  {vehicle.vehicleType}
                </span>
              </div>
              <p className="text-sm text-slate-500">Operator: Demo Ambulance Operator (MH-12)</p>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleEmergency}
              disabled={loading}
              className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 ${
                isEmergencyActive
                  ? 'bg-slate-800 hover:bg-slate-900 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
              }`}
            >
              <Radio className={`w-5 h-5 ${isEmergencyActive ? 'text-red-400 animate-pulse' : ''}`} />
              <span>{isEmergencyActive ? 'DEACTIVATE EMERGENCY' : 'ACTIVATE EMERGENCY MODE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Corridor Status</div>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${isEmergencyActive ? 'bg-red-600 animate-ping' : isTripCompleted ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
            <span className={`text-lg font-bold ${isEmergencyActive ? 'text-red-600' : isTripCompleted ? 'text-emerald-600' : 'text-slate-700'}`}>
              {isEmergencyActive ? 'EMERGENCY ACTIVE' : isTripCompleted ? 'TRIP COMPLETED' : 'STANDBY / IDLE'}
            </span>
          </div>
        </div>

        {/* ETA Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estimated Arrival (ETA)</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {isEmergencyActive ? formatEta(activeTrip.eta) : isTripCompleted ? '0 min (Arrived)' : '--'}
            </span>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Distance Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Distance Remaining</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {isEmergencyActive ? formatDistance(activeTrip.distanceRemaining) : isTripCompleted ? '0.0 km' : '--'}
            </span>
            <Navigation className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Destination & Live Route Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-red-600" />
          <span>Emergency Destination</span>
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={isEmergencyActive}
            className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-75"
          />
        </div>
      </div>

      {/* Upcoming Junction Corridor List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>Upcoming Corridor Junctions</span>
          <span className="text-xs text-slate-500 font-normal">Real-Time Officer Coordination</span>
        </h3>

        <div className="space-y-3">
          {junctions.map((j, index) => (
            <div key={j.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{j.name}</h4>
                  <p className="text-xs text-slate-500">Area: {j.area}</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getJunctionBadgeColor(j.status)}`}>
                {j.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
