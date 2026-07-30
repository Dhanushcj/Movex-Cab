import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Green Icon for Drivers
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const center = [28.7041, 77.1025]; // Default center (Delhi)

export default function LiveMap() {
  const [mapData, setMapData] = useState({ onlineDrivers: [], activeBookings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMapData = async () => {
    try {
      const res = await api.get('/admin/map');
      if (res.data.success) {
        setMapData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching map data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-m-8 h-[calc(100vh-80px)] relative bg-gray-100">
      {/* Floating UI Overlay */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-between items-start pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-white pointer-events-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Live Tracking</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Real-time driver & ride monitoring</p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md pl-4 pr-6 py-3 rounded-2xl shadow-xl border border-white flex items-center gap-4 transition-transform hover:scale-105">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900 leading-none mb-1">{mapData.onlineDrivers?.length || 0}</div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Active Drivers</div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md pl-4 pr-6 py-3 rounded-2xl shadow-xl border border-white flex items-center gap-4 transition-transform hover:scale-105">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900 leading-none mb-1">{mapData.activeBookings?.length || 0}</div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Live Rides</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-full z-0">
        <MapContainer center={center} zoom={11} zoomControl={false} style={{ width: '100%', height: '100%' }}>
          {/* Using Google Maps raster tiles for the familiar aesthetic without the JS API limitations */}
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution='&copy; Google Maps'
          />
          {mapData.onlineDrivers?.map((driver) => (
            driver.location?.coordinates ? (
              <Marker
                key={driver._id}
                position={[
                  driver.location.coordinates[1], // lat
                  driver.location.coordinates[0]  // lng
                ]}
                icon={driverIcon}
              >
                <Popup className="rounded-xl overflow-hidden shadow-lg border-0">
                  <div className="p-1">
                    <div className="font-bold text-gray-900 text-base">{driver.name || 'Driver'}</div>
                    <div className="text-xs font-medium text-gray-500 mt-1">{driver.phone || 'No phone number'}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                      {driver.location.coordinates[1].toFixed(5)}, {driver.location.coordinates[0].toFixed(5)}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block">Online Now</div>
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
