import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import styles from './Auth.module.css';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ForgeLogo from '../components/ForgeLogo';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [role, setRole] = useState('customer'); // 'customer' or 'driver'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = '/auth/login';
      const payload = {
        password,
        role
      };
      
      if (identifier.includes('@')) {
        payload.email = identifier;
      } else {
        payload.phone = identifier;
      }

      const response = await API.post(endpoint, payload);
      
      if (response.data.success) {
        login(response.data.data, response.data.token, role);
        if (role === 'customer') {
          navigate('/customer/dashboard');
        } else {
          navigate('/driver/dashboard');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      {/* Background Decorative Elements matching Landing Page */}
      <div className={styles.bgDecoration1}></div>
      <div className={styles.bgDecoration2}></div>

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <div className={styles.logoContainer} onClick={() => navigate('/')}>
              <ForgeLogo />
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Log in to access premium mobility services</p>
          </div>

          <div className={styles.roleToggle}>
            <button 
              type="button"
              className={`${styles.roleBtn} ${role === 'customer' ? styles.active : ''}`}
              onClick={() => setRole('customer')}
            >
              Customer
            </button>
            <button 
              type="button"
              className={`${styles.roleBtn} ${role === 'driver' ? styles.active : ''}`}
              onClick={() => setRole('driver')}
            >
              Driver
            </button>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email or Phone</label>
              <div className={styles.inputWrapper}>
                {identifier.includes('@') ? 
                  <Mail className={styles.inputIcon} size={18} /> : 
                  <Phone className={styles.inputIcon} size={18} />
                }
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Enter your email or phone" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input 
                  type="password" 
                  className={styles.input} 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.forgotPassword}>
                <a href="#forgot" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              <span>{loading ? 'Authenticating...' : `Log in as ${role === 'customer' ? 'Customer' : 'Driver'}`}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className={styles.footer}>
            <p>Don't have an account?</p>
            <Link to={`/register?type=${role}`} className={styles.link}>
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
