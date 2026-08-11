import React, { useState } from 'react';
import API from '../services/api';
import { Mail, Lock, EyeOff, Eye, ArrowRight, AlertCircle } from 'lucide-react';
import logoImage from '../assets/Group 1686559028.png';
import centerImage from '../assets/image 1419.png';
import ellipseImage from '../assets/Ellipse 6225.png';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div style={{ backgroundColor: '#F3F4F6', fontFamily: 'Outfit, sans-serif' }} className="min-h-screen w-full flex relative overflow-hidden">
      
      {/* Left Section - Hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-between relative p-12 lg:p-24 z-10">
        
        {/* Logo Placeholder */}
        <div className="w-[190px] h-[132px] flex flex-col justify-center">
          <img 
            src={logoImage} 
            alt="Forge India Connect Pvt. Ltd." 
            className="w-full h-auto object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Center Image and Blur */}
        <div className="relative flex-1 flex flex-row items-center justify-center -mt-10 gap-0">
          <img 
            src={ellipseImage} 
            alt="" 
            className="absolute pointer-events-none"
            style={{ width: '522px', height: '311px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          
          <img 
            src={centerImage} 
            alt="Vehicles" 
            className="z-10 object-contain max-w-[600px] h-[auto] mix-blend-multiply"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Bottom Text */}
        <div className="max-w-xl z-10 pl-6">
          <h2 className="font-normal text-[#000000] text-[24px] mb-4">
            Smart Taxi Management
          </h2>
          <p className="font-normal text-[#7C848D] text-[20px] leading-[28px]">
            Monitor your fleet, bookings, drivers, and business performance from one dashboard.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 z-20">
        <div 
          className="bg-white w-full max-w-[580px] rounded-[28px] p-10 md:p-14 lg:p-16 flex flex-col shadow-xl shadow-gray-200/50 border border-gray-100"
          style={{ minHeight: '769px' }}
        >
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mt-12 mb-16">
            <h1 className="font-medium text-[32px] text-[#262D36] mb-2">Welcome back!</h1>
            <p className="font-normal text-[20px] text-[#7C848D]">Sign in to access your dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="space-y-8 flex-1">
              
              {/* Email Field */}
              <div className="flex flex-col space-y-3">
                <label className="font-normal text-[18px] text-[#262D36]">
                  Email / Mobile Number
                </label>
                <div className="relative flex items-center border-b border-[#E9EAEC] rounded-[16px] bg-white h-[52px] px-4 hover:border-gray-300 focus-within:border-[#0053B3] focus-within:ring-1 focus-within:ring-[#0053B3] transition-all">
                  <Mail className="text-[#7C848D] w-5 h-5 mr-3" />
                  <input
                    type="text"
                    placeholder="Enter Email or Mobile number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[#262D36] text-[18px] placeholder:text-[#7C848D]"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col space-y-3">
                <label className="font-normal text-[18px] text-[#262D36]">
                  Password
                </label>
                <div className="relative flex items-center border-b border-[#E9EAEC] rounded-[16px] bg-white h-[52px] px-4 hover:border-gray-300 focus-within:border-[#0053B3] focus-within:ring-1 focus-within:ring-[#0053B3] transition-all">
                  <Lock className="text-[#7C848D] w-5 h-5 mr-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[#262D36] text-[18px] placeholder:text-[#7C848D]"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 p-1 focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {showPassword ? (
                      <Eye className="text-[#7C848D] w-5 h-5" />
                    ) : (
                      <EyeOff className="text-[#7C848D] w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <a href="#" className="font-normal text-[16px] text-[#0053B3] hover:underline transition-all">
                  Forgot Password
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-auto pt-12 pb-6 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-[377px] max-w-full h-[52px] bg-[#0053B3] hover:bg-[#004291] active:bg-[#003370] text-[#ECECEC] rounded-[16px] flex items-center justify-center font-normal text-[20px] transition-all shadow-md gap-3 disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign in to Dashboard'}
                {!loading && <ArrowRight className="w-5 h-5 text-[#F3F3F3]" />}
              </button>
            </div>
            
          </form>
        </div>
      </div>

    </div>
  );
};

export default Login;
