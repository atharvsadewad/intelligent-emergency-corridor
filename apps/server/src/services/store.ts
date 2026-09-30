import { 
  User, 
  Junction, 
  EmergencyVehicle, 
  TrafficOfficer, 
  EmergencyTrip, 
  CorridorEvent,
  JunctionStatus,
  VehicleStatus
} from '../types';

// Predefined demo route coordinates for Pune corridor (Swargate to Ruby Hall Clinic)
export const DEMO_PUNE_ROUTE: Array<[number, number]> = [
  [73.8636, 18.5018], // Swargate Bus Station / Junction (Start)
  [73.8655, 18.5045], // Nehru Stadium Road
  [73.8688, 18.5085], // Seven Loves Chowk (Junction 2)
  [73.8710, 18.5150], // Timber Market Road
  [73.8732, 18.5220], // Maldhakka Chowk
  [73.8741, 18.5284], // Pune Station Chowk (Junction 3)
  [73.8765, 18.5320], // Sadhu Vaswani Circle
  [73.8785, 18.5360], // Bund Garden Road Junction (Junction 4)
  [73.8805, 18.5380], // Wadia College Chowk
  [73.8820, 18.5395]  // Ruby Hall Clinic Gate (Junction 5 - Destination)
];

// Initial Demo State
const initialUsers: User[] = [
  { id: 'usr_operator_1', name: 'Demo Operator (Ambulance)', email: 'demo-emergency@example.com', phone: '+91-9876543210', role: 'EMERGENCY_OPERATOR', createdAt: new Date().toISOString() },
  { id: 'usr_control_1', name: 'Control Room Specialist', email: 'demo-control@example.com', phone: '+91-9876543211', role: 'CONTROL_ROOM', createdAt: new Date().toISOString() },
  { id: 'usr_officer_swargate', name: 'Inspector Ramesh', email: 'officer-swargate@example.com', phone: '+91-9876543212', role: 'TRAFFIC_OFFICER', createdAt: new Date().toISOString() },
  { id: 'usr_officer_sevenloves', name: 'Officer Suresh', email: 'demo-officer@example.com', phone: '+91-9876543213', role: 'TRAFFIC_OFFICER', createdAt: new Date().toISOString() },
  { id: 'usr_officer_station', name: 'Officer Priya', email: 'officer-station@example.com', phone: '+91-9876543214', role: 'TRAFFIC_OFFICER', createdAt: new Date().toISOString() },
  { id: 'usr_officer_bundgarden', name: 'Officer Amit', email: 'officer-bundgarden@example.com', phone: '+91-9876543215', role: 'TRAFFIC_OFFICER', createdAt: new Date().toISOString() },
  { id: 'usr_officer_rubyhall', name: 'Officer Deepa', email: 'officer-rubyhall@example.com', phone: '+91-9876543216', role: 'TRAFFIC_OFFICER', createdAt: new Date().toISOString() },
  { id: 'usr_admin_1', name: 'System Administrator', email: 'demo-admin@example.com', phone: '+91-9876543217', role: 'ADMIN', createdAt: new Date().toISOString() }
];

const initialJunctions: Junction[] = [
  { id: 'jnc_swargate', name: 'Swargate Junction', latitude: 18.5018, longitude: 73.8636, area: 'Swargate', status: 'IDLE' },
  { id: 'jnc_sevenloves', name: 'Seven Loves Chowk', latitude: 18.5085, longitude: 73.8688, area: 'Ghorpade Peth', status: 'IDLE' },
  { id: 'jnc_station', name: 'Pune Station Chowk', latitude: 18.5284, longitude: 73.8741, area: 'Pune Station', status: 'IDLE' },
  { id: 'jnc_bundgarden', name: 'Bund Garden Road Junction', latitude: 18.5360, longitude: 73.8785, area: 'Bund Garden', status: 'IDLE' },
  { id: 'jnc_rubyhall', name: 'Ruby Hall Clinic Gate Junction', latitude: 18.5395, longitude: 73.8820, area: 'Sangamvadi', status: 'IDLE' }
];

const initialVehicles: EmergencyVehicle[] = [
  {
    id: 'veh_amb_042',
    vehicleNumber: 'MH-12-AMB-042',
    vehicleType: 'AMBULANCE',
    operatorId: 'usr_operator_1',
    status: 'IDLE',
    currentLatitude: 18.5018,
    currentLongitude: 73.8636,
    destination: 'Ruby Hall Clinic, Pune',
    createdAt: new Date().toISOString()
  }
];

