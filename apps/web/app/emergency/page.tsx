'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { EmergencyVehiclePanel } from '@/components/emergency/EmergencyVehiclePanel';
import { EmergencyVehicle, EmergencyTrip, Junction } from '@/types';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';

export default function EmergencyPage() {
  const [vehicle, setVehicle] = useState<EmergencyVehicle | null>(null);
  const [activeTrip, setActiveTrip] = useState<EmergencyTrip | null>(null);
  const [junctions, setJunctions] = useState<Junction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getActiveEmergency();
      if (data?.snapshot) {
        setVehicle(data.snapshot.activeVehicle);
        setActiveTrip(data.snapshot.activeTrip);
        setJunctions(data.snapshot.junctions || []);
      }
    } catch (err) {
      console.warn('Error fetching emergency state:', err);
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
        setActiveTrip(snapshot.activeTrip);
        if (snapshot.junctions) setJunctions(snapshot.junctions);
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
        Loading Emergency Vehicle Operator Interface...
      </div>
    );
  }

  const defaultVehicle: EmergencyVehicle = vehicle || {
    id: 'veh_amb_042',
    vehicleNumber: 'MH-12-AMB-042',
    vehicleType: 'AMBULANCE',
    operatorId: 'usr_operator_1',
    status: 'IDLE',
    currentLatitude: 18.5018,
    currentLongitude: 73.8636,
    destination: 'Ruby Hall Clinic, Pune'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Emergency Vehicle Interface</h1>
        <p className="text-xs text-slate-500">Authorized Operator Dispatch & Location Controls</p>
      </div>

      <EmergencyVehiclePanel
        vehicle={defaultVehicle}
        activeTrip={activeTrip}
        junctions={junctions}
        onRefresh={fetchState}
      />
    </div>
  );
}
