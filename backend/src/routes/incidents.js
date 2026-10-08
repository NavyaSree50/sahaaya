const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db/database');
const { calculateTriageScore } = require('../services/triageEngine');
const { generateAgencyDispatchBrief } = require('../services/dispatchFormatter');

// Generate short human-readable tracking code: SHY-XXXX
function generateTrackingCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SHY-${num}`;
}

// 1. Citizen raises SOS
router.post('/sos', (req, res) => {
  try {
    const {
      emergencyType = 'OTHER',
      victimName,
      victimPhone,
      alternatePhone = null,
      peopleCount = 1,
      vulnerableTags = [],
      requiredResources = [],
      description = '',
      latitude,
      longitude,
      address,
      landmark = null
    } = req.body;

    if (!victimName || !victimPhone || !latitude || !longitude || !address) {
      return res.status(400).json({ error: 'Missing required fields: victimName, victimPhone, latitude, longitude, and address are mandatory.' });
    }

    const id = `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const trackingCode = generateTrackingCode();

    const { urgencyScore, priorityBand } = calculateTriageScore({
      emergencyType,
      peopleCount,
      vulnerableTags
    });

    const vulnerableJson = JSON.stringify(vulnerableTags);
    const resourcesJson = JSON.stringify(requiredResources);

    const insertStmt = db.prepare(`
      INSERT INTO incidents (
        id, tracking_code, emergency_type, urgency_score, priority_band, status,
        victim_name, victim_phone, alternate_phone, people_count, vulnerable_tags, required_resources,
        description, latitude, longitude, address, landmark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'REPORTED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    insertStmt.run(
      id,
      trackingCode,
      emergencyType,
      urgencyScore,
      priorityBand,
      victimName,
      victimPhone,
      alternatePhone,
      peopleCount,
      vulnerableJson,
      resourcesJson,
      description,
      parseFloat(latitude),
      parseFloat(longitude),
      address,
      landmark
    );

    // Add initial log
    const logId = `log-${Date.now()}`;
    db.prepare(`
      INSERT INTO incident_logs (id, incident_id, actor_type, actor_name, action, notes)
      VALUES (?, ?, 'CITIZEN', ?, 'SOS_CREATED', ?)
    `).run(
      logId,
      id,
      victimName,
      `Emergency distress request reported: ${emergencyType} with ${peopleCount} person(s).`
    );

    // Initial message
    db.prepare(`
      INSERT INTO messages (id, incident_id, sender_type, sender_name, message)
      VALUES (?, ?, 'SYSTEM', 'Sahaaya Emergency Desk', ?)
    `).run(
      `msg-${Date.now()}`,
      id,
      'Your SOS has been broadcast to NSS Digital Emergency Coordinators. Please stay calm. Do not move unless in immediate hazard.'
    );

    const createdIncident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);

    // Broadcast via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.to('room:coordinators').emit('sos:new', createdIncident);
      io.to('room:admin').emit('sos:new', createdIncident);
    }

    res.status(201).json({
      success: true,
      incident: createdIncident,
      trackingCode: createdIncident.tracking_code
    });
  } catch (err) {
    console.error('Error creating SOS incident:', err);
    res.status(500).json({ error: 'Failed to record emergency distress request' });
  }
});

// 2. List all incidents (for Volunteer Triage & Admin Dashboard)
router.get('/', (req, res) => {
  try {
    const { status, emergencyType, priority, search } = req.query;

    let query = `
      SELECT i.*, 
             v.name as volunteer_name, v.college as volunteer_college, v.nss_unit as volunteer_nss_unit, v.phone as volunteer_phone
      FROM incidents i
      LEFT JOIN volunteers v ON i.assigned_volunteer_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    if (emergencyType) {
      query += ' AND i.emergency_type = ?';
      params.push(emergencyType);
    }
    if (priority) {
      query += ' AND i.priority_band = ?';
      params.push(priority);
    }
    if (search) {
      query += ' AND (i.tracking_code LIKE ? OR i.victim_name LIKE ? OR i.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY i.urgency_score DESC, i.created_at DESC';

    const incidents = db.prepare(query).all(...params);
    res.json(incidents);
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ error: 'Failed to retrieve incidents' });
  }
});

