-- Intelligent Emergency Corridor Management System
-- Database Schema for PostgreSQL / Supabase

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if re-initialising
DROP TABLE IF EXISTS corridor_events CASCADE;
DROP TABLE IF EXISTS traffic_officers CASCADE;
DROP TABLE IF EXISTS emergency_trips CASCADE;
DROP TABLE IF EXISTS emergency_vehicles CASCADE;
DROP TABLE IF EXISTS junctions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Links application profile to the corresponding Supabase Auth user by UUID.
    auth_user_id UUID UNIQUE,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'EMERGENCY_OPERATOR', 'CONTROL_ROOM', 'TRAFFIC_OFFICER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Junctions Table
CREATE TABLE junctions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    area VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'PENDING', 'ALERTED', 'ACKNOWLEDGED', 'CLEARED', 'PASSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Emergency Vehicles Table
CREATE TABLE emergency_vehicles (
    id VARCHAR(64) PRIMARY KEY,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('AMBULANCE', 'FIRE_BRIGADE', 'POLICE', 'NDRF')),
    operator_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'EMERGENCY_ACTIVE', 'COMPLETED')),
    current_latitude DOUBLE PRECISION NOT NULL,
    current_longitude DOUBLE PRECISION NOT NULL,
    destination VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Traffic Officers Table
CREATE TABLE traffic_officers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_junction_id VARCHAR(64) REFERENCES junctions(id) ON DELETE SET NULL,
    availability_status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'ON_DUTY', 'BUSY', 'OFFLINE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Emergency Trips Table
CREATE TABLE emergency_trips (
    id VARCHAR(64) PRIMARY KEY,
    vehicle_id VARCHAR(64) NOT NULL REFERENCES emergency_vehicles(id) ON DELETE CASCADE,
    destination VARCHAR(255) NOT NULL,
    destination_latitude DOUBLE PRECISION,
    destination_longitude DOUBLE PRECISION,
    route_geometry JSONB, -- Stored geojson or coordinate array
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    eta INTEGER NOT NULL DEFAULT 0, -- ETA in seconds
    distance_remaining DOUBLE PRECISION NOT NULL DEFAULT 0.0 -- in kilometers
);

-- 6. Corridor Events Table
CREATE TABLE corridor_events (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) REFERENCES emergency_trips(id) ON DELETE CASCADE,
    junction_id VARCHAR(64) REFERENCES junctions(id) ON DELETE SET NULL,
    officer_id VARCHAR(64) REFERENCES traffic_officers(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('EMERGENCY_ACTIVATED', 'VEHICLE_LOCATION_UPDATED', 'JUNCTION_ALERTED', 'JUNCTION_ACKNOWLEDGED', 'JUNCTION_CLEARED', 'JUNCTION_PASSED', 'TRIP_COMPLETED')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes for high-performance querying
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_vehicles_status ON emergency_vehicles(status);
CREATE INDEX idx_trips_vehicle_status ON emergency_trips(vehicle_id, status);
CREATE INDEX idx_officers_junction ON traffic_officers(assigned_junction_id);
CREATE INDEX idx_corridor_events_trip ON corridor_events(trip_id);
