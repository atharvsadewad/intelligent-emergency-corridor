import { persistence } from './persistence';
import { fetchRoute, calculateHaversineDistance } from './mapbox';
import { EmergencyTrip, Junction, EventType } from '../types';

export class CorridorService {
  public async activateEmergency(vehicleId: string, destination = 'Ruby Hall Clinic, Pune', destLat = 18.5395, destLng = 73.8820) {
    const vehicle = await persistence.getVehicleById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');

    const existing = await persistence.getActiveTrip();
    if (existing && existing.vehicleId === vehicleId) return { trip: existing, vehicle, junctions: await persistence.getJunctions(), events: await persistence.getEvents() };
    if (existing) throw new Error('Another emergency trip is already active');

    const route = await fetchRoute(vehicle.currentLatitude, vehicle.currentLongitude, destLat, destLng);
    const trip: EmergencyTrip = {
      id: `trip_${Date.now()}`,
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      destination,
      destinationLat: destLat,
      destinationLng: destLng,
      routeGeometry: route.geometry,
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      eta: route.durationSec,
      distanceRemaining: route.distanceKm
    };

    await persistence.updateVehicle(vehicle.id, { status: 'EMERGENCY_ACTIVE', destination });
    await persistence.createTrip(trip);

    const junctions = await persistence.getJunctions();
    await Promise.all(junctions.map((j, index) => persistence.updateJunctionStatus(j.id, index < 2 ? 'ALERTED' : 'PENDING')));

    await persistence.addEvent({ tripId: trip.id, eventType: 'EMERGENCY_ACTIVATED', metadata: { vehicleNumber: vehicle.vehicleNumber, destination, eta: route.durationSec, distanceKm: route.distanceKm, routeSource: route.source } });

    return { trip, vehicle: await persistence.getVehicleById(vehicleId), junctions: await persistence.getJunctions(), events: await persistence.getEvents() };
  }

  public async deactivateEmergency(vehicleId: string) {
    const vehicle = await persistence.getVehicleById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');
    const activeTrip = await persistence.getActiveTrip();
    if (activeTrip && activeTrip.vehicleId === vehicleId) {
      await persistence.updateTrip(activeTrip.id, { status: 'CANCELLED', endedAt: new Date().toISOString() });
      await persistence.addEvent({ tripId: activeTrip.id, eventType: 'TRIP_COMPLETED', metadata: { cancelled: true } });
    }
    await persistence.updateVehicle(vehicleId, { status: 'IDLE' });
    const junctions = await persistence.getJunctions();
    await Promise.all(junctions.map(j => persistence.updateJunctionStatus(j.id, 'IDLE')));
    return persistence.getSnapshot();
  }

  public async updateLocation(vehicleId: string, latitude: number, longitude: number, speedKmh = 40) {
    const vehicle = await persistence.getVehicleById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');
    await persistence.updateVehicle(vehicleId, { currentLatitude: latitude, currentLongitude: longitude });

    const activeTrip = await persistence.getActiveTrip();
    if (!activeTrip || activeTrip.status !== 'IN_PROGRESS') return persistence.getSnapshot();

    const destLat = activeTrip.destinationLat || 18.5395;
    const destLng = activeTrip.destinationLng || 73.8820;
    const distRemaining = calculateHaversineDistance(latitude, longitude, destLat, destLng);
    const speed = speedKmh > 0 ? speedKmh : 40;
    const etaSec = Math.round((distRemaining / speed) * 3600);
    await persistence.updateTrip(activeTrip.id, { distanceRemaining: distRemaining, eta: etaSec });

    const junctions = await persistence.getJunctions();
    for (const j of junctions) {
      const distToJunction = calculateHaversineDistance(latitude, longitude, j.latitude, j.longitude);
      if (distToJunction <= 0.25 && j.status !== 'PASSED') {
        await persistence.updateJunctionStatus(j.id, 'PASSED');
        await persistence.addEvent({ tripId: activeTrip.id, junctionId: j.id, eventType: 'JUNCTION_PASSED', metadata: { junctionName: j.name } });
      }
    }

    const refreshedJunctions = await persistence.getJunctions();
    const unpassed = refreshedJunctions.filter(j => j.status !== 'PASSED');
    for (const j of unpassed.slice(0, 2)) {
      if (j.status === 'PENDING' || j.status === 'IDLE') {
        await persistence.updateJunctionStatus(j.id, 'ALERTED');
        await persistence.addEvent({ tripId: activeTrip.id, junctionId: j.id, eventType: 'JUNCTION_ALERTED', metadata: { junctionName: j.name } });
      }
    }

    if (distRemaining <= 0.1) {
      await persistence.updateTrip(activeTrip.id, { status: 'COMPLETED', endedAt: new Date().toISOString(), distanceRemaining: 0, eta: 0 });
      await persistence.updateVehicle(vehicleId, { status: 'COMPLETED' });
      const remaining = await persistence.getJunctions();
      for (const j of remaining) if (j.status !== 'PASSED') await persistence.updateJunctionStatus(j.id, 'PASSED');
      await persistence.addEvent({ tripId: activeTrip.id, eventType: 'TRIP_COMPLETED', metadata: { destination: activeTrip.destination, completedAt: new Date().toISOString() } });
    } else {
      await persistence.addEvent({ tripId: activeTrip.id, eventType: 'VEHICLE_LOCATION_UPDATED', metadata: { latitude, longitude, speedKmh, distanceRemaining: distRemaining, eta: etaSec } });
    }

    return persistence.getSnapshot();
  }

  public async updateJunctionStatus(junctionId: string, status: 'ACKNOWLEDGED' | 'CLEARED' | 'PASSED' | 'ALERTED', officerId?: string) {
    const junction = await persistence.updateJunctionStatus(junctionId, status);
    if (!junction) throw new Error('Junction not found');
    const activeTrip = await persistence.getActiveTrip();
    if (activeTrip) {
      const eventType: EventType = status === 'ACKNOWLEDGED' ? 'JUNCTION_ACKNOWLEDGED' : status === 'CLEARED' ? 'JUNCTION_CLEARED' : status === 'PASSED' ? 'JUNCTION_PASSED' : 'JUNCTION_ALERTED';
      await persistence.addEvent({ tripId: activeTrip.id, junctionId, officerId, eventType, metadata: { junctionName: junction.name, status } });
    }
    return { junction, snapshot: await persistence.getSnapshot() };
  }
}

export const corridorService = new CorridorService();
