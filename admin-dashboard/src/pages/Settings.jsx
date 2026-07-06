import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'MoveX Admin',
    supportEmail: 'support@movex.com',
    cancellationFee: 50,
    maintenanceMode: false
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <button className="btn-primary">
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
            <label className="block text-sm font-medium mb-2">Default Cancellation Fee (₹)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-glass)] bg-white text-[var(--text-dark)]"
              value={settings.cancellationFee}
              onChange={(e) => setSettings({...settings, cancellationFee: Number(e.target.value)})}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
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
