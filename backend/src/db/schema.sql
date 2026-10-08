-- Sahaaya Emergency Coordination Database Schema

CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  nss_unit TEXT NOT NULL,
  college TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  badge_id TEXT UNIQUE NOT NULL,
  is_active INTEGER DEFAULT 1,
  active_cases_count INTEGER DEFAULT 0,
  resolved_cases_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_agencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- POLICE, FIRE, AMBULANCE_108, NDRF, SDRF, DISASTER_MGMT, HOSPITAL
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  primary_phone TEXT NOT NULL,
  alternate_phone TEXT,
  control_room_email TEXT,
  coverage_radius_km REAL DEFAULT 30.0,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL, -- e.g. SHY-8421
  emergency_type TEXT NOT NULL, -- FLOOD, FIRE, MEDICAL, ROAD_ACCIDENT, BUILDING_COLLAPSE, WOMEN_SAFETY, OTHER
  urgency_score INTEGER DEFAULT 50, -- 1-100 calculated
  priority_band TEXT DEFAULT 'HIGH', -- CRITICAL, HIGH, MEDIUM, LOW
  status TEXT DEFAULT 'REPORTED', -- REPORTED, VERIFIED, ASSISTANCE_DISPATCHED, HELP_REACHED, CLOSED
  victim_name TEXT NOT NULL,
  victim_phone TEXT NOT NULL,
  alternate_phone TEXT,
  people_count INTEGER DEFAULT 1,
  vulnerable_tags TEXT, -- JSON array string e.g. ["ELDERLY", "INFANT", "INJURED"]
  required_resources TEXT, -- e.g. ["EVACUATION_BOAT", "OXYGEN", "FIRST_AID"]
  description TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address TEXT NOT NULL,
  landmark TEXT,
  assigned_volunteer_id TEXT,
  dispatched_agency_id TEXT,
  dispatched_agency_name TEXT,
  dispatched_agency_phone TEXT,
  eta_minutes INTEGER,
  coordinator_notes TEXT,
  verification_details TEXT, -- JSON string of verification questions answered
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  dispatched_at DATETIME,
  resolved_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_volunteer_id) REFERENCES volunteers (id),
  FOREIGN KEY (dispatched_agency_id) REFERENCES emergency_agencies (id)
);

CREATE TABLE IF NOT EXISTS incident_logs (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,
  actor_type TEXT NOT NULL, -- SYSTEM, CITIZEN, VOLUNTEER, AGENCY
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL, -- SOS_CREATED, VOLUNTEER_ASSIGNED, VERIFIED, DISPATCH_INITIATED, STATUS_UPDATED, HELP_CONFIRMED, NOTE_ADDED
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,
  sender_type TEXT NOT NULL, -- CITIZEN, VOLUNTEER, SYSTEM
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents (priority_band, urgency_score DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_tracking ON incidents (tracking_code);
CREATE INDEX IF NOT EXISTS idx_logs_incident ON incident_logs (incident_id);
CREATE INDEX IF NOT EXISTS idx_messages_incident ON messages (incident_id);
