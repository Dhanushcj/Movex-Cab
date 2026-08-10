import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

import CustomerLayout from './components/CustomerLayout';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerBooking from './pages/CustomerBooking';
import CustomerHistory from './pages/CustomerHistory';
import CustomerProfile from './pages/CustomerProfile';
import CustomerTracking from './pages/CustomerTracking';
import CustomerPass from './pages/CustomerPass';

import DriverLayout from './components/DriverLayout';
import DriverDashboard from './pages/DriverDashboard';
import DriverActiveRide from './pages/DriverActiveRide';
import DriverTrip from './pages/DriverTrip';
import DriverSupport from './pages/DriverSupport';
import DriverProfile from './pages/DriverProfile';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Customer Portal */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="book" element={<CustomerBooking />} />
          <Route path="passes" element={<CustomerPass />} />
          <Route path="tracking/:id" element={<CustomerTracking />} />
          <Route path="history" element={<CustomerHistory />} />
          <Route path="profile" element={<CustomerProfile />} />
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
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
