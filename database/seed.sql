-- Seed Data for Intelligent Emergency Corridor Management System
-- Pune Emergency Route Demo Scenario

-- 1. Users
INSERT INTO users (id, name, email, phone, role) VALUES
('usr_operator_1', 'Demo Operator (Ambulance)', 'demo-emergency@example.com', '+91-9876543210', 'EMERGENCY_OPERATOR'),
('usr_control_1', 'Control Room Specialist', 'demo-control@example.com', '+91-9876543211', 'CONTROL_ROOM'),
('usr_officer_swargate', 'Inspector Ramesh (Swargate)', 'officer-swargate@example.com', '+91-9876543212', 'TRAFFIC_OFFICER'),
('usr_officer_sevenloves', 'Officer Suresh (Seven Loves)', 'demo-officer@example.com', '+91-9876543213', 'TRAFFIC_OFFICER'),
('usr_officer_station', 'Officer Priya (Station Chowk)', 'officer-station@example.com', '+91-9876543214', 'TRAFFIC_OFFICER'),
('usr_officer_bundgarden', 'Officer Amit (Bund Garden)', 'officer-bundgarden@example.com', '+91-9876543215', 'TRAFFIC_OFFICER'),
('usr_officer_rubyhall', 'Officer Deepa (Ruby Hall)', 'officer-rubyhall@example.com', '+91-9876543216', 'TRAFFIC_OFFICER'),
('usr_admin_1', 'System Administrator', 'demo-admin@example.com', '+91-9876543217', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

-- 2. Junctions (Pune Corridor: Swargate -> Seven Loves -> Station Chowk -> Bund Garden -> Ruby Hall)
INSERT INTO junctions (id, name, latitude, longitude, area, status) VALUES
('jnc_swargate', 'Swargate Junction', 18.5018, 73.8636, 'Swargate', 'IDLE'),
('jnc_sevenloves', 'Seven Loves Chowk', 18.5085, 73.8688, 'Ghorpade Peth', 'IDLE'),
('jnc_station', 'Pune Station Chowk', 18.5284, 73.8741, 'Pune Station', 'IDLE'),
('jnc_bundgarden', 'Bund Garden Road Junction', 18.5360, 73.8785, 'Bund Garden', 'IDLE'),
('jnc_rubyhall', 'Ruby Hall Clinic Gate Junction', 18.5395, 73.8820, 'Sangamvadi', 'IDLE')
ON CONFLICT (id) DO NOTHING;

-- 3. Emergency Vehicle
INSERT INTO emergency_vehicles (id, vehicle_number, vehicle_type, operator_id, status, current_latitude, current_longitude, destination) VALUES
('veh_amb_042', 'MH-12-AMB-042', 'AMBULANCE', 'usr_operator_1', 'IDLE', 18.5018, 73.8636, 'Ruby Hall Clinic, Pune')
ON CONFLICT (id) DO NOTHING;

-- 4. Traffic Officers Assignment
INSERT INTO traffic_officers (id, user_id, assigned_junction_id, availability_status) VALUES
('off_1', 'usr_officer_swargate', 'jnc_swargate', 'ON_DUTY'),
('off_2', 'usr_officer_sevenloves', 'jnc_sevenloves', 'ON_DUTY'),
('off_3', 'usr_officer_station', 'jnc_station', 'ON_DUTY'),
('off_4', 'usr_officer_bundgarden', 'jnc_bundgarden', 'ON_DUTY'),
('off_5', 'usr_officer_rubyhall', 'jnc_rubyhall', 'ON_DUTY')
ON CONFLICT (id) DO NOTHING;
