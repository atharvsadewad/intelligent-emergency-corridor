# REST API & Socket.IO Specification

## REST API Endpoints

### Authentication
- `POST /api/auth/login`
  - Body: `{ email, role }`
  - Returns: User session details & demo token.

### Emergency Vehicles
- `GET /api/vehicles`
  - Returns array of emergency vehicles.
- `GET /api/vehicles/:id`
  - Returns vehicle by ID.

### Emergencies & Trips
- `GET /api/emergencies/active`
  - Returns active emergency trip details & current route geometry.
- `GET /api/emergencies/:id`
  - Returns trip details by ID.
- `POST /api/emergencies`
  - Body: `{ vehicleId, destination, destinationLat, destinationLng }`
  - Starts emergency mode, generates route, alerts upcoming junctions.
- `PATCH /api/emergencies/:id/activate`
  - Activates emergency mode for vehicle.
- `PATCH /api/emergencies/:id/deactivate`
  - Deactivates emergency mode and resets corridor status.

### Real-Time GPS Location Updates
- `POST /api/location/update`
  - Body: `{ vehicleId, latitude, longitude, speed }`
  - Updates vehicle position, updates ETA/distance, checks if junctions passed.

### Junctions & Officers
- `GET /api/junctions`
  - Returns list of junctions and their statuses.
- `GET /api/junctions/upcoming`
  - Returns junctions along active emergency route.
- `POST /api/junctions/:id/alert`
  - Triggers manual alert to assigned officer for junction.
- `PATCH /api/junctions/:id/status`
  - Body: `{ status: 'ACKNOWLEDGED' | 'CLEARED' | 'PASSED' | 'PENDING', officerId? }`
  - Updates junction clearance status and broadcasts real-time updates.

---

## Socket.IO Events

| Event Name | Direction | Payload Description |
|---|---|---|
| `emergency:activated` | Server -> Clients | Active trip data, route geometry, upcoming junctions |
| `emergency:deactivated` | Server -> Clients | Trip ID, reason |
| `vehicle:location_updated` | Client <-> Server | `{ vehicleId, latitude, longitude, eta, distanceRemaining }` |
| `corridor:updated` | Server -> Clients | Complete snapshot of active corridor and junction statuses |
| `junction:alerted` | Server -> Officer | Junction alert details (junction name, vehicle, ETA) |
| `junction:acknowledged` | Server <-> Clients | `{ junctionId, officerId, timestamp }` |
| `junction:cleared` | Server <-> Clients | `{ junctionId, officerId, timestamp }` |
| `trip:completed` | Server -> Clients | Summary of completed trip |
