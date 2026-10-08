import React, { useState, useEffect } from 'react';
import { 
  Search, Phone, Clock, Truck, CheckCircle2, AlertTriangle, 
  Send, MessageSquare, MapPin, Users, HeartHandshake, Shield, Sparkles
} from 'lucide-react';
import { getIncident, sendIncidentMessage } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { EMERGENCY_ADVICE } from '../utils/emergencyAdvice';

const STEPS = [
  { id: 'REPORTED', title: '1. Request Received', desc: 'Alert sent to NSS volunteer team' },
  { id: 'VERIFIED', title: '2. Volunteer Verified', desc: 'Coordinator checked your details' },
  { id: 'ASSISTANCE_DISPATCHED', title: '3. Rescue on the Way', desc: 'Official team dispatched' },
  { id: 'HELP_REACHED', title: '4. Help Reached', desc: 'Rescue team on-site' }
];

export default function CitizenTrack({ initialTrackingCode }) {
  const [trackingInput, setTrackingInput] = useState(initialTrackingCode || 'SHY-7821');
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const { socket } = useSocket();

  const loadIncident = async (code) => {
    if (!code) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getIncident(code.trim().toUpperCase());
      setIncident(data);
    } catch (err) {
      setError(err.message || 'Tracking ID not found');
      setIncident(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingCode) {
      setTrackingInput(initialTrackingCode);
      loadIncident(initialTrackingCode);
    } else {
      loadIncident('SHY-7821');
    }
  }, [initialTrackingCode]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket || !incident) return;
    socket.emit('join:incident', incident.tracking_code);

    const handleUpdate = (updated) => {
      if (updated.id === incident.id || updated.tracking_code === incident.tracking_code) {
        setIncident(prev => ({ ...prev, ...updated }));
      }
    };

    const handleMessage = (msg) => {
      setIncident(prev => {
        if (!prev) return prev;
        const exists = prev.messages && prev.messages.some(m => m.id === msg.id);
        if (exists) return prev;
        return { ...prev, messages: [...(prev.messages || []), msg] };
      });
    };

    socket.on('incident:update', handleUpdate);
    socket.on('incident:message', handleMessage);

    return () => {
      socket.emit('leave:incident', incident.tracking_code);
      socket.off('incident:update', handleUpdate);
      socket.off('incident:message', handleMessage);
    };
  }, [socket, incident?.tracking_code, incident?.id]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadIncident(trackingInput);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !incident) return;
    try {
      setSendingMsg(true);
      await sendIncidentMessage(incident.id, {
        senderType: 'CITIZEN',
        senderName: incident.victim_name,
        message: chatMessage.trim()
      });
      setChatMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  const getStepIndex = () => {
    if (!incident) return 0;
    if (incident.status === 'REPORTED') return 0;
    if (incident.status === 'VERIFIED') return 1;
    if (incident.status === 'ASSISTANCE_DISPATCHED') return 2;
    if (incident.status === 'HELP_REACHED' || incident.status === 'CLOSED') return 3;
    return 0;
  };

  const currentStep = getStepIndex();
  const advice = incident ? (EMERGENCY_ADVICE[incident.emergency_type] || EMERGENCY_ADVICE.OTHER) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Search Bar - Clean & Simple */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Track Your Emergency Request</h2>
          <p className="text-xs text-slate-500">Enter your tracking code to see live progress.</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={trackingInput}
            onChange={e => setTrackingInput(e.target.value.toUpperCase())}
            placeholder="e.g. SHY-7821"
            className="w-full sm:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0"
          >
            {loading ? 'Searching...' : 'Check Status'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {incident && (
        <div className="space-y-6">
          {/* Main Progress Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            
            {/* Header: Tracking Code & Emergency Type */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tracking ID</span>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {incident.tracking_code}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    {incident.emergency_type}
                  </span>
                </div>
              </div>

              {/* Call 112 directly */}
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Police / Ambulance: 112</span>
              </a>
            </div>

            {/* Visual 4-Step Progress Journey */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STEPS.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/30'
                        : isPassed
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isPassed ? '✓' : idx + 1}
                      </span>
                      {isCurrent && <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Current Status Message Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shrink-0 mt-0.5">
                {incident.status === 'HELP_REACHED' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : incident.status === 'ASSISTANCE_DISPATCHED' ? (
                  <Truck className="w-6 h-6 text-orange-600 animate-bounce" />
                ) : (
                  <Shield className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {incident.status === 'HELP_REACHED'
                    ? '🎉 Rescue Team Has Reached Your Location'
                    : incident.status === 'ASSISTANCE_DISPATCHED'
                    ? `🚑 Official Help is on the way! ETA: ~${incident.eta_minutes || 15} minutes`
                    : incident.status === 'VERIFIED'
                    ? '🛡️ Situation Verified — Connecting with Emergency Dispatchers'
                    : '⏳ Request Received — Volunteer being assigned'}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {incident.status === 'ASSISTANCE_DISPATCHED'
                    ? `Assigned Rescue Agency: ${incident.dispatched_agency_name || 'Emergency Services'}. Keep your phone battery safe.`
                    : incident.status === 'HELP_REACHED'
                    ? 'Official responders are on-site. Follow rescue team instructions.'
                    : 'A dedicated NSS student coordinator is reviewing your coordinates and establishing contact with official response units.'}
                </p>
              </div>
            </div>

          </div>

          {/* 2-Column: Coordinator Info & Chat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Coordinator Details Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                  {incident.volunteer_name ? incident.volunteer_name.charAt(0) : 'N'}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Your Digital Coordinator</span>
                  <h4 className="text-base font-bold text-slate-900">
                    {incident.volunteer_name || 'NSS Volunteer Desk'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {incident.volunteer_college || 'National Service Scheme Command'}
                  </p>
                </div>
              </div>

              {incident.volunteer_phone && (
                <a
                  href={`tel:${incident.volunteer_phone}`}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Coordinator ({incident.volunteer_phone})</span>
                </a>
              )}

              {/* Simple Survival Tips */}
              {advice && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-rose-900 block">⚠️ What to do right now:</span>
                  <p className="text-rose-800 font-medium">{advice.criticalRule}</p>
                  <ul className="text-slate-700 space-y-1 list-disc list-inside">
                    {advice.dos.slice(0, 2).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Clean In-App Messaging */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Direct Messages with Coordinator
                </h4>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                {incident.messages && incident.messages.length > 0 ? (
                  incident.messages.map((m, i) => {
                    const isCitizen = m.sender_type === 'CITIZEN';
                    return (
                      <div key={m.id || i} className={`flex flex-col ${isCitizen ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-semibold">
                          {m.sender_name}
                        </span>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                          isCitizen
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}>
                          {m.message}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center">
                    No messages yet. Send an update about your situation here.
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder="Type an update to coordinator..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !chatMessage.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
