import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Navigation, CheckCircle2, XCircle } from 'lucide-react';
import API from '../services/api';

const DriverHistory = () => {
  const [pastRides, setPastRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/drivers/earnings');
        if (res.data.success) {
          const rides = [...(res.data.rides || []), ...(res.data.cancelledRides || [])];
          rides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setPastRides(rides);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '24px' };
  const headerStyle = { fontSize: '28px', fontWeight: '800', color: 'var(--forge-blue-deep)', marginBottom: '24px', letterSpacing: '-0.5px' };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Trip History</h1>
      
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading your trips...</p>
        </div>
      ) : pastRides.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '20px', 
          padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Navigation size={40} color="#94A3B8" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 12px 0' }}>No trips found</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>Your completed and cancelled trips will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {pastRides.map(ride => {
            const dateObj = new Date(ride.createdAt);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            
            // Format addresses
            const pickupStr = ride.pickup?.address || 'Selected Location';
            const dropoffStr = ride.dropoff?.address || ride.drop?.address || 'Selected Location';
            
            // Format price
            const fareAmount = typeof ride.fare === 'object' 
              ? (ride.fare?.finalFare || ride.fare?.estimatedFare || 0) 
              : (ride.fare || 0);

            const isCancelled = ride.status === 'cancelled';
            const isCompleted = ride.status === 'completed';

            return (
              <div key={ride._id} style={{ 
                background: 'var(--bg-white)', 
                border: '1px solid var(--border-light)', 
                borderRadius: '16px', 
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                alignItems: 'center'
              }}>
                
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px' }}>
                    <Calendar size={20} color="var(--forge-blue)" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{dateStr}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{timeStr}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <MapPin size={18} color="#D97706" style={{ marginTop: '2px' }} />
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Pickup</p>
                        <p style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>{pickupStr}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <MapPin size={18} color="#4F46E5" style={{ marginTop: '2px' }} />
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Dropoff</p>
                        <p style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>{dropoffStr}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
                       {isCompleted && <CheckCircle2 size={16} color="#10B981" />}
                       {isCancelled && <XCircle size={16} color="#EF4444" />}
                       {!isCompleted && !isCancelled && <Clock size={16} color="#F59E0B" />}
                       
                       <span style={{ fontSize: '14px', fontWeight: '700', color: isCompleted ? '#10B981' : isCancelled ? '#EF4444' : '#F59E0B' }}>
                         {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                       </span>

                       {ride.customer?.name && (
                         <span style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid #CBD5E1' }}>
                           Customer: <strong>{ride.customer.name}</strong>
                         </span>
                       )}
                    </div>
                  </div>
                </div>


                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DriverHistory;
