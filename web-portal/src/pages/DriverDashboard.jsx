import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const center = { lat: 13.0827, lng: 80.2707 }; // Chennai
const libraries = ['places', 'geometry'];

const DriverDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRide, setIncomingRide] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });
  
  useEffect(() => {
    // Fetch initial status
    const fetchStatus = async () => {
      try {
        const res = await API.get('/drivers/me');
        if (res.data.success) {
          setIsOnline(res.data.data.isAvailable);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (data) => {
      setIncomingRide(data);
    };

    const handleCancelled = () => {
      setIncomingRide(null);
    };

    socket.on('ride:incoming', handleIncoming);
    socket.on('ride:cancelled', handleCancelled);

    return () => {
      socket.off('ride:incoming', handleIncoming);
      socket.off('ride:cancelled', handleCancelled);
    };
  }, [socket]);

  const toggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await API.put('/drivers/status', { isAvailable: newStatus, location: { type: 'Point', coordinates: [80.2707, 13.0827] } });
      setIsOnline(newStatus);
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const acceptRide = async () => {
    if (!incomingRide) return;
    try {
      const res = await API.put(`/bookings/${incomingRide.bookingId}/accept`, {});
      if (res.data.success) {
        socket.emit('ride:accept', {
          bookingId: incomingRide.bookingId,
          driverId: user._id,
          driverInfo: {
            name: user.name,
            phone: user.phone,
            vehicle: user.vehicle
          },
          booking: res.data.data
        });
        setIncomingRide(null);
        navigate(`/driver/active-ride/${incomingRide.bookingId}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to accept ride');
      setIncomingRide(null);
    }
  };

  const rejectRide = () => {
    setIncomingRide(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Driver Dashboard</h1>
        <button 
          onClick={toggleOnline}
          style={{
            padding: '10px 24px',
            background: isOnline ? 'var(--error)' : 'var(--success)',
            color: '#fff',
            borderRadius: 'var(--border-radius)',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>
      
      <div style={{ flex: 1, position: 'relative', border: '1px solid var(--border-light)', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={14}
            options={{ disableDefaultUI: true }}
          >
            <Marker position={center} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} />
          </GoogleMap>
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading Map...
          </div>
        )}

        {/* Incoming Ride Overlay */}
        {incomingRide && (
          <div style={{
            position: 'absolute',
            bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-light)',
            width: '90%', maxWidth: '400px',
            textAlign: 'center',
            zIndex: 10
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '20px' }}>New Ride Request</h3>
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <p><strong>Pickup:</strong> {incomingRide.pickup?.address}</p>
              <p><strong>Dropoff:</strong> {incomingRide.drop?.address}</p>
              <p><strong>Est. Distance:</strong> {incomingRide.distanceToPickup} km</p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={rejectRide}
                style={{ flex: 1, padding: '12px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: 'var(--border-radius)' }}
              >
                Reject
              </button>
              <button 
                onClick={acceptRide}
                style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius)' }}
              >
                Accept
              </button>
            </div>
          </div>
        )}

        {!isOnline && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px',
            fontWeight: 'bold',
            zIndex: 5
          }}>
            You are Offline
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
