'use client';

import React from 'react';
import { EmergencyVehicle, EmergencyTrip, Junction, TrafficOfficer, CorridorEvent } from '@/types';
import { EmergencyMap } from '@/components/maps/EmergencyMap';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';
import { EventTimeline } from './EventTimeline';
import { TripHistory } from './TripHistory';
import { ShieldAlert, Activity, UserCheck, Clock, Navigation, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { formatEta, formatDistance, getJunctionBadgeColor } from '@/lib/utils';
import { api } from '@/lib/api';

interface ControlRoomDashboardProps {
  vehicle: EmergencyVehicle | null;
  trip: EmergencyTrip | null;
  junctions: Junction[];
  officers: TrafficOfficer[];
  events: CorridorEvent[];
  trips?: EmergencyTrip[];
  onRefresh?: () => void;
}

export const ControlRoomDashboard: React.FC<ControlRoomDashboardProps> = ({
  vehicle,
  trip,
  junctions,
  officers,
  events,
  trips = [],
  onRefresh
}) => {
  const isEmergencyActive = vehicle?.status === 'EMERGENCY_ACTIVE' && trip?.status === 'IN_PROGRESS';
  const isTripCompleted = trip?.status === 'COMPLETED' || vehicle?.status === 'COMPLETED';

  const handleManualAlertJunction = async (junctionId: string) => {
    try {
      await api.alertJunction(junctionId);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Alert failed');
    }
  };

  const handleClearJunction = async (junctionId: string) => {
    try {
      await api.updateJunctionStatus(junctionId, 'CLEARED');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Clear failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Operations Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Emergencies Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Corridor Status</span>
            <div className={`p-2 rounded-lg ${isEmergencyActive ? 'bg-red-100 text-red-600 animate-pulse' : isTripCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold ${isEmergencyActive ? 'text-red-600' : isTripCompleted ? 'text-emerald-600' : 'text-slate-900'}`}>
              {isEmergencyActive ? 'ACTIVE CORRIDOR' : isTripCompleted ? 'TRIP COMPLETED' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* ETA Metric */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Destination ETA</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {isEmergencyActive ? formatEta(trip.eta) : isTripCompleted ? '0 min (Arrived)' : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">{isTripCompleted ? 'Destination Reached' : 'Live Traffic'}</span>
          </div>
        </div>

        {/* Corridor Distance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Distance</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {isEmergencyActive ? formatDistance(trip.distanceRemaining) : isTripCompleted ? '0.0 km' : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">Pune Route</span>
          </div>
        </div>

        {/* Corridor Clearance Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Junction Clearance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {junctions.filter(j => j.status === 'CLEARED' || j.status === 'PASSED').length} / {junctions.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Junctions Ready</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Map & Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Corridor Map (Spans 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-red-600" />
                <span>Live Corridor GPS & Map View</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Route: Swargate → Ruby Hall Clinic
              </span>
            </div>
            <EmergencyMap vehicle={vehicle} trip={trip} junctions={junctions} className="h-[460px]" />
          </div>
        </div>

        {/* Simulation Panel & System Info */}
        <div className="space-y-6">
          <SimulationPanel vehicle={vehicle} trip={trip} />

          {/* Active Emergency Info Card */}
          {vehicle && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Active Vehicle Profile</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Vehicle No:</span>
                  <span className="font-mono font-bold text-slate-900">{vehicle.vehicleNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Vehicle Type:</span>
                  <span className="font-semibold text-slate-900">{vehicle.vehicleType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-semibold text-slate-900">{vehicle.destination}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Current GPS:</span>
                  <span className="font-mono text-slate-700">
                    {vehicle.currentLatitude.toFixed(4)}, {vehicle.currentLongitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Corridor Junction Matrix & Live Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Junction Control Matrix */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Corridor Junction Control Matrix</span>
            <span className="text-xs font-normal text-slate-500">Real-Time Officer Dispatch</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                  <th className="py-3 px-4">Junction Name</th>
                  <th className="py-3 px-4">Area</th>
                  <th className="py-3 px-4">Assigned Officer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {junctions.map((j) => {
                  const officer = officers.find(o => o.assignedJunctionId === j.id);
                  return (
                    <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{j.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{j.area}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {officer ? officer.userName : 'Unassigned'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getJunctionBadgeColor(j.status)}`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {j.status !== 'CLEARED' && j.status !== 'PASSED' && (
                          <button
                            onClick={() => handleClearJunction(j.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors"
                          >
                            FORCE CLEAR
                          </button>
                        )}
                        {j.status === 'PENDING' && (
                          <button
                            onClick={() => handleManualAlertJunction(j.id)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-semibold transition-colors"
                          >
                            ALERT
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-Time Audit Log Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Corridor Audit Trail</span>
          </h3>
          <EventTimeline events={events} />
        </div>
      </div>
      <TripHistory trips={trips} />
    </div>
  );
};
