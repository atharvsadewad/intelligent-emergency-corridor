'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EmergencyVehicle, EmergencyTrip } from '@/types';
import { Play, Pause, RotateCcw, FastForward, SkipForward, Cpu, CheckCircle2 } from 'lucide-react';
import { getSocket } from '@/lib/socket';

// Demo Pune route coordinates [lng, lat]
const SIMULATION_ROUTE_COORDS: Array<[number, number]> = [
  [73.8636, 18.5018], // Swargate (Start)
  [73.8655, 18.5045],
  [73.8688, 18.5085], // Seven Loves Chowk
  [73.8710, 18.5150],
  [73.8732, 18.5220],
  [73.8741, 18.5284], // Pune Station Chowk
  [73.8765, 18.5320],
  [73.8785, 18.5360], // Bund Garden Road Junction
  [73.8805, 18.5380],
  [73.8820, 18.5395]  // Ruby Hall Clinic (Destination)
];

interface SimulationPanelProps {
  vehicle: EmergencyVehicle | null;
  trip: EmergencyTrip | null;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ vehicle, trip }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const vehicleId = vehicle?.id || 'veh_amb_042';
  const isTripCompleted = trip?.status === 'COMPLETED' || vehicle?.status === 'COMPLETED';

  // Advance simulation by 1 step via Socket.IO real-time event
  const stepSimulation = (idx: number) => {
    if (idx >= SIMULATION_ROUTE_COORDS.length) {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const [lng, lat] = SIMULATION_ROUTE_COORDS[idx];
    const speed = 40 * speedMultiplier;

    try {
      const socket = getSocket();
      socket.emit('vehicle:location_updated', {
        vehicleId,
        latitude: lat,
        longitude: lng,
        speed
      });
    } catch (err) {
      console.warn('Simulation location update socket error:', err);
    }
  };

  const handleStart = () => {
    if (vehicle?.status !== 'EMERGENCY_ACTIVE') {
      try {
        const socket = getSocket();
        socket.emit('vehicle:location_updated', {
          vehicleId,
          latitude: SIMULATION_ROUTE_COORDS[0][1],
          longitude: SIMULATION_ROUTE_COORDS[0][0],
          speed: 40
        });
      } catch (e) {}
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleNextStep = () => {
    const nextIdx = Math.min(currentIndex + 1, SIMULATION_ROUTE_COORDS.length - 1);
    setCurrentIndex(nextIdx);
    stepSimulation(nextIdx);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentIndex(0);
    try {
      const socket = getSocket();
      socket.emit('simulation:reset');
    } catch (e) {}
  };

  useEffect(() => {
    if (isRunning) {
      const intervalMs = Math.max(1200 / speedMultiplier, 300);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= SIMULATION_ROUTE_COORDS.length) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            stepSimulation(SIMULATION_ROUTE_COORDS.length - 1);
            return SIMULATION_ROUTE_COORDS.length - 1;
          }
          stepSimulation(next);
          return next;
        });
      }, intervalMs);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, speedMultiplier, vehicleId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-slate-900 text-sm">GPS Corridor Simulation Engine</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
          Step {currentIndex + 1} / {SIMULATION_ROUTE_COORDS.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${isTripCompleted ? 'bg-emerald-600' : 'bg-red-600'}`}
          style={{ width: `${((currentIndex + 1) / SIMULATION_ROUTE_COORDS.length) * 100}%` }}
        />
      </div>

      {isTripCompleted && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Vehicle arrived at destination. Trip Completed!</span>
        </div>
      )}

      {/* Primary Control Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {isRunning ? (
          <button
            onClick={handlePause}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
          >
            <Pause className="w-4 h-4" />
            <span>PAUSE</span>
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isTripCompleted}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-colors shadow-xs"
          >
            <Play className="w-4 h-4" />
            <span>START</span>
          </button>
        )}

        <button
          onClick={handleNextStep}
          disabled={isTripCompleted}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          <span>NEXT STEP</span>
        </button>

        <button
          onClick={handleReset}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 border border-slate-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESET</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg p-1 justify-center">
          <FastForward className="w-3.5 h-3.5 text-slate-400" />
          {[1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeedMultiplier(s)}
              className={`px-1.5 py-0.5 text-[11px] font-bold rounded ${
                speedMultiplier === s ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
