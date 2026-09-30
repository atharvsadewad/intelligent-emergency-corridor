import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

let adminClient: SupabaseClient | null = null;
let authClient: SupabaseClient | null = null;
let isConnected = false;
let mode: 'DATABASE CONNECTED' | 'DEMO MODE' = 'DEMO MODE';

export function initSupabase(): SupabaseClient | null {
  const url = config.supabaseUrl;
  const serviceKey = config.supabaseServiceRoleKey;
  const anonKey = config.supabaseAnonKey;

  if (url && serviceKey && !url.includes('your-supabase-project')) {
    adminClient = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    authClient = createClient(url, anonKey || serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    isConnected = true;
    mode = 'DATABASE CONNECTED';
    console.log('✅ Supabase backend clients initialized. PostgreSQL is PRIMARY source of truth.');
  } else {
    adminClient = null;
    authClient = null;
    isConnected = false;
    mode = 'DEMO MODE';
    console.log('ℹ️ Supabase service credentials not configured. Running in DEMO FALLBACK mode.');
  }

  return adminClient;
}

export function getSupabase(): SupabaseClient | null {
  if (!adminClient && !isConnected) initSupabase();
  return adminClient;
}

export function getSupabaseAuth(): SupabaseClient | null {
  if (!authClient && !isConnected) initSupabase();
  return authClient;
}

export function getDatabaseMode(): { isConnected: boolean; mode: 'DATABASE CONNECTED' | 'DEMO MODE' } {
  return { isConnected, mode };
}
