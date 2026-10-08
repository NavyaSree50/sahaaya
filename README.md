# Sahaaya — Digital Community Emergency Coordination Platform

> **Core Motto:** *“Volunteer safety comes before volunteer service.”*

Sahaaya is a full-stack digital community emergency coordination platform bridging citizens in distress, registered NSS (National Service Scheme) student volunteers acting as **Digital Emergency Coordinators**, and authorized public emergency services (Police, Fire, 108/Ambulance, NDRF/SDRF, Disaster Management).

---

## 🚨 The Problem

During natural disasters (floods, cyclones), fires, road crashes, or medical crises:
1. Affected citizens often panic, lack direct access to the right nodal emergency control room, or cannot communicate their exact GPS coordinates and situation accurately.
2. Willing volunteers (such as college NSS volunteers) often attempt to enter dangerous disaster zones without protective gear, risking their lives.

---

## 🛡️ The Solution: Sahaaya

Sahaaya establishes a **remote coordination bridge**:
- **Citizens** request urgent help in 1 tap, transmitting their GPS location, disaster type, headcount, and specific vulnerabilities.
- **NSS Volunteers** act strictly as **Digital Emergency Coordinators**. Operating safely from a remote location, they verify the distress call, generate structured emergency dispatch briefs, contact the authorized emergency services (112, 108, Fire, NDRF), and guide the victim with life-saving survival instructions while tracking the rescue until help reaches the scene.

### Key Lifecycle Pipeline:
$$\text{Reported} \longrightarrow \text{Verified} \longrightarrow \text{Assistance on the Way} \longrightarrow \text{Help Reached}$$

---

## 🌟 Key Features

### 1. Citizen / Victim Portal
- **1-Tap Emergency SOS**: Auto-detects GPS coordinates with high accuracy and reverse geocoding fallback.
- **Disaster Categorization**: Flood & Inundation, Fire Outbreak, Medical Emergency, Road Crash, Structural Collapse, Women Safety, Other.
- **High-Risk Vulnerability Flags**: Infants, Elderly (60+), Pregnant Mothers, Injured / Active Bleeding, Immobile / Bedridden, Oxygen-dependent.
- **1-Click Demo Scenarios**: Instant simulation buttons for testing Velachery Flood or Building Fire without typing.
- **Live Lifecycle Progress Tracker**: Visual stepper showing real-time updates without page reload.
- **Assigned Coordinator Card**: Direct view of who is coordinating your case, their NSS unit, and contact phone.
- **Tailored Survival Guidelines**: Instant DOs and DON'Ts (e.g. electrical shutoff in floods, crawling low under smoke in fires) to keep victims safe while awaiting responders.
- **Emergency Speed Dial**: Direct 1-tap call to 112, 108, 101, 1070.

### 2. NSS Volunteer Digital Coordinator Portal
- **Safety Protocol Banner**: Unmissable reminders enforcing remote digital coordination only.
- **Volunteer Profile Switcher**: Easily test as Priya Sharma (Anna Univ), Aarav Patel (BMSCE), Kavita Nair (CUSAT), or Rohan Deshmukh (COEP).
- **Automated Urgency Triage Engine**: Scores incidents 1–100 based on hazard type, trapped headcount, vulnerabilities, and elapsed time.
- **Interactive Leaflet Map**: Displays the victim's exact GPS coordinates with a 450m circular danger zone buffer.
- **Step-by-Step Coordination Workbench**:
  1. **Telephone Verification**: In-app checklist to confirm victim situation authenticity and assess hazard level.
  2. **Authorized Emergency Dispatch (The Bridge)**: Select authorized agency (NDRF, 108 Ambulance, Fire Service, 112 Police) with pre-generated structured briefing for SMS/WhatsApp/Email and estimated arrival time (ETA).
  3. **Track & Confirm**: In-app chat with the victim and final confirmation when help reaches the site.

### 3. Authority & Admin Command Center
- **National Geospatial Incident Map**: Interactive map plotting emergency clusters across India.
- **Disaster KPIs**: Total SOS logged, active ongoing cases, people rescued, average triage latency.
- **Pipeline Breakdown**: Visual distribution of disaster types and status progressions.
- **Audit Log & CSV Export**: Export comprehensive incident reports for disaster management after-action reviews.

### 4. Emergency Directory & Knowledge Hub
- 24x7 verified national toll-free helplines (112, 108, 101, 100, 1070, 1077, 1091, 1098).
- Emergency guidelines and first-aid protocols.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Leaflet & React-Leaflet.
- **Backend**: Node.js, Express, Socket.IO (for real-time live triage alerts and tracking updates).
- **Database**: SQLite (`better-sqlite3`) with WAL mode for concurrency and zero-configuration local persistence.
- **Real-Time Engine**: WebSocket events for live SOS alerts, status transitions, and coordinator-victim chat.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Start the Backend Server
```bash
cd backend
npm install
node src/server.js
```
*Backend runs on `http://localhost:5000`*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📁 Project Structure

```
sahaaya/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js          # SQLite connection & WAL mode
│   │   │   ├── schema.sql           # Schema: incidents, volunteers, agencies, logs, messages
│   │   │   └── seed.js              # Pre-seeded realistic emergency scenarios & NSS volunteers
│   │   ├── routes/
│   │   │   ├── incidents.js         # SOS creation, verification, dispatch, and tracking API
│   │   │   ├── volunteers.js        # Volunteer profiles & active status
│   │   │   ├── agencies.js          # Emergency response units directory
│   │   │   └── analytics.js         # Command telemetry & KPI metrics
│   │   ├── services/
│   │   │   ├── triageEngine.js      # Algorithmic urgency score calculation (1-100)
│   │   │   └── dispatchFormatter.js # Pre-formatted structured dispatch brief generator
│   │   ├── sockets/
│   │   │   └── socketHandler.js     # Real-time WebSocket event broadcaster
│   │   └── server.js                # Express & Socket.IO server entry point
│   ├── package.json
│   └── sahaaya.sqlite               # Local database file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Global navigation with helpline tickers
│   │   │   ├── EmergencyMap.jsx     # Interactive Leaflet map with hazard zones
│   │   │   ├── StatusBadge.jsx      # Color-coded status & urgency badges
│   │   │   ├── SafetyBanner.jsx     # "Volunteer safety comes before volunteer service"
│   │   │   └── DispatchModal.jsx    # Emergency agency dispatch assistant
│   │   ├── context/
│   │   │   └── SocketContext.jsx    # WebSocket provider & audio alert tone
│   │   ├── pages/
│   │   │   ├── CitizenSOS.jsx       # 1-Tap SOS with GPS auto-detection
│   │   │   ├── CitizenTrack.jsx     # 4-stage live tracking & coordinator chat
│   │   │   ├── VolunteerDashboard.jsx # Triage queue & coordinator portal
│   │   │   ├── VolunteerWorkbench.jsx # Incident verification & dispatch workbench
│   │   │   ├── AdminAnalytics.jsx   # Geospatial map & command telemetry
│   │   │   └── EmergencyDirectory.jsx # Public helpline directory & guides
│   │   ├── utils/
│   │   │   ├── api.js               # REST API client
│   │   │   └── emergencyAdvice.js   # Tailored survival rules
│   │   ├── App.jsx                  # Main tab router & notification banners
│   │   ├── main.jsx
│   │   └── index.css                # Tailwind CSS v4 & Leaflet styling
│   ├── package.json
│   └── vite.config.js
├── package.json                     # Root scripts
└── README.md
```
