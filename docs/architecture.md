# Intelligent Emergency Corridor Management System - Architecture

## System Architecture Overview

```
                   +---------------------------------------+
                   |  Emergency Vehicle Interface (Web)    |
                   +-------------------+-------------------+
                                       |
                         REST API      |     Socket.IO Events
                         HTTP/JSON     v     Real-Time Stream
                   +---------------------------------------+
                   |       Express Backend (Node.js/TS)    |
                   | - REST Controllers                    |
                   | - Socket.IO Manager                   |
                   | - Corridor Business Engine            |
                   | - Mapbox Integration Service          |
                   +---------+--------------------+--------+
                             |                    |
            PostgreSQL /     |                    | External API
            Supabase DB      v                    v
                   +-------------------+  +-------------------+
                   | Database Storage  |  | Mapbox Directions |
                   +-------------------+  +-------------------+
                             |
                   Events & State Updates
                             |
         +-------------------+-------------------+
         v                                       v
+-------------------------------+   +-------------------------------+
|  Control Room Dashboard (Web) |   | Traffic Officer Mobile (Web)  |
+-------------------------------+   +-------------------------------+
```

## Layer Definitions

1. **Presentation Layer (Apps/Web)**
   - Built with Next.js App Router, TypeScript, Tailwind CSS, Lucide React, and Recharts.
   - Maps rendered with Mapbox GL JS (with interactive HTML5 canvas/SVG fallback when API keys are omitted).
   - Role-specific workflows for Emergency Operator, Control Room, Traffic Officer, and Admin.

2. **API & Real-Time Event Layer (Apps/Server)**
   - Express server providing Zod-validated REST endpoints.
   - Socket.IO gateway handling instant bi-directional updates: vehicle position, junction alerts, acknowledgment, and corridor clearing.

3. **Core Business Logic (Corridor Engine)**
   - Route calculation & junction proximity matching.
   - Real-time ETA and distance recalculation.
   - Junction lifecycle management: `IDLE` -> `PENDING` -> `ALERTED` -> `ACKNOWLEDGED` -> `CLEARED` -> `PASSED`.

4. **Persistence Layer (Database)**
   - PostgreSQL schema with Supabase Auth compatibility.
   - Robust in-memory state fallback if PostgreSQL credentials are absent during local testing.

## Persistence and Authentication

The backend uses a persistence abstraction so the same corridor business logic can operate in development and connected environments:

- `DEMO MODE`: the original in-memory store is used for offline demonstrations.
- `DATABASE CONNECTED`: Supabase PostgreSQL is the primary source of truth through the backend service-role client.

The backend authenticates users with Supabase Auth and resolves the application role from the `users` profile table. Protected REST routes enforce role permissions on the server. Socket.IO connections also require a valid Supabase access token when database mode is enabled.

Clients do not write directly to PostgreSQL. The intended state flow is:

`Client -> REST/Socket.IO -> Corridor Service -> Persistence Service -> PostgreSQL -> Socket.IO -> Clients`

This keeps the backend authoritative instead of allowing a browser simulation to become the source of truth.
