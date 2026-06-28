import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

const GlobalSettings = () => {
  const [settings, setSettings] = useState({
    websiteTitle: '',
    heroHeading: '',
    heroSubtitle: '',
    footerText: '',
    signature: '',
    defaultTheme: 'Midnight Aurora',
    defaultMusicVolume: 0.5,
    enableConfetti: true,
    enableBackgroundMusic: true,
    enableSearchSuggestions: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings');
        if (res.data) setSettings(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put('http://localhost:5000/api/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      window.open(`http://localhost:5000/api/backup/export?token=${token}`, '_blank');
      // For a real app, passing token in query is not the best, but this is a quick demo.
      // Better approach: fetch blob and trigger download.
      
      const res = await axios.get('http://localhost:5000/api/backup/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
          <p className="text-white/50 mt-1">Configure your website's appearance and defaults.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-semibold">Copy & Text</h3>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Website Title</label>
                <input 
                  type="text" 
                  value={settings.websiteTitle}
                  onChange={(e) => setSettings({...settings, websiteTitle: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Hero Heading</label>
                <input 
                  type="text" 
                  value={settings.heroHeading}
                  onChange={(e) => setSettings({...settings, heroHeading: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Hero Subtitle</label>
                <input 
                  type="text" 
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Letter Signature</label>
                <input 
                  type="text" 
                  value={settings.signature}
                  onChange={(e) => setSettings({...settings, signature: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-semibold">Features & Toggles</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Confetti Effect</div>
                  <div className="text-sm text-white/50">Show confetti when letter opens</div>
                </div>
                <button 
                  onClick={() => setSettings({...settings, enableConfetti: !settings.enableConfetti})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableConfetti ? 'bg-purple-600' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enableConfetti ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Background Music</div>
                  <div className="text-sm text-white/50">Allow music to play</div>
                </div>
                <button 
                  onClick={() => setSettings({...settings, enableBackgroundMusic: !settings.enableBackgroundMusic})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableBackgroundMusic ? 'bg-purple-600' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enableBackgroundMusic ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-semibold text-red-400">Data Management</h3>
              <p className="text-sm text-white/50">Export your entire database to a JSON file.</p>
              <button 
                onClick={handleExportBackup}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Export JSON Backup
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </AdminLayout>
  );
};

export default GlobalSettings;
