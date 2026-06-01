'use client';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setName(data.name || '');
        setThreshold(data.defaultThreshold || 5);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, defaultThreshold: threshold }),
    });

    if (res.ok) {
      setMessage('Settings updated successfully!');
    } else {
      setMessage('Failed to update settings.');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-slate-400">Loading Configuration...</div>;

  return (
    <div className="max-w-2xl p-8 mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Global Configuration</h1>
        <p className="text-sm text-slate-400">Manage tenant preferences and default inventory parameters.</p>
      </div>
      <hr className="border-slate-800" />
      
      <form onSubmit={handleSave} className="p-6 space-y-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <label className="block text-sm font-medium text-slate-300">Organization Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Global Low Stock Alert Threshold</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
            className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Products with stock at or below this number will automatically trigger system flags unless a specific SKU item limit overrides it.</p>
        </div>

        {message && <p className="text-sm font-medium text-emerald-400">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration Options'}
        </button>
      </form>
    </div>
  );
}