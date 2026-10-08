/**
 * Sahaaya Automated Triage & Priority Scoring Engine
 * Evaluates distress severity to order incoming requests for NSS Digital Coordinators.
 */

const BASE_SCORES = {
  BUILDING_COLLAPSE: 95,
  FIRE: 90,
  FLOOD: 85,
  MEDICAL: 88,
  ROAD_ACCIDENT: 82,
  WOMEN_SAFETY: 85,
  OTHER: 60
};

const VULNERABILITY_WEIGHTS = {
  INFANT: 12,
  PREGNANT: 12,
  ELDERLY: 10,
  INJURED: 12,
  IMMOBILE: 14,
  OXYGEN_DEPENDENT: 15
};

function calculateTriageScore({
  emergencyType,
  peopleCount = 1,
  vulnerableTags = [],
  createdAt = new Date()
}) {
  let score = BASE_SCORES[emergencyType] || 60;

  // Headcount modifier (more trapped lives = higher priority)
  const count = parseInt(peopleCount, 10) || 1;
  if (count >= 10) {
    score += 15;
  } else if (count >= 5) {
    score += 10;
  } else if (count >= 2) {
    score += 5;
  }

  // Vulnerability modifier
  const tags = Array.isArray(vulnerableTags) ? vulnerableTags : [];
  tags.forEach(tag => {
    const key = tag.toUpperCase();
    if (VULNERABILITY_WEIGHTS[key]) {
      score += VULNERABILITY_WEIGHTS[key];
    } else {
      score += 6;
    }
  });

  // Time decay / escalation modifier: If emergency is unhandled, it grows more critical
  const elapsedMinutes = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
  const timeBonus = Math.min(15, Math.floor(elapsedMinutes / 5) * 2);
  score += timeBonus;

  // Clamp 1 - 100
  const finalScore = Math.min(100, Math.max(1, Math.round(score)));

  let priorityBand = 'MEDIUM';
  if (finalScore >= 85) {
    priorityBand = 'CRITICAL';
  } else if (finalScore >= 70) {
    priorityBand = 'HIGH';
  } else if (finalScore >= 45) {
    priorityBand = 'MEDIUM';
  } else {
    priorityBand = 'LOW';
  }

  return {
    urgencyScore: finalScore,
    priorityBand
  };
}

module.exports = {
  calculateTriageScore,
  BASE_SCORES,
  VULNERABILITY_WEIGHTS
};
