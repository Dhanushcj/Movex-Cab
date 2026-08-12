import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthScreen from './pages/AuthScreen';
import DriverRegister from './pages/DriverRegister';

import CustomerLayout from './components/CustomerLayout';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerBooking from './pages/CustomerBooking';
import CustomerHistory from './pages/CustomerHistory';
import CustomerProfile from './pages/CustomerProfile';
import CustomerTracking from './pages/CustomerTracking';
import CustomerPass from './pages/CustomerPass';
import CustomerSettings from './pages/CustomerSettings';
import CustomerNotifications from './pages/CustomerNotifications';
import CustomerSupport from './pages/CustomerSupport';

import DriverLayout from './components/DriverLayout';
import DriverDashboard from './pages/DriverDashboard';
import DriverActiveRide from './pages/DriverActiveRide';
import DriverTrip from './pages/DriverTrip';
import DriverSupport from './pages/DriverSupport';
import DriverProfile from './pages/DriverProfile';
import DriverHistory from './pages/DriverHistory';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/register" element={<AuthScreen />} />
        <Route path="/driver-register" element={<DriverRegister />} />
        
        {/* Customer Portal */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="book" element={<CustomerBooking />} />
          <Route path="passes" element={<CustomerPass />} />
          <Route path="tracking/:id" element={<CustomerTracking />} />
          <Route path="history" element={<CustomerHistory />} />
          <Route path="notifications" element={<CustomerNotifications />} />
          <Route path="settings" element={<CustomerSettings />} />
          <Route path="support" element={<CustomerSupport />} />
        </Route>

        {/* Driver Portal */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="active-ride/:id" element={<DriverActiveRide />} />
          <Route path="trip" element={<DriverTrip />} />
          <Route path="support" element={<DriverSupport />} />
          <Route path="documents" element={<DriverProfile />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="history" element={<DriverHistory />} />
          <Route path="settings" element={<div style={{padding: '24px', maxWidth: '1200px', margin: '0 auto'}}><h2>Settings</h2><p className="text-muted">Settings feature is coming soon.</p></div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
