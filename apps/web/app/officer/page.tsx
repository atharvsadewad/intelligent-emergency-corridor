'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { OfficerMobileView } from '@/components/officer/OfficerMobileView';
import { TrafficOfficer, Junction, EmergencyVehicle, EmergencyTrip } from '@/types';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';

export default function OfficerPage() {
  const [officers, setOfficers] = useState<TrafficOfficer[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('off_2'); // Default to Seven Loves Chowk Officer Suresh
  const [vehicle, setVehicle] = useState<EmergencyVehicle | null>(null);
  const [trip, setTrip] = useState<EmergencyTrip | null>(null);
  const [junctions, setJunctions] = useState<Junction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getActiveEmergency();
      if (data?.snapshot) {
        setVehicle(data.snapshot.activeVehicle);
        setTrip(data.snapshot.activeTrip);
        setJunctions(data.snapshot.junctions || []);
        if (data.snapshot.officers) setOfficers(data.snapshot.officers);
      }
    } catch (err) {
      console.warn('Officer page fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const socket = getSocket();

    const handleUpdate = (snapshot: any) => {
      if (snapshot) {
        if (snapshot.activeVehicle) setVehicle(snapshot.activeVehicle);
        setTrip(snapshot.activeTrip);
        if (snapshot.junctions) setJunctions(snapshot.junctions);
        if (snapshot.officers) setOfficers(snapshot.officers);
      }
    };

    socket.on('corridor:updated', handleUpdate);
    return () => {
      socket.off('corridor:updated', handleUpdate);
    };
  }, [fetchState]);

  const activeOfficer = officers.find(o => o.id === selectedOfficerId) || {
    id: 'off_2',
    userId: 'usr_officer_sevenloves',
    userName: 'Officer Suresh',
    assignedJunctionId: 'jnc_sevenloves',
    junctionName: 'Seven Loves Chowk',
    availabilityStatus: 'ON_DUTY'
  };

  const assignedJunction = junctions.find(j => j.id === activeOfficer.assignedJunctionId) || junctions[1] || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm font-medium">
        Loading Traffic Officer Field Mobile Interface...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Officer Station Selector Header */}
      <div className="max-w-md mx-auto bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600">Select Active Officer Post:</span>
        <select
          value={selectedOfficerId}
          onChange={(e) => setSelectedOfficerId(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none"
        >
          {officers.map(o => (
            <option key={o.id} value={o.id}>
              {o.userName} ({o.junctionName?.split(' ')[0] || 'Post'})
            </option>
          ))}
        </select>
      </div>

      <OfficerMobileView
        officer={activeOfficer}
        assignedJunction={assignedJunction}
        vehicle={vehicle}
        trip={trip}
        onRefresh={fetchState}
      />
    </div>
  );
}
