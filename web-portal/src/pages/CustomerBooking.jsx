import React, { useState } from 'react';
import { Map, MapPin, CarFront, Users } from 'lucide-react';
import styles from './CustomerBooking.module.css';

const CustomerBooking = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('mini');

  const vehicles = [
    { id: 'mini', name: 'MoveX Mini', desc: 'Compact rides for daily commutes', price: '$12.50', capacity: 3, time: '3 min' },
    { id: 'sedan', name: 'MoveX Sedan', desc: 'Comfortable rides for longer trips', price: '$18.00', capacity: 4, time: '5 min' },
    { id: 'suv', name: 'MoveX XL', desc: 'Extra space for groups and luggage', price: '$26.50', capacity: 6, time: '8 min' },
  ];

  return (
    <div className={styles.bookingContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.searchCard}>
          <h3 style={{ marginBottom: '20px' }}>Where to?</h3>
          
          <div className={styles.inputGroup}>
            <div className={styles.iconWrapper}>
              <div className={styles.dot}></div>
              <div className={styles.line}></div>
              <div className={styles.square}></div>
            </div>
            <div className={styles.inputs}>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Pickup Location" 
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Destination" 
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
              />
            </div>
          </div>
        </div>

        {pickup && dropoff && (
          <div className={styles.searchCard}>
            <h3 style={{ marginBottom: '20px' }}>Choose a Ride</h3>
            <div className={styles.vehicleOptions}>
              {vehicles.map(v => (
                <div 
                  key={v.id} 
                  className={`${styles.vehicleCard} ${selectedVehicle === v.id ? styles.selected : ''}`}
                  onClick={() => setSelectedVehicle(v.id)}
                >
                  <div className={styles.vehicleInfo}>
                    <div className={styles.vehicleIcon}>
                      <CarFront size={24} />
                    </div>
                    <div className={styles.vehicleDetails}>
                      <h4>{v.name} <span style={{fontSize: '12px', fontWeight: 'normal', marginLeft: '8px'}}>{v.time} away</span></h4>
                      <p>{v.desc}</p>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Users size={12} /> {v.capacity} seats
                      </p>
                    </div>
                  </div>
                  <div className={styles.vehiclePrice}>
                    {v.price}
                  </div>
                </div>
              ))}
            </div>
            
            <button className={styles.btnBook} style={{ marginTop: '24px' }}>
              Confirm Booking
            </button>
          </div>
        )}
      </div>

      <div className={styles.mapPanel}>
        <div className={styles.mapPlaceholder}>
          <Map size={64} style={{ marginBottom: '16px', color: 'var(--primary)', opacity: 0.8 }} />
          <h3>Interactive Map View</h3>
          <p>This section will integrate with Google Maps / Mapbox API.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerBooking;
