import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCog, Car, CalendarCheck, 
  CreditCard, CircleDollarSign, Tag, MessageSquareWarning, 
  BarChart3, Settings, LogOut, CheckCircle, XCircle 
} from 'lucide-react';
import API, { setAuthToken } from './api';

import CustomersScreen from './screens/CustomersScreen';
import DriversScreen from './screens/DriversScreen';
import VehiclesScreen from './screens/VehiclesScreen';

function LoginScreen({ setToken }: { setToken: (t: string) => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { phone, password, role: 'admin' });
      if (response.data.success) {
        setToken(response.data.token);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
          <p className="text-slate-400 mt-2">Sign in to manage MoveX operations</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">Admin Phone</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. 9999999999"
              required
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------- Navigation Layout ----------------

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/drivers', label: 'Drivers', icon: UserCog },
  { path: '/vehicles', label: 'Vehicles', icon: Car },
  { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/fare-management', label: 'Fare Management', icon: CircleDollarSign },
  { path: '/offers', label: 'Offers', icon: Tag },
  { path: '/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function AdminLayout({ logout }: { logout: () => void }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">MoveX</h1>
            <p className="text-xs text-slate-500">Admin Control</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout} 
            className="flex items-center gap-3 text-red-600 hover:bg-red-50 w-full px-4 py-3 rounded-xl font-medium transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

// ---------------- Screens ----------------

function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, driversRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/drivers')
      ]);
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (driversRes.data.success) {
        setDrivers(driversRes.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateDriverStatus = async (id: string, status: string) => {
    try {
      const res = await API.put(`/admin/drivers/${id}`, { approvalStatus: status });
      if (res.data.success) {
        alert(`Driver marked as ${status}`);
        fetchAdminData();
      }
    } catch (e) {
      alert('Failed to update driver status');
    }
  };

  const pendingDrivers = drivers.filter(d => d.approvalStatus === 'pending');

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">System Overview</h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Customers</p>
              <p className="text-3xl font-bold text-slate-800">{stats?.users?.customers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Drivers</p>
              <p className="text-3xl font-bold text-slate-800">{stats?.users?.drivers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Bookings</p>
              <p className="text-3xl font-bold text-slate-800">{stats?.bookings?.total || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-emerald-600">₹{stats?.revenue?.total || 0}</p>
            </div>
          </div>

          {/* Pending Approvals */}
          <h2 className="text-xl font-bold text-slate-800 mb-6">Pending Driver Approvals ({pendingDrivers.length})</h2>
          
          {pendingDrivers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
              <p className="text-lg font-medium">All caught up!</p>
              <p>No pending driver applications to review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingDrivers.map((driver) => (
                <div key={driver._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{driver.name}</h3>
                      <p className="text-slate-500">{driver.phone}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Pending
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 text-sm flex-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicle Type</span>
                      <span className="font-semibold text-slate-700 capitalize">{driver.vehicle?.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicle Model</span>
                      <span className="font-semibold text-slate-700">{driver.vehicle?.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Plate Number</span>
                      <span className="font-semibold text-slate-700">{driver.vehicle?.plateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gender</span>
                      <span className="font-semibold text-slate-700 capitalize">{driver.gender}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleUpdateDriverStatus(driver._id, 'rejected')}
                      className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                    <button 
                      onClick={() => handleUpdateDriverStatus(driver._id, 'approved')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
        <p className="text-lg font-medium">Coming Soon</p>
        <p>The {title} module is currently under development.</p>
      </div>
    </div>
  );
}

// ---------------- App Root ----------------

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      setAuthToken(token);
    } else {
      localStorage.removeItem('adminToken');
      setAuthToken(null);
    }
  }, [token]);

  const handleLogout = () => setToken(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={token ? <Navigate to="/dashboard" replace /> : <LoginScreen setToken={setToken} />} 
        />
        
        {token && (
          <Route element={<AdminLayout logout={handleLogout} />}>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/customers" element={<CustomersScreen />} />
            <Route path="/drivers" element={<DriversScreen />} />
            <Route path="/vehicles" element={<VehiclesScreen />} />
            <Route path="/bookings" element={<PlaceholderScreen title="Bookings & Trips" />} />
            <Route path="/payments" element={<PlaceholderScreen title="Payments & Transactions" />} />
            <Route path="/fare-management" element={<PlaceholderScreen title="Fare Management" />} />
            <Route path="/offers" element={<PlaceholderScreen title="Offers & Promo Codes" />} />
            <Route path="/complaints" element={<PlaceholderScreen title="Complaints & Support" />} />
            <Route path="/reports" element={<PlaceholderScreen title="Analytics & Reports" />} />
            <Route path="/settings" element={<PlaceholderScreen title="System Settings" />} />
          </Route>
        )}
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
