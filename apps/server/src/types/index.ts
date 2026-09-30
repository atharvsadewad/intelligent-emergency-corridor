export type UserRole = 'ADMIN' | 'EMERGENCY_OPERATOR' | 'CONTROL_ROOM' | 'TRAFFIC_OFFICER';

export type VehicleType = 'AMBULANCE' | 'FIRE_BRIGADE' | 'POLICE' | 'NDRF';

export type VehicleStatus = 'IDLE' | 'EMERGENCY_ACTIVE' | 'COMPLETED';

export type JunctionStatus = 'IDLE' | 'PENDING' | 'ALERTED' | 'ACKNOWLEDGED' | 'CLEARED' | 'PASSED';

export type AvailabilityStatus = 'AVAILABLE' | 'ON_DUTY' | 'BUSY' | 'OFFLINE';

export type TripStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type EventType = 
  | 'EMERGENCY_ACTIVATED' 
  | 'VEHICLE_LOCATION_UPDATED' 
  | 'JUNCTION_ALERTED' 
  | 'JUNCTION_ACKNOWLEDGED' 
  | 'JUNCTION_CLEARED' 
  | 'JUNCTION_PASSED' 
  | 'TRIP_COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Junction {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  area: string;
  status: JunctionStatus;
  createdAt?: string;
}

export interface EmergencyVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  operatorId?: string;
  status: VehicleStatus;
  currentLatitude: number;
  currentLongitude: number;
  destination: string;
  createdAt?: string;
}

export interface TrafficOfficer {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  assignedJunctionId?: string;
  junctionName?: string;
  availabilityStatus: AvailabilityStatus;
  createdAt?: string;
}

export interface EmergencyTrip {
  id: string;
  vehicleId: string;
  vehicleNumber?: string;
  vehicleType?: VehicleType;
  destination: string;
  destinationLat?: number;
  destinationLng?: number;
  routeGeometry: Array<[number, number]>; // [lng, lat] format for Mapbox/GeoJSON compatibility
  status: TripStatus;
  startedAt: string;
  endedAt?: string;
  eta: number; // seconds
  distanceRemaining: number; // km
}

export interface CorridorEvent {
  id: string;
  tripId: string;
  junctionId?: string;
  officerId?: string;
  eventType: EventType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CorridorSnapshot {
  activeTrip: EmergencyTrip | null;
  activeVehicle: EmergencyVehicle | null;
  junctions: Junction[];
  officers: TrafficOfficer[];
  events: CorridorEvent[];
}
