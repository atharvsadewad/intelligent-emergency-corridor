import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config';
import { initSupabase, getDatabaseMode } from './services/supabase';
import { initSocketIO } from './socket';

// Routes
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicle';
import emergencyRoutes from './routes/emergency';
import junctionRoutes from './routes/junction';
import officerRoutes from './routes/officer';
import tripRoutes from './routes/trip';
import locationRoutes from './routes/location';

initSupabase();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: config.corsOrigin || '*' }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Intelligent Emergency Corridor Management System API',
    timestamp: new Date().toISOString(),
    database: getDatabaseMode()
  });
});

// Register REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/junctions', junctionRoutes);
app.use('/api/officers', officerRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/location', locationRoutes);

// Initialize Socket.IO
initSocketIO(server);

// Start HTTP Server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Emergency Corridor Server running on port http://localhost:${PORT}`);
  console.log(`📡 Socket.IO gateway ready for real-time events`);
  console.log(`=======================================================`);
});
