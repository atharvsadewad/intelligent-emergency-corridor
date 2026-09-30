import { Request, Response } from 'express';
import { persistence } from '../services/persistence';
export const getTrips = async (_req: Request, res: Response) => { try { return res.json(await persistence.getTrips()); } catch (e: any) { return res.status(500).json({ error: e.message }); } };
export const getTripById = async (req: Request, res: Response) => { try { const trip = await persistence.getTripById(req.params.id); if (!trip) return res.status(404).json({ error: 'Trip not found' }); return res.json(trip); } catch (e: any) { return res.status(500).json({ error: e.message }); } };
