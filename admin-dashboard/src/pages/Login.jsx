import React, { useState } from 'react';
import API from '../services/api';
import { Car, Lock, Phone, AlertCircle } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', {
        email,
        password,
        role: 'admin'
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        onLoginSuccess();
      } else {
        setError('Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authenticate. Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_40%)] pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
            <Car className="text-white w-8 h-8" />
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-white">MoveX Admin</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Authenticate to access control panel</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Admin Email
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-[var(--text-muted)] w-4.5 h-4.5" />
              <input
                type="email"
                placeholder="admin@cab.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input pl-10 w-full"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-[var(--text-muted)] w-4.5 h-4.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pl-10 w-full"
                required
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3.5 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-[var(--text-muted)] font-medium">
          Secure, encrypted authorization protocol.
        </div>
      </div>
    </div>
  );
};

export default Login;
