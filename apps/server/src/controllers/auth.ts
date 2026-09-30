import { Request, Response } from 'express';
import { z } from 'zod';
import { getSupabaseAuth } from '../services/supabase';
import { persistence } from '../services/persistence';
import { store } from '../services/store';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1).optional(),
    role: z.enum(['ADMIN', 'EMERGENCY_OPERATOR', 'CONTROL_ROOM', 'TRAFFIC_OFFICER']).optional()
  })
});

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  try {
    const auth = getSupabaseAuth();
    if (auth) {
      if (!password) return res.status(400).json({ error: 'Password is required when database authentication is enabled.' });
      const { data, error } = await auth.auth.signInWithPassword({ email: email.toLowerCase(), password });
      if (error || !data.user || !data.session) return res.status(401).json({ error: error?.message || 'Invalid credentials' });
      const user = await persistence.getUserByEmail(email);
      if (!user) return res.status(403).json({ error: 'Authenticated user has no application profile.' });
      if (role && role !== user.role) return res.status(403).json({ error: 'Selected role does not match your account.' });
      return res.json({ message: 'Logged in successfully', user, token: data.session.access_token, accessToken: data.session.access_token, refreshToken: data.session.refresh_token });
    }

    const user = store.getUserByEmail(email);
    if (!user) {
      const newUser = { id: `usr_${Date.now()}`, name: email.split('@')[0].toUpperCase(), email: email.toLowerCase(), phone: '+91-9876500000', role: role || 'CONTROL_ROOM', createdAt: new Date().toISOString() } as any;
      store.getUsers().push(newUser);
      return res.json({ message: 'Logged in successfully (Demo)', user: newUser, token: `demo-token-${newUser.id}`, accessToken: `demo-token-${newUser.id}` });
    }
    return res.json({ message: 'Logged in successfully (Demo)', user, token: `demo-token-${user.id}`, accessToken: `demo-token-${user.id}` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Authentication failed' });
  }
};
