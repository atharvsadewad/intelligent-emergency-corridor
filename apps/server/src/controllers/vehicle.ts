import { Request, Response } from 'express';
import { persistence } from '../services/persistence';
export const getVehicles = async (_req: Request, res: Response) => { try { return res.json(await persistence.getVehicles()); } catch (e: any) { return res.status(500).json({ error: e.message }); } };
export const getVehicleById = async (req: Request, res: Response) => { try { const vehicle = await persistence.getVehicleById(req.params.id); if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' }); return res.json(vehicle); } catch (e: any) { return res.status(500).json({ error: e.message }); } };
