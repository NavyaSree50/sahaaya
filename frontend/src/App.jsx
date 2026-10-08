import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CitizenSOS from './pages/CitizenSOS';
import CitizenTrack from './pages/CitizenTrack';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import EmergencyDirectory from './pages/EmergencyDirectory';
import SMSGatewaySimulator from './pages/SMSGatewaySimulator';
import { useSocket } from './context/SocketContext';
import { AlertTriangle, ArrowRight, Shield, HeartHandshake } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('sos');
  const [activeTrackingCode, setActiveTrackingCode] = useState('SHY-7821');
  const { lastNotification } = useSocket();

  const handleSOSTriggered = (trackingCode) => {
    setActiveTrackingCode(trackingCode);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Real-time incoming SOS Notification Toast */}
      {lastNotification && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xl animate-bounce sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 animate-spin" />
            <span>CRITICAL ALERT: New Emergency Distress Received ({lastNotification.incident?.tracking_code} - {lastNotification.incident?.emergency_type})</span>
          </div>
          <button
            onClick={() => {
              setActiveTab('volunteer');
            }}
            className="underline flex items-center gap-1 hover:text-rose-200"
          >
            <span>Open Coordinator Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Page Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'sos' && (
          <CitizenSOS onSOSTriggered={handleSOSTriggered} />
        )}

        {activeTab === 'track' && (
          <CitizenTrack initialTrackingCode={activeTrackingCode} />
        )}

        {activeTab === 'volunteer' && (
          <VolunteerDashboard />
        )}

        {activeTab === 'admin' && (
          <AdminAnalytics />
        )}

        {activeTab === 'sms' && (
          <SMSGatewaySimulator onIncidentCreated={handleSOSTriggered} />
        )}

        {activeTab === 'resources' && (
          <EmergencyDirectory />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Sahaaya</span>
              <span className="text-slate-500"> — Digital Community Emergency Coordination</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span>“Volunteer safety comes before volunteer service.”</span>
          </div>

          <div className="text-xs text-slate-400">
            National Service Scheme • ERSS 112 • 108 EMS
          </div>
        </div>
      </footer>
    </div>
  );
}
