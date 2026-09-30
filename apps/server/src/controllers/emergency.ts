import { Request, Response } from 'express';
import { z } from 'zod';
import { corridorService } from '../services/corridor';
import { persistence } from '../services/persistence';
import { getSocketIO } from '../socket';

export const createEmergencySchema = z.object({ body: z.object({ vehicleId: z.string().min(1), destination: z.string().optional(), destinationLat: z.number().optional(), destinationLng: z.number().optional() }) });
export const updateLocationSchema = z.object({ body: z.object({ vehicleId: z.string().min(1), latitude: z.number(), longitude: z.number(), speed: z.number().optional() }) });

async function broadcastSnapshot() { const io = getSocketIO(); if (io) io.emit('corridor:updated', await persistence.getSnapshot()); }

export const createEmergency = async (req: Request, res: Response) => {
  try {
    const { vehicleId, destination, destinationLat, destinationLng } = req.body;
    const result = await corridorService.activateEmergency(vehicleId, destination, destinationLat, destinationLng);
    const io = getSocketIO(); if (io) io.emit('emergency:activated', result.trip);
    await broadcastSnapshot();
    return res.status(201).json(result);
  } catch (error: any) { return res.status(400).json({ error: error.message || 'Failed to create emergency' }); }
};

export const getActiveEmergency = async (_req: Request, res: Response) => {
  try { return res.json({ activeTrip: await persistence.getActiveTrip(), snapshot: await persistence.getSnapshot() }); }
  catch (error: any) { return res.status(500).json({ error: error.message || 'Failed to fetch emergency state' }); }
};

export const getEmergencyById = async (req: Request, res: Response) => {
  try { const trip = await persistence.getTripById(req.params.id); if (!trip) return res.status(404).json({ error: 'Trip not found' }); return res.json(trip); }
  catch (error: any) { return res.status(500).json({ error: error.message || 'Failed to fetch trip' }); }
};

export const activateEmergencyMode = async (req: Request, res: Response) => {
  try {
    const result = await corridorService.activateEmergency(req.params.id);
    const io = getSocketIO(); if (io) io.emit('emergency:activated', result.trip);
    await broadcastSnapshot();
    return res.json(result);
  } catch (error: any) { return res.status(400).json({ error: error.message || 'Failed to activate emergency' }); }
};

export const deactivateEmergencyMode = async (req: Request, res: Response) => {
  try {
    const snapshot = await corridorService.deactivateEmergency(req.params.id);
    const io = getSocketIO(); if (io) io.emit('emergency:deactivated', { vehicleId: req.params.id });
    if (io) io.emit('corridor:updated', snapshot);
    return res.json({ message: 'Emergency mode deactivated', snapshot });
  } catch (error: any) { return res.status(400).json({ error: error.message || 'Failed to deactivate emergency' }); }
};

export const updateVehicleLocation = async (req: Request, res: Response) => {
  try {
    const { vehicleId, latitude, longitude, speed } = req.body;
    const snapshot = await corridorService.updateLocation(vehicleId, latitude, longitude, speed);
    const io = getSocketIO();
    if (io) {
      io.emit('vehicle:location_updated', { vehicleId, latitude, longitude, speed, activeTrip: snapshot.activeTrip });
      io.emit('corridor:updated', snapshot);
    }
    return res.json(snapshot);
  } catch (error: any) { return res.status(400).json({ error: error.message || 'Failed to update location' }); }
};
