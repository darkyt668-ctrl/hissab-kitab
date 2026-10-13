import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  Eye, 
  Trash2, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  X,
  Package
} from 'lucide-react';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';

export default function PurchaseInvoices({ 
  purchaseInvoices, 
  products, 
  parties, 
  currency, 
  businessProfile,
  onCreatePurchaseInvoice, 
  onDeletePurchaseInvoice, 
  onViewInvoice,
  initialOpenNew = false 
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialOpenNew);

  // New Purchase Invoice Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  
  // Line items
  const [cartItems, setCartItems] = useState([
    { productId: '', name: '', costPrice: 0, unitPrice: 0, qty: 1, availableStock: 0, total: 0 }
  ]);
  const [discount, setDiscount] = useState('0');
  const [paidAmount, setPaidAmount] = useState('');

  useEffect(() => {
    if (initialOpenNew) {
      setIsCreateModalOpen(true);
    }
  }, [initialOpenNew]);

  // Only show suppliers in the dropdown
  const supplierParties = useMemo(() => {
    return parties.filter(p => p.type === 'Supplier');
  }, [parties]);

  const supplierOptions = useMemo(() => {
    return [
      { value: '', label: '-- Select Supplier --' },
      ...supplierParties.map(p => ({
        value: p.id,
        label: p.name,
        sublabel: p.phone ? `Phone: ${p.phone}` : undefined,
        badge: p.balance < 0 ? `Payable: ${currency} ${Math.abs(p.balance).toLocaleString()}` : (p.balance === 0 ? 'Clear' : undefined)
      }))
    ];
  }, [supplierParties, currency]);

  const productOptions = useMemo(() => {
    return products.map(p => ({
      value: p.id,
      label: p.name,
      sublabel: `Stock: ${p.stock} ${p.unit || 'Pcs'} | Cost: ${currency} ${Number(p.costPrice).toLocaleString()}`,
    }));
  }, [products, currency]);

  const paymentMethodOptions = useMemo(() => [
    { value: 'Cash', label: '💵 Cash Payment' },
    { value: 'EasyPaisa', label: '📱 EasyPaisa' },
    { value: 'JazzCash', label: '📱 JazzCash' },
    { value: 'Bank Transfer', label: '🏦 Bank Transfer' },
    { value: 'Credit / Udhar', label: '📒 Udhar / Credit (Supplier ko baad mein dein ge)' }
  ], []);

  // Calculations for current cart
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  }, [cartItems]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - (Number(discount) || 0));
  }, [subtotal, discount]);

  const balanceDue = useMemo(() => {
    const paid = Number(paidAmount) || 0;
    return Math.max(0, grandTotal - paid);
  }, [grandTotal, paidAmount]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return (purchaseInvoices || []).filter(inv => {
      const matchSearch = (inv.invoiceNo || '').toLowerCase().includes(search.toLowerCase()) ||
                          (inv.supplierName || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseInvoices, search, statusFilter]);

  // Totals overview
  const totalPurchasesVal = useMemo(() => (purchaseInvoices || []).reduce((s, i) => s + (Number(i.total) || 0), 0), [purchaseInvoices]);
  const totalPaidVal = useMemo(() => (purchaseInvoices || []).reduce((s, i) => s + (Number(i.paidAmount) || 0), 0), [purchaseInvoices]);
  const totalPayableVal = useMemo(() => (purchaseInvoices || []).reduce((s, i) => s + (Number(i.balanceDue) || 0), 0), [purchaseInvoices]);

  const handleProductSelect = (index, productId) => {
    const prod = products.find(p => p.id === productId);
    const updated = [...cartItems];
    if (prod) {
      updated[index] = {
        productId: prod.id,
        name: prod.name,
        costPrice: prod.costPrice || 0,
        unitPrice: prod.costPrice || 0, // Purchase = cost price
        qty: 1,
        availableStock: prod.stock || 0,
        total: prod.costPrice || 0
      };
    } else {
      updated[index] = { productId: '', name: '', costPrice: 0, unitPrice: 0, qty: 1, availableStock: 0, total: 0 };
    }
    setCartItems(updated);
  };

  const handleQtyChange = (index, qty) => {
    const parsedQty = Math.max(1, Number(qty) || 1);
    const updated = [...cartItems];
    updated[index].qty = parsedQty;
    updated[index].total = parsedQty * (Number(updated[index].unitPrice) || 0);
    setCartItems(updated);
  };

  const handlePriceChange = (index, price) => {
    const parsedPrice = Number(price) || 0;
    const updated = [...cartItems];
    updated[index].unitPrice = parsedPrice;
    updated[index].total = (Number(updated[index].qty) || 1) * parsedPrice;
    setCartItems(updated);
  };

  const handleAddRow = () => {
    setCartItems([
      ...cartItems,
      { productId: '', name: '', costPrice: 0, unitPrice: 0, qty: 1, availableStock: 0, total: 0 }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (cartItems.length === 1) return;
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleOpenCreate = () => {
    setSelectedSupplierId('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Cash');
    setNotes('');
    setDiscount('0');
    setPaidAmount('');
    setCartItems([
      { productId: '', name: '', costPrice: 0, unitPrice: 0, qty: 1, availableStock: 0, total: 0 }
    ]);
    setIsCreateModalOpen(true);
  };

  const handleSubmitInvoice = (e) => {
    e.preventDefault();

    const validItems = cartItems.filter(item => item.productId && item.qty > 0);
    if (validItems.length === 0) {
      return alert('Kam az kam 1 product add karein with valid quantity');
    }

    if (!selectedSupplierId) {
      return alert('Supplier select karein. Pehle Parties mein Supplier add karein.');
    }

    // Determine supplier name & phone
    let supplierName = '';
    let supplierPhone = '';
    if (selectedSupplierId) {
      const party = parties.find(p => p.id === selectedSupplierId);
      if (party) {
        supplierName = party.name;
        supplierPhone = party.phone || '';
      }
    }

    const newInvoice = onCreatePurchaseInvoice({
      supplierId: selectedSupplierId,
      supplierName,
      supplierPhone,
      date: invoiceDate,
      items: validItems,
      subtotal,
      discount: Number(discount) || 0,
      paidAmount: paidAmount === '' ? grandTotal : Number(paidAmount),
      paymentMethod,
      notes
    });

    setIsCreateModalOpen(false);
    if (newInvoice && onViewInvoice) {
      onViewInvoice(newInvoice);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            Purchase Invoices
          </h2>
          <p className="text-xs text-slate-500">Supplier se kharidari ka record. Purchase pe stock automatically plus hota hai.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md shadow-purple-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Purchase Invoice
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Purchases</span>
            <p className="text-xl font-extrabold text-purple-700">{currency} {totalPurchasesVal.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Paid to Suppliers</span>
            <p className="text-xl font-extrabold text-emerald-700">{currency} {totalPaidVal.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Payable (Udhar)</span>
            <p className="text-xl font-extrabold text-rose-600">{currency} {totalPayableVal.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number or supplier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Paid', 'Partial', 'Unpaid'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                statusFilter === status
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-purple-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Paid</th>
                <th className="py-3.5 px-4 text-right">Payable</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Koi purchase invoice nahi mila. "New Purchase Invoice" se pehli purchase darj karein!
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-purple-600">{inv.invoiceNo}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{inv.supplierName}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {inv.items?.length || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                      {currency} {Number(inv.total).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                      {currency} {Number(inv.paidAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      {Number(inv.balanceDue) > 0 ? `${currency} ${Number(inv.balanceDue).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'Partial' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewInvoice && onViewInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Purchase Invoice #${inv.invoiceNo} delete karein?`)) onDeletePurchaseInvoice(inv.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Purchase Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New Purchase Invoice (Kharidari)"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmitInvoice} className="space-y-5">
          {/* Supplier & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-200/60">
            {/* Supplier Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier (Party) *
              </label>
              <SearchableSelect
                options={supplierOptions}
                value={selectedSupplierId}
                onChange={(val) => setSelectedSupplierId(val)}
                placeholder="-- Select Supplier --"
                searchPlaceholder="Supplier ka naam search karein..."
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Sirf Supplier type parties dikhein gi. Parties section mein pehle supplier add karein.
              </p>
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Cart Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-purple-50/60 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Purchase Items (Stock Plus Hoga)</span>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                  {/* Product Picker */}
                  <div className="flex-1 min-w-[200px]">
                    <SearchableSelect
                      options={productOptions}
                      value={item.productId}
                      onChange={(val) => handleProductSelect(idx, val)}
                      placeholder="-- Product Select Karein --"
                      searchPlaceholder="Product ka naam search karein..."
                    />
                  </div>

                  {/* Unit Price (Purchase price) */}
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handlePriceChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-right"
                    />
                  </div>

                  {/* Qty */}
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleQtyChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="w-28 text-right font-bold text-xs text-slate-800 self-center">
                    {currency} {Number(item.total).toLocaleString()}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    disabled={cartItems.length === 1}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Calculation Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Left: Notes & Method */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <SearchableSelect
                  options={paymentMethodOptions}
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val)}
                  placeholder="Payment method select karein..."
                  searchPlaceholder="Search..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Remarks
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Supplier ne 10 din ka credit diya hai..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>
            </div>

            {/* Right: Calculations */}
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200/60 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold">{currency} {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-28 px-2 py-1 text-right text-xs bg-white border border-slate-200 rounded-lg text-emerald-600 font-bold"
                />
              </div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-purple-200 pt-2">
                <span>Grand Total:</span>
                <span className="text-purple-700">{currency} {grandTotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between border-t border-purple-200/60 pt-2">
                <div>
                  <span className="font-bold text-emerald-700">Paid to Supplier:</span>
                  <p className="text-[10px] text-slate-400">Blank = full payment</p>
                </div>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  placeholder={`${grandTotal}`}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-28 px-2 py-1 text-right text-xs bg-white border border-slate-200 rounded-lg font-bold text-emerald-700"
                />
              </div>

              {balanceDue > 0 && (
                <div className="flex justify-between items-center bg-rose-50 p-2 rounded-xl text-rose-700 border border-rose-200 font-bold mt-1">
                  <span>Baqi Raqam (Supplier Payable):</span>
                  <span>{currency} {balanceDue.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-green-50 p-2 rounded-xl text-green-800 border border-green-200 mt-1">
                <Package className="w-4 h-4" />
                <span className="text-[11px] font-bold">Stock automatically plus ho jayega!</span>
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 active:scale-95 transition-all"
            >
              Save Purchase Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
