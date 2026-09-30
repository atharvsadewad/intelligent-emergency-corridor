import { Request, Response } from 'express';
import { z } from 'zod';
import { corridorService } from '../services/corridor';
import { persistence } from '../services/persistence';
import { getSocketIO } from '../socket';

export const updateJunctionStatusSchema = z.object({ body: z.object({ status: z.enum(['ACKNOWLEDGED', 'CLEARED', 'PASSED', 'ALERTED', 'PENDING']), officerId: z.string().optional() }) });
export const getJunctions = async (_req: Request, res: Response) => { try { return res.json(await persistence.getJunctions()); } catch (e: any) { return res.status(500).json({ error: e.message }); } };
export const getUpcomingJunctions = async (_req: Request, res: Response) => { try { return res.json((await persistence.getJunctions()).filter(j => j.status !== 'PASSED')); } catch (e: any) { return res.status(500).json({ error: e.message }); } };

export const alertJunction = async (req: Request, res: Response) => {
  try { const { junction, snapshot } = await corridorService.updateJunctionStatus(req.params.id, 'ALERTED'); const io = getSocketIO(); if (io) { io.emit('junction:alerted', { junctionId: req.params.id, junction }); io.emit('corridor:updated', snapshot); } return res.json({ message: 'Junction alerted', junction }); }
  catch (error: any) { return res.status(400).json({ error: error.message }); }
};

export const updateJunctionStatus = async (req: Request, res: Response) => {
  try { const { id } = req.params; const { status, officerId } = req.body; const result = await corridorService.updateJunctionStatus(id, status, officerId); const io = getSocketIO(); if (io) { if (status === 'ACKNOWLEDGED') io.emit('junction:acknowledged', { junctionId: id, officerId, timestamp: new Date().toISOString() }); if (status === 'CLEARED') io.emit('junction:cleared', { junctionId: id, officerId, timestamp: new Date().toISOString() }); io.emit('corridor:updated', result.snapshot); } return res.json({ message: `Junction status updated to ${status}`, junction: result.junction }); }
  catch (error: any) { return res.status(400).json({ error: error.message }); }
};
