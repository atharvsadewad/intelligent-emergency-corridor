import { config } from '../config';
import { DEMO_PUNE_ROUTE } from './store';

export interface MapboxRouteResult {
  geometry: Array<[number, number]>; // [longitude, latitude]
  distanceKm: number;
  durationSec: number;
  source: 'MAPBOX_API' | 'DEMO_FALLBACK';
}

/**
 * Calculates distance in KM between two coordinates using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Fetches route geometry and ETA from Mapbox Directions API or returns Pune Demo Route
 */
export async function fetchRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<MapboxRouteResult> {
  const token = config.mapboxToken;

  if (token && !token.includes('demo_token')) {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}?geometries=geojson&overview=full&access_token=${token}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            geometry: route.geometry.coordinates,
            distanceKm: Math.round((route.distance / 1000) * 10) / 10,
            durationSec: Math.round(route.duration),
            source: 'MAPBOX_API'
          };
        }
      }
    } catch (error) {
      console.warn('Mapbox Directions API failed, falling back to demo route:', error);
    }
  }

  // Fallback Demo Route Calculation
  const distanceKm = calculateHaversineDistance(originLat, originLng, destLat, destLng) || 4.2;
  const averageSpeedKmh = 40; // Emergency vehicle speed average
  const durationSec = Math.round((distanceKm / averageSpeedKmh) * 3600);

  return {
    geometry: DEMO_PUNE_ROUTE,
    distanceKm: distanceKm > 0 ? distanceKm : 4.5,
    durationSec: durationSec > 0 ? durationSec : 420,
    source: 'DEMO_FALLBACK'
  };
}
