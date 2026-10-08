import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Phone, MapPin, Clock, Search, Filter, 
  AlertTriangle, CheckCircle2, ChevronRight, UserCheck, Radio
} from 'lucide-react';
import { getIncidents, getVolunteers, toggleVolunteerStatus, assignVolunteer } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import SafetyBanner from '../components/SafetyBanner';
import VolunteerWorkbench from './VolunteerWorkbench';

export default function VolunteerDashboard() {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIncidentId, setActiveIncidentId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();

  const loadData = async () => {
    try {
      setLoading(true);
      const [vols, incs] = await Promise.all([
        getVolunteers(),
        getIncidents({ status: statusFilter, search: searchQuery })
      ]);
      setVolunteers(vols);
      if (!selectedVolunteer && vols.length > 0) {
        setSelectedVolunteer(vols[0]);
      } else if (selectedVolunteer) {
        const cur = vols.find(v => v.id === selectedVolunteer.id);
        if (cur) setSelectedVolunteer(cur);
      }
      setIncidents(incs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      getIncidents({ status: statusFilter, search: searchQuery })
        .then(setIncidents)
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;
    socket.emit('join:coordinators');

    const handleNew = (newInc) => {
      setIncidents(prev => [newInc, ...prev.filter(i => i.id !== newInc.id)]);
    };

    const handleUpdate = (updated) => {
      setIncidents(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
    };

    socket.on('sos:new', handleNew);
    socket.on('incident:update', handleUpdate);

    return () => {
      socket.off('sos:new', handleNew);
      socket.off('incident:update', handleUpdate);
    };
  }, [socket]);

  const handleClaim = async (incidentId) => {
    if (!selectedVolunteer) return;
    try {
      await assignVolunteer(incidentId, selectedVolunteer.id);
      setActiveIncidentId(incidentId);
      loadData();
    } catch (err) {
      alert('Failed to claim incident: ' + err.message);
    }
  };

  if (activeIncidentId) {
    return (
      <VolunteerWorkbench
        incidentId={activeIncidentId}
        volunteer={selectedVolunteer}
        onBack={() => {
          setActiveIncidentId(null);
          loadData();
        }}
        onStatusUpdated={loadData}
      />
    );
  }

  const getEmoji = (type) => {
    if (type === 'FLOOD') return '🌊';
    if (type === 'FIRE') return '🔥';
    if (type === 'MEDICAL') return '🚑';
    if (type === 'ROAD_ACCIDENT') return '🚗';
    return '⚠️';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Friendly Safety Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl shrink-0">
            <Shield className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 className="text-base font-black text-amber-950">
              “Volunteer Safety Comes Before Volunteer Service”
            </h2>
            <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
              Coordinate remotely from home or desk. <strong>Never physically enter floodwaters, fire zones, or accident sites.</strong> Your job is to verify information and dispatch official services (112, 108, NDRF).
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-amber-200/80 text-amber-900 font-bold text-xs rounded-full shrink-0">
          Remote Coordination Only
        </span>
      </div>

      {/* Volunteer Identity Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
            {selectedVolunteer ? selectedVolunteer.name.charAt(0) : 'N'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {selectedVolunteer ? selectedVolunteer.name : 'Loading Volunteer...'}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {selectedVolunteer ? selectedVolunteer.nss_unit : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {selectedVolunteer ? selectedVolunteer.college : ''}
            </p>
          </div>
        </div>

        {/* Switch Identity Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-500 shrink-0">Logged in as:</label>
          <select
            value={selectedVolunteer ? selectedVolunteer.id : ''}
            onChange={e => {
              const found = volunteers.find(v => v.id === e.target.value);
              if (found) setSelectedVolunteer(found);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {volunteers.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.college.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Incident Queue */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Incoming Distress Requests
            </h3>
            <p className="text-xs text-slate-500">
              Pick a request to verify the citizen's situation and alert official rescue services.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search area or code..."
              className="w-full sm:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'REPORTED', label: 'Needs Verification' },
            { id: 'VERIFIED', label: 'Verified' },
            { id: 'ASSISTANCE_DISPATCHED', label: 'Rescue En Route' },
            { id: 'HELP_REACHED', label: 'Help Reached' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                statusFilter === f.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Incidents Cards List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Loading distress requests...
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching incidents found.
            </div>
          ) : (
            incidents.map(inc => {
              const isAssignedToMe = selectedVolunteer && inc.assigned_volunteer_id === selectedVolunteer.id;

              return (
                <div
                  key={inc.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl">{getEmoji(inc.emergency_type)}</span>
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                        {inc.tracking_code}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {inc.emergency_type} Emergency
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        inc.status === 'HELP_REACHED' ? 'bg-emerald-100 text-emerald-800' :
                        inc.status === 'ASSISTANCE_DISPATCHED' ? 'bg-orange-100 text-orange-800' :
                        inc.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inc.status.replace('_', ' ')}
                      </span>
                      {inc.description && inc.description.includes('2G SMS GATEWAY') && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          📡 2G SMS
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-slate-900">{inc.victim_name}</span>
                      <span>•</span>
                      <span>📞 {inc.victim_phone}</span>
                      <span>•</span>
                      <span>👥 {inc.people_count} person(s)</span>
                      <span>•</span>
                      <span>📍 {inc.address}</span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    {!inc.assigned_volunteer_id ? (
                      <button
                        onClick={() => handleClaim(inc.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Claim & Coordinate</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveIncidentId(inc.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <span>{isAssignedToMe ? 'Open My Workbench' : 'View Coordination'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
