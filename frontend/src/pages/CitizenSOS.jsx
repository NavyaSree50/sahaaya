import React, { useState, useEffect } from 'react';
import { 
  Droplets, Flame, HeartPulse, Car, AlertTriangle, 
  MapPin, Phone, Users, Check, Loader2, Sparkles, Shield
} from 'lucide-react';
import { submitSOS } from '../utils/api';

const EMERGENCY_CHOICES = [
  { id: 'FLOOD', label: 'Flood / Waterlogging', emoji: '🌊', desc: 'Trapped by water, need boat / rescue', bg: 'hover:border-blue-500 hover:bg-blue-50/50', active: 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 text-blue-900' },
  { id: 'FIRE', label: 'Fire Outbreak', emoji: '🔥', desc: 'Smoke, trapped in building / stairs', bg: 'hover:border-rose-500 hover:bg-rose-50/50', active: 'border-rose-600 bg-rose-50 ring-2 ring-rose-600 text-rose-900' },
  { id: 'MEDICAL', label: 'Medical Emergency', emoji: '🚑', desc: 'Heart attack, stroke, oxygen needed', bg: 'hover:border-emerald-500 hover:bg-emerald-50/50', active: 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600 text-emerald-900' },
  { id: 'ROAD_ACCIDENT', label: 'Road Accident', emoji: '🚗', desc: 'Vehicle crash, people injured / trapped', bg: 'hover:border-amber-500 hover:bg-amber-50/50', active: 'border-amber-600 bg-amber-50 ring-2 ring-amber-600 text-amber-900' },
  { id: 'OTHER', label: 'Other Disaster', emoji: '⚠️', desc: 'Building collapse, storm, general danger', bg: 'hover:border-purple-500 hover:bg-purple-50/50', active: 'border-purple-600 bg-purple-50 ring-2 ring-purple-600 text-purple-900' }
];

export default function CitizenSOS({ onSOSTriggered }) {
  const [emergencyType, setEmergencyType] = useState('FLOOD');
  const [victimName, setVictimName] = useState('');
  const [victimPhone, setVictimPhone] = useState('');
  const [peopleCount, setPeopleCount] = useState(2);
  const [hasVulnerable, setHasVulnerable] = useState({ infant: false, elderly: false, injured: false });
  const [address, setAddress] = useState('Velachery, Chennai');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState(12.9815);
  const [longitude, setLongitude] = useState(80.2180);
  const [detectingGPS, setDetectingGPS] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Auto detect location on load
  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setDetectingGPS(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setDetectingGPS(false);
          // Reverse geocoding
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
            .then(r => r.json())
            .then(data => {
              if (data && data.display_name) {
                setAddress(data.display_name);
              }
            })
            .catch(() => {});
        },
        () => setDetectingGPS(false),
        { timeout: 7000 }
      );
    }
  };

  const handleDemoFill = (scenario) => {
    if (scenario === 'flood') {
      setEmergencyType('FLOOD');
      setVictimName('Sundar Raman');
      setVictimPhone('+91 98401 22334');
      setPeopleCount(4);
      setHasVulnerable({ infant: true, elderly: true, injured: false });
      setAddress('Plot 42, AGS Colony, Velachery, Chennai');
      setLandmark('Near Velachery Railway Station');
      setLatitude(12.9815);
      setLongitude(80.2180);
    } else if (scenario === 'fire') {
      setEmergencyType('FIRE');
      setVictimName('Priya Nair');
      setVictimPhone('+91 99012 33445');
      setPeopleCount(3);
      setHasVulnerable({ infant: false, elderly: false, injured: true });
      setAddress('Tech Plaza, 4th Block, Koramangala, Bengaluru');
      setLandmark('Near Sony World Signal');
      setLatitude(12.9352);
      setLongitude(77.6245);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!victimName.trim() || !victimPhone.trim() || !address.trim()) {
      setError('Please enter your name, phone number, and location.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const tags = [];
      if (hasVulnerable.infant) tags.push('INFANT');
      if (hasVulnerable.elderly) tags.push('ELDERLY');
      if (hasVulnerable.injured) tags.push('INJURED');

      const res = await submitSOS({
        emergencyType,
        victimName: victimName.trim(),
        victimPhone: victimPhone.trim(),
        peopleCount: parseInt(peopleCount, 10) || 1,
        vulnerableTags: tags,
        requiredResources: [emergencyType === 'FLOOD' ? 'Boat' : 'Ambulance'],
        description: `Emergency request for ${emergencyType}.`,
        latitude,
        longitude,
        address: address.trim(),
        landmark: landmark.trim() || null
      });

      if (res && res.trackingCode) {
        onSOSTriggered(res.trackingCode);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit SOS request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Friendly Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          <span>Sahaaya Emergency Help Desk</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Need Help? Tell us your situation
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
          An NSS Volunteer will receive your call digitally, contact local emergency services (112, 108, NDRF), and guide you safely until rescue arrives.
        </p>

        {/* 1-Click Demo Fill */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-medium">Quick 1-Click Demo:</span>
          <button
            type="button"
            onClick={() => handleDemoFill('flood')}
            className="px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold transition"
          >
            🌊 Test Flood SOS (Chennai)
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('fire')}
            className="px-3 py-1 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold transition"
          >
            🔥 Test Fire SOS (Bengaluru)
          </button>
        </div>
      </div>

      {/* Main Clean Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg shadow-slate-200/50 space-y-8">
        
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Emergency Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black">1</span>
            <label className="text-sm font-bold text-slate-900">
              What kind of emergency is this?
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EMERGENCY_CHOICES.map(item => {
              const selected = emergencyType === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setEmergencyType(item.id)}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                    selected ? item.active : `border-slate-200 bg-white ${item.bg}`
                  }`}
                >
                  <span className="text-2xl shrink-0">{item.emoji}</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Location */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black">2</span>
              <label className="text-sm font-bold text-slate-900">
                Where are you right now?
              </label>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={detectingGPS}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200"
            >
              {detectingGPS ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5 text-blue-600" />}
              <span>{detectingGPS ? 'Locating...' : 'Auto-Detect My GPS'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Street name, apartment, or area name"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <input
              type="text"
              value={landmark}
              onChange={e => setLandmark(e.target.value)}
              placeholder="Nearest landmark (e.g. Near Big Temple or Metro Station)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Step 3: Contact Details & People */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black">3</span>
            <label className="text-sm font-bold text-slate-900">
              Your Contact & Headcount
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={victimName}
                onChange={e => setVictimName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number (to reach you)</label>
              <input
                type="tel"
                required
                value={victimPhone}
                onChange={e => setVictimPhone(e.target.value)}
                placeholder="e.g. 98401 23456"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* People Count & Vulnerability */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">How many people are with you?</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 8].map(n => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setPeopleCount(n)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition ${
                      peopleCount === n
                        ? 'bg-rose-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-3 text-xs">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVulnerable.infant}
                  onChange={e => setHasVulnerable(prev => ({ ...prev, infant: e.target.checked }))}
                  className="rounded border-slate-300 text-rose-600 w-4 h-4"
                />
                <span>👶 Baby / Infant present</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVulnerable.elderly}
                  onChange={e => setHasVulnerable(prev => ({ ...prev, elderly: e.target.checked }))}
                  className="rounded border-slate-300 text-rose-600 w-4 h-4"
                />
                <span>👵 Senior Citizen / Elderly present</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVulnerable.injured}
                  onChange={e => setHasVulnerable(prev => ({ ...prev, injured: e.target.checked }))}
                  className="rounded border-slate-300 text-rose-600 w-4 h-4"
                />
                <span>🩹 Injured or bleeding</span>
              </label>
            </div>
          </div>
        </div>

        {/* Giant Friendly Red Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-lg tracking-wide shadow-xl shadow-rose-600/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 animate-sos-pulse-gentle"
          >
            {submitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Submitting Your Help Request...</span>
              </>
            ) : (
              <>
                <span>🚨 REQUEST EMERGENCY HELP NOW</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-3">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>NSS Digital Coordinators & 112 services are on standby.</span>
          </div>
        </div>

      </form>
    </div>
  );
}
