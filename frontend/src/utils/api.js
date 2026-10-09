const API_BASE = 'https://sahaaya-backend-pz5y.onrender.com/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function submitSOS(data) {
  const res = await fetch(`${API_BASE}/incidents/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit SOS');
  }
  return res.json();
}

export async function getIncidents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.emergencyType && filters.emergencyType !== 'ALL') params.append('emergencyType', filters.emergencyType);
  if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
  return res.json();
}

export async function getIncident(codeOrId) {
  const res = await fetch(`${API_BASE}/incidents/${codeOrId}`);
  if (!res.ok) {
    throw new Error('Incident not found');
  }
  return res.json();
}

export async function assignVolunteer(incidentId, volunteerId) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ volunteerId })
  });
  return res.json();
}

export async function verifyIncident(incidentId, data) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function dispatchAgency(incidentId, data) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function confirmHelpReached(incidentId, data) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/help-reached`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getDispatchBrief(incidentId) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/dispatch-brief`);
  return res.json();
}

export async function sendIncidentMessage(incidentId, data) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getVolunteers() {
  const res = await fetch(`${API_BASE}/volunteers`);
  return res.json();
}

export async function toggleVolunteerStatus(volunteerId) {
  const res = await fetch(`${API_BASE}/volunteers/${volunteerId}/toggle-status`, {
    method: 'PATCH'
  });
  return res.json();
}

export async function getAgencies(district = '') {
  const params = district ? `?district=${encodeURIComponent(district)}` : '';
  const res = await fetch(`${API_BASE}/agencies${params}`);
  return res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  return res.json();
}

export async function sendSimulatedSMS(from, body) {
  const res = await fetch(`${API_BASE}/gateway/sms-inbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, body })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send SMS');
  }
  return res.json();
}

export async function getSMSLogs() {
  const res = await fetch(`${API_BASE}/gateway/sms-logs`);
  return res.json();
}
