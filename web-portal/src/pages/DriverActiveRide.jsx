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
  const [currentLocation, setCurrentLocation] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore

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
    <div style={{ display: 'flex', gap: '24px', height: '100%', fontFamily: 'var(--font-family)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '420px' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ marginBottom: '24px', color: 'var(--forge-blue-deep)', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>Ride Status</h2>
          
          <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-section-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <p style={{ margin: '0 0 4px', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', fontWeight: '700' }}>Customer</p>
            <p style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>{ride.customer?.name || 'Customer'}</p>
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <p style={{ margin: '0 0 12px', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', fontWeight: '700' }}>Locations</p>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white', border: '3px solid var(--forge-blue)', marginTop: '4px' }}></div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 2px 0', fontWeight: '600' }}>Pickup</p>
                <p style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>{ride.pickup.address}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white', border: '3px solid var(--status-success)', marginTop: '4px' }}></div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 2px 0', fontWeight: '600' }}>Dropoff</p>
                <p style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>{ride.drop.address}</p>
              </div>
            </div>
          </div>

          {status === 'accepted' && (
            <button 
              onClick={handleArrive}
              style={{ width: '100%', padding: '16px', background: 'var(--forge-blue)', color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)', fontWeight: '700', fontSize: '16px', boxShadow: '0 4px 14px rgba(7, 90, 170, 0.3)', cursor: 'pointer' }}
            >
              I Have Arrived
            </button>
          )}

          {status === 'arrived' && (
            <form onSubmit={handleStartTrip} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 8px', fontWeight: '600', color: 'var(--text-primary)' }}>Enter 4-digit OTP from customer</p>
                <input 
                  type="text" 
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', padding: '16px', fontSize: '24px', fontWeight: '700', textAlign: 'center', letterSpacing: '12px', background: '#F8FAFC', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--forge-blue-deep)' }}
                />
              </div>
              <button 
                type="submit"
                style={{ width: '100%', padding: '16px', background: 'var(--status-success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
              >
                Start Trip
              </button>
            </form>
          )}

          {status === 'in_progress' && (
            <button 
              onClick={handleCompleteTrip}
              style={{ width: '100%', padding: '16px', background: 'var(--forge-blue)', color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(7, 90, 170, 0.3)' }}
            >
              Complete Trip
            </button>
          )}
        </div>
      </div>
      
      <div style={{ flex: 2, background: '#E2E8F0', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: ride.pickup.coordinates[1], lng: ride.pickup.coordinates[0] }}
            zoom={14}
            options={{ 
              disableDefaultUI: true,
              styles: [
                { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
                { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
                { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
                { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
                { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
              ]
            }}
          >
            {directions && <DirectionsRenderer directions={directions} options={{
              polylineOptions: { strokeColor: '#075AAA', strokeWeight: 6 }
            }} />}
          </GoogleMap>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontWeight: '600' }}>Loading Navigation...</div>
        )}
      </div>
    </div>
  );
};

export default DriverActiveRide;
