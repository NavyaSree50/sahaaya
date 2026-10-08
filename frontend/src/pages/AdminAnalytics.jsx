import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, AlertTriangle, ShieldCheck, CheckCircle2, 
  Clock, MapPin, Download, RefreshCw, Radio
} from 'lucide-react';
import { getAnalytics } from '../utils/api';
import EmergencyMap from '../components/EmergencyMap';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const exportCSV = () => {
    if (!data || !data.mapIncidents) return;
    const headers = ['Tracking Code', 'Emergency Type', 'Urgency Score', 'Status', 'Victim Name', 'People Count', 'Address', 'Dispatched Agency', 'Created At'];
    const rows = data.mapIncidents.map(i => [
      i.tracking_code,
      i.emergency_type,
      i.urgency_score,
      i.status,
      `"${i.victim_name}"`,
      i.people_count,
      `"${i.address.replace(/"/g, '""')}"`,
      `"${i.dispatched_agency_name || 'N/A'}"`,
      i.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sahaaya_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading Command Center Stats...
      </div>
    );
  }

  const { summary, statusDistribution = [], typeDistribution = [], mapIncidents = [] } = data || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Emergency Response Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of emergency requests, people assisted, and active NSS student volunteers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAnalytics}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500">Total Requests</div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
            {summary?.totalIncidents || 0}
          </div>
          <p className="text-xs text-rose-600 mt-1 font-semibold">
            {summary?.activeIncidents || 0} active now
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500">People Assisted</div>
          <div className="text-3xl font-black text-emerald-600 mt-2 font-mono">
            {summary?.rescuedPeople || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Out of {summary?.totalPeopleImpacted || 0} reported lives
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500">Active Volunteers</div>
          <div className="text-3xl font-black text-amber-600 mt-2 font-mono">
            {summary?.activeVolunteers || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            NSS Digital Coordinators on duty
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500">Avg Priority Score</div>
          <div className="text-3xl font-black text-blue-600 mt-2 font-mono">
            {summary?.avgUrgency || 0}<span className="text-xs text-slate-400 font-sans">/100</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculated urgency
          </p>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            <span>Incident Locations Map</span>
          </h3>
          <span className="text-xs font-mono font-bold text-slate-500">
            {mapIncidents.length} pins plotted
          </span>
        </div>

        <EmergencyMap
          incidents={mapIncidents}
          height="380px"
          zoom={5}
          showPerimeter={false}
        />
      </div>

      {/* Simple Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="text-base font-bold text-slate-900">
          All Emergency Log Records
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tracking Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mapIncidents.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{inc.tracking_code}</td>
                  <td className="py-3 px-4 font-semibold">{inc.emergency_type}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{inc.victim_name}</td>
                  <td className="py-3 px-4 font-mono">{inc.people_count}</td>
                  <td className="py-3 px-4 text-slate-500 line-clamp-1">{inc.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
