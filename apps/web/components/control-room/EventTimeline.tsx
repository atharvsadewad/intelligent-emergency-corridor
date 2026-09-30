'use client';

import React from 'react';
import { CorridorEvent } from '@/types';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert, Navigation } from 'lucide-react';

interface EventTimelineProps {
  events: CorridorEvent[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No active corridor events logged.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY_ACTIVATED':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'JUNCTION_ALERTED':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'JUNCTION_ACKNOWLEDGED':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'JUNCTION_CLEARED':
      case 'JUNCTION_PASSED':
      case 'TRIP_COMPLETED':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Navigation className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flow-root max-h-[350px] overflow-y-auto pr-2">
      <ul className="-mb-8">
        {events.slice(0, 15).map((event, idx) => (
          <li key={event.id || idx}>
            <div className="relative pb-6">
              {idx !== events.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              )}
              <div className="relative flex space-x-3 items-start">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-xs">
                  {getEventIcon(event.eventType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">
                    {event.eventType.replace(/_/g, ' ')}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {event.metadata?.junctionName || event.metadata?.destination || 'System Dispatch'}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
