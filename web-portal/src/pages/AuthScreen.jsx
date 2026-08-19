import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Home } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../services/api';
import styles from './Auth.module.css';

const defaultCenter = [13.0827, 80.2707]; // Chennai
const routeColors = ['#0053B3', '#D49F0C', '#10B981', '#EF4444', '#8B5CF6'];

function MapFlyController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

const junctionDotIcon = (color = '#E8C84A') => L.divIcon({
  className: 'junction-dot',
  html: `<div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

const userLocationIcon = L.divIcon({
  className: 'user-live-location-marker',
  html: `<div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
    <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(37, 99, 235, 0.4); animation: pulse-ring 2s infinite ease-out;"></div>
    <div style="width: 14px; height: 14px; border-radius: 50%; background: #2563EB; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); z-index: 2;"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const decodePolyline = (t) => {
  let n, o, a = 0, r = 0, s = 0, l = 0, i = [];
  for (; a < t.length;) {
    n = 0, o = 0;
    do {
      o |= (31 & (n = t.charCodeAt(a++) - 63)) << l;
      l += 5;
    } while (n >= 32);
    const d = 1 & o ? ~(o >> 1) : o >> 1;
    r += d;
    l = 0, n = 0, o = 0;
    do {
      o |= (31 & (n = t.charCodeAt(a++) - 63)) << l;
      l += 5;
    } while (n >= 32);
    const u = 1 & o ? ~(o >> 1) : o >> 1;
    s += u;
    l = 0;
    i.push({ lat: r / 1e5, lng: s / 1e5 });
  }
  return i;
};

const AuthScreen = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, checkEmailVerification, sendEmailVerificationLink, resetPassword, loginWithPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login', 'register', 'verify_email', 'forgot_password'
  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
  
  // Role: 'customer' or 'driver'
  const [role, setRole] = useState('customer');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male'); // 'male' or 'female'

  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [routes, setRoutes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.log('Location unavailable', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await API.get('/route-manager/routes');
        if (res.data.success) {
          const processedRoutes = res.data.data.map((r, idx) => {
            // Draw path directly connecting the junctions
            const jPath = (r.junctions || []).map(j => ({
              lat: j.location.coordinates[1],
              lng: j.location.coordinates[0]
            }));
            
            return {
              ...r,
              displayColor: routeColors[idx % routeColors.length],
              junctionPath: jPath,
              decodedPolyline: r.polyline ? decodePolyline(r.polyline) : jPath
            };
          });
          setRoutes(processedRoutes);
        }
      } catch (err) {
        console.error('Failed to fetch routes', err);
      }
    };
    fetchRoutes();
    
    // Set up polling to integrate with admin portal changes
    const interval = setInterval(() => {
      fetchRoutes();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapRef.current && routes.length > 0 && window.google?.maps) {
      try {
        const bounds = new window.google.maps.LatLngBounds();
        let hasPoints = false;
        routes.forEach(route => {
          const pathToUse = (route.decodedPolyline && route.decodedPolyline.length > 0) ? route.decodedPolyline : route.junctionPath;
          if (pathToUse) {
            pathToUse.forEach(coord => {
              bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
              hasPoints = true;
            });
          }
        });
        if (hasPoints) {
          mapRef.current.fitBounds(bounds);
        }
      } catch (e) {}
    }
  }, [routes]);

  useEffect(() => {
    if (location.pathname === '/register') setMode('register');
    if (location.pathname === '/login') setMode('login');
  }, [location.pathname]);

  const validateForm = () => {
    setError('');
    if (!email) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    
    if (mode === 'forgot_password') return null;

    if (!password) return 'Please enter your password.';
    if (mode === 'register') {
      if (!name) return 'Please enter your full name.';
      if (!phone) return 'Please enter your mobile number.';
      if (!/^[6-9]\d{9}$/.test(phone)) return 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
      if (password !== confirmPassword) return 'Passwords do not match.';
      if (password.length < 6) return 'Password must be at least 6 characters.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        let user;
        try {
          user = await loginWithEmail(email, password, role);
        } catch (firebaseErr) {
          if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
             // Fallback to custom backend auth for users created without Firebase (e.g. older mobile app users)
             try {
               const success = await loginWithPassword(email, password, role);
               if (success) {
                 navigate(role === 'driver' ? '/driver' : '/customer');
                 return;
               }
             } catch (backendErr) {
               throw new Error(backendErr.response?.data?.message || 'Email or password is incorrect.');
             }
          }
          throw firebaseErr; // Rethrow if it's not a simple credential error or if fallback also fails (handled above)
        }
        if (user) {
          navigate(role === 'driver' ? '/driver' : '/customer');
        }
      } else if (mode === 'register') {
        const user = await registerWithEmail(email, password, name, phone, gender, role);
        if (user) setMode('verify_email');
      } else if (mode === 'forgot_password') {
        await resetPassword(email);
        alert('Password reset email sent! Please check your inbox.');
        setMode('login');
      }
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('not configured')) {
        setError(err.message);
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Email or password is incorrect.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle(role);
      if (user) {
        navigate(role === 'driver' ? '/driver' : '/customer');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendEmailVerificationLink();
      alert('Verification email resent! Please check your inbox.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckVerification = async () => {
    try {
      const isVerified = await checkEmailVerification(role);
      if (isVerified) {
        navigate(role === 'driver' ? '/driver' : '/customer');
      } else {
        setError('Email is not verified yet. Please check your inbox.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleRole = () => {
    setRole(role === 'customer' ? 'driver' : 'customer');
    setError('');
  };

  return (
    <div className={styles.authPageContainer}>
      <button 
        onClick={() => navigate('/')}
        className={styles.homeButton}
        title="Return to Home"
      >
        <Home size={20} />
      </button>
      
      <main className={styles.mainLayout}>
        {/* Left Side: Promotional Route Card */}
        <section className={styles.promoSection}>
          <div className={styles.brandPill}>
            <img src="/logo.png" alt="Forge India Connect" className={styles.brandLogo} />
            FORGE INDIA CONNECT
          </div>
          <h1 className={styles.promoTitle}>
            Welcome back.<br />
            <span className={styles.highlight}>Your route</span> is waiting.
          </h1>
          <p className={styles.promoText}>
            Sign in to manage your mobility pass, view covered routes and enjoy seamless rides across your daily commute.
          </p>

          <div className={styles.mapContainer}>
            <MapContainer
              center={defaultCenter}
              zoom={11}
              style={{ width: '100%', height: '100%', borderRadius: '16px' }}
              zoomControl={true}
            >
              {userLocation && <MapFlyController center={userLocation} zoom={13} />}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                subdomains="abcd"
                maxZoom={19}
              />
              {routes.map(route => {
                const hasJunctions = route.junctionPath && route.junctionPath.length > 0;
                const hasRoadLine = route.decodedPolyline && route.decodedPolyline.length > 0;
                const polylinePositions = (route.decodedPolyline || []).map(p => [p.lat, p.lng]);
                
                return (
                  <React.Fragment key={route._id}>
                    {hasRoadLine && (
                      <Polyline
                        positions={polylinePositions}
                        pathOptions={{
                          color: route.displayColor || '#0053B3',
                          opacity: 0.85,
                          weight: 4,
                        }}
                      />
                    )}
                    
                    {hasJunctions && route.junctionPath.map((pt, index) => (
                      <Marker 
                        key={`${route._id}-j-${index}`}
                        position={[pt.lat, pt.lng]} 
                        icon={junctionDotIcon('#E8C84A')}
                      />
                    ))}
                  </React.Fragment>
                );
              })}
              {userLocation && (
                <Marker 
                  position={userLocation} 
                  icon={userLocationIcon}
                  title="Your Location"
                />
              )}
            </MapContainer>
          </div>
        </section>

        {/* Right Side: Authentication Card */}
        <section className={styles.authSection}>
          <div className={styles.authCard}>
            
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create an account' : mode === 'forgot_password' ? 'Reset your password' : 'Verify Email'}
              </h2>
              <p className={styles.cardSubtitle}>
                {mode === 'login' ? 'Sign in to access your mobility services' : mode === 'register' ? 'Join Forge India Connect today' : mode === 'forgot_password' ? "Enter your registered email address and we'll help you get back into your account." : 'Please verify your email to continue.'}
              </p>
            </div>

            {error && (
              <div className={styles.errorBanner} style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                color: 'var(--error, #ef4444)', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                marginBottom: '24px',
                fontSize: '14px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                {error}
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className={styles.segmentToggle}>
                <button 
                  className={`${styles.segmentBtn} ${mode === 'login' ? styles.active : ''}`}
                  onClick={() => { setMode('login'); setError(''); }}
                >
                  Log In
                </button>
                <button 
                  className={`${styles.segmentBtn} ${mode === 'register' ? styles.active : ''}`}
                  onClick={() => { setMode('register'); setError(''); }}
                >
                  Sign Up
                </button>
              </div>
            )}

            {mode === 'verify_email' ? (
              <div className={styles.verifyEmailContainer}>
                <Mail size={48} color="var(--forge-blue)" style={{marginBottom: '16px'}} />
                <p className={styles.verifyText}>
                  We've sent a verification email to:<br/>
                  <strong style={{color: 'var(--text-primary)'}}>{email}</strong>
                </p>
                <button 
                  className={styles.btnPrimary}
                  onClick={handleCheckVerification}
                  disabled={loading}
                >
                  I've verified my email
                </button>
                <button 
                  className={styles.btnGoogle}
                  onClick={handleResendVerification}
                  style={{marginTop: '16px'}}
                >
                  Resend Verification Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                
                {mode === 'register' && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Full Name</label>
                      <div className={styles.inputWrapper}>
                        <User size={20} className={styles.inputIcon} />
                        <input 
                          type="text" 
                          className={`${styles.input} ${error.includes('name') ? styles.inputError : ''}`}
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Mobile Number</label>
                        <div className={styles.inputWrapper}>
                          <Phone size={20} className={styles.inputIcon} />
                          <input
                            type="tel"
                            className={styles.input}
                            placeholder="Enter your mobile number"
                            value={phone}
                            onChange={(e) => {
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
                        </div>
                        {phoneError && <span style={{color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'}}>{phoneError}</span>}
                    </div>
                  </>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={20} className={styles.inputIcon} />
                    <input 
                      type="email" 
                      className={`${styles.input} ${error.includes('email') || error.includes('Email') ? styles.inputError : ''}`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {mode !== 'forgot_password' && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={20} className={styles.inputIcon} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className={`${styles.input} ${error.includes('password') || error.includes('Password') ? styles.inputError : ''}`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {mode === 'login' && (
                      <div className={styles.forgotPasswordRow}>
                        <button type="button" className={styles.linkBtn} onClick={() => { setMode('forgot_password'); setError(''); }}>
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'register' && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Confirm Password</label>
                      <div className={styles.inputWrapper}>
                        <Lock size={20} className={styles.inputIcon} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          className={`${styles.input} ${error.includes('match') ? styles.inputError : ''}`}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Gender</label>
                      <div className={styles.genderRow}>
                        <div 
                          className={`${styles.genderBtn} ${gender === 'male' ? styles.active : ''}`}
                          onClick={() => setGender('male')}
                        >
                          <div className={styles.genderCircle}>
                            {gender === 'male' && <div className={styles.genderDot}></div>}
                          </div>
                          <span className={styles.genderText}>Male</span>
                        </div>
                        <div 
                          className={`${styles.genderBtn} ${gender === 'female' ? styles.active : ''}`}
                          onClick={() => setGender('female')}
                        >
                          <div className={styles.genderCircle}>
                            {gender === 'female' && <div className={styles.genderDot}></div>}
                          </div>
                          <span className={styles.genderText}>Female</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {error && <span className={styles.errorText}>{error}</span>}

                {mode === 'register' && role === 'driver' ? (
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
                      Driver registration requires document verification.
                    </p>
                    <button 
                      type="button" 
                      className={styles.btnPrimary} 
                      onClick={() => navigate('/driver-register', { state: { name, phone, email, password, gender } })}
                    >
                      Proceed to Driver Application
                    </button>
                  </div>
                ) : (
                  <>
                    <button type="submit" className={styles.btnPrimary} disabled={loading} style={{marginTop: mode === 'register' ? '24px' : '0'}}>
                      {loading ? (mode === 'login' ? 'Signing in...' : 'Please wait...') : mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                    </button>

                    {mode === 'forgot_password' && (
                      <div style={{textAlign: 'center', marginBottom: '24px'}}>
                        <button type="button" className={styles.linkBtn} onClick={() => setMode('login')}>
                          Back to Login
                        </button>
                      </div>
                    )}

                    {(mode === 'login' || mode === 'register') && (
                      <>
                        <div className={styles.divider}>OR</div>

                        <button 
                          type="button" 
                          className={styles.btnGoogle}
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                        >
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" style={{ display: 'block' }}>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                          Continue with Google
                        </button>
                      </>
                    )}
                  </>
                )}
                    
                <div className={styles.driverLoginRow}>
                  {role === 'customer' ? 'Are you a driver?' : 'Are you a rider?'}
                  <button type="button" className={styles.driverLoginBtn} onClick={toggleRole}>
                    Login / Register as {role === 'customer' ? 'Driver' : 'Rider'}
                  </button>
                </div>
                
                <p className={styles.termsText}>
                  By continuing, you agree to our <a href="#" className={styles.termsLink}>Terms of Service</a> and <a href="#" className={styles.termsLink}>Privacy Policy</a>.
                </p>

              </form>
            )}

          </div>
        </section>
      </main>
    </div>
  );
};

export default AuthScreen;
