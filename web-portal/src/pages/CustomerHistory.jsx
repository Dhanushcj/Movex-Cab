import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import API from '../services/api';

const CustomerHistory = () => {
  const [pastRides, setPastRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/users/me/rides');
        if (res.data.success) {
          setPastRides(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleCancelRide = async (id) => {
    if (window.confirm("Are you sure you want to cancel this ride?")) {
      try {
        const res = await API.put(`/bookings/${id}/cancel`, { reason: 'User requested cancellation' });
        if (res.data.success) {
          // Update the specific ride status in state
          setPastRides(prev => prev.map(ride => 
            ride._id === id ? { ...ride, status: 'cancelled' } : ride
          ));
        }
      } catch (err) {
        console.error('Failed to cancel ride', err);
        alert(err.response?.data?.message || 'Failed to cancel ride');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 0' }}>
      <h1 style={{ fontSize: '42px', fontWeight: '700', color: 'var(--forge-blue)', marginBottom: '24px', fontFamily: `'Poppins', sans-serif`, lineHeight: '1.15' }}>Ride History</h1>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading history...</p>
      ) : pastRides.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>You have no past rides.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pastRides.map(ride => {
            const dateObj = new Date(ride.createdAt);
            const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Format addresses
            const pickupStr = ride.pickup?.address || 'Selected Location';
            const dropoffStr = ride.dropoff?.address || ride.drop?.address || 'Selected Location';
            
            // Format price
            const fareAmount = typeof ride.fare === 'object' 
              ? (ride.fare?.finalFare || ride.fare?.estimatedFare || 0) 
              : (ride.fare || 0);

            const isCancelled = ride.status === 'cancelled';
            const isCompleted = ride.status === 'completed';
            const canCancel = !isCancelled && !isCompleted && ride.status !== 'failed';
            const displayStatus = isCancelled ? 'Cancelled' : (isCompleted ? 'Completed' : 'In Progress');

            return (
              <div key={ride._id} className="white-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', marginBottom: '16px' }}>
                
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Calendar size={24} />
                    <span style={{ fontSize: '12px' }}>{dateStr}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <MapPin size={16} color="var(--success)" style={{ marginTop: '2px' }} />
                      <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Pickup</p>
                        <p style={{ fontWeight: '500' }}>{pickupStr}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <MapPin size={16} color="var(--error)" style={{ marginTop: '2px' }} />
                      <div>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Dropoff</p>
                        <p style={{ fontWeight: '500' }}>{dropoffStr}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {canCancel && (
                      <button 
                        onClick={() => handleCancelRide(ride._id)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          border: '1px solid var(--error)',
                          background: 'transparent',
                          color: 'var(--error)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        Cancel Ride
                      </button>
                    )}
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: '600',
                      background: displayStatus === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : (displayStatus === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 159, 12, 0.1)'),
                      color: displayStatus === 'Completed' ? 'var(--success)' : (displayStatus === 'Cancelled' ? 'var(--error)' : '#D49F0C')
                    }}>
                      {displayStatus}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <Clock size={14} /> {timeStr} • {ride.vehicleType || 'Ride'}
                  </p>
                </div>
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerHistory;
