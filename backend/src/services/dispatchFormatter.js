/**
 * Sahaaya Emergency Service Dispatch Briefing Generator
 * Generates clear, standardized briefings for 112/108/Fire/NDRF dispatchers.
 */

function generateAgencyDispatchBrief(incident, coordinator = null) {
  const gmapsUrl = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;
  
  let vulStr = 'None specified';
  if (incident.vulnerable_tags) {
    try {
      const parsed = typeof incident.vulnerable_tags === 'string' 
        ? JSON.parse(incident.vulnerable_tags) 
        : incident.vulnerable_tags;
      if (Array.isArray(parsed) && parsed.length > 0) {
        vulStr = parsed.join(', ');
      }
    } catch {
      vulStr = incident.vulnerable_tags;
    }
  }

  let resStr = 'Immediate Rescue';
  if (incident.required_resources) {
    try {
      const parsed = typeof incident.required_resources === 'string'
        ? JSON.parse(incident.required_resources)
        : incident.required_resources;
      if (Array.isArray(parsed) && parsed.length > 0) {
        resStr = parsed.join(', ');
      }
    } catch {
      resStr = incident.required_resources;
    }
  }

  return `🚨 [EMERGENCY DISPATCH BRIEF - SAHAAYA COORDINATION] 🚨
--------------------------------------------------
TRACKING ID: ${incident.tracking_code}
URGENCY: ${incident.priority_band} (Score: ${incident.urgency_score}/100)
EMERGENCY TYPE: ${incident.emergency_type}

📍 LOCATION:
- Address: ${incident.address}
${incident.landmark ? `- Landmark: ${incident.landmark}\n` : ''}- GPS: ${incident.latitude.toFixed(6)}, ${incident.longitude.toFixed(6)}
- Map Pin: ${gmapsUrl}

👥 VICTIM DETAILS:
- Contact Person: ${incident.victim_name}
- Primary Phone: ${incident.victim_phone}
${incident.alternate_phone ? `- Alternate Phone: ${incident.alternate_phone}\n` : ''}- People Trapped / Affected: ${incident.people_count}
- Vulnerabilities: ${vulStr}

⚠️ SITUATION SUMMARY:
"${incident.description || 'Assistance requested immediately.'}"
- Required Resources: ${resStr}

🛡️ VERIFIED BY NSS DIGITAL COORDINATOR:
- Coordinator: ${coordinator ? `${coordinator.name} (${coordinator.college}, Unit: ${coordinator.nss_unit})` : 'Sahaaya Verified Desk'}
- Coordinator Contact: ${coordinator ? coordinator.phone : 'Emergency Desk'}
- Rule Followed: Remote Digital Coordination (Zero Volunteer Hazard)
--------------------------------------------------
*Dispatched via Sahaaya Digital Emergency Platform*`;
}

module.exports = {
  generateAgencyDispatchBrief
};
