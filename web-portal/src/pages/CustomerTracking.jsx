import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, ShieldCheck, CheckCircle2, Navigation } from 'lucide-react';
import styles from './CustomerBooking.module.css'; // Reusing styles
import API from '../services/api';
import { SocketContext } from '../context/SocketContext';

const CustomerTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [ride, setRide] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [status, setStatus] = useState('searching');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await API.get(`/bookings/${id}`);
        if (res.data.success) {
          setRide(res.data.data);
          setStatus(res.data.data.status);
          if (res.data.data.driver) {
            setDriverInfo(res.data.data.driver);
          }
        }
      } catch (err) {
        console.error('Failed to fetch ride', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  useEffect(() => {
    if (!socket || !ride) return;

    socket.emit('tracking:join', { bookingId: ride._id });

    const handleStatusUpdate = (data) => {
      setStatus(data.status);
    };

    const handleRideAccepted = (data) => {
      if (data.driverInfo) setDriverInfo(data.driverInfo);
      if (data.booking) {
        setRide(data.booking);
      }
      setStatus('accepted');
    };

    const handleRideStarted = () => {
      setStatus('in_progress');
    };

    const handleRideCompleted = () => {
      setStatus('completed');
    };

    socket.on('booking:status', handleStatusUpdate);
    socket.on('ride:accepted', handleRideAccepted);
    socket.on('ride:started', handleRideStarted);
    socket.on('ride:completed', handleRideCompleted);

    return () => {
      socket.off('booking:status', handleStatusUpdate);
      socket.off('ride:accepted', handleRideAccepted);
      socket.off('ride:started', handleRideStarted);
      socket.off('ride:completed', handleRideCompleted);
    };
  }, [socket, ride]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.bookingContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.searchCard}>
          <h3 style={{ marginBottom: '20px' }}>
            {status === 'searching' && 'Finding your driver...'}
            {status === 'accepted' && 'Driver is on the way'}
            {status === 'arrived' && 'Driver has arrived'}
            {status === 'in_progress' && 'Trip in progress'}
            {status === 'completed' && 'Trip completed'}
          </h3>

          {status === 'searching' ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px', border: '4px solid var(--border-light)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p>Connecting you to nearby drivers...</p>
            </div>
          ) : (
            <>
              {driverInfo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-dark)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-light)' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--border-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {driverInfo.name ? driverInfo.name[0] : 'D'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '18px' }}>{driverInfo.name || 'Your Driver'}</h4>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>4.9 ★ • {driverInfo.vehicle?.make || 'Car'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{driverInfo.vehicle?.plateNumber || 'XYZ-123'}</div>
                  </div>
                </div>
              )}

              {(status === 'accepted' || status === 'arrived') && (
                <div style={{ backgroundColor: 'var(--bg-dark)', padding: '24px', borderRadius: 'var(--border-radius)', textAlign: 'center', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
                  <p style={{ margin: '0 0 12px', color: 'var(--text-muted)' }}>Provide this OTP to your driver</p>
                  <div style={{ fontSize: '32px', letterSpacing: '8px', fontWeight: 'bold' }}>{ride?.rideOTP || '----'}</div>
                </div>
              )}

              <div className={styles.inputGroup}>
                <div className={styles.iconWrapper}>
                  <div className={styles.dot}></div>
                  <div className={styles.line}></div>
                  <div className={styles.square}></div>
                </div>
                <div className={styles.inputs}>
                  <div style={{ padding: '12px 16px', background: 'var(--bg-dark)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-light)' }}>
                    {ride?.pickup?.address}
                  </div>
                  <div style={{ padding: '12px 16px', background: 'var(--bg-dark)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-light)' }}>
                    {ride?.drop?.address}
                  </div>
                </div>
              </div>

              {status === 'completed' && (
                <button 
                  className={styles.btnBook} 
                  style={{ marginTop: '24px' }}
                  onClick={() => navigate('/customer/dashboard')}
                >
                  Done
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className={styles.mapPanel}>
        <div className={styles.mapPlaceholder}>
          <Navigation size={64} style={{ marginBottom: '16px', color: 'var(--primary)', opacity: 0.8 }} />
          <h3>Map Tracking View</h3>
          <p>Location tracking not fully visualized in this example.</p>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CustomerTracking;
