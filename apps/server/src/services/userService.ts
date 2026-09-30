import { getSupabase } from './supabase';
import { store } from './store';
import { User, UserRole } from '../types';

export class UserService {
  public async getUserByEmail(email: string): Promise<User | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      if (data && !error) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role as UserRole,
          createdAt: data.created_at
        };
      }
    }
    return store.getUserByEmail(email);
  }

  public async getUserById(id: string): Promise<User | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (data && !error) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role as UserRole,
          createdAt: data.created_at
        };
      }
    }
    return store.getUserById(id);
  }

  public async getUsers(): Promise<User[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (data && !error) {
        return data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role as UserRole,
          createdAt: u.created_at
        }));
      }
    }
    return store.getUsers();
  }
}

export const userService = new UserService();
