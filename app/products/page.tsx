'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantityOnHand: number;
  costPrice: number | null;
  sellingPrice: number | null;
  lowStockLimit: number | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '', // Used only when tracking an update action
    name: '',
    sku: '',
    description: '',
    quantityOnHand: '0',
    costPrice: '',
    sellingPrice: '',
    lowStockLimit: '',
  });

  // Fetch products scoped to user organization
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (err) {
      console.error('Error Loading Products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Create or Update submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    const isEditing = !!formData.id;
    const url = isEditing ? `/api/products/${formData.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save product changes.');

      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Safe execution of native hard deletion with dialog check
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this product item permanently?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Delete action failed:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      sku: '',
      description: '',
      quantityOnHand: '0',
      costPrice: '',
      sellingPrice: '',
      lowStockLimit: '',
    });
    setError('');
  };

  // Client-side quick filter processing matching structural design specs
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structural Navigation Layout Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">StockFlow Catalog</h1>
        <div className="flex space-x-4">
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
          <Link href="/products" className="text-sm font-semibold text-blue-600">Products</Link>
          <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">Settings</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Dynamic Search & Operations Context Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <input
            type="text"
            placeholder="Search catalog by name or SKU identifier..."
            className="w-full sm:max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            + Add New Product
          </button>
        </div>

        {/* Content Render Logic State Router */}
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400 font-medium">Querying master tenant products list...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Product Info</th>
                    <th className="px-6 py-3">SKU</th>
                    <th className="px-6 py-3 text-right">Selling Price</th>
                    <th className="px-6 py-3 text-right">In Stock</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          {product.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{product.sku}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {product.sellingPrice !== null ? `$${product.sellingPrice.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-semibold ${product.quantityOnHand <= (product.lowStockLimit ?? 5) ? 'text-red-600' : 'text-gray-700'}`}>
                            {product.quantityOnHand} units
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center space-x-3">
                          <button
                            onClick={() => {
                              setFormData({
                                id: product.id,
                                name: product.name,
                                sku: product.sku,
                                description: product.description || '',
                                quantityOnHand: String(product.quantityOnHand),
                                costPrice: product.costPrice ? String(product.costPrice) : '',
                                sellingPrice: product.sellingPrice ? String(product.sellingPrice) : '',
                                lowStockLimit: product.lowStockLimit ? String(product.lowStockLimit) : '',
                              });
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-sm text-gray-400">
                        No product items matched your operational scope or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create / Edit Form Modal Dialog Layer Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 text-base">
                  {formData.id ? 'Edit System Product Parameters' : 'Add New Inventory Item Record'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">{error}</div>}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Item Name *</label>
                  <input
                    type="text" required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">SKU / Unique Identifying String *</label>
                  <input
                    type="text" required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono"
                    value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Product Description</label>
                  <textarea
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Starting Stock Level</label>
                    <input
                      type="number" min="0" required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      value={formData.quantityOnHand} onChange={(e) => setFormData({ ...formData, quantityOnHand: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Low Stock Limit Warning</label>
                    <input
                      type="number" min="0" placeholder="Defaults to 5 if empty"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      value={formData.lowStockLimit} onChange={(e) => setFormData({ ...formData, lowStockLimit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Unit Acquisition Cost ($)</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Unit Customer Price ($)</label>
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-sm disabled:bg-blue-400"
                  >
                    {formLoading ? 'Saving product parameters...' : 'Commit Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}