# Intelligent Emergency Corridor Management System Using Real-Time GPS and Traffic Coordination

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-black.svg)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

A real-time emergency vehicle coordination platform built to solve urban traffic delays for emergency vehicles (Ambulance, Fire Brigade, Police, NDRF). The system establishes dynamic "Green Corridors" by connecting Emergency Operators, Control Room Specialists, and Traffic Officers at upcoming junctions via real-time GPS tracking and instant bi-directional Socket.IO communication.

---

## Table of Contents
1. [Project Purpose](#project-purpose)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Environment Variables](#environment-variables)
6. [Local Installation](#local-installation)
7. [Database Setup](#database-setup)
8. [Running Backend Server](#running-backend-server)
9. [Running Frontend Web App](#running-frontend-web-app)
10. [Demo Accounts](#demo-accounts)
11. [Simulation Engine Mode](#simulation-engine-mode)
12. [API Endpoints](#api-endpoints)
13. [Socket.IO Event Gateway](#socketio-event-gateway)
14. [Deployment Strategy](#deployment-strategy)
15. [Future AI/ML Extension](#future-aiml-extension)

---

## 1. Project Purpose

When Emergency Mode is activated:
1. The authorized emergency vehicle shares its live GPS position.
2. The operator selects a destination hospital or incident zone.
3. A routing engine calculates the geometry, distance, and ETA.
4. The system identifies upcoming junctions along the emergency corridor.
5. Control Room dispatchers observe the active emergency on a live map.
6. Relevant traffic officers assigned to upcoming junctions receive instant alerts with vehicle ETA.
7. Officers acknowledge alerts and clear their respective junctions.
8. Control Room updates corridor clearance status in real time.
9. Vehicle movement continuously updates ETA, marking passed junctions as `PASSED`.
10. Upon arrival at the destination, the trip is completed and archived.

> **System Boundaries:** This platform does not directly control physical traffic signals or IoT hardware; it provides human-in-the-loop operational coordination between emergency crews, central dispatchers, and field traffic police officers.

---

## 2. Architecture Overview

```
Emergency Vehicle Interface (Web / Mobile GPS)
            |
            | REST API + Socket.IO Bi-directional Stream
            v
   Node.js + Express Backend (TypeScript)
            |
            +------ PostgreSQL / Supabase Schema (Store Service Fallback)
            |
            +------ Mapbox Directions & Geocoding APIs
            |
            v
   Real-Time Event Gateway (Socket.IO)
            |
            +------> Control Room Operations Command (Web)
            |
            +------> Traffic Officer Mobile Interface (Web)
```

---

## 3. Technology Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React icons, Canvas/Mapbox GL JS map fallback, Socket.IO client.
- **Backend:** Node.js, Express.js, TypeScript, REST API, Socket.IO server, Zod validation, in-memory store adapter with PostgreSQL/Supabase support.
- **Database:** PostgreSQL (with `schema.sql` and `seed.sql`), Supabase Auth compatible.
- **Mapping:** Mapbox GL JS & Mapbox Directions API (with interactive HTML5 Canvas fallback when token is omitted).

---

## 4. Folder Structure

```
intelligent-emergency-corridor/
├── package.json
├── .env.example
├── README.md
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── demo-scenario.md
├── apps/
│   ├── server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── config/
│   │       ├── controllers/
│   │       ├── middleware/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── socket/
│   │       ├── types/
│   │       └── utils/
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── next.config.js
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── types/
```

---

## 5. Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
# Frontend Environment Variables
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001

# Backend Environment Variables
PORT=5001
CORS_ORIGIN=http://localhost:3000

# Database Configuration (Optional - falls back seamlessly to memory store)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/emergency_corridor
```

---

## 6. Local Installation

```bash
# Install all workspace dependencies
npm install
```

---

## 7. Database Setup

If running local PostgreSQL or Supabase:

```bash
psql -U postgres -d emergency_corridor -f database/schema.sql
psql -U postgres -d emergency_corridor -f database/seed.sql
```

*Note: If no database URL is supplied, the backend uses a pre-seeded memory store so the application runs seamlessly out-of-the-box!*

---

## 8. Running Backend Server

```bash
npm run dev:server
```
Backend will start on `http://localhost:5001`.

---

## 9. Running Frontend Web App

```bash
npm run dev:web
```
Frontend will start on `http://localhost:3000`.

To run both concurrently:
```bash
npm run dev
```

---

## 10. Demo Accounts

- **Emergency Operator:** `demo-emergency@example.com`
- **Control Room Specialist:** `demo-control@example.com`
- **Traffic Officer (Seven Loves Chowk):** `demo-officer@example.com`
- **System Administrator:** `demo-admin@example.com`

---

## 11. Simulation Engine Mode

The platform includes a built-in simulation panel for demonstration without relying on active physical GPS hardware.

- **Predefined Route:** Swargate Bus Station → Seven Loves Chowk → Pune Station Chowk → Bund Garden Road → Ruby Hall Clinic Gate.
- **Controls:** `START SIMULATION`, `PAUSE`, `RESUME`, `RESET`, `NEXT STEP`, `SPEED (1x, 2x, 5x)`.
- **Real-Time Integration:** Simulation location steps fire through the same `POST /api/location/update` and Socket.IO broadcast mechanisms as live GPS devices.

---

## 12. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticates or returns demo user token |
| `GET` | `/api/vehicles` | List registered emergency vehicles |
| `GET` | `/api/emergencies/active` | Get current active corridor and trip snapshot |
| `PATCH` | `/api/emergencies/:id/activate` | Activate Emergency Mode for vehicle |
| `PATCH` | `/api/emergencies/:id/deactivate` | Cancel/deactivate emergency trip |
| `POST` | `/api/location/update` | Post vehicle GPS coordinates |
| `GET` | `/api/junctions` | List corridor junctions and statuses |
| `PATCH` | `/api/junctions/:id/status` | Update junction clearance state (`ACKNOWLEDGED` / `CLEARED`) |
| `GET` | `/api/officers` | List traffic officers and duty posts |

---

## 13. Socket.IO Event Gateway

- `emergency:activated`
- `emergency:deactivated`
- `vehicle:location_updated`
- `corridor:updated`
- `junction:alerted`
- `junction:acknowledged`
- `junction:cleared`
- `trip:completed`

---

## 14. Deployment Strategy

- **Frontend:** Vercel (Root directory: `apps/web`)
- **Backend:** Render or Railway (Root directory: `apps/server`)
- **Database:** Supabase PostgreSQL

---

## 15. Future AI/ML Extension

This MVP foundation is architected to easily connect an AI intelligence layer:
1. **Traffic Congestion Prediction:** ML model trained on historical junction delay data to dynamically re-route emergency vehicles around gridlock.
2. **Dynamic Priority Queueing:** Multi-vehicle priority scoring based on medical severity (e.g. cardiac arrest vs non-critical transport).

## Supabase / Persistent Mode

The server now supports two persistence modes:

- **DEMO MODE** — no Supabase service credentials; uses the existing in-memory demo store.
- **DATABASE CONNECTED** — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are configured; Supabase PostgreSQL becomes the source of truth.

### Setup

1. Create a Supabase project.
2. Run `database/schema.sql` in the Supabase SQL Editor.
3. Run `database/seed.sql`.
4. Add the Supabase URL, anon key, and service-role key to the root `.env`.
5. Create the demo Auth users with:

```bash
npm --prefix apps/server run seed:auth
```

The demo Auth password is `Password123!`. These are development-only accounts.

6. Start the application:

```bash
npm run dev
```

The backend `/api/health` endpoint reports whether the application is using `DEMO MODE` or `DATABASE CONNECTED`.

### Authentication

When Supabase is connected, `/api/auth/login` authenticates through Supabase Auth and returns a Supabase access token. Protected REST endpoints validate the bearer token and enforce application roles server-side.

The browser stores only the session access token and application user profile in local storage for this college prototype. The service-role key must remain server-side and must never be exposed to the Next.js client.
