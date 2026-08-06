import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone } from 'lucide-react';
import styles from './Auth.module.css';
import axios from 'axios'; // We will use this later

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer'); // 'customer' or 'driver'
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In reality we would call: axios.post('/api/auth/login', { identifier, password, role })
      
      if (role === 'customer') {
        navigate('/customer/dashboard');
      } else {
        navigate('/driver/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logo} onClick={() => navigate('/')}>MoveX</div>
          <p className={styles.subtitle}>Welcome back to premium mobility</p>
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

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email or Phone</label>
            <div className={styles.inputWrapper}>
              {identifier.includes('@') ? 
                <Mail className={styles.inputIcon} size={20} /> : 
                <Phone className={styles.inputIcon} size={20} />
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
              <Lock className={styles.inputIcon} size={20} />
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? 'Authenticating...' : `Log in as ${role === 'customer' ? 'Customer' : 'Driver'}`}
          </button>
        </form>

        <div className={styles.footer}>
          Don't have an account? <Link to={`/register?type=${role}`} className={styles.link}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
