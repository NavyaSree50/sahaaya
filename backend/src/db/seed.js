const { db, initDb } = require('./database');
const { calculateTriageScore } = require('../services/triageEngine');

function seedDatabase() {
  initDb();

  console.log('🌱 Seeding Sahaaya Database with realistic initial data...');

  // 1. Seed Volunteers
  const volunteers = [
    {
      id: 'vol-1',
      name: 'Priya Sharma',
      email: 'priya.nss@annauniv.edu',
      phone: '+91 98401 23456',
      nss_unit: 'Unit-04',
      college: 'College of Engineering, Guindy (Anna Univ)',
      district: 'Chennai',
      state: 'Tamil Nadu',
      badge_id: 'NSS-TN-CHN-0402',
      is_active: 1,
      active_cases_count: 1,
      resolved_cases_count: 14
    },
    {
      id: 'vol-2',
      name: 'Aarav Patel',
      email: 'aarav.nss@bmsce.ac.in',
      phone: '+91 98802 34567',
      nss_unit: 'Unit-12',
      college: 'BMS College of Engineering',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      badge_id: 'NSS-KA-BLR-1209',
      is_active: 1,
      active_cases_count: 0,
      resolved_cases_count: 22
    },
    {
      id: 'vol-3',
      name: 'Kavita Nair',
      email: 'kavita.nss@cusat.ac.in',
      phone: '+91 94473 45678',
      nss_unit: 'Unit-07',
      college: 'Cochin University of Science & Tech',
      district: 'Ernakulam',
      state: 'Kerala',
      badge_id: 'NSS-KL-ERN-0715',
      is_active: 1,
      active_cases_count: 0,
      resolved_cases_count: 19
    },
    {
      id: 'vol-4',
      name: 'Rohan Deshmukh',
      email: 'rohan.nss@coep.ac.in',
      phone: '+91 97654 56789',
      nss_unit: 'Unit-02',
      college: 'COEP Technological University',
      district: 'Pune',
      state: 'Maharashtra',
      badge_id: 'NSS-MH-PUN-0231',
      is_active: 1,
      active_cases_count: 0,
      resolved_cases_count: 9
    }
  ];

  const insertVolunteer = db.prepare(`
    INSERT OR REPLACE INTO volunteers 
    (id, name, email, phone, nss_unit, college, district, state, badge_id, is_active, active_cases_count, resolved_cases_count)
    VALUES (@id, @name, @email, @phone, @nss_unit, @college, @district, @state, @badge_id, @is_active, @active_cases_count, @resolved_cases_count)
  `);

  volunteers.forEach(v => insertVolunteer.run(v));

  // 2. Seed Emergency Response Agencies
  const agencies = [
    {
      id: 'agn-1',
      name: 'NDRF 04 Battalion (Arakkonam/Regional Rescue)',
      category: 'NDRF',
      district: 'Chennai',
      state: 'Tamil Nadu',
      primary_phone: '1070',
      alternate_phone: '044-28414520',
      control_room_email: 'ndrf04.control@nic.in',
      coverage_radius_km: 120.0,
      is_available: 1
    },
    {
      id: 'agn-2',
      name: '108 GVK-EMRI State Emergency Ambulance Service',
      category: 'AMBULANCE_108',
      district: 'Statewide Hub',
      state: 'All Regions',
      primary_phone: '108',
      alternate_phone: '112',
      control_room_email: 'dispatch@108emri.in',
      coverage_radius_km: 50.0,
      is_available: 1
    },
    {
      id: 'agn-3',
      name: 'Tamil Nadu Fire & Rescue Services Control Room',
      category: 'FIRE',
      district: 'Chennai Central',
      state: 'Tamil Nadu',
      primary_phone: '101',
      alternate_phone: '044-28554444',
      control_room_email: 'tnfrs.control@tn.gov.in',
      coverage_radius_km: 25.0,
      is_available: 1
    },
    {
      id: 'agn-4',
      name: 'National Emergency Response Centre (ERSS - 112)',
      category: 'POLICE',
      district: 'Unified Command',
      state: 'National',
      primary_phone: '112',
      alternate_phone: '100',
      control_room_email: 'erss.dispatch@mha.gov.in',
      coverage_radius_km: 200.0,
      is_available: 1
    },
    {
      id: 'agn-5',
      name: 'District Disaster Management Authority (DDMA)',
      category: 'DISASTER_MGMT',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      primary_phone: '1077',
      alternate_phone: '080-22975555',
      control_room_email: 'ddma.blr@karnataka.gov.in',
      coverage_radius_km: 60.0,
      is_available: 1
    },
    {
      id: 'agn-6',
      name: 'Karnataka State Fire & Emergency Services Hub',
      category: 'FIRE',
      district: 'Bengaluru',
      state: 'Karnataka',
      primary_phone: '101',
      alternate_phone: '080-22971500',
      control_room_email: 'ksfes.blr@gov.in',
      coverage_radius_km: 35.0,
      is_available: 1
    }
  ];

  const insertAgency = db.prepare(`
    INSERT OR REPLACE INTO emergency_agencies 
    (id, name, category, district, state, primary_phone, alternate_phone, control_room_email, coverage_radius_km, is_available)
    VALUES (@id, @name, @category, @district, @state, @primary_phone, @alternate_phone, @control_room_email, @coverage_radius_km, @is_available)
  `);

  agencies.forEach(a => insertAgency.run(a));

  // 3. Seed Realistic Incidents
  const now = new Date();
  const pastMinutes = (m) => new Date(now.getTime() - m * 60 * 1000).toISOString();

  const incidents = [
    {
      id: 'inc-101',
      tracking_code: 'SHY-7821',
      emergency_type: 'FLOOD',
      victim_name: 'Sundar Raman',
      victim_phone: '+91 94441 55678',
      alternate_phone: '+91 98410 88990',
      people_count: 4,
      vulnerable_tags: JSON.stringify(['ELDERLY', 'INFANT']),
      required_resources: JSON.stringify(['EVACUATION_BOAT', 'OXYGEN_SUPPORT', 'DRINKING_WATER']),
      description: 'Water level entered ground floor, reaching 4.5 feet high. Power cut since morning. 82-year-old grandmother requires oxygen concentrator support, 8-month infant present. Trapped on rooftop terrace.',
      latitude: 12.9815,
      longitude: 80.2180,
      address: 'Plot 42, 3rd Cross Street, AGS Colony, Velachery',
      landmark: 'Near Velachery MRTS Station and Grand Square Mall',
      status: 'ASSISTANCE_DISPATCHED',
      assigned_volunteer_id: 'vol-1',
      dispatched_agency_id: 'agn-1',
      dispatched_agency_name: 'NDRF 04 Battalion & State SDRF Boat Unit #3',
      dispatched_agency_phone: '1070 / 044-28414520',
      eta_minutes: 15,
      coordinator_notes: 'Spoke with Sundar at 19:15. Family is safe on terrace. Confirmed 4 individuals (2 adults, 1 infant, 1 senior). Transferred GPS coordinates and urgent power/boat requirements to NDRF Control Room. Inflatable Gemini boat en route from Arakkonam staging post.',
      verification_details: JSON.stringify({
        waterLevelRising: true,
        immediateShelterSafe: true,
        medicalEmergencyPresent: true,
        contactVerified: true
      }),
      created_at: pastMinutes(35),
      verified_at: pastMinutes(28),
      dispatched_at: pastMinutes(14),
      updated_at: pastMinutes(14)
    },
    {
      id: 'inc-102',
      tracking_code: 'SHY-3490',
      emergency_type: 'FIRE',
      victim_name: 'Meera Krishnan',
      victim_phone: '+91 99012 33445',
      alternate_phone: '+91 80255 12345',
      people_count: 5,
      vulnerable_tags: JSON.stringify(['INJURED']),
      required_resources: JSON.stringify(['FIRE_TENDER', 'AMBULANCE', 'SMOKE_MASKS']),
      description: 'Dense electrical fire and smoke originating from basement server room spreading to 2nd floor staircase. 5 office staff trapped in back corner balcony, stairs impassable due to smoke.',
      latitude: 12.9352,
      longitude: 77.6245,
      address: 'Tech Plaza, 4th Block, 80 Feet Road, Koramangala',
      landmark: 'Opposite Sony World Signal',
      status: 'VERIFIED',
      assigned_volunteer_id: 'vol-2',
      dispatched_agency_id: null,
      dispatched_agency_name: null,
      dispatched_agency_phone: null,
      eta_minutes: null,
      coordinator_notes: 'Contacted Meera. Instructed group to seal door cracks with damp towels and stay low on the open balcony away from the internal stairwell. Contacting Koramangala Fire Brigade Station #4.',
      verification_details: JSON.stringify({
        smokeInhalationRisk: true,
        fireEscapesBlocked: true,
        contactVerified: true
      }),
      created_at: pastMinutes(18),
      verified_at: pastMinutes(8),
      dispatched_at: null,
      updated_at: pastMinutes(8)
    },
    {
      id: 'inc-103',
      tracking_code: 'SHY-9104',
      emergency_type: 'ROAD_ACCIDENT',
      victim_name: 'Anand Verma',
      victim_phone: '+91 98230 77112',
      alternate_phone: null,
      people_count: 3,
      vulnerable_tags: JSON.stringify(['INJURED', 'IMMOBILE']),
      required_resources: JSON.stringify(['ALS_AMBULANCE', 'HYDRAULIC_CUTTER', 'HIGHWAY_POLICE']),
      description: 'Major collision between passenger car and commercial truck on highway bypass. Driver door jammed, passenger has severe leg fracture and active bleeding. Needs immediate extrication and trauma ambulance.',
      latitude: 18.5204,
      longitude: 73.8567,
      address: 'NH-48 Katraj Bypass, KM Marker 32',
      landmark: 'Near Navale Bridge Junction',
      status: 'REPORTED',
      assigned_volunteer_id: null,
      dispatched_agency_id: null,
      dispatched_agency_name: null,
      dispatched_agency_phone: null,
      eta_minutes: null,
      coordinator_notes: null,
      verification_details: null,
      created_at: pastMinutes(6),
      verified_at: null,
      dispatched_at: null,
      updated_at: pastMinutes(6)
    },
    {
      id: 'inc-104',
      tracking_code: 'SHY-1158',
      emergency_type: 'MEDICAL',
      victim_name: 'Deepak Sen',
      victim_phone: '+91 97060 44556',
      alternate_phone: '+91 94350 11223',
      people_count: 1,
      vulnerable_tags: JSON.stringify(['ELDERLY', 'OXYGEN_DEPENDENT']),
      required_resources: JSON.stringify(['ALS_AMBULANCE', 'PORTABLE_OXYGEN']),
      description: 'Acute shortness of breath and chest pressure in 74-year-old patient with prior cardiac history. SpO2 dropped below 84%. Pulse rapid. Immediate paramedic ambulance needed.',
      latitude: 26.1445,
      longitude: 91.7362,
      address: 'House 18, Bye Lane 3, Rajgarh Road, Guwahati',
      landmark: 'Behind Commerce College',
      status: 'HELP_REACHED',
      assigned_volunteer_id: 'vol-3',
      dispatched_agency_id: 'agn-2',
      dispatched_agency_name: '108 Emergency Ambulance Unit #14',
      dispatched_agency_phone: '108',
      eta_minutes: 0,
      coordinator_notes: '108 ALS Ambulance reached site at 19:35. Paramedics administered high-flow oxygen and stabilized patient. Transferring to GMCH Trauma ICU. Case marked successfully resolved.',
      verification_details: JSON.stringify({
        chestPainConfirmed: true,
        patientConscious: true,
        contactVerified: true
      }),
      created_at: pastMinutes(65),
      verified_at: pastMinutes(58),
      dispatched_at: pastMinutes(45),
      resolved_at: pastMinutes(5),
      updated_at: pastMinutes(5)
    }
  ];

  const insertIncident = db.prepare(`
    INSERT OR REPLACE INTO incidents 
    (id, tracking_code, emergency_type, urgency_score, priority_band, status, 
     victim_name, victim_phone, alternate_phone, people_count, vulnerable_tags, required_resources,
     description, latitude, longitude, address, landmark, assigned_volunteer_id,
     dispatched_agency_id, dispatched_agency_name, dispatched_agency_phone, eta_minutes,
     coordinator_notes, verification_details, created_at, verified_at, dispatched_at, resolved_at, updated_at)
    VALUES 
    (@id, @tracking_code, @emergency_type, @urgency_score, @priority_band, @status,
     @victim_name, @victim_phone, @alternate_phone, @people_count, @vulnerable_tags, @required_resources,
     @description, @latitude, @longitude, @address, @landmark, @assigned_volunteer_id,
     @dispatched_agency_id, @dispatched_agency_name, @dispatched_agency_phone, @eta_minutes,
     @coordinator_notes, @verification_details, @created_at, @verified_at, @dispatched_at, @resolved_at, @updated_at)
  `);

  incidents.forEach(inc => {
    const { urgencyScore, priorityBand } = calculateTriageScore({
      emergencyType: inc.emergency_type,
      peopleCount: inc.people_count,
      vulnerableTags: JSON.parse(inc.vulnerable_tags || '[]'),
      createdAt: inc.created_at
    });

    const item = {
      id: inc.id,
      tracking_code: inc.tracking_code,
      emergency_type: inc.emergency_type,
      urgency_score: urgencyScore,
      priority_band: priorityBand,
      status: inc.status,
      victim_name: inc.victim_name,
      victim_phone: inc.victim_phone,
      alternate_phone: inc.alternate_phone || null,
      people_count: inc.people_count || 1,
      vulnerable_tags: inc.vulnerable_tags || '[]',
      required_resources: inc.required_resources || '[]',
      description: inc.description || '',
      latitude: inc.latitude,
      longitude: inc.longitude,
      address: inc.address,
      landmark: inc.landmark || null,
      assigned_volunteer_id: inc.assigned_volunteer_id || null,
      dispatched_agency_id: inc.dispatched_agency_id || null,
      dispatched_agency_name: inc.dispatched_agency_name || null,
      dispatched_agency_phone: inc.dispatched_agency_phone || null,
      eta_minutes: inc.eta_minutes || null,
      coordinator_notes: inc.coordinator_notes || null,
      verification_details: inc.verification_details || null,
      created_at: inc.created_at || new Date().toISOString(),
      verified_at: inc.verified_at || null,
      dispatched_at: inc.dispatched_at || null,
      resolved_at: inc.resolved_at || null,
      updated_at: inc.updated_at || new Date().toISOString()
    };

    insertIncident.run(item);
  });

  // 4. Seed Incident Logs
  const insertLog = db.prepare(`
    INSERT OR REPLACE INTO incident_logs (id, incident_id, actor_type, actor_name, action, notes, created_at)
    VALUES (@id, @incident_id, @actor_type, @actor_name, @action, @notes, @created_at)
  `);

  const logs = [
    {
      id: 'log-1',
      incident_id: 'inc-101',
      actor_type: 'CITIZEN',
      actor_name: 'Sundar Raman',
      action: 'SOS_CREATED',
      notes: 'Distress request submitted with GPS coordinates and headcount.',
      created_at: pastMinutes(35)
    },
    {
      id: 'log-2',
      incident_id: 'inc-101',
      actor_type: 'VOLUNTEER',
      actor_name: 'Priya Sharma (NSS Unit-04)',
      action: 'VOLUNTEER_ASSIGNED',
      notes: 'Digital Coordinator Priya Sharma claimed incident coordination.',
      created_at: pastMinutes(32)
    },
    {
      id: 'log-3',
      incident_id: 'inc-101',
      actor_type: 'VOLUNTEER',
      actor_name: 'Priya Sharma (NSS Unit-04)',
      action: 'VERIFIED',
      notes: 'Telephone verification complete. Water at 4.5 ft. Roof safe. Infant & senior confirmed.',
      created_at: pastMinutes(28)
    },
    {
      id: 'log-4',
      incident_id: 'inc-101',
      actor_type: 'VOLUNTEER',
      actor_name: 'Priya Sharma (NSS Unit-04)',
      action: 'DISPATCH_INITIATED',
      notes: 'NDRF 04 Battalion & SDRF Boat Unit #3 officially contacted and dispatched. ETA 15 mins.',
      created_at: pastMinutes(14)
    },
    {
      id: 'log-5',
      incident_id: 'inc-102',
      actor_type: 'CITIZEN',
      actor_name: 'Meera Krishnan',
      action: 'SOS_CREATED',
      notes: 'Fire distress report submitted.',
      created_at: pastMinutes(18)
    },
    {
      id: 'log-6',
      incident_id: 'inc-102',
      actor_type: 'VOLUNTEER',
      actor_name: 'Aarav Patel (NSS Unit-12)',
      action: 'VERIFIED',
      notes: 'Verified situation. Group advised to remain on external balcony. Calling Koramangala Fire Station.',
      created_at: pastMinutes(8)
    },
    {
      id: 'log-7',
      incident_id: 'inc-103',
      actor_type: 'CITIZEN',
      actor_name: 'Anand Verma',
      action: 'SOS_CREATED',
      notes: 'Highway collision reported. Extrication requested.',
      created_at: pastMinutes(6)
    },
    {
      id: 'log-8',
      incident_id: 'inc-104',
      actor_type: 'VOLUNTEER',
      actor_name: 'Kavita Nair (NSS Unit-07)',
      action: 'HELP_CONFIRMED',
      notes: 'Ambulance team confirmed on site. Patient stabilized with O2 and in transit to GMCH.',
      created_at: pastMinutes(5)
    }
  ];

  logs.forEach(l => insertLog.run(l));

  // 5. Seed In-App Messages
  const insertMessage = db.prepare(`
    INSERT OR REPLACE INTO messages (id, incident_id, sender_type, sender_name, message, created_at)
    VALUES (@id, @incident_id, @sender_type, @sender_name, @message, @created_at)
  `);

  const messages = [
    {
      id: 'msg-1',
      incident_id: 'inc-101',
      sender_type: 'SYSTEM',
      sender_name: 'Sahaaya Alert',
      message: 'Your SOS request has been received. NSS Digital Coordinator Priya Sharma has been assigned to your case.',
      created_at: pastMinutes(32)
    },
    {
      id: 'msg-2',
      incident_id: 'inc-101',
      sender_type: 'VOLUNTEER',
      sender_name: 'Priya Sharma (NSS)',
      message: 'Hello Sundar, I am Priya, your NSS Digital Coordinator. I have contacted the NDRF rescue post at Velachery. Please keep everyone on the roof and conserve phone battery. Rescue boat is on the way!',
      created_at: pastMinutes(20)
    },
    {
      id: 'msg-3',
      incident_id: 'inc-101',
      sender_type: 'CITIZEN',
      sender_name: 'Sundar Raman',
      message: 'Thank you Priya! We can hear sirens in the main avenue. We are keeping a white cloth waving from the terrace.',
      created_at: pastMinutes(10)
    }
  ];

  messages.forEach(m => insertMessage.run(m));

  console.log('✅ Seed data successfully populated!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
