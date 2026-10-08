import React from 'react';
import { 
  Phone, Shield, AlertTriangle, BookOpen, HeartPulse, 
  Flame, Droplets, Car, HelpCircle, Building2, CheckCircle2
} from 'lucide-react';
import { EMERGENCY_ADVICE } from '../utils/emergencyAdvice';

const HELPLINES = [
  { number: '112', title: 'National Unified Emergency Response (ERSS)', desc: 'Single pan-India emergency number for Police, Fire, and Ambulance.', tag: 'All Emergencies' },
  { number: '108', title: 'State Emergency Ambulance Service', desc: 'Free emergency medical dispatch & life support ambulance transfer.', tag: 'Medical' },
  { number: '101', title: 'Fire & Rescue Services', desc: 'Control room for structural fires, industrial fires, and rescue operations.', tag: 'Fire' },
  { number: '100', title: 'Police Emergency Control', desc: 'Law enforcement, violent crimes, road traffic accidents, and crowd management.', tag: 'Police' },
  { number: '1070', title: 'National Disaster Management (NDRF)', desc: 'State & Central emergency operational centre for major floods, cyclones, landslides.', tag: 'Disaster / NDRF' },
  { number: '1077', title: 'District Disaster Management Authority (DDMA)', desc: 'District collector control room for localized evacuation and relief camps.', tag: 'District Relief' },
  { number: '1091', title: 'Women Safety Helpline', desc: 'Dedicated 24x7 distress helpline for women facing imminent danger or harassment.', tag: 'Women Safety' },
  { number: '1098', title: 'Childline India', desc: '24-hour nationwide emergency phone outreach service for children in need of care.', tag: 'Children' }
];

export default function EmergencyDirectory() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Official Public Directory & Preparedness</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Emergency Helplines & Survival Protocols
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Direct verified phone numbers for emergency responders, plus community first-aid and disaster response doctrine.
        </p>
      </div>

      {/* National Helplines Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>Verified Emergency Helplines (Toll-Free, 24x7)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {HELPLINES.map((h, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-rose-500 font-mono tracking-tight">
                    {h.number}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {h.tag}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mt-2 leading-tight">
                  {h.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {h.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <a
                  href={`tel:${h.number}`}
                  className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call {h.number}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Sahaaya & NSS Volunteer Doctrine FAQ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <span>About Sahaaya & The NSS Digital Emergency Doctrine</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-amber-300 uppercase">
              1. The Real Problem
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In severe floods, multi-vehicle crashes, or building fires, affected citizens often cannot describe their coordinates or reach the correct nodal dispatcher. Simultaneously, untrained volunteers entering disaster zones risk becoming casualties themselves.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-amber-300 uppercase">
              2. The Solution
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sahaaya transforms NSS student volunteers into <strong>Digital Emergency Coordinators</strong>. Operating safely from a remote desk, they verify distress calls, filter false alarms, format structured GPS briefs, and coordinate with official rescue services.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-amber-300 uppercase">
              3. The Core Motto
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>“Volunteer safety comes before volunteer service.”</strong> Sahaaya does not replace police, fire, or NDRF. It creates an agile, informed coordination bridge so that the right rescue team reaches the right person fast.
            </p>
          </div>
        </div>
      </div>

      {/* Community First Aid & Survival Rules */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-rose-500" />
          <span>Disaster Survival Guidelines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(EMERGENCY_ADVICE).map(([key, item]) => (
            <div key={key} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {item.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                  {key}
                </span>
              </div>

              <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
                ⚠️ {item.criticalRule}
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <span className="text-[11px] font-bold text-emerald-400 block mb-1">Key Actions:</span>
                {item.dos.slice(0, 2).map((d, idx) => (
                  <p key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{d}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
