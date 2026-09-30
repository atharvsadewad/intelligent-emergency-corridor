import { getSupabase, getDatabaseMode } from './supabase';
import { store } from './store';
import { CorridorSnapshot, CorridorEvent, EmergencyTrip, EmergencyVehicle, Junction, TrafficOfficer, User, UserRole, VehicleStatus, VehicleType, JunctionStatus, TripStatus, AvailabilityStatus } from '../types';

const mapUser = (u: any): User => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', role: u.role as UserRole, createdAt: u.created_at });
const mapVehicle = (v: any): EmergencyVehicle => ({ id: v.id, vehicleNumber: v.vehicle_number, vehicleType: v.vehicle_type as VehicleType, operatorId: v.operator_id || undefined, status: v.status as VehicleStatus, currentLatitude: Number(v.current_latitude), currentLongitude: Number(v.current_longitude), destination: v.destination || '', createdAt: v.created_at });
const mapJunction = (j: any): Junction => ({ id: j.id, name: j.name, latitude: Number(j.latitude), longitude: Number(j.longitude), area: j.area, status: j.status as JunctionStatus, createdAt: j.created_at });
const mapTrip = (t: any): EmergencyTrip => ({ id: t.id, vehicleId: t.vehicle_id, destination: t.destination, destinationLat: t.destination_latitude == null ? undefined : Number(t.destination_latitude), destinationLng: t.destination_longitude == null ? undefined : Number(t.destination_longitude), routeGeometry: (t.route_geometry || []) as Array<[number, number]>, status: t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : t.status as TripStatus, startedAt: t.started_at, endedAt: t.ended_at || undefined, eta: Number(t.eta || 0), distanceRemaining: Number(t.distance_remaining || 0) });
const mapEvent = (e: any): CorridorEvent => ({ id: e.id, tripId: e.trip_id, junctionId: e.junction_id || undefined, officerId: e.officer_id || undefined, eventType: e.event_type, timestamp: e.timestamp, metadata: e.metadata || undefined });

class PersistenceService {
  private db() {
    return getSupabase();
  }

  public isDatabaseConnected() { return getDatabaseMode().isConnected; }

  async getUsers(): Promise<User[]> {
    const db = this.db();
    if (!db) return store.getUsers();
    const { data, error } = await db.from('users').select('*').order('created_at');
    if (error) throw error;
    return (data || []).map(mapUser);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = this.db();
    if (!db) return store.getUserByEmail(email);
    const { data, error } = await db.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const db = this.db();
    if (!db) return store.getUserById(id);
    const { data, error } = await db.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapUser(data) : undefined;
  }

  async getVehicles(): Promise<EmergencyVehicle[]> {
    const db = this.db();
    if (!db) return store.getVehicles();
    const { data, error } = await db.from('emergency_vehicles').select('*').order('created_at');
    if (error) throw error;
    return (data || []).map(mapVehicle);
  }

  async getVehicleById(id: string): Promise<EmergencyVehicle | undefined> {
    const db = this.db();
    if (!db) return store.getVehicleById(id);
    const { data, error } = await db.from('emergency_vehicles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapVehicle(data) : undefined;
  }

  async updateVehicle(id: string, updates: Partial<EmergencyVehicle>): Promise<EmergencyVehicle | undefined> {
    const db = this.db();
    if (!db) return store.updateVehicle(id, updates);
    const dbUpdates: Record<string, unknown> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.currentLatitude !== undefined) dbUpdates.current_latitude = updates.currentLatitude;
    if (updates.currentLongitude !== undefined) dbUpdates.current_longitude = updates.currentLongitude;
    if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
    if (!Object.keys(dbUpdates).length) return this.getVehicleById(id);
    const { data, error } = await db.from('emergency_vehicles').update(dbUpdates).eq('id', id).select('*').single();
    if (error) throw error;
    return mapVehicle(data);
  }

  async getJunctions(): Promise<Junction[]> {
    const db = this.db();
    if (!db) return store.getJunctions();
    const { data, error } = await db.from('junctions').select('*').order('id');
    if (error) throw error;
    return (data || []).map(mapJunction);
  }

  async getJunctionById(id: string): Promise<Junction | undefined> {
    const db = this.db();
    if (!db) return store.getJunctionById(id);
    const { data, error } = await db.from('junctions').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapJunction(data) : undefined;
  }

  async updateJunctionStatus(id: string, status: JunctionStatus): Promise<Junction | undefined> {
    const db = this.db();
    if (!db) return store.updateJunctionStatus(id, status);
    const { data, error } = await db.from('junctions').update({ status }).eq('id', id).select('*').single();
    if (error) throw error;
    return mapJunction(data);
  }

  async getOfficers(): Promise<TrafficOfficer[]> {
    const db = this.db();
    if (!db) return store.getOfficers();
    const { data, error } = await db.from('traffic_officers').select('*, users(name,email), junctions(name)').order('id');
    if (error) throw error;
    return (data || []).map((o: any) => ({ id: o.id, userId: o.user_id, userName: o.users?.name, userEmail: o.users?.email, assignedJunctionId: o.assigned_junction_id || undefined, junctionName: o.junctions?.name, availabilityStatus: o.availability_status as AvailabilityStatus, createdAt: o.created_at }));
  }

