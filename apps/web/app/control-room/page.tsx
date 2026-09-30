'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ControlRoomDashboard } from '@/components/control-room/ControlRoomDashboard';
import { EmergencyVehicle, EmergencyTrip, Junction, TrafficOfficer, CorridorEvent } from '@/types';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';

export default function ControlRoomPage() {
  const [vehicle, setVehicle] = useState<EmergencyVehicle | null>(null);
  const [trip, setTrip] = useState<EmergencyTrip | null>(null);
  const [junctions, setJunctions] = useState<Junction[]>([]);
  const [officers, setOfficers] = useState<TrafficOfficer[]>([]);
  const [events, setEvents] = useState<CorridorEvent[]>([]);
  const [trips, setTrips] = useState<EmergencyTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getActiveEmergency();
      if (data?.snapshot) {
        setVehicle(data.snapshot.activeVehicle);
        setTrip(data.snapshot.activeTrip);
        setJunctions(data.snapshot.junctions || []);
        setOfficers(data.snapshot.officers || []);
        setEvents(data.snapshot.events || []);
        setTrips(await api.getTrips().catch(() => []));
      }
    } catch (err) {
      console.warn('Control Room fetch error:', err);
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
        if (snapshot.events) setEvents(snapshot.events);
        api.getTrips().then(setTrips).catch(() => undefined);
      }
    };

    socket.on('corridor:updated', handleUpdate);
    return () => {
      socket.off('corridor:updated', handleUpdate);
    };
  }, [fetchState]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm font-medium">
        Connecting to Control Room Operations Center...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Control Room Command Center</h1>
          <p className="text-xs text-slate-500">Real-Time Intelligent Emergency Corridor Oversight</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-700 uppercase">Live Socket Sync</span>
        </div>
      </div>

      <ControlRoomDashboard
        vehicle={vehicle}
        trip={trip}
        junctions={junctions}
        officers={officers}
        events={events}
        trips={trips}
        onRefresh={fetchState}
      />
    </div>
  );
}
