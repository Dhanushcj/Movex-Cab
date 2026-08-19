import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import styles from './DriverRegister.module.css';
import { Home } from 'lucide-react';

const KARNATAKA_DISTRICTS = [
  'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
  'Bidar', 'Chamarajanagar', 'Chikballapur', 'Chikkamagaluru', 'Chitradurga',
  'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri',
  'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur',
  'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'
];

export default function DriverRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state || {};

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Step 1: Personal
  const [name, setName] = useState(prefill.name || '');
  const [phone, setPhone] = useState(prefill.phone || '');
  const [email, setEmail] = useState(prefill.email || '');
  const [password, setPassword] = useState(prefill.password || '');
  const [gender, setGender] = useState(prefill.gender || 'male');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Karnataka');

  // Step 2: Vehicle
  const [vehicleOwnership, setVehicleOwnership] = useState('own');
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [plateType, setPlateType] = useState('white');
  const [vehicleColor, setVehicleColor] = useState('');

  // Step 3: Documents
  const [docs, setDocs] = useState({
    aadhaarNumber: '', aadhaarFile: null,
    panNumber: '', panFile: null,
    dlNumber: '', dlFile: null,
    rcNumber: '', rcFile: null,
    insNumber: '', insFile: null,
    profilePhoto: null
  });

  const handleDocChange = (field, value) => {
    setDocs(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);
    const res = await API.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.imageUrl;
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!name || !phone || !email || !password || !dob || !city) {
        setError('Please fill all mandatory fields in Step 1.');
        return false;
      }
    } else if (step === 2) {
      if (vehicleOwnership === 'own') {
        if (!vehicleMake || !vehicleModel || !plateNumber) {
          setError('Please fill vehicle make, model and plate number.');
          return false;
        }
      }
    } else if (step === 3) {
      if (!docs.aadhaarNumber || !docs.panNumber || !docs.dlNumber || !docs.rcNumber) {
        setError('Please provide Aadhaar, PAN, DL and RC numbers.');
        return false;
      }
      if (!docs.aadhaarFile || !docs.panFile || !docs.dlFile || !docs.rcFile || !docs.profilePhoto) {
        setError('Please upload all mandatory documents (Aadhaar, PAN, DL, RC, Profile Photo).');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      // 1. Upload docs
      const aadhaarUrl = await uploadFile(docs.aadhaarFile);
      const panUrl = await uploadFile(docs.panFile);
      const dlUrl = await uploadFile(docs.dlFile);
      const rcUrl = await uploadFile(docs.rcFile);
      const insUrl = await uploadFile(docs.insFile);
      const profileUrl = await uploadFile(docs.profilePhoto);

      // 2. Assemble payload
      const payload = {
        name, phone, email, password, gender, dob,
        address: `${city}, ${stateName}`,
        vehicleOwnership,
        vehicle: vehicleOwnership === 'company' 
          ? { type: 'none', make: 'N/A', model: 'N/A', color: 'N/A', plateNumber: 'N/A' }
          : { type: vehicleType, make: vehicleMake, model: vehicleModel, color: vehicleColor, plateNumber, plateType },
        documents: {
          aadhaar: { number: docs.aadhaarNumber, url: aadhaarUrl },
          pan: { number: docs.panNumber, url: panUrl },
          drivingLicense: { number: docs.dlNumber, url: dlUrl },
          vehicleRC: { number: docs.rcNumber, url: rcUrl },
          insurance: docs.insNumber ? { number: docs.insNumber, url: insUrl } : undefined,
          profilePhoto: { url: profileUrl }
        }
      };

      // 3. Register Driver
      const res = await API.post('/auth/driver/register', payload);
      if (res.data.success) {
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      } else {
        setError(res.data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <Home size={24} />
          </button>
          <h2 className={styles.title}>Driver Application</h2>
          <div style={{ width: 24 }}></div>
        </div>
        <p className={styles.subtitle}>Complete your profile to start earning</p>

        <div className={styles.stepIndicator}>
          {[1, 2, 3].map(s => (
            <div key={s} className={`${styles.step} ${step === s ? styles.stepActive : ''} ${step > s ? styles.stepCompleted : ''}`}>
              {s}
            </div>
          ))}
        </div>

        {error && <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        {step === 1 && (
          <div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input className={styles.input} type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <input 
                className={styles.input} 
                type="tel" 
                value={phone} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) {
                    setPhone(val);
                    if (val.length > 0 && !/^[6-9]/.test(val)) {
                      setPhoneError('Mobile number must start with 6, 7, 8, or 9');
                    } else {
                      setPhoneError('');
                    }
                  }
                }} 
              />
              {phoneError && <span style={{color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'}}>{phoneError}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date of Birth</label>
              <input className={styles.input} type="date" value={dob} onChange={e => setDob(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>City (Karnataka Only)</label>
              <select className={styles.select} value={city} onChange={e => setCity(e.target.value)}>
                <option value="">Select City</option>
                {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Vehicle Ownership</label>
              <select className={styles.select} value={vehicleOwnership} onChange={e => setVehicleOwnership(e.target.value)}>
                <option value="own">I own a vehicle</option>
                <option value="company">Company provided vehicle</option>
              </select>
            </div>
            
            {vehicleOwnership === 'own' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Vehicle Type</label>
                  <select className={styles.select} value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                    <option value="bike">Bike</option>
                    <option value="auto">Auto</option>
                    <option value="mini">Mini</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Vehicle Make (e.g., Honda)</label>
                  <input className={styles.input} type="text" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Vehicle Model (e.g., City)</label>
                  <input className={styles.input} type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Plate Number</label>
                  <input className={styles.input} type="text" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Plate Type</label>
                  <select className={styles.select} value={plateType} onChange={e => setPlateType(e.target.value)}>
                    <option value="white">White Plate (Private)</option>
                    <option value="yellow">Yellow Plate (Commercial)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Aadhaar Number</label>
              <input className={styles.input} type="text" value={docs.aadhaarNumber} onChange={e => handleDocChange('aadhaarNumber', e.target.value)} />
              <input className={styles.input} type="file" onChange={e => handleDocChange('aadhaarFile', e.target.files[0])} style={{marginTop: '8px'}}/>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>PAN Number</label>
              <input className={styles.input} type="text" value={docs.panNumber} onChange={e => handleDocChange('panNumber', e.target.value)} />
              <input className={styles.input} type="file" onChange={e => handleDocChange('panFile', e.target.files[0])} style={{marginTop: '8px'}}/>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Driving License Number</label>
              <input className={styles.input} type="text" value={docs.dlNumber} onChange={e => handleDocChange('dlNumber', e.target.value)} />
              <input className={styles.input} type="file" onChange={e => handleDocChange('dlFile', e.target.files[0])} style={{marginTop: '8px'}}/>
            </div>
            {vehicleOwnership === 'own' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Vehicle RC Number</label>
                <input className={styles.input} type="text" value={docs.rcNumber} onChange={e => handleDocChange('rcNumber', e.target.value)} />
                <input className={styles.input} type="file" onChange={e => handleDocChange('rcFile', e.target.files[0])} style={{marginTop: '8px'}}/>
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label}>Profile Photo</label>
              <input className={styles.input} type="file" onChange={e => handleDocChange('profilePhoto', e.target.files[0])} />
            </div>
          </div>
        )}

        <div className={styles.buttonRow}>
          {step > 1 ? (
            <button className={styles.btnSecondary} onClick={handleBack} disabled={loading}>Back</button>
          ) : <div></div>}
          
          {step < 3 ? (
            <button className={styles.btnPrimary} onClick={handleNext}>Continue</button>
          ) : (
            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
