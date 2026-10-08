import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SafetyBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-950/60 border border-amber-600/50 rounded-lg p-2.5 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-300">SAFETY DIRECTIVE:</span>
          <span>Volunteer safety comes before volunteer service. Act as a Digital Coordinator — do NOT enter danger zones.</span>
        </div>
        <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono border border-amber-500/30">
          REMOTE ONLY
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/70 border border-amber-500/40 rounded-xl p-4 md:p-5 shadow-lg shadow-amber-950/20 mb-6">
      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Core Safety Protocol
              </span>
              <span className="text-xs text-slate-400">NSS Emergency Doctrine</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              “Volunteer Safety Comes Before Volunteer Service.”
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              As an NSS Digital Emergency Coordinator, you save lives by maintaining a high-speed communication bridge between citizens and authorized emergency services. <strong className="text-amber-200">You do NOT physically deploy into floodwaters, active fires, or structural collapse zones.</strong>
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Command Active</span>
          </div>
          <span className="text-[11px] text-slate-400">Zero Physical Hazard</span>
        </div>
      </div>
    </div>
  );
}
