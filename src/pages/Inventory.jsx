import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  Package, 
  TrendingUp, 
  ArrowUpDown,
  Boxes,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';

export default function Inventory({ 
  products, 
  currency, 
  onSaveProduct, 
  onDeleteProduct, 
  onAdjustStock,
  initialFilterLowStock = false 
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(initialFilterLowStock);
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // 'add' or 'subtract'

  // Product Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    minStockAlert: '5',
    unit: 'Pcs'
  });

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [products]);

  const categoryOptions = useMemo(() => {
    return categories.map(c => ({
      value: c,
      label: c === 'All' ? '📂 All Categories' : `📦 ${c}`
    }));
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(prod => {
      const matchSearch = prod.name.toLowerCase().includes(search.toLowerCase()) || 
                          (prod.sku && prod.sku.toLowerCase().includes(search.toLowerCase()));
      const matchCat = selectedCategory === 'All' || prod.category === selectedCategory;
      const isLowStock = (prod.stock || 0) <= (prod.minStockAlert || 5);
      const matchLowStock = filterLowStockOnly ? isLowStock : true;
      return matchSearch && matchCat && matchLowStock;
    });
  }, [products, search, selectedCategory, filterLowStockOnly]);

  const totalInventoryCost = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.costPrice) || 0) * (Number(p.stock) || 0), 0);
  }, [products]);

  const totalInventoryRetail = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.sellingPrice) || 0) * (Number(p.stock) || 0), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => (p.stock || 0) <= (p.minStockAlert || 5)).length;
  }, [products]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'General',
      costPrice: '',
      sellingPrice: '',
      stock: '',
      minStockAlert: '5',
      unit: 'Pcs'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku || '',
      category: prod.category || 'General',
      costPrice: prod.costPrice || '',
      sellingPrice: prod.sellingPrice || '',
      stock: prod.stock || '',
      minStockAlert: prod.minStockAlert || '5',
      unit: prod.unit || 'Pcs'
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Product name is required');
    if (!formData.sellingPrice) return alert('Selling price is required');

    onSaveProduct({
      ...(editingProduct ? { id: editingProduct.id } : {}),
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category,
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      stock: Number(formData.stock) || 0,
      minStockAlert: Number(formData.minStockAlert) || 5,
      unit: formData.unit
    });

    setIsProductModalOpen(false);
  };

  const handleOpenAdjust = (prod) => {
    setAdjustingProduct(prod);
    setAdjustQty('');
    setAdjustType('add');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStockSubmit = (e) => {
    e.preventDefault();
    const qty = Number(adjustQty);
    if (!qty || qty <= 0) return alert('Please enter a valid positive quantity');
    
    const delta = adjustType === 'add' ? qty : -qty;
    onAdjustStock(adjustingProduct.id, delta);
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Products & Stock</h2>
          <p className="text-xs text-slate-500">Manage catalog, track inventory valuation, and monitor reorder levels.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Inventory Valuation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Products</span>
            <p className="text-xl font-extrabold text-slate-800">{products.length} Items</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inventory Value (Cost)</span>
            <p className="text-xl font-extrabold text-emerald-700">{currency} {totalInventoryCost.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
            <p className={`text-xl font-extrabold ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {lowStockCount} Items
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <div className="w-48">
              <SearchableSelect
                options={categoryOptions}
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                placeholder="Filter Category"
                searchPlaceholder="Search category..."
              />
            </div>

            {/* Low stock toggle */}
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filterLowStockOnly
                  ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Only ({lowStockCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Item & Code</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Sale Price</th>
                <th className="py-3.5 px-4 text-right">Profit / Margin</th>
                <th className="py-3.5 px-4 text-center">Available Stock</th>
                <th className="py-3.5 px-4 text-center">Stock Actions</th>
                <th className="py-3.5 px-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No products found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isLow = (prod.stock || 0) <= (prod.minStockAlert || 5);
                  const marginAmount = (prod.sellingPrice || 0) - (prod.costPrice || 0);
                  const marginPct = prod.sellingPrice > 0 ? Math.round((marginAmount / prod.sellingPrice) * 100) : 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{prod.name}</div>
                        <span className="text-[11px] text-slate-400 font-mono">{prod.sku || 'NO-SKU'}</span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {prod.category || 'General'}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                        {currency} {Number(prod.costPrice).toLocaleString()}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                        {currency} {Number(prod.sellingPrice).toLocaleString()}
                      </td>

                      {/* Profit Margin */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-semibold text-emerald-600">
                          +{currency} {marginAmount.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">({marginPct}% margin)</span>
                      </td>

                      {/* Stock Level & Low Alert */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-extrabold text-sm">
                          <span className={isLow ? 'text-rose-600' : 'text-slate-800'}>
                            {prod.stock}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">{prod.unit || 'Pcs'}</span>
                        </div>
                        {isLow && (
                          <div className="mt-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Low Stock (&le;{prod.minStockAlert})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Stock Adjust button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenAdjust(prod)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                        >
                          <ArrowUpDown className="w-3 h-3" />
                          Adjust
                        </button>
                      </td>

                      {/* Edit / Delete */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${prod.name}"?`)) onDeleteProduct(prod.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveProductSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Basmati Rice (5kg Bag)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">SKU / Barcode</label>
              <input
                type="text"
                placeholder="e.g. RICE-5KG"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Grocery / Spices"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Purchase / Cost Price ({currency})</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sale Price ({currency}) *</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Current Stock</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Alert Threshold</label>
              <input
                type="number"
                min="0"
                placeholder="5"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit</label>
              <SearchableSelect
                options={['Pcs', 'Kg', 'Bag', 'Tin', 'Pkt', 'Box', 'Litre', 'Dozen', 'Meter', 'Gram', 'Carton']}
                value={formData.unit}
                onChange={(val) => setFormData({ ...formData, unit: val })}
                placeholder="Select Unit"
                searchPlaceholder="Search unit..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock: ${adjustingProduct?.name || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdjustStockSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Stock:</span>
              <span className="font-bold text-slate-900">{adjustingProduct?.stock} {adjustingProduct?.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Min Alert Threshold:</span>
              <span className="font-semibold text-slate-700">{adjustingProduct?.minStockAlert} {adjustingProduct?.unit}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAdjustType('add')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                adjustType === 'add'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Add Stock (Restock)
            </button>
            <button
              type="button"
              onClick={() => setAdjustType('subtract')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                adjustType === 'subtract'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <MinusCircle className="w-4 h-4 text-rose-600" />
              Deduct (Damage/Waste)
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quantity to {adjustType === 'add' ? 'Add' : 'Deduct'} ({adjustingProduct?.unit})
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 10"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
