'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
  threshold: number;
}

interface DashboardData {
  totalProducts: number;
  totalInventoryCount: number;
  lowStockItems: LowStockItem[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading metrics view...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Basic Navigation Banner */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">StockFlow Dashboard</h1>
        <div className="flex space-x-4">
          <Link href="/dashboard" className="text-sm font-semibold text-blue-600">Dashboard</Link>
          <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">Products</Link>
          <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">Settings</Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Metric Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Product Types</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data?.totalProducts ?? 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Total Units In Stock</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data?.totalInventoryCount ?? 0}</p>
          </div>
        </div>

        {/* Low Stock Watch Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Low Stock Alert Panel</h3>
            <p className="text-xs text-gray-500 mt-0.5">Products requiring immediate reordering items.</p>
          </div>
          <div className="p-6">
            {data?.lowStockItems && data.lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">SKU Code</th>
                      <th className="px-4 py-3 text-right">Available Stock</th>
                      <th className="px-4 py-3 text-right">Minimum Alert Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.lowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3.5 font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-red-600 bg-red-50/50 rounded-md">{item.quantityOnHand} units</td>
                        <td className="px-4 py-3.5 text-right text-gray-600">{item.threshold} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-400">
                ✅ All products safely above their low-stock safety lines.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}