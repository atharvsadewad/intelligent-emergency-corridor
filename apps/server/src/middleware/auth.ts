import { NextFunction, Request, Response } from 'express';
import { getSupabase, getDatabaseMode } from '../services/supabase';
import { persistence } from '../services/persistence';
import { User, UserRole } from '../types';
import { store } from '../services/store';

declare global { namespace Express { interface Request { user?: User } } }

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
    const { isConnected } = getDatabaseMode();

    if (!isConnected) {
      if (token.startsWith('demo-token-')) {
        const user = store.getUserById(token.replace('demo-token-', ''));
        if (user) req.user = user;
      }
      return next();
    }

    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const db = getSupabase();
    if (!db) return res.status(503).json({ error: 'Authentication service unavailable' });
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session' });
    const user = await persistence.getUserByEmail(data.user.email || '');
    if (!user) return res.status(403).json({ error: 'Application profile not found' });
    req.user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({ error: error.message || 'Authentication failed' });
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}
