import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { persistence } from '../services/persistence';
import { corridorService } from '../services/corridor';
import { config } from '../config';
import { getSupabase } from '../services/supabase';

let io: SocketIOServer | null = null;

async function authenticateSocket(socket: Socket): Promise<boolean> {
  const token = socket.handshake.auth?.token as string | undefined;
  const db = getSupabase();
  if (!db) return true;
  if (!token) return false;
  const { data, error } = await db.auth.getUser(token);
  return !error && !!data.user;
}

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, { cors: { origin: config.corsOrigin || '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] } });

  io.use(async (socket, next) => {
    try { if (await authenticateSocket(socket)) return next(); next(new Error('Unauthorized socket connection')); }
    catch { next(new Error('Unauthorized socket connection')); }
  });

  io.on('connection', async (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.emit('corridor:updated', await persistence.getSnapshot());

    socket.on('request:snapshot', async () => socket.emit('corridor:updated', await persistence.getSnapshot()));

    socket.on('vehicle:location_updated', async (data: { vehicleId: string; latitude: number; longitude: number; speed?: number }) => {
      try {
        const snapshot = await corridorService.updateLocation(data.vehicleId, data.latitude, data.longitude, data.speed);
        io?.emit('vehicle:location_updated', { ...data, activeTrip: snapshot.activeTrip });
        io?.emit('corridor:updated', snapshot);
      } catch (err: any) { console.error('Socket location update:', err.message); }
    });

    socket.on('junction:acknowledge', async (data: { junctionId: string; officerId?: string }) => {
      try {
        const result = await corridorService.updateJunctionStatus(data.junctionId, 'ACKNOWLEDGED', data.officerId);
        io?.emit('junction:acknowledged', { junctionId: data.junctionId, officerId: data.officerId, timestamp: new Date().toISOString() });
        io?.emit('corridor:updated', result.snapshot);
      } catch (err: any) { console.error('Socket acknowledge:', err.message); }
    });

    socket.on('junction:clear', async (data: { junctionId: string; officerId?: string }) => {
      try {
        const result = await corridorService.updateJunctionStatus(data.junctionId, 'CLEARED', data.officerId);
        io?.emit('junction:cleared', { junctionId: data.junctionId, officerId: data.officerId, timestamp: new Date().toISOString() });
        io?.emit('corridor:updated', result.snapshot);
      } catch (err: any) { console.error('Socket clear:', err.message); }
    });

    socket.on('simulation:reset', async () => {
      try { await persistence.resetDemoState(); io?.emit('corridor:updated', await persistence.getSnapshot()); }
      catch (err: any) { console.error('Socket reset:', err.message); }
    });

    socket.on('disconnect', () => console.log(`[Socket.IO] Client disconnected: ${socket.id}`));
  });
  return io;
}

export function getSocketIO(): SocketIOServer | null { return io; }
