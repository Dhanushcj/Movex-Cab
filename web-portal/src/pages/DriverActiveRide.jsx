import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { SocketContext } from '../context/SocketContext';
import API from '../services/api';

const libraries = ['places', 'geometry'];

const DriverActiveRide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [ride, setRide] = useState(null);
  const [status, setStatus] = useState('accepted');
  const [otp, setOtp] = useState('');
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await API.get(`/bookings/${id}`);
        if (res.data.success) {
          setRide(res.data.data);
          setStatus(res.data.data.status);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  useEffect(() => {
    if (!ride || !isLoaded) return;
    
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    
    let origin, destination;
    
    if (status === 'accepted' || status === 'arrived') {
      // Driver navigating to pickup
      origin = { lat: 13.0827, lng: 80.2707 }; // Mock current loc
      destination = { lat: ride.pickup.coordinates[1], lng: ride.pickup.coordinates[0] };
    } else if (status === 'in_progress') {
      // Driver navigating to dropoff
      origin = { lat: ride.pickup.coordinates[1], lng: ride.pickup.coordinates[0] };
      destination = { lat: ride.drop.coordinates[1], lng: ride.drop.coordinates[0] };
    }
    
    if (origin && destination) {
      directionsService.route({
        origin,
        destination,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, stat) => {
        // eslint-disable-next-line no-undef
        if (stat === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      });
    }
  }, [ride, isLoaded, status]);

  const handleArrive = async () => {
    try {
      const res = await API.put(`/bookings/${id}/arrived`, {});
      if (res.data.success) {
        setStatus('arrived');
        socket.emit('booking:status', { bookingId: id, status: 'arrived' });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleStartTrip = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) return alert('Enter 4-digit OTP');
    try {
      const res = await API.put(`/bookings/${id}/start`, { otp });
      if (res.data.success) {
        setStatus('in_progress');
        socket.emit('ride:started', { bookingId: id });
        socket.emit('booking:status', { bookingId: id, status: 'in_progress' });
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleCompleteTrip = async () => {
    try {
      const res = await API.put(`/bookings/${id}/complete`, {});
      if (res.data.success) {
        setStatus('completed');
        socket.emit('ride:completed', { bookingId: id });
        socket.emit('booking:status', { bookingId: id, status: 'completed' });
        alert('Trip Completed!');
        navigate('/driver/dashboard');
      }
    } catch (e) {
      alert('Failed to complete trip');
    }
  };

  if (loading) return <div>Loading ride...</div>;
  if (!ride) return <div>Ride not found</div>;

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-light)' }}>
          <h2 style={{ marginBottom: '16px' }}>Ride Status</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <p style={{ margin: '0 0 8px', color: 'var(--text-muted)' }}>Customer</p>
            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{ride.customer?.name || 'Customer'}</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <p style={{ margin: '0 0 8px', color: 'var(--text-muted)' }}>Locations</p>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Pickup:</strong> {ride.pickup.address}</p>
            <p style={{ fontSize: '14px' }}><strong>Drop:</strong> {ride.drop.address}</p>
          </div>

          {status === 'accepted' && (
            <button 
              onClick={handleArrive}
              style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius)', fontWeight: 'bold' }}
            >
              I Have Arrived
            </button>
          )}

          {status === 'arrived' && (
            <form onSubmit={handleStartTrip} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 8px' }}>Enter 4-digit OTP from customer</p>
                <input 
                  type="text" 
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', padding: '16px', fontSize: '24px', textAlign: 'center', letterSpacing: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: 'var(--border-radius)' }}
                />
              </div>
              <button 
                type="submit"
                style={{ width: '100%', padding: '16px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius)', fontWeight: 'bold' }}
              >
                Start Trip
              </button>
            </form>
          )}

          {status === 'in_progress' && (
            <button 
              onClick={handleCompleteTrip}
              style={{ width: '100%', padding: '16px', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius)', fontWeight: 'bold' }}
            >
              Complete Trip
            </button>
          )}
        </div>
      </div>
      
      <div style={{ flex: 2, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: ride.pickup.coordinates[1], lng: ride.pickup.coordinates[0] }}
            zoom={14}
            options={{ disableDefaultUI: true }}
          >
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading Map...</div>
        )}
      </div>
    </div>
  );
};

export default DriverActiveRide;
