import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEta(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 min';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} sec`;
  return `${mins} min ${secs > 0 ? `${secs}s` : ''}`;
}

export function formatDistance(km: number): string {
  if (km === undefined || km === null) return '0 km';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function getJunctionBadgeColor(status: string) {
  switch (status) {
    case 'CLEARED':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'ACKNOWLEDGED':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'ALERTED':
      return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
    case 'PASSED':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'PENDING':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}
