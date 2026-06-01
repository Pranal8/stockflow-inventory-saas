'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [threshold, setThreshold] = useState('5');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultThreshold: threshold }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">StockFlow Configurations</h1>
        <div className="flex space-x-4">
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
          <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">Products</Link>
          <Link href="/settings" className="text-sm font-semibold text-blue-600">Settings</Link>
        </div>
      </nav>
      <main className="max-w-xl mx-auto p-6 mt-8">
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Global Default Low Stock Threshold</h3>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">Default Alert Level Quantity</label>
            <input 
              type="number" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-blue-500"
              value={threshold} onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md font-semibold text-sm">Save Configuration Parameters</button>
          {saved && <p className="text-center text-xs font-semibold text-green-600 mt-2">✓ Settings parameters synced safely.</p>}
        </form>
      </main>
    </div>
  );
}