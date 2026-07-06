import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  CalendarDays, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/admin/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  // Mock charts details
  const revenueData = [
    { name: 'Mon', Revenue: 4000, Commission: 800 },
    { name: 'Tue', Revenue: 5200, Commission: 1040 },
    { name: 'Wed', Revenue: 4800, Commission: 960 },
    { name: 'Thu', Revenue: 6100, Commission: 1220 },
    { name: 'Fri', Revenue: 7500, Commission: 1500 },
    { name: 'Sat', Revenue: 9200, Commission: 1840 },
    { name: 'Sun', Revenue: 8400, Commission: 1680 }
  ];

  const vehicleDistribution = [
    { name: 'Bike', count: 120 },
    { name: 'Auto', count: 85 },
    { name: 'Mini', count: 64 },
    { name: 'Sedan', count: 98 },
    { name: 'SUV', count: 42 }
  ];

  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.revenue?.total || 0}`,
      desc: 'Overall earnings processed',
      icon: TrendingUp,
      color: 'indigo',
      change: '+14.5%',
      isPositive: true
    },
    {
      title: 'Platform Commission',
      value: `₹${stats?.revenue?.commission || 0}`,
      desc: 'Platform share earnings (20%)',
      icon: TrendingUp,
      color: 'emerald',
      change: '+12.3%',
      isPositive: true
    },
    {
      title: 'Active Customers',
      value: stats?.users?.customers || 0,
      desc: 'Registered riders list count',
      icon: Users,
      color: 'indigo',
      change: '+5.2%',
      isPositive: true
    },
    {
      title: 'Total Drivers',
      value: stats?.users?.drivers || 0,
      desc: `${stats?.users?.approvedDrivers || 0} approved, ${stats?.users?.pendingDrivers || 0} pending`,
      icon: ShieldCheck,
      color: 'emerald',
      change: `${stats?.users?.pendingDrivers || 0} pending`,
      isPositive: false
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Real-time status updates, earnings summary, and performance metrics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {card.title}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-[var(--border-glass)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">{card.desc}</span>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${card.isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {card.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : null}
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Area Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Performance</h3>
              <p className="text-xs text-[var(--text-muted)]">Daily gross revenue vs commission</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Gross Revenue
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Commission
              </span>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#131a2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="Commission" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorComm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicles distribution chart */}
        <div className="glass-card p-6">
          <div>
            <h3 className="text-lg font-bold text-white">Active Fleets</h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">Distribution across vehicle classes</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#131a2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