// 3. Get single incident by ID or Tracking Code
router.get('/:codeOrId', (req, res) => {
  try {
    const { codeOrId } = req.params;
    const incident = db.prepare(`
      SELECT i.*, 
             v.name as volunteer_name, v.college as volunteer_college, v.nss_unit as volunteer_nss_unit, v.phone as volunteer_phone, v.badge_id as volunteer_badge_id
      FROM incidents i
      LEFT JOIN volunteers v ON i.assigned_volunteer_id = v.id
      WHERE i.id = ? OR i.tracking_code = ?
    `).get(codeOrId, codeOrId);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const logs = db.prepare(`
      SELECT * FROM incident_logs WHERE incident_id = ? ORDER BY created_at ASC
    `).all(incident.id);

    const messages = db.prepare(`
      SELECT * FROM messages WHERE incident_id = ? ORDER BY created_at ASC
    `).all(incident.id);

    res.json({
      ...incident,
      logs,
      messages
    });
  } catch (err) {
    console.error('Error fetching incident:', err);
    res.status(500).json({ error: 'Failed to retrieve incident details' });
  }
});

// 4. Assign Volunteer Coordinator
router.patch('/:id/assign', (req, res) => {
  try {
    const { id } = req.params;
    const { volunteerId } = req.body;

    const volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    db.prepare(`
      UPDATE incidents 
      SET assigned_volunteer_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(volunteerId, id);

    db.prepare(`
      UPDATE volunteers 
      SET active_cases_count = active_cases_count + 1 
      WHERE id = ?
    `).run(volunteerId);

    // Log action
    db.prepare(`
      INSERT INTO incident_logs (id, incident_id, actor_type, actor_name, action, notes)
      VALUES (?, ?, 'VOLUNTEER', ?, 'VOLUNTEER_ASSIGNED', ?)
    `).run(
      `log-${Date.now()}`,
      id,
      `${volunteer.name} (${volunteer.nss_unit})`,
      `Assigned as Digital Emergency Coordinator for remote verification and dispatch.`
    );

    // Post system message to victim
    db.prepare(`
      INSERT INTO messages (id, incident_id, sender_type, sender_name, message)
      VALUES (?, ?, 'SYSTEM', 'Sahaaya Alert', ?)
    `).run(
      `msg-${Date.now()}`,
      id,
      `NSS Volunteer ${volunteer.name} (${volunteer.college}) is now coordinating your emergency request remotely.`
    );

    const updated = db.prepare(`
      SELECT i.*, v.name as volunteer_name, v.college as volunteer_college, v.nss_unit as volunteer_nss_unit, v.phone as volunteer_phone
      FROM incidents i
      LEFT JOIN volunteers v ON i.assigned_volunteer_id = v.id
      WHERE i.id = ?
    `).get(id);

    const io = req.app.get('io');
    if (io) {
      io.to(`incident:${updated.tracking_code}`).emit('incident:update', updated);
      io.to('room:coordinators').emit('incident:update', updated);
    }

    res.json({ success: true, incident: updated });
  } catch (err) {
    console.error('Error assigning volunteer:', err);
    res.status(500).json({ error: 'Failed to assign coordinator' });
  }
});

// 5. Verify Incident (Reported -> Verified)
router.patch('/:id/verify', (req, res) => {
  try {
    const { id } = req.params;
    const { verificationDetails, coordinatorNotes, volunteerId } = req.body;

    const volunteer = volunteerId ? db.prepare('SELECT * FROM volunteers WHERE id = ?').get(volunteerId) : null;
    const volunteerName = volunteer ? `${volunteer.name} (${volunteer.nss_unit})` : 'Digital Coordinator';

    db.prepare(`
      UPDATE incidents 
      SET status = 'VERIFIED',
          verification_details = ?,
          coordinator_notes = ?,
          verified_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(verificationDetails || {}), coordinatorNotes || '', id);

    // Add Log
    db.prepare(`
      INSERT INTO incident_logs (id, incident_id, actor_type, actor_name, action, notes)
      VALUES (?, ?, 'VOLUNTEER', ?, 'VERIFIED', ?)
    `).run(
      `log-${Date.now()}`,
      id,
      volunteerName,
      `Situation verified. Assessment: ${coordinatorNotes || 'Distress confirmed authentic. Preparing authorized emergency dispatch.'}`
    );

    // Push system message
    db.prepare(`
      INSERT INTO messages (id, incident_id, sender_type, sender_name, message)
      VALUES (?, ?, 'SYSTEM', 'Sahaaya Desk', ?)
    `).run(
      `msg-${Date.now()}`,
      id,
      'Your situation has been verified by the coordinator. Official emergency services are now being contacted for immediate dispatch.'
    );

    const updated = db.prepare(`
      SELECT i.*, v.name as volunteer_name, v.college as volunteer_college, v.nss_unit as volunteer_nss_unit, v.phone as volunteer_phone
      FROM incidents i
      LEFT JOIN volunteers v ON i.assigned_volunteer_id = v.id
      WHERE i.id = ?
    `).get(id);

    const io = req.app.get('io');
    if (io) {
      io.to(`incident:${updated.tracking_code}`).emit('incident:update', updated);
      io.to('room:coordinators').emit('incident:update', updated);
    }

    res.json({ success: true, incident: updated });
  } catch (err) {
    console.error('Error verifying incident:', err);
    res.status(500).json({ error: 'Failed to verify incident' });
  }
});

