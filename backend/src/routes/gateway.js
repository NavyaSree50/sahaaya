const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { parseInboundSMS } = require('../services/smsParser');

// In-memory or persisted SMS message transmission log
const smsLogs = [];

function generateTrackingCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SHY-${num}`;
}

// Ingest SMS Distress Request
router.post('/sms-inbound', (req, res) => {
  try {
    const { from = '+91 98409 99112', body = '', timestamp = new Date().toISOString() } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'SMS message body cannot be empty' });
    }

    // 1. Parse SMS
    const parsed = parseInboundSMS(from, body);

    const id = `inc-sms-${Date.now()}`;
    const trackingCode = generateTrackingCode();
    const vulnerableJson = JSON.stringify(parsed.vulnerableTags);
    const resourcesJson = JSON.stringify(['Immediate Evacuation', 'First Aid']);

    // 2. Save incident in database
    const insertStmt = db.prepare(`
      INSERT INTO incidents (
        id, tracking_code, emergency_type, urgency_score, priority_band, status,
        victim_name, victim_phone, people_count, vulnerable_tags, required_resources,
        description, latitude, longitude, address, landmark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'REPORTED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const formattedDesc = `[INGESTED VIA 2G SMS GATEWAY]\n"${parsed.rawSMS}"`;
    const landmark = parsed.hasExactGPS ? 'GPS coordinates relayed via SMS' : 'Locality geocoded from SMS text';

    insertStmt.run(
      id,
      trackingCode,
      parsed.emergencyType,
      parsed.urgencyScore,
      parsed.priorityBand,
      `SMS Citizen (${from.slice(-4)})`,
      from,
      parsed.peopleCount,
      vulnerableJson,
      resourcesJson,
      formattedDesc,
      parsed.latitude,
      parsed.longitude,
      parsed.address,
      landmark
    );

    // 3. Log System Action
    db.prepare(`
      INSERT INTO incident_logs (id, incident_id, actor_type, actor_name, action, notes)
      VALUES (?, ?, 'SYSTEM', '2G/SMS Gateway', 'SOS_CREATED', ?)
    `).run(
      `log-sms-${Date.now()}`,
      id,
      `Distress SMS received via cellular cell tower. Parsed Type: ${parsed.emergencyType}, People: ${parsed.peopleCount}.`
    );

    // 4. Initial system message
    db.prepare(`
      INSERT INTO messages (id, incident_id, sender_type, sender_name, message)
      VALUES (?, ?, 'SYSTEM', 'SMS Telemetry Desk', ?)
    `).run(
      `msg-sms-${Date.now()}`,
      id,
      `Distress signal ingested via SMS Gateway. Sender Phone: ${from}. Low battery/low connectivity protocol active.`
    );

    // 5. Generate automated Return Confirmation SMS
    const returnSMS = `SAHAAYA 2G ALERT: SOS received (ID: ${trackingCode}). Assigned to NSS Digital Coordinator. Official 112/NDRF rescue alerted. Stay on high ground/safe zone. Keep phone on standby.`;

    const logEntry = {
      id: `sms-${Date.now()}`,
      direction: 'INBOUND',
      from,
      body: parsed.rawSMS,
      timestamp,
      parsedResult: parsed,
      trackingCode,
      outboundReply: returnSMS
    };

    smsLogs.unshift(logEntry);

    const createdIncident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);

    // Broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to('room:coordinators').emit('sos:new', createdIncident);
      io.to('room:admin').emit('sos:new', createdIncident);
    }

    res.status(201).json({
      success: true,
      trackingCode,
      incident: createdIncident,
      parsed,
      returnSMS,
      logEntry
    });
  } catch (err) {
    console.error('Error processing inbound SMS:', err);
    res.status(500).json({ error: 'Failed to process inbound SMS distress message' });
  }
});

// Get SMS Telemetry History
router.get('/sms-logs', (req, res) => {
  res.json({
    totalProcessed: smsLogs.length,
    logs: smsLogs.slice(0, 50)
  });
});

module.exports = router;
