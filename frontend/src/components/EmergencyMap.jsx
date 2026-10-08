import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, Users, AlertTriangle } from 'lucide-react';

// Center map controller helper
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Create custom modern divIcon markers with SVG
function createCustomMarkerIcon(type, priority) {
  let bgColor = '#f59e0b'; // amber
  if (priority === 'CRITICAL') bgColor = '#ef4444'; // red
  else if (priority === 'HIGH') bgColor = '#f97316'; // orange
  else if (priority === 'MEDIUM') bgColor = '#eab308'; // yellow

  let iconEmoji = '⚠️';
  if (type === 'FLOOD') iconEmoji = '🌊';
  else if (type === 'FIRE') iconEmoji = '🔥';
  else if (type === 'MEDICAL') iconEmoji = '🚑';
  else if (type === 'ROAD_ACCIDENT') iconEmoji = '🚗';
  else if (type === 'BUILDING_COLLAPSE') iconEmoji = '🏚️';

  return L.divIcon({
    className: 'custom-emergency-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background-color: ${bgColor};
        color: white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        border: 2px solid white;
        font-size: 18px;
        cursor: pointer;
      ">
        <span>${iconEmoji}</span>
        ${priority === 'CRITICAL' ? `
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid ${bgColor};
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            opacity: 0.75;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
}

export default function EmergencyMap({
  incidents = [],
  selectedIncident = null,
  height = '420px',
  zoom = 12,
  showPerimeter = true
}) {
  // Determine center coordinates
  let center = [12.9716, 77.5946]; // Default: India central coordinates (Bengaluru)
  if (selectedIncident && selectedIncident.latitude && selectedIncident.longitude) {
    center = [selectedIncident.latitude, selectedIncident.longitude];
  } else if (incidents.length > 0 && incidents[0].latitude) {
    center = [incidents[0].latitude, incidents[0].longitude];
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-inner" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', backgroundColor: '#0f172a' }}
      >
        <ChangeView center={center} zoom={selectedIncident ? 14 : zoom} />

        {/* Dark-themed OpenStreetMap tiles (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Selected Incident Hazard Danger Buffer */}
        {selectedIncident && showPerimeter && selectedIncident.latitude && (
          <Circle
            center={[selectedIncident.latitude, selectedIncident.longitude]}
            radius={450} // 450m hazard perimeter
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '4, 8'
            }}
          />
        )}

        {/* Plot incidents */}
        {incidents.map((inc) => {
          if (!inc.latitude || !inc.longitude) return null;
          const markerIcon = createCustomMarkerIcon(inc.emergency_type, inc.priority_band);
          const gmapsUrl = `https://www.google.com/maps?q=${inc.latitude},${inc.longitude}`;

          return (
            <Marker
              key={inc.id || inc.tracking_code}
              position={[inc.latitude, inc.longitude]}
              icon={markerIcon}
            >
              <Popup className="sahaaya-popup">
                <div className="p-1 min-w-[220px] text-slate-900">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-mono text-xs font-bold text-rose-600">{inc.tracking_code}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {inc.emergency_type}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-900">{inc.victim_name}</div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{inc.address}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-700">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3 h-3 text-slate-500" /> {inc.people_count} person(s)
                    </span>
                    <span className="font-semibold text-amber-700">Status: {inc.status}</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" /> Maps Link
                    </a>
                    <span className="text-[10px] text-slate-400">Score: {inc.urgency_score || 50}/100</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-[11px] text-slate-300 shadow-lg hidden sm:block">
        <div className="font-bold text-slate-200 text-xs mb-1.5 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-rose-400" />
          <span>Incident Map Legend</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical Priority (85+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>High Priority (70-84)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>Medium Priority</span>
          </div>
        </div>
        {selectedIncident && (
          <div className="mt-2 pt-1.5 border-t border-slate-700/80 text-[10px] text-rose-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>Red Circle = 450m Danger Buffer</span>
          </div>
        )}
      </div>
    </div>
  );
}
