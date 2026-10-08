import React from 'react';
import { HeartHandshake, Phone, Shield, Radio, Search, Compass, BarChart3, HelpCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { connected } = useSocket();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('sos')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20 group-hover:scale-105 transition">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  Sahaaya
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Emergency Help
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Connecting Citizens • NSS Volunteers • Rescue Services
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Simple & Human Friendly */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('sos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'sos'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🚨 Ask for Help</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'track'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Track Status</span>
            </button>

            <button
              onClick={() => setActiveTab('volunteer')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'volunteer'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Volunteer Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('sms')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'sms'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>SMS Mode</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Quick Direct 112 Call */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="tel:112"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition"
            >
              <Phone className="w-3.5 h-3.5 text-rose-600" />
              <span>Direct Police / Fire / Ambulance: <strong>112</strong></span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
