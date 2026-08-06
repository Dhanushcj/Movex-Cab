import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Drivers from './pages/Drivers';
import Bookings from './pages/Bookings';
import FareManagement from './pages/FareManagement';
import LiveMap from './pages/LiveMap';
import Payments from './pages/Payments';
import Payouts from './pages/Payouts';
import Complaints from './pages/Complaints';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Banners from './pages/Banners';
import PassManagement from './pages/PassManagement';
import Reviews from './pages/Reviews';
import RouteManager from './pages/RouteManager';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payouts" element={<Payouts />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/fares" element={<FareManagement />} />
        <Route path="/banners" element={<Banners />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/passes" element={<PassManagement />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/route-manager" element={<RouteManager />} />
        {/* Fallback routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
