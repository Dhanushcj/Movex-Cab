import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Activity } from 'lucide-react';
import API from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: '',
    supportEmail: '',
    defaultCancellationFee: 50,
    commissionPercentage: 20,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/admin/settings');
        if (res.data.data) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await API.put('/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <button className="btn-primary" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="glass-card p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-glass)]">
          <SettingsIcon className="w-6 h-6 text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold">General Configuration</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Platform Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-glass)] bg-white text-[var(--text-dark)]"
              value={settings.siteName}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Support Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-glass)] bg-white text-[var(--text-dark)]"
              value={settings.supportEmail}
              onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Commission Percentage (%)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-glass)] bg-white text-[var(--text-dark)]"
              value={settings.commissionPercentage}
              onChange={(e) => setSettings({...settings, commissionPercentage: Number(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Cancellation Fee (₹)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-glass)] bg-white text-[var(--text-dark)]"
              value={settings.defaultCancellationFee}
              onChange={(e) => setSettings({...settings, defaultCancellationFee: Number(e.target.value)})}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-glass)]">
            <div>
              <div className="font-medium">Maintenance Mode</div>
              <div className="text-sm text-[var(--text-muted)]">Disable the app for users</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
