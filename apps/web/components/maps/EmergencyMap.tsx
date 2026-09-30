'use client';

import React, { useRef, useEffect } from 'react';
import { EmergencyVehicle, Junction, EmergencyTrip } from '@/types';
import { ShieldAlert, MapPin, Navigation, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { formatEta, formatDistance } from '@/lib/utils';

interface EmergencyMapProps {
  vehicle?: EmergencyVehicle | null;
  trip?: EmergencyTrip | null;
  junctions?: Junction[];
  className?: string;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  vehicle,
  trip,
  junctions = [],
  className = 'h-[500px]'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bounds for Pune corridor (Swargate to Ruby Hall)
  // Lat range: ~18.498 to 18.545, Lng range: ~73.855 to 73.890
  const MIN_LAT = 18.4980;
  const MAX_LAT = 18.5450;
  const MIN_LNG = 73.8550;
  const MAX_LNG = 73.8900;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Projection helpers
    const toCanvasX = (lng: number) => {
      const padding = 50;
      return padding + ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * (width - padding * 2);
    };

    const toCanvasY = (lat: number) => {
      const padding = 50;
      // Invert Y for canvas lat coordinates
      return height - (padding + ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * (height - padding * 2));
    };

    // 1. Draw Grid Background
    ctx.fillStyle = '#f8fafc'; // Slate-50 background
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Route Geometry Line
    const geometry = trip?.routeGeometry || [
      [73.8636, 18.5018],
      [73.8688, 18.5085],
      [73.8741, 18.5284],
      [73.8785, 18.5360],
      [73.8820, 18.5395]
    ];

    if (geometry.length > 1) {
      // Background glow for active corridor
      ctx.strokeStyle = vehicle?.status === 'EMERGENCY_ACTIVE' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      geometry.forEach(([lng, lat], i) => {
        const x = toCanvasX(lng);
        const y = toCanvasY(lat);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Main route line
      ctx.strokeStyle = vehicle?.status === 'EMERGENCY_ACTIVE' ? '#dc2626' : '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      geometry.forEach(([lng, lat], i) => {
        const x = toCanvasX(lng);
        const y = toCanvasY(lat);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 3. Draw Junctions
    junctions.forEach((j) => {
      const x = toCanvasX(j.longitude);
      const y = toCanvasY(j.latitude);

      let color = '#94a3b8'; // IDLE / PENDING
      if (j.status === 'ALERTED') color = '#f59e0b';
      if (j.status === 'ACKNOWLEDGED') color = '#2563eb';
      if (j.status === 'CLEARED') color = '#16a34a';
      if (j.status === 'PASSED') color = '#64748b';

      // Junction circle halo
      ctx.fillStyle = `${color}33`;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      // Main Junction point
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label text
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(j.name.split(' ')[0], x + 16, y + 4);
    });

    // 4. Draw Destination Pin (Ruby Hall)
    const destLng = trip?.destinationLng || 73.8820;
    const destLat = trip?.destinationLat || 18.5395;
    const destX = toCanvasX(destLng);
    const destY = toCanvasY(destLat);

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(destX, destY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#15803d';
    ctx.fillText('🏥 Destination: Ruby Hall', destX + 14, destY + 4);

    // 5. Draw Emergency Vehicle Marker
    if (vehicle) {
      const vx = toCanvasX(vehicle.currentLongitude);
      const vy = toCanvasY(vehicle.currentLatitude);

      // Pulse animation halo
      ctx.fillStyle = vehicle.status === 'EMERGENCY_ACTIVE' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(71, 85, 105, 0.3)';
      ctx.beginPath();
      ctx.arc(vx, vy, 20, 0, Math.PI * 2);
      ctx.fill();

      // Vehicle inner icon circle
      ctx.fillStyle = vehicle.status === 'EMERGENCY_ACTIVE' ? '#dc2626' : '#334155';
      ctx.beginPath();
      ctx.arc(vx, vy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Vehicle Label Callout
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.fillText(`🚑 ${vehicle.vehicleNumber}`, vx - 35, vy - 24);
    }
  }, [vehicle, trip, junctions]);

  return (
    <div className={`relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Map Overlay Stats Pill */}
      {trip && vehicle?.status === 'EMERGENCY_ACTIVE' && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur border border-slate-200 rounded-lg p-3 shadow-md flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-red-600 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <span>CORRIDOR ACTIVE</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <div className="flex items-center space-x-1 text-slate-700 text-xs font-semibold">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>ETA: {formatEta(trip.eta)}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <div className="flex items-center space-x-1 text-slate-700 text-xs font-semibold">
            <Navigation className="w-4 h-4 text-slate-400" />
            <span>Distance: {formatDistance(trip.distanceRemaining)}</span>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-xs flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span className="text-slate-600">Ambulance</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-600">Alerted</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="text-slate-600">Acknowledged</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-slate-600">Cleared</span>
        </div>
      </div>
    </div>
  );
};
