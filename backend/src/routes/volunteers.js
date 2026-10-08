const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// List volunteers
router.get('/', (req, res) => {
  try {
    const volunteers = db.prepare(`
      SELECT * FROM volunteers ORDER BY is_active DESC, active_cases_count DESC, name ASC
    `).all();
    res.json(volunteers);
  } catch (err) {
    console.error('Error fetching volunteers:', err);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// Toggle active status
router.patch('/:id/toggle-status', (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(id);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    const newStatus = volunteer.is_active ? 0 : 1;
    db.prepare('UPDATE volunteers SET is_active = ? WHERE id = ?').run(newStatus, id);

    const updated = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    console.error('Error toggling status:', err);
    res.status(500).json({ error: 'Failed to update volunteer status' });
  }
});

// Single volunteer profile
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(id);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    const activeCases = db.prepare(`
      SELECT * FROM incidents 
      WHERE assigned_volunteer_id = ? AND status != 'HELP_REACHED' AND status != 'CLOSED'
      ORDER BY urgency_score DESC
    `).all(id);

    const resolvedCases = db.prepare(`
      SELECT * FROM incidents 
      WHERE assigned_volunteer_id = ? AND (status = 'HELP_REACHED' OR status = 'CLOSED')
      ORDER BY resolved_at DESC
      LIMIT 10
    `).all(id);

    res.json({
      ...volunteer,
      activeCases,
      resolvedCases
    });
  } catch (err) {
    console.error('Error fetching volunteer profile:', err);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

module.exports = router;