// 6. Record Agency Dispatch (Verified -> Assistance on the Way)
router.post('/:id/dispatch', (req, res) => {
  try {
    const { id } = req.params;
    const { agencyId, agencyName, agencyPhone, etaMinutes, dispatchNotes, volunteerId } = req.body;

    const volunteer = volunteerId ? db.prepare('SELECT * FROM volunteers WHERE id = ?').get(volunteerId) : null;
    const volunteerName = volunteer ? `${volunteer.name} (${volunteer.nss_unit})` : 'Digital Coordinator';

    db.prepare(`
      UPDATE incidents 
      SET status = 'ASSISTANCE_DISPATCHED',
          dispatched_agency_id = ?,
          dispatched_agency_name = ?,
          dispatched_agency_phone = ?,
          eta_minutes = ?,
          coordinator_notes = CASE WHEN coordinator_notes IS NOT NULL THEN coordinator_notes || '\n[DISPATCH]: ' || ? ELSE ? END,
          dispatched_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(agencyId || null, agencyName, agencyPhone, etaMinutes || 15, dispatchNotes || '', dispatchNotes || '', id);

    // Log
    db.prepare(`
      INSERT INTO incident_logs (id, incident_id, actor_type, actor_name, action, notes)
      VALUES (?, ?, 'VOLUNTEER', ?, 'DISPATCH_INITIATED', ?)
    `).run(
      `log-${Date.now()}`,
      id,
      volunteerName,
      `Official assistance dispatched via ${agencyName} (${agencyPhone}). Estimated Arrival: ~${etaMinutes || 15} minutes.`
    );

    // In-app alert message
    db.prepare(`
      INSERT INTO messages (id, incident_id, sender_type, sender_name, message)
      VALUES (?, ?, 'SYSTEM', 'Sahaaya Dispatch Alert', ?)
    `).run(
      `msg-${Date.now()}`,
      id,
      `🚨 Official Assistance is ON THE WAY! Assigned unit: ${agencyName}. ETA: approximately ${etaMinutes || 15} mins. Keep phone lines free.`
    );

    const updated = db.prepare(`
      SELECT i.*, v.name as volunteer_name, v.college as volunteer_college, v.nss_unit as volunteer_nss_unit, v.phone as volunteer_phone
      FROM incidents i
      LEFT JOIN volunteers v ON i.assigned_volunteer_id = v.id
      WHERE i.id = ?
    `).get(id);

    const io = req.app.get('io');
    if (io) {
      io.to(`incident:${updated.tracking_code}`).emit('incident:update', updated);
      io.to('room:coordinators').emit('incident:update', updated);
    }

    res.json({ success: true, incident: updated });
  } catch (err) {
    console.error('Error recording agency dispatch:', err);
    res.status(500).json({ error: 'Failed to record agency dispatch' });
  }
});

// 7. Confirm Help Reached (Assistance on the Way -> Help Reached)
router.patch('/:id/help-reached', (req, res) => {
  try {
    const { id } = req.params;
    const { confirmationNotes, volunteerId } = req.body;

    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const volunteer = volunteerId ? db.prepare('SELECT * FROM volunteers WHERE id = ?').get(volunteerId) : null;
    const volunteerName = volunteer ? `${volunteer.name} (${volunteer.nss_unit})` : 'Digital Coordinator';

    db.prepare(`
      UPDATE incidents 
      SET status = 'HELP_REACHED',
          resolved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    if (incident.assigned_volunteer_id) {
      db.prepare(`
        UPDATE volunteers 
        SET resolved_cases_count = resolved_cases_count + 1,
            active_cases_count = MAX(0, active_cases_count - 1)
        WHERE id = ?
      `).run(incident.assigned_volunteer_id);
    }

    db.prepare(`
      INSERT INTO incident_logs (id, incident_id, actor_type, actor_name, action, notes)
      VALUES (?, ?, 'VOLUNTEER', ?, 'HELP_CONFIRMED', ?)
    `).run(
      `log-${Date.now()}`,
      id,
      volunteerName,
      confirmationNotes || 'Authorized rescue team arrived on-site and confirmed victim safety.'
    );

    db.prepare(`
      INSERT INTO messages (id, incident_id, sender_type, sender_name, message)
      VALUES (?, ?, 'SYSTEM', 'Sahaaya Desk', ?)
    `).run(
      `msg-${Date.now()}`,
      id,
      'Help has reached your location! Stay safe and follow rescue team directives.'
    );

    const updated = db.prepare(`
      SELECT i.*, v.name as volunteer_name, v.college as volunteer_college, v.nss_unit as volunteer_nss_unit, v.phone as volunteer_phone
      FROM incidents i
      LEFT JOIN volunteers v ON i.assigned_volunteer_id = v.id
      WHERE i.id = ?
    `).get(id);

    const io = req.app.get('io');
    if (io) {
      io.to(`incident:${updated.tracking_code}`).emit('incident:update', updated);
      io.to('room:coordinators').emit('incident:update', updated);
    }

    res.json({ success: true, incident: updated });
  } catch (err) {
    console.error('Error confirming help reached:', err);
    res.status(500).json({ error: 'Failed to confirm help reached' });
  }
});

// 8. Generate Agency Dispatch Brief
router.get('/:id/dispatch-brief', (req, res) => {
  try {
    const { id } = req.params;
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const volunteer = incident.assigned_volunteer_id 
      ? db.prepare('SELECT * FROM volunteers WHERE id = ?').get(incident.assigned_volunteer_id)
      : null;

    const brief = generateAgencyDispatchBrief(incident, volunteer);
    res.json({ brief });
  } catch (err) {
    console.error('Error generating dispatch brief:', err);
    res.status(500).json({ error: 'Failed to generate dispatch brief' });
  }
});

// 9. Send In-App Message
router.post('/:id/messages', (req, res) => {
  try {
    const { id } = req.params;
    const { senderType, senderName, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const msgId = `msg-${Date.now()}`;
    db.prepare(`
      INSERT INTO messages (id, incident_id, sender_type, sender_name, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(msgId, id, senderType || 'CITIZEN', senderName || 'User', message.trim());

    const incident = db.prepare('SELECT tracking_code FROM incidents WHERE id = ?').get(id);
    const savedMsg = db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);

    const io = req.app.get('io');
    if (io && incident) {
      io.to(`incident:${incident.tracking_code}`).emit('incident:message', savedMsg);
    }

    res.status(201).json({ success: true, message: savedMsg });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
