import React, { useEffect, useState, useContext } from 'react';
import { User, Car, FileText, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import styles from './DriverProfile.module.css';

const DriverProfile = () => {
  const { user } = useContext(AuthContext);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data.success) {
          setDriver(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <h1 className={styles.pageTitle}>Driver Profile & Documents</h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading profile...</p>
      </div>
    );
  }

  const d = driver || {};
  const initials = d.name ? d.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'DR';
  const vehicle = d.vehicle || {};
  const docs = d.documents || {};
  const rating = d.rating?.average?.toFixed(1) || '5.0';
  const employeeId = d.employeeId || 'Not assigned';

  const docList = [
    { 
      key: 'drivingLicense', 
      label: "Driver's License", 
      data: docs.drivingLicense,
      expiry: docs.drivingLicense?.expiryDate 
    },
    { 
      key: 'vehicleRC', 
      label: 'Vehicle Registration (RC)', 
      data: docs.vehicleRC,
      expiry: docs.vehicleRC?.expiryDate 
    },
    { 
      key: 'insurance', 
      label: 'Vehicle Insurance', 
      data: docs.insurance,
      expiry: docs.insurance?.expiryDate 
    },
    { 
      key: 'profilePhoto', 
      label: 'Profile Photo', 
      data: docs.profilePhoto,
      expiry: null 
    },
  ];

  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const exp = new Date(dateStr);
    const now = new Date();
    const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays < 90;
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.pageTitle}>Driver Profile & Documents</h1>
      
      <div className={styles.grid}>
        
        {/* Profile Info Column */}
        <div className={styles.column}>
          
          <div className={styles.card}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>{initials}</div>
              <div className={styles.profileInfo}>
                <h2>{d.name || 'Driver'}</h2>
                <p>{d.approvalStatus === 'approved' ? 'Verified Driver' : d.approvalStatus || 'Driver'} &bull; <span className={styles.star}>★</span> {rating}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className={styles.infoRow}>
                <div className={`${styles.iconBox} ${styles.iconBoxUser}`}>
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={styles.infoLabel}>Employee ID</p>
                  <p className={styles.infoValue}>{employeeId}</p>
                </div>
              </div>

              {d.phone && (
                <div className={styles.infoRow}>
                  <div className={`${styles.iconBox} ${styles.iconBoxUser}`}>
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className={styles.infoLabel}>Phone</p>
                    <p className={styles.infoValue}>{d.countryCode || '+91'} {d.phone}</p>
                  </div>
                </div>
              )}

              {d.email && (
                <div className={styles.infoRow}>
                  <div className={`${styles.iconBox} ${styles.iconBoxUser}`}>
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className={styles.infoLabel}>Email</p>
                    <p className={styles.infoValue}>{d.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardTitleWrapper}>
              <div className={`${styles.iconBox} ${styles.iconBoxCar}`}>
                <Car size={20} strokeWidth={2.5} />
              </div>
              <h3 className={styles.cardTitle}>Vehicle Details</h3>
            </div>
            
            <div className={styles.detailList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Type</span>
                <span className={styles.detailValue}>{vehicle.type ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) : 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Make / Model</span>
                <span className={styles.detailValue}>{vehicle.make || 'N/A'} {vehicle.model || ''} {vehicle.year ? `(${vehicle.year})` : ''}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Color</span>
                <span className={styles.detailValue}>{vehicle.color || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>License Plate</span>
                <span className={styles.detailValue}>{vehicle.plateNumber || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Capacity</span>
                <span className={styles.detailValue}>{vehicle.capacity || 'N/A'} seats</span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Documents Column */}
        <div className={styles.column}>
          <div className={styles.card}>
            <div className={styles.cardTitleWrapper}>
              <div className={`${styles.iconBox} ${styles.iconBoxDoc}`}>
                <FileText size={20} strokeWidth={2.5} />
              </div>
              <h3 className={styles.cardTitle}>Required Documents</h3>
            </div>
            
            <div className={styles.detailList}>
              {docList.map(doc => {
                const isVerified = doc.data?.verified;
                const expiring = isExpiringSoon(doc.expiry);
                const expired = isExpired(doc.expiry);
                const hasDoc = doc.data?.url || isVerified;

                return (
                  <div 
                    key={doc.key} 
                    className={`${styles.docItem} ${(expired || expiring) ? styles.docItemWarning : ''}`}
                  >
                    <div>
                      <p className={styles.docName}>{doc.label}</p>
                      <p className={styles.docMeta}>
                        {doc.expiry 
                          ? `Expires: ${formatDate(doc.expiry)}${expiring ? ' (Expiring soon)' : ''}${expired ? ' (Expired)' : ''}`
                          : hasDoc ? 'Uploaded' : 'Not uploaded'
                        }
                      </p>
                    </div>
                    <div className={`${styles.statusWrapper} ${isVerified ? styles.statusVerified : expired || expiring ? styles.statusWarning : ''}`}>
                      {isVerified ? (
                        <><CheckCircle size={18} strokeWidth={2.5} /> Verified</>
                      ) : expired || expiring ? (
                        <><AlertCircle size={18} strokeWidth={2.5} /> Update Needed</>
                      ) : hasDoc ? (
                        <><AlertCircle size={18} strokeWidth={2.5} /> Pending</>
                      ) : (
                        <><Upload size={18} strokeWidth={2.5} /> Upload</>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <button className={styles.btnUpload}>Upload New Document</button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DriverProfile;
