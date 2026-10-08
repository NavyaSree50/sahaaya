import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Phone, MapPin, Users, AlertTriangle, ShieldCheck, 
  Send, MessageSquare, CheckCircle2, Truck, ExternalLink, Clock, FileText, Check
} from 'lucide-react';
import EmergencyMap from '../components/EmergencyMap';
import DispatchModal from '../components/DispatchModal';
import { getIncident, verifyIncident, confirmHelpReached, sendIncidentMessage } from '../utils/api';
import { useSocket } from '../context/SocketContext';

export default function VolunteerWorkbench({ incidentId, volunteer, onBack, onStatusUpdated }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [checkPhone, setCheckPhone] = useState(false);
  const [checkHeadcount, setCheckHeadcount] = useState(false);
  const [coordinatorNotes, setCoordinatorNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const { socket } = useSocket();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getIncident(incidentId);
      setIncident(data);
      if (data.coordinator_notes) setCoordinatorNotes(data.coordinator_notes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [incidentId]);

  useEffect(() => {
    if (!socket || !incident) return;
    socket.emit('join:incident', incident.tracking_code);

    const handleUpdate = (updated) => {
      if (updated.id === incident.id) loadData();
    };

    const handleMsg = (msg) => {
      setIncident(prev => {
        if (!prev) return prev;
        const exists = prev.messages && prev.messages.some(m => m.id === msg.id);
        if (exists) return prev;
        return { ...prev, messages: [...(prev.messages || []), msg] };
      });
    };

    socket.on('incident:update', handleUpdate);
    socket.on('incident:message', handleMsg);

    return () => {
      socket.emit('leave:incident', incident.tracking_code);
      socket.off('incident:update', handleUpdate);
      socket.off('incident:message', handleMsg);
    };
  }, [socket, incident?.tracking_code, incident?.id]);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      await verifyIncident(incident.id, {
        volunteerId: volunteer ? volunteer.id : null,
        verificationDetails: { phoneContactEstablished: checkPhone, headcountVerified: checkHeadcount },
        coordinatorNotes
      });
      await loadData();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert('Verification failed: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmHelp = async () => {
    if (!window.confirm('Confirm that emergency services have reached and victim is safe?')) return;
    try {
      await confirmHelpReached(incident.id, {
        volunteerId: volunteer ? volunteer.id : null,
        confirmationNotes: `Help confirmed reached by NSS Coordinator ${volunteer ? volunteer.name : ''}.`
      });
      await loadData();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert('Failed to confirm: ' + err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !incident) return;
    try {
      setSendingMsg(true);
      await sendIncidentMessage(incident.id, {
        senderType: 'VOLUNTEER',
        senderName: volunteer ? `${volunteer.name} (NSS)` : 'Digital Coordinator',
        message: chatMessage.trim()
      });
      setChatMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading || !incident) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading Coordination Desk...
      </div>
    );
  }

  const gmapsUrl = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests List</span>
        </button>

        <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          🛡️ Digital Coordinator Mode (Remote Only)
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-black text-slate-900 tracking-tight">
              {incident.tracking_code}
            </span>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {incident.emergency_type} Emergency
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              incident.status === 'HELP_REACHED' ? 'bg-emerald-100 text-emerald-800' :
              incident.status === 'ASSISTANCE_DISPATCHED' ? 'bg-orange-100 text-orange-800' :
              incident.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {incident.status.replace('_', ' ')}
            </span>
          </div>

          <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
            <span>Victim: <strong>{incident.victim_name}</strong></span>
            <span>•</span>
            <span>Phone: <strong>{incident.victim_phone}</strong></span>
            <span>•</span>
            <span>Headcount: <strong>{incident.people_count} person(s)</strong></span>
          </div>
        </div>

        {/* Quick External Map Navigation */}
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-200"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open in Google Maps</span>
        </a>
      </div>

      {/* Main 2-Column: Actions & Details + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Step-by-Step Coordination */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Victim Location: {incident.address}</span>
              </span>
            </div>

            <EmergencyMap
              incidents={[incident]}
              selectedIncident={incident}
              height="260px"
              zoom={14}
              showPerimeter={true}
            />
          </div>

          {/* Action Step 1: Telephone Verification */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Step 1</span>
                <h4 className="text-base font-bold text-slate-900">Contact Person & Verify Situation</h4>
              </div>

              <a
                href={`tel:${incident.victim_phone}`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {incident.victim_name}</span>
              </a>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkPhone}
                  onChange={e => setCheckPhone(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 w-4 h-4"
                />
                <span>Spoke on phone with victim and confirmed they need assistance</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkHeadcount}
                  onChange={e => setCheckHeadcount(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 w-4 h-4"
                />
                <span>Confirmed headcount ({incident.people_count} people) and immediate hazard</span>
              </label>
            </div>

            {incident.status === 'REPORTED' && (
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {verifying ? 'Updating...' : '✓ Mark as VERIFIED (Situation Confirmed)'}
              </button>
            )}
          </div>

          {/* Action Step 2: Emergency Service Dispatch */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Step 2</span>
                <h4 className="text-base font-bold text-slate-900">Alert Authorized Emergency Services (112, 108, NDRF)</h4>
              </div>

              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Open Dispatch Assistant</span>
              </button>
            </div>

            {incident.dispatched_agency_name ? (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-900 space-y-1">
                <p><strong>Dispatched Team:</strong> {incident.dispatched_agency_name}</p>
                <p><strong>Estimated Arrival Time:</strong> ~{incident.eta_minutes || 15} minutes</p>
                <p><strong>Phone:</strong> {incident.dispatched_agency_phone || '112'}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Click "Open Dispatch Assistant" to pick an authorized agency and copy/send the standardized brief with GPS link.
              </p>
            )}
          </div>

          {/* Action Step 3: Help Reached */}
          {incident.status === 'ASSISTANCE_DISPATCHED' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Step 3</span>
                <h4 className="text-base font-bold text-slate-900">Confirm Help Reached on Site</h4>
                <p className="text-xs text-slate-500">Mark rescue complete once the official responders arrive.</p>
              </div>

              <button
                onClick={handleConfirmHelp}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Help Reached</span>
              </button>
            </div>
          )}

        </div>

        {/* Right 1 Col: Clean In-App Citizen Chat */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Message with {incident.victim_name}
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
            {incident.messages && incident.messages.length > 0 ? (
              incident.messages.map((m, i) => {
                const isVolunteer = m.sender_type === 'VOLUNTEER';
                return (
                  <div key={m.id || i} className={`flex flex-col ${isVolunteer ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-semibold">
                      {m.sender_name}
                    </span>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                      isVolunteer
                        ? 'bg-amber-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {m.message}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center">
                Send reassuring instructions or status updates to the citizen here.
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              placeholder="Send guidance to victim..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={sendingMsg || !chatMessage.trim()}
              className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Dispatch Modal */}
      <DispatchModal
        incident={incident}
        volunteer={volunteer}
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onSuccess={() => {
          loadData();
          if (onStatusUpdated) onStatusUpdated();
        }}
      />
    </div>
  );
}
