import React, { useState, useEffect } from 'react';
import { 
  Radio, Send, Battery, Signal, ArrowRight, ShieldCheck, 
  CheckCircle2, MessageSquare, AlertTriangle, RefreshCw, Smartphone
} from 'lucide-react';
import { sendSimulatedSMS, getSMSLogs } from '../utils/api';

const PRESET_SMS_SAMPLES = [
  {
    title: 'Flood Rooftop Rescue (Chennai)',
    phone: '+91 94441 22334',
    text: 'SOS FLOOD 4 12.9815,80.2180 INFANT,ELDERLY Water 4ft rooftop terrace',
    category: 'FLOOD'
  },
  {
    title: 'Building Fire Trap (Bengaluru)',
    phone: '+91 98801 44556',
    text: 'SOS FIRE 3 koramangala tech park 4th floor INJURED smoke blocking stairs',
    category: 'FIRE'
  },
  {
    title: 'Highway Road Crash (Pune)',
    phone: '+91 97654 33221',
    text: 'SOS ACCIDENT 2 18.5204,73.8567 Katraj bypass vehicle overturned active bleeding',
    category: 'ROAD_ACCIDENT'
  },
  {
    title: 'Low-Signal Plain Text Panic',
    phone: '+91 94350 77889',
    text: 'HELP FLOOD 5 persons baby trapped velachery power cut water rising',
    category: 'FLOOD'
  }
];

export default function SMSGatewaySimulator({ onIncidentCreated }) {
  const [senderPhone, setSenderPhone] = useState('+91 98401 22334');
  const [smsText, setSmsText] = useState('SOS FLOOD 4 12.9815,80.2180 INFANT,ELDERLY Water 4ft rooftop terrace');
  const [transmitting, setTransmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      const res = await getSMSLogs();
      if (res && res.logs) setLogs(res.logs);
    } catch {}
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSendSMS = async (e) => {
    e.preventDefault();
    if (!smsText.trim()) return;

    try {
      setTransmitting(true);
      setError(null);
      const res = await sendSimulatedSMS(senderPhone, smsText.trim());
      setLastResult(res);
      fetchLogs();
    } catch (err) {
      setError(err.message || 'Failed to transmit SMS');
    } finally {
      setTransmitting(false);
    }
  };

  const loadPreset = (preset) => {
    setSenderPhone(preset.phone);
    setSmsText(preset.text);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-2">
            📡 2G Cellular & Offline Fallback
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            SMS Distress Gateway
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            When heavy floods take down 4G/5G data towers, citizens can text a simple SMS. Sahaaya parses the coordinates, alerts NSS volunteers, and returns an immediate confirmation SMS.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2-Column: Phone + Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Phone Mockup (5 Cols) */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm bg-white border-2 border-slate-300 rounded-[36px] p-5 shadow-xl space-y-4">
            
            {/* Status bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="font-bold text-amber-700">📶 2G EDGE (Low Signal)</span>
              <span>18% 🪫</span>
            </div>

            {/* To recipient */}
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">To:</span>
              <span className="font-bold text-slate-900 font-mono">SAHAAYA EMERGENCY DESK (11200)</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Your Mobile Number</label>
              <input
                type="tel"
                value={senderPhone}
                onChange={e => setSenderPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                <span>Distress Message:</span>
                <span className="font-mono">{smsText.length}/160</span>
              </div>
              <textarea
                rows={4}
                value={smsText}
                onChange={e => setSmsText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSendSMS}
              disabled={transmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{transmitting ? 'Sending...' : 'SEND SOS VIA SMS'}</span>
            </button>

            {/* Return SMS Bubble */}
            {lastResult && lastResult.returnSMS && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold block text-[10px] text-emerald-700 uppercase">Received Return SMS:</span>
                <p className="font-mono text-[11px]">"{lastResult.returnSMS}"</p>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="w-full max-w-sm mt-4 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1-Click Realistic Presets:
            </span>
            <div className="space-y-1.5">
              {PRESET_SMS_SAMPLES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(p)}
                  className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs text-slate-800 transition flex items-center justify-between"
                >
                  <span className="font-semibold">{p.title}</span>
                  <span className="text-emerald-700 font-bold text-[11px]">Load</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Console (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          {lastResult && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase">Parsed Successfully</span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Tracking ID: <span className="font-mono text-rose-600">{lastResult.trackingCode}</span>
                  </h3>
                </div>

                <button
                  onClick={() => onIncidentCreated && onIncidentCreated(lastResult.trackingCode)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Track Live ➔
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Category</span>
                  <span className="font-bold text-slate-900">{lastResult.parsed.emergencyType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Headcount</span>
                  <span className="font-bold text-slate-900">{lastResult.parsed.peopleCount} people</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Location</span>
                  <span className="font-semibold text-slate-800">{lastResult.parsed.address}</span>
                </div>
              </div>
            </div>
          )}

          {/* Log Stream */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Cellular Ingested SMS Log
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No SMS messages yet.</div>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-slate-800">{l.from}</span>
                      <span className="font-bold text-rose-600">{l.trackingCode}</span>
                    </div>
                    <p className="text-slate-600 font-mono text-[11px]">"{l.body}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