const initialOfficers: TrafficOfficer[] = [
  { id: 'off_1', userId: 'usr_officer_swargate', userName: 'Inspector Ramesh', userEmail: 'officer-swargate@example.com', assignedJunctionId: 'jnc_swargate', junctionName: 'Swargate Junction', availabilityStatus: 'ON_DUTY' },
  { id: 'off_2', userId: 'usr_officer_sevenloves', userName: 'Officer Suresh', userEmail: 'demo-officer@example.com', assignedJunctionId: 'jnc_sevenloves', junctionName: 'Seven Loves Chowk', availabilityStatus: 'ON_DUTY' },
  { id: 'off_3', userId: 'usr_officer_station', userName: 'Officer Priya', userEmail: 'officer-station@example.com', assignedJunctionId: 'jnc_station', junctionName: 'Pune Station Chowk', availabilityStatus: 'ON_DUTY' },
  { id: 'off_4', userId: 'usr_officer_bundgarden', userName: 'Officer Amit', userEmail: 'officer-bundgarden@example.com', assignedJunctionId: 'jnc_bundgarden', junctionName: 'Bund Garden Road Junction', availabilityStatus: 'ON_DUTY' },
  { id: 'off_5', userId: 'usr_officer_rubyhall', userName: 'Officer Deepa', userEmail: 'officer-rubyhall@example.com', assignedJunctionId: 'jnc_rubyhall', junctionName: 'Ruby Hall Clinic Gate Junction', availabilityStatus: 'ON_DUTY' }
];

class MemoryStore {
  private users: User[] = [...initialUsers];
  private junctions: Junction[] = JSON.parse(JSON.stringify(initialJunctions));
  private vehicles: EmergencyVehicle[] = JSON.parse(JSON.stringify(initialVehicles));
  private officers: TrafficOfficer[] = JSON.parse(JSON.stringify(initialOfficers));
  private activeTrip: EmergencyTrip | null = null;
  private tripHistory: EmergencyTrip[] = [];
  private events: CorridorEvent[] = [];

  // Reset to initial state
  public reset() {
    this.junctions = JSON.parse(JSON.stringify(initialJunctions));
    this.vehicles = JSON.parse(JSON.stringify(initialVehicles));
    this.officers = JSON.parse(JSON.stringify(initialOfficers));
    this.activeTrip = null;
    this.events = [];
  }

  // Users
  public getUsers(): User[] { return this.users; }
  public getUserByEmail(email: string): User | undefined { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  public getUserById(id: string): User | undefined { return this.users.find(u => u.id === id); }

  // Vehicles
  public getVehicles(): EmergencyVehicle[] { return this.vehicles; }
  public getVehicleById(id: string): EmergencyVehicle | undefined { return this.vehicles.find(v => v.id === id); }
  public updateVehicle(id: string, updates: Partial<EmergencyVehicle>): EmergencyVehicle | undefined {
    const v = this.getVehicleById(id);
    if (!v) return undefined;
    Object.assign(v, updates);
    return v;
  }

  // Junctions
  public getJunctions(): Junction[] { return this.junctions; }
  public getJunctionById(id: string): Junction | undefined { return this.junctions.find(j => j.id === id); }
  public updateJunctionStatus(id: string, status: JunctionStatus): Junction | undefined {
    const j = this.getJunctionById(id);
    if (!j) return undefined;
    j.status = status;
    return j;
  }

  // Officers
  public getOfficers(): TrafficOfficer[] { return this.officers; }
  public getOfficerById(id: string): TrafficOfficer | undefined { return this.officers.find(o => o.id === id); }
  public getOfficerByUserId(userId: string): TrafficOfficer | undefined { return this.officers.find(o => o.userId === userId); }

  // Active Trip
  public getActiveTrip(): EmergencyTrip | null { return this.activeTrip; }
  public setActiveTrip(trip: EmergencyTrip | null) { this.activeTrip = trip; }
  public updateActiveTrip(updates: Partial<EmergencyTrip>): EmergencyTrip | null {
    if (!this.activeTrip) return null;
    Object.assign(this.activeTrip, updates);
    return this.activeTrip;
  }
  public getTrips(): EmergencyTrip[] {
    return this.activeTrip ? [this.activeTrip, ...this.tripHistory] : this.tripHistory;
  }

  // Corridor Events
  public addEvent(event: Omit<CorridorEvent, 'id' | 'timestamp'>): CorridorEvent {
    const newEvent: CorridorEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    this.events.unshift(newEvent); // Latest first
    return newEvent;
  }

  public getEvents(): CorridorEvent[] { return this.events; }

  // Snapshot for control room / WebSocket initial load
  public getSnapshot() {
    const vehicle = this.vehicles.find(v => v.status === 'EMERGENCY_ACTIVE') || this.vehicles[0];
    return {
      activeTrip: this.activeTrip,
      activeVehicle: vehicle,
      junctions: this.junctions,
      officers: this.officers,
      events: this.events
    };
  }
}

export const store = new MemoryStore();
