const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('corridor_token');
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('corridor_token');
  localStorage.removeItem('corridor_user');
}

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  Object.assign(headers, options?.headers || {});
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (email: string, password?: string, role?: string) => fetcher<{ user: any; token: string; accessToken?: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
  getVehicles: () => fetcher<any[]>('/vehicles'),
  getVehicleById: (id: string) => fetcher<any>(`/vehicles/${id}`),
  getActiveEmergency: () => fetcher<{ activeTrip: any; snapshot: any }>('/emergencies/active'),
  activateEmergency: (vehicleId: string, destination?: string) => fetcher<any>(`/emergencies/${vehicleId}/activate`, { method: 'PATCH', body: JSON.stringify({ destination }) }),
  deactivateEmergency: (vehicleId: string) => fetcher<any>(`/emergencies/${vehicleId}/deactivate`, { method: 'PATCH' }),
  updateLocation: (vehicleId: string, latitude: number, longitude: number, speed?: number) => fetcher<any>('/location/update', { method: 'POST', body: JSON.stringify({ vehicleId, latitude, longitude, speed }) }),
  getJunctions: () => fetcher<any[]>('/junctions'),
  getUpcomingJunctions: () => fetcher<any[]>('/junctions/upcoming'),
  alertJunction: (id: string) => fetcher<any>(`/junctions/${id}/alert`, { method: 'POST' }),
  updateJunctionStatus: (id: string, status: string, officerId?: string) => fetcher<any>(`/junctions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, officerId }) }),
  getOfficers: () => fetcher<any[]>('/officers'),
  getOfficerById: (id: string) => fetcher<any>(`/officers/${id}`),
  getTrips: () => fetcher<any[]>('/trips'),
  getTripById: (id: string) => fetcher<any>(`/trips/${id}`),
  health: () => fetcher<any>('/health')
};
