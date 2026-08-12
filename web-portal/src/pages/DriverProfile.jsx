import React, { useEffect, useState, useContext } from 'react';
import { User, Car, FileText, CheckCircle, AlertCircle, Upload, Eye } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import styles from './DriverProfile.module.css';

const DriverProfile = () => {
  const { user } = useContext(AuthContext);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = React.useRef(null);
  const [activeUploadKey, setActiveUploadKey] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeUploadKey) return;

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append(activeUploadKey, file);
      
      const res = await API.post('/drivers/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert('Document uploaded successfully!');
        fetchProfile();
      } else {
        alert('Upload failed: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
      alert('Error uploading document');
    } finally {
      setUploadingDoc(false);
      setActiveUploadKey(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
                        <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '4px'}} onClick={() => { setActiveUploadKey(doc.key); fileInputRef.current.click(); }}>
                          <AlertCircle size={18} strokeWidth={2.5} /> Update Needed
                        </div>
                      ) : hasDoc ? (
                        <><AlertCircle size={18} strokeWidth={2.5} /> Pending</>
                      ) : (
                        <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '4px'}} onClick={() => { setActiveUploadKey(doc.key); fileInputRef.current.click(); }}>
                          <Upload size={18} strokeWidth={2.5} /> Upload
                        </div>
                      )}
                      
                      {doc.data?.url && (
                        <a 
                          href={doc.data.url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ marginLeft: '16px', color: 'var(--forge-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                          title="View Document"
                        >
                          <Eye size={16} /> View
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {uploadingDoc && <p style={{textAlign: 'center', color: 'var(--forge-blue)', fontWeight: '600', marginTop: '10px'}}>Uploading...</p>}
              <button 
                className={styles.btnUpload}
                onClick={() => alert('Please click the "Upload" button next to the specific document you wish to upload.')}
              >
                Upload New Document
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }}
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DriverProfile;
