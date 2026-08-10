import React from 'react';
import { User, Car, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './DriverProfile.module.css';

const DriverProfile = () => {
  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.pageTitle}>Driver Profile & Documents</h1>
      
      <div className={styles.grid}>
        
        {/* Profile Info Column */}
        <div className={styles.column}>
          
          <div className={styles.card}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>MK</div>
              <div className={styles.profileInfo}>
                <h2>Mike Knight</h2>
                <p>Pro Driver &bull; <span className={styles.star}>★</span> 4.9</p>
              </div>
            </div>
            
            <div className={styles.infoRow}>
              <div className={`${styles.iconBox} ${styles.iconBoxUser}`}>
                <User size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className={styles.infoLabel}>Driver ID</p>
                <p className={styles.infoValue}>DRV-84920</p>
              </div>
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
                <span className={styles.detailLabel}>Make / Model</span>
                <span className={styles.detailValue}>Toyota Camry (2023)</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Color</span>
                <span className={styles.detailValue}>Midnight Black</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>License Plate</span>
                <span className={styles.detailValue}>ABC-1234</span>
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
              
              <div className={styles.docItem}>
                <div>
                  <p className={styles.docName}>Driver's License</p>
                  <p className={styles.docMeta}>Expires: Dec 2028</p>
                </div>
                <div className={`${styles.statusWrapper} ${styles.statusVerified}`}>
                  <CheckCircle size={18} strokeWidth={2.5} /> Verified
                </div>
              </div>
              
              <div className={styles.docItem}>
                <div>
                  <p className={styles.docName}>Vehicle Registration</p>
                  <p className={styles.docMeta}>Expires: Oct 2027</p>
                </div>
                <div className={`${styles.statusWrapper} ${styles.statusVerified}`}>
                  <CheckCircle size={18} strokeWidth={2.5} /> Verified
                </div>
              </div>
              
              <div className={`${styles.docItem} ${styles.docItemWarning}`}>
                <div>
                  <p className={styles.docName}>Vehicle Insurance</p>
                  <p className={styles.docMeta}>Expires: Sep 2026 (Expiring soon)</p>
                </div>
                <div className={`${styles.statusWrapper} ${styles.statusWarning}`}>
                  <AlertCircle size={18} strokeWidth={2.5} /> Update Needed
                </div>
              </div>
              
              <button className={styles.btnUpload}>Upload New Document</button>
              
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DriverProfile;
