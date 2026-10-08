const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

router.get('/', (req, res) => {
  try {
    // 1. Overall counts
    const totalIncidents = db.prepare('SELECT COUNT(*) as count FROM incidents').get().count;
    const activeIncidents = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status != 'HELP_REACHED' AND status != 'CLOSED'").get().count;
    const resolvedIncidents = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'HELP_REACHED' OR status = 'CLOSED'").get().count;

    // 2. Status Breakdown
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count FROM incidents GROUP BY status
    `).all();

    // 3. Category Breakdown
    const typeCounts = db.prepare(`
      SELECT emergency_type, COUNT(*) as count FROM incidents GROUP BY emergency_type ORDER BY count DESC
    `).all();

    // 4. People impacted & saved
    const peopleStats = db.prepare(`
      SELECT 
        SUM(people_count) as total_people,
        SUM(CASE WHEN status = 'HELP_REACHED' OR status = 'CLOSED' THEN people_count ELSE 0 END) as rescued_people
      FROM incidents
    `).get();

    // 5. Volunteer Stats
    const totalVolunteers = db.prepare('SELECT COUNT(*) as count FROM volunteers').get().count;
    const activeVolunteers = db.prepare('SELECT COUNT(*) as count FROM volunteers WHERE is_active = 1').get().count;

    // 6. Average Urgency Score
    const avgUrgency = db.prepare('SELECT ROUND(AVG(urgency_score), 1) as avg FROM incidents').get().avg || 0;

    // 7. Recent Incidents with coordinates for map
    const mapIncidents = db.prepare(`
      SELECT id, tracking_code, emergency_type, priority_band, urgency_score, status,
             victim_name, people_count, latitude, longitude, address, dispatched_agency_name,
             created_at, updated_at
      FROM incidents
      ORDER BY created_at DESC
      LIMIT 100
    `).all();

    res.json({
      summary: {
        totalIncidents,
        activeIncidents,
        resolvedIncidents,
        totalPeopleImpacted: peopleStats.total_people || 0,
        rescuedPeople: peopleStats.rescued_people || 0,
        totalVolunteers,
        activeVolunteers,
        avgUrgency
      },
      statusDistribution: statusCounts,
      typeDistribution: typeCounts,
      mapIncidents
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics data' });
  }
});

module.exports = router;
