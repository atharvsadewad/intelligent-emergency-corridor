import dotenv from 'dotenv';
import path from 'path';

// Load root .env or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || ''
};
