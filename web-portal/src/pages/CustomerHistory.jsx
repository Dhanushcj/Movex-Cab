import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

const CustomerHistory = () => {
  const pastRides = [
    {
      id: 'TRP-10492',
      date: 'Aug 04, 2026',
      pickup: '123 Main St, City Center',
      dropoff: 'Airport Terminal 2',
      amount: '$45.00',
      status: 'Completed',
      vehicle: 'MoveX Sedan'
    },
    {
      id: 'TRP-10381',
      date: 'Aug 01, 2026',
      pickup: 'Central Station',
      dropoff: '890 Tech Park Blvd',
      amount: '$18.50',
      status: 'Completed',
      vehicle: 'MoveX Mini'
    },
    {
      id: 'TRP-10214',
      date: 'Jul 28, 2026',
      pickup: 'Shopping Mall',
      dropoff: '123 Main St, City Center',
      amount: '$22.00',
      status: 'Cancelled',
      vehicle: 'MoveX XL'
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Ride History</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {pastRides.map(ride => (
          <div key={ride.id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Calendar size={24} />
                <span style={{ fontSize: '12px' }}>{ride.date}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <MapPin size={16} color="var(--success)" style={{ marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Pickup</p>
                    <p style={{ fontWeight: '500' }}>{ride.pickup}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <MapPin size={16} color="var(--error)" style={{ marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Dropoff</p>
                    <p style={{ fontWeight: '500' }}>{ride.dropoff}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
              <span style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '12px',
                fontWeight: '600',
                background: ride.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: ride.status === 'Completed' ? 'var(--success)' : 'var(--error)'
              }}>
                {ride.status}
              </span>
              <h3 style={{ fontSize: '24px', margin: 0 }}>{ride.amount}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> {ride.id} • {ride.vehicle}
              </p>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerHistory;
