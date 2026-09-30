import { io, Socket } from 'socket.io-client';
import { getStoredToken } from './api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token: getStoredToken() },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
    socketInstance.on('connect', () => console.log('[Socket.IO] Connected to backend gateway'));
    socketInstance.on('connect_error', (err) => console.warn('[Socket.IO] Connection error:', err.message));
  }
  return socketInstance;
}

export function resetSocket() {
  if (socketInstance) { socketInstance.disconnect(); socketInstance = null; }
}
