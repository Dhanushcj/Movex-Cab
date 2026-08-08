import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';
import styles from './Auth.module.css';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [role, setRole] = useState('customer'); // 'customer' or 'driver'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'driver' || type === 'customer') {
      setRole(type);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = role === 'driver' ? '/auth/driver/register' : '/auth/register';
      const payload = { ...formData };
      
      // Add default driver requirements
      if (role === 'driver') {
        payload.vehicle = { type: 'mini', make: 'Generic', model: 'Car', year: 2020, plateNumber: 'XXX-000', color: 'White' };
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
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logo} onClick={() => navigate('/')}>MoveX</div>
          <p className={styles.subtitle}>Create your premium account</p>
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

        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={20} />
              <input 
                type="text" 
                name="name"
                className={styles.input} 
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={20} />
              <input 
                type="email" 
                name="email"
                className={styles.input} 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone Number</label>
            <div className={styles.inputWrapper}>
              <Phone className={styles.inputIcon} size={20} />
              <input 
                type="tel" 
                name="phone"
                className={styles.input} 
                placeholder="+1 234 567 8900" 
                value={formData.phone}
                onChange={handleChange}
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
                name="password"
                className={styles.input} 
                placeholder="Create a strong password" 
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? 'Creating Account...' : `Sign up as ${role === 'customer' ? 'Customer' : 'Driver'}`}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