  async getOfficerById(id: string): Promise<TrafficOfficer | undefined> {
    const db = this.db();
    if (!db) return store.getOfficerById(id) || store.getOfficerByUserId(id);
    const { data, error } = await db.from('traffic_officers').select('*, users(name,email), junctions(name)').or(`id.eq.${id},user_id.eq.${id}`).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    return { id: data.id, userId: data.user_id, userName: data.users?.name, userEmail: data.users?.email, assignedJunctionId: data.assigned_junction_id || undefined, junctionName: data.junctions?.name, availabilityStatus: data.availability_status as AvailabilityStatus, createdAt: data.created_at };
  }

  async getActiveTrip(): Promise<EmergencyTrip | null> {
    const db = this.db();
    if (!db) return store.getActiveTrip();
    const { data, error } = await db.from('emergency_trips').select('*, emergency_vehicles(vehicle_number,vehicle_type)').eq('status', 'IN_PROGRESS').order('started_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const trip = mapTrip(data);
    trip.vehicleNumber = data.emergency_vehicles?.vehicle_number;
    trip.vehicleType = data.emergency_vehicles?.vehicle_type;
    return trip;
  }

  async getTrips(): Promise<EmergencyTrip[]> {
    const db = this.db();
    if (!db) return store.getTrips();
    const { data, error } = await db.from('emergency_trips').select('*, emergency_vehicles(vehicle_number,vehicle_type)').order('started_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => { const t = mapTrip(row); t.vehicleNumber = row.emergency_vehicles?.vehicle_number; t.vehicleType = row.emergency_vehicles?.vehicle_type; return t; });
  }

  async getTripById(id: string): Promise<EmergencyTrip | undefined> {
    const db = this.db();
    if (!db) return store.getTrips().find(t => t.id === id);
    const { data, error } = await db.from('emergency_trips').select('*, emergency_vehicles(vehicle_number,vehicle_type)').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    const t = mapTrip(data); t.vehicleNumber = data.emergency_vehicles?.vehicle_number; t.vehicleType = data.emergency_vehicles?.vehicle_type; return t;
  }

  async createTrip(trip: EmergencyTrip): Promise<EmergencyTrip> {
    const db = this.db();
    if (!db) { store.setActiveTrip(trip); return trip; }
    const { data, error } = await db.from('emergency_trips').insert({ id: trip.id, vehicle_id: trip.vehicleId, destination: trip.destination, destination_latitude: trip.destinationLat, destination_longitude: trip.destinationLng, route_geometry: trip.routeGeometry, status: trip.status, started_at: trip.startedAt, eta: trip.eta, distance_remaining: trip.distanceRemaining }).select('*').single();
    if (error) throw error;
    return mapTrip(data);
  }

  async updateTrip(id: string, updates: Partial<EmergencyTrip>): Promise<EmergencyTrip | undefined> {
    const db = this.db();
    if (!db) {
      const active = store.getActiveTrip();
      if (!active || active.id !== id) return undefined;
      return store.updateActiveTrip(updates) || undefined;
    }
    const dbUpdates: Record<string, unknown> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.endedAt !== undefined) dbUpdates.ended_at = updates.endedAt;
    if (updates.eta !== undefined) dbUpdates.eta = updates.eta;
    if (updates.distanceRemaining !== undefined) dbUpdates.distance_remaining = updates.distanceRemaining;
    if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
    const { data, error } = await db.from('emergency_trips').update(dbUpdates).eq('id', id).select('*').single();
    if (error) throw error;
    return mapTrip(data);
  }

  async addEvent(event: Omit<CorridorEvent, 'id' | 'timestamp'>): Promise<CorridorEvent> {
    const db = this.db();
    if (!db) return store.addEvent(event);
    const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const timestamp = new Date().toISOString();
    const { data, error } = await db.from('corridor_events').insert({ id, trip_id: event.tripId, junction_id: event.junctionId || null, officer_id: event.officerId || null, event_type: event.eventType, timestamp, metadata: event.metadata || {} }).select('*').single();
    if (error) throw error;
    return mapEvent(data);
  }

  async getEvents(tripId?: string): Promise<CorridorEvent[]> {
    const db = this.db();
    if (!db) return store.getEvents();
    let query = db.from('corridor_events').select('*').order('timestamp', { ascending: false });
    if (tripId) query = query.eq('trip_id', tripId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapEvent);
  }

  async getSnapshot(): Promise<CorridorSnapshot> {
    const [activeTrip, vehicles, junctions, officers, events] = await Promise.all([
      this.getActiveTrip(), this.getVehicles(), this.getJunctions(), this.getOfficers(), this.getEvents()
    ]);
    const activeVehicle = vehicles.find(v => v.status === 'EMERGENCY_ACTIVE') || vehicles[0] || null;
    return { activeTrip, activeVehicle, junctions, officers, events };
  }

  async resetDemoState(): Promise<void> {
    const db = this.db();
    if (!db) { store.reset(); return; }
    // Development/demo reset only. Production deployments should not expose this endpoint/event.
    await db.from('junctions').update({ status: 'IDLE' }).neq('status', 'IDLE');
    await db.from('emergency_vehicles').update({ status: 'IDLE' }).eq('id', 'veh_amb_042');
    await db.from('emergency_trips').update({ status: 'CANCELLED', ended_at: new Date().toISOString() }).eq('status', 'IN_PROGRESS');
  }
}

export const persistence = new PersistenceService();
