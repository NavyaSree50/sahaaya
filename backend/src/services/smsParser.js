/**
 * Sahaaya Low-Bandwidth SMS Distress Parser & Gateway Service
 * Parses compact SMS / USSD strings or raw natural text into structured incidents.
 */

const { calculateTriageScore } = require('./triageEngine');

// Known Indian emergency hotspots coordinates cache for SMS geocoding fallback
const LOCALITY_GEO_CACHE = {
  'velachery': { lat: 12.9815, lon: 80.2180, addr: 'Velachery, Chennai, Tamil Nadu' },
  'tambaram': { lat: 12.9249, lon: 80.1000, addr: 'Tambaram, Chennai, Tamil Nadu' },
  'koramangala': { lat: 12.9352, lon: 77.6245, addr: 'Koramangala, Bengaluru, Karnataka' },
  'indiranagar': { lat: 12.9784, lon: 77.6408, addr: 'Indiranagar, Bengaluru, Karnataka' },
  'guwahati': { lat: 26.1445, lon: 91.7362, addr: 'Guwahati, Assam' },
  'shivaji nagar': { lat: 18.5314, lon: 73.8446, addr: 'Shivaji Nagar, Pune, Maharashtra' },
  'katraj': { lat: 18.4575, lon: 73.8677, addr: 'Katraj Bypass, Pune, Maharashtra' },
  'kochi': { lat: 9.9312, lon: 76.2673, addr: 'Kochi, Ernakulam, Kerala' },
  'wayanad': { lat: 11.6854, lon: 76.1320, addr: 'Wayanad, Kerala' }
};

function parseInboundSMS(senderPhone, smsText) {
  const clean = (smsText || '').trim();
  const lower = clean.toLowerCase();

  let emergencyType = 'OTHER';
  if (lower.includes('flood') || lower.includes('water') || lower.includes('drown') || lower.includes('boat')) {
    emergencyType = 'FLOOD';
  } else if (lower.includes('fire') || lower.includes('smoke') || lower.includes('burn')) {
    emergencyType = 'FIRE';
  } else if (lower.includes('accident') || lower.includes('crash') || lower.includes('collision') || lower.includes('highway')) {
    emergencyType = 'ROAD_ACCIDENT';
  } else if (lower.includes('cardiac') || lower.includes('heart') || lower.includes('oxygen') || lower.includes('medical') || lower.includes('doctor')) {
    emergencyType = 'MEDICAL';
  } else if (lower.includes('collapse') || lower.includes('rubble') || lower.includes('trapped building')) {
    emergencyType = 'BUILDING_COLLAPSE';
  }

  // Detect headcount (e.g. "4 people", "5 persons", or second word in SOS FLOOD 4 ...)
  let peopleCount = 1;
  const countMatch = clean.match(/(?:people|persons|headcount|victims|trapped)?\s*(\d{1,2})\s*(?:people|persons|family members)?/i);
  if (countMatch && parseInt(countMatch[1], 10) > 0) {
    peopleCount = Math.min(100, parseInt(countMatch[1], 10));
  } else {
    // Check structured format: SOS FLOOD 4 ...
    const tokens = clean.split(/\s+/);
    for (const t of tokens) {
      const num = parseInt(t, 10);
      if (!isNaN(num) && num > 0 && num < 50) {
        peopleCount = num;
        break;
      }
    }
  }

  // Detect vulnerabilities
  const vulnerableTags = [];
  if (lower.includes('baby') || lower.includes('infant') || lower.includes('child') || lower.includes('toddler')) {
    vulnerableTags.push('INFANT');
  }
  if (lower.includes('elderly') || lower.includes('senior') || lower.includes('grandmother') || lower.includes('grandfather') || lower.includes('old age')) {
    vulnerableTags.push('ELDERLY');
  }
  if (lower.includes('pregnant')) {
    vulnerableTags.push('PREGNANT');
  }
  if (lower.includes('injured') || lower.includes('bleeding') || lower.includes('fracture') || lower.includes('wound')) {
    vulnerableTags.push('INJURED');
  }
  if (lower.includes('oxygen') || lower.includes('breathing')) {
    vulnerableTags.push('OXYGEN_DEPENDENT');
  }
  if (lower.includes('bedridden') || lower.includes('wheelchair') || lower.includes('cannot walk')) {
    vulnerableTags.push('IMMOBILE');
  }

  // Detect GPS Coordinates: e.g. 12.9815,80.2180 or 12.9815 80.2180
  let latitude = 13.0827; // Default Chennai coordinates
  let longitude = 80.2707;
  let address = 'SMS Emergency Location (Coordinates Relayed via 2G)';
  let hasExactGPS = false;

  const coordMatch = clean.match(/(-?\d{1,2}\.\d{3,7})[,\s]+(-?\d{1,3}\.\d{3,7})/);
  if (coordMatch) {
    latitude = parseFloat(coordMatch[1]);
    longitude = parseFloat(coordMatch[2]);
    hasExactGPS = true;
    address = `GPS Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)} (SMS Origin)`;
  } else {
    // Check known localities in text
    for (const [loc, geo] of Object.entries(LOCALITY_GEO_CACHE)) {
      if (lower.includes(loc)) {
        latitude = geo.lat;
        longitude = geo.lon;
        address = geo.addr;
        break;
      }
    }
  }

  const { urgencyScore, priorityBand } = calculateTriageScore({
    emergencyType,
    peopleCount,
    vulnerableTags
  });

  return {
    emergencyType,
    peopleCount,
    vulnerableTags,
    latitude,
    longitude,
    address,
    hasExactGPS,
    urgencyScore,
    priorityBand,
    rawSMS: clean,
    senderPhone
  };
}

module.exports = {
  parseInboundSMS,
  LOCALITY_GEO_CACHE
};
