import React, { useState, useEffect } from 'react';
import { X, Send, Phone, Copy, Check, ExternalLink, Shield, AlertTriangle, Clock } from 'lucide-react';
import { getAgencies, getDispatchBrief, dispatchAgency } from '../utils/api';

export default function DispatchModal({ incident, volunteer, isOpen, onClose, onSuccess }) {
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [customAgencyName, setCustomAgencyName] = useState('');
  const [customAgencyPhone, setCustomAgencyPhone] = useState('');
  const [etaMinutes, setEtaMinutes] = useState(15);
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [briefText, setBriefText] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !incident) return;

    getAgencies(incident.district || '')
      .then(data => {
        setAgencies(data);
        if (incident.emergency_type === 'FLOOD') {
          const ndrf = data.find(a => a.category === 'NDRF');
          if (ndrf) setSelectedAgency(ndrf);
        } else if (incident.emergency_type === 'FIRE') {
          const fire = data.find(a => a.category === 'FIRE');
          if (fire) setSelectedAgency(fire);
        } else if (incident.emergency_type === 'MEDICAL' || incident.emergency_type === 'ROAD_ACCIDENT') {
          const amb = data.find(a => a.category === 'AMBULANCE_108');
          if (amb) setSelectedAgency(amb);
        } else if (data.length > 0) {
          setSelectedAgency(data[0]);
        }
      })
      .catch(console.error);

    getDispatchBrief(incident.id)
      .then(res => {
        if (res.brief) setBriefText(res.brief);
      })
      .catch(console.error);
  }, [isOpen, incident]);

  if (!isOpen || !incident) return null;

  const activeAgencyName = selectedAgency ? selectedAgency.name : customAgencyName;
  const activeAgencyPhone = selectedAgency ? selectedAgency.primary_phone : customAgencyPhone;

  const handleCopy = () => {
    if (!briefText) return;
    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(briefText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeAgencyName || !activeAgencyPhone) {
      setError('Please choose an emergency service unit and telephone number.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await dispatchAgency(incident.id, {
        agencyId: selectedAgency ? selectedAgency.id : null,
        agencyName: activeAgencyName,
        agencyPhone: activeAgencyPhone,
        etaMinutes: parseInt(etaMinutes, 10) || 15,
        dispatchNotes,
        volunteerId: volunteer ? volunteer.id : null
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record agency dispatch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Emergency Service Dispatch Assistant
            </h3>
            <p className="text-xs text-slate-500">
              Relay verified victim GPS & details to Police, Fire, Ambulance, or NDRF.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* Agency Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              1. Select Authorized Emergency Service
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {agencies.map(agency => (
                <button
                  type="button"
                  key={agency.id}
                  onClick={() => setSelectedAgency(agency)}
                  className={`text-left p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                    selectedAgency && selectedAgency.id === agency.id
                      ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-500/20 text-orange-950 font-semibold'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{agency.name}</span>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <span className="font-mono font-bold text-orange-700 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {agency.primary_phone}
                    </span>
                    <span className="text-[11px] text-slate-500">{agency.district}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Standardized Briefing Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Ready-to-Send Emergency Briefing
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition border border-emerald-200 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={5}
              value={briefText}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono text-slate-700 focus:outline-none"
            />
          </div>

          {/* Arrival ETA */}
          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Estimated Arrival Time (ETA in minutes)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={etaMinutes}
                  onChange={e => setEtaMinutes(e.target.value)}
                  className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 text-center"
                />
                <span className="text-xs text-slate-500 font-medium">mins</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Confirming...' : 'Confirm Assistance on the Way'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
