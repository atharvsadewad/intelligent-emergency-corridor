import { Request, Response } from 'express';
import { persistence } from '../services/persistence';
export const getOfficers = async (_req: Request, res: Response) => { try { return res.json(await persistence.getOfficers()); } catch (e: any) { return res.status(500).json({ error: e.message }); } };
export const getOfficerById = async (req: Request, res: Response) => { try { const officer = await persistence.getOfficerById(req.params.id); if (!officer) return res.status(404).json({ error: 'Officer not found' }); return res.json(officer); } catch (e: any) { return res.status(500).json({ error: e.message }); } };
