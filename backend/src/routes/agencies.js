const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

router.get('/', (req, res) => {
  try {
    const { category, district } = req.query;
    let query = 'SELECT * FROM emergency_agencies WHERE is_available = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (district) {
      query += ' AND (district = ? OR district = "Statewide Hub" OR district = "Unified Command")';
      params.push(district);
    }

    query += ' ORDER BY category ASC, name ASC';

    const agencies = db.prepare(query).all(...params);
    res.json(agencies);
  } catch (err) {
    console.error('Error fetching emergency agencies:', err);
    res.status(500).json({ error: 'Failed to retrieve emergency agencies' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, category, district, state, primaryPhone, alternatePhone, controlRoomEmail } = req.body;
    if (!name || !category || !primaryPhone) {
      return res.status(400).json({ error: 'Name, category, and primaryPhone are required' });
    }

    const id = `agn-${Date.now()}`;
    db.prepare(`
      INSERT INTO emergency_agencies (id, name, category, district, state, primary_phone, alternate_phone, control_room_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, category, district || 'General', state || 'India', primaryPhone, alternatePhone || null, controlRoomEmail || null);

    const agency = db.prepare('SELECT * FROM emergency_agencies WHERE id = ?').get(id);
    res.status(201).json(agency);
  } catch (err) {
    console.error('Error creating agency:', err);
    res.status(500).json({ error: 'Failed to create emergency agency' });
  }
});

module.exports = router;
