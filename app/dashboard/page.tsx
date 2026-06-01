'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Aggregating Stockflow Metrics...</div>;

  const { metrics, lowStockItems, organizationName, globalThreshold } = data;

  return (
    <div className="max-w-6xl p-8 mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{organizationName} Hub</h1>
          <p className="text-sm text-slate-400">Real-time tenant analytics overview. Global threshold flag: <span className="text-indigo-400 font-semibold">{globalThreshold} units</span>.</p>
        </div>
        <Link href="/products" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
          Manage Inventory
        </Link>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tracked SKUs</p>
          <p className="text-4xl font-bold text-white">{metrics.totalProducts}</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Items On-Hand</p>
          <p className="text-4xl font-bold text-emerald-400">{metrics.totalInventoryValue}</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Low Stock Alerts</p>
          <p className="text-4xl font-bold text-rose-500">{metrics.lowStockCount}</p>
        </div>
      </div>

      {/* Low Stock Watchlist Component */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white">Critical Low Stock Alerts</h2>
        <p className="text-sm text-slate-400">Items below or equal to current safe thresholds that require immediate reordering.</p>
        
        {lowStockItems.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center text-slate-500 text-sm">
            🎉 Solid work! All stock units are currently sitting above replenishment levels.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold border-b border-slate-800">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU Identifier</th>
                  <th className="p-3 text-right">Qty Remaining</th>
                  <th className="p-3 text-right">Trigger Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {lowStockItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-950 transition-colors">
                    <td className="p-3 font-medium text-white">{item.name}</td>
                    <td className="p-3 font-mono text-slate-400">{item.sku}</td>
                    <td className="p-3 text-right font-bold text-rose-400">{item.quantityOnHand}</td>
                    <td className="p-3 text-right text-slate-500">
                      {item.lowStockLimit !== null ? `${item.lowStockLimit} (Custom)` : `${globalThreshold} (Global)`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}