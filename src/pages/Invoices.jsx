import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Eye, 
  Trash2, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  UserPlus
} from 'lucide-react';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';

export default function Invoices({ 
  invoices, 
  products, 
  parties, 
  currency, 
  businessProfile,
  onCreateInvoice, 
  onDeleteInvoice, 
  onViewInvoice,
  initialOpenNew = false 
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialOpenNew);

  // New Invoice Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [easypaisaTrxId, setEasypaisaTrxId] = useState('');
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

  const customerParties = useMemo(() => {
    return parties.filter(p => p.type === 'Customer');
  }, [parties]);

  const customerOptions = useMemo(() => {
    return [
      { value: '', label: '💵 Direct Cash / Walk-in Customer' },
      ...customerParties.map(p => ({
        value: p.id,
        label: p.name,
        sublabel: p.phone ? `Phone: ${p.phone}` : undefined,
        badge: p.balance > 0 ? `Khata: ${currency} ${p.balance.toLocaleString()}` : (p.balance === 0 ? 'Clear' : undefined)
      }))
    ];
  }, [customerParties, currency]);

  const productOptions = useMemo(() => {
    return products.map(p => ({
      value: p.id,
      label: p.name,
      sublabel: `Stock: ${p.stock} ${p.unit || 'Pcs'} | ${currency} ${Number(p.sellingPrice).toLocaleString()}`,
      badge: (p.stock || 0) <= (p.minStockAlert || 5) ? 'Low Stock' : undefined
    }));
  }, [products, currency]);

  const paymentMethodOptions = useMemo(() => [
    { value: 'Cash', label: '💵 Cash at Counter' },
    { value: 'EasyPaisa', label: '📱 EasyPaisa Mobile Account' },
    { value: 'JazzCash', label: '📱 JazzCash Mobile Account' },
    { value: 'Bank Transfer', label: '🏦 Online Bank / Raast Transfer' },
    { value: 'Credit / Khata', label: '📒 Full Udhar / Khata' }
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
    return invoices.filter(inv => {
      const matchSearch = inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
                          (inv.customerName && inv.customerName.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  // Totals overview
  const totalSalesVal = useMemo(() => invoices.reduce((s, i) => s + (Number(i.total) || 0), 0), [invoices]);
  const totalCollectedVal = useMemo(() => invoices.reduce((s, i) => s + (Number(i.paidAmount) || 0), 0), [invoices]);
  const totalPendingVal = useMemo(() => invoices.reduce((s, i) => s + (Number(i.balanceAdded) || 0), 0), [invoices]);

  const handleProductSelect = (index, productId) => {
    const prod = products.find(p => p.id === productId);
    const updated = [...cartItems];
    if (prod) {
      updated[index] = {
        productId: prod.id,
        name: prod.name,
        costPrice: prod.costPrice || 0,
        unitPrice: prod.sellingPrice || 0,
        qty: 1,
        availableStock: prod.stock || 0,
        total: prod.sellingPrice || 0
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
    setSelectedCustomerId('');
    setCustomCustomerName('Walk-in Cash Customer');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Cash');
    setEasypaisaTrxId('');
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
      return alert('Please add at least one product with valid quantity');
    }

    // Determine customer name & phone
    let finalCustName = customCustomerName;
    let customerPhone = '';
    if (selectedCustomerId) {
      const party = parties.find(p => p.id === selectedCustomerId);
      if (party) {
        finalCustName = party.name;
        customerPhone = party.phone || '';
      }
    }

    const newInvoice = onCreateInvoice({
      customerId: selectedCustomerId || null,
      customerName: finalCustName || 'Walk-in Cash Customer',
      customerPhone,
      date: invoiceDate,
      items: validItems,
      subtotal,
      discount: Number(discount) || 0,
      tax: 0,
      paidAmount: paidAmount === '' ? grandTotal : Number(paidAmount),
      paymentMethod,
      easypaisaTrxId: paymentMethod === 'EasyPaisa' ? easypaisaTrxId.trim() : '',
      notes
    });

    setIsCreateModalOpen(false);
    onViewInvoice(newInvoice);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales Invoicing & Billing</h2>
          <p className="text-xs text-slate-500">Generate bills, track instant collections vs pending customer Udhar.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Invoice
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Sales Invoiced</span>
            <p className="text-xl font-extrabold text-indigo-700">{currency} {totalSalesVal.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Cash Collected</span>
            <p className="text-xl font-extrabold text-emerald-700">{currency} {totalCollectedVal.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Udhar / Balance</span>
            <p className="text-xl font-extrabold text-rose-600">{currency} {totalPendingVal.toLocaleString()}</p>
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
            placeholder="Search invoice number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Paid', 'Partial', 'Unpaid'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Paid</th>
                <th className="py-3.5 px-4 text-right">Udhar Balance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    No invoices found. Click "Create New Invoice" to make your first sale!
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-600">{inv.invoiceNo}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{inv.customerName}</td>
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
                      {Number(inv.balanceAdded) > 0 ? `${currency} ${Number(inv.balanceAdded).toLocaleString()}` : '-'}
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
                          onClick={() => onViewInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete Invoice #${inv.invoiceNo}?`)) onDeleteInvoice(inv.id);
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

      {/* Create New Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Sales Invoice"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmitInvoice} className="space-y-5">
          {/* Customer & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            {/* Customer Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Customer (Khata Party)
              </label>
              <SearchableSelect
                options={customerOptions}
                value={selectedCustomerId}
                onChange={(val) => {
                  setSelectedCustomerId(val);
                  if (val) setCustomCustomerName('');
                }}
                placeholder="-- Choose Customer --"
                searchPlaceholder="Type customer name or phone..."
              />
            </div>

            {/* Custom Customer Name if not in parties */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="Walk-in Cash Customer"
                value={selectedCustomerId ? (customerParties.find(p => p.id === selectedCustomerId)?.name || '') : customCustomerName}
                disabled={!!selectedCustomerId}
                onChange={(e) => setCustomCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Cart Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Invoice Items</span>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line Item
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
                      placeholder="-- Choose Product --"
                      searchPlaceholder="Search product by name or SKU..."
                    />
                  </div>

                  {/* Unit Price */}
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
                  placeholder="Select Payment Method..."
                  searchPlaceholder="Search payment method..."
                />
              </div>

              {/* Dedicated EasyPaisa Account Details & Transaction ID Input */}
              {paymentMethod === 'EasyPaisa' && (
                <div className="bg-emerald-50 border border-emerald-300/80 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      EasyPaisa Account
                    </span>
                    <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Direct Mobile Transfer
                    </span>
                  </div>

                  <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Merchant EasyPaisa No:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {businessProfile?.easypaisaNumber || '0300-1234567'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Title:</span>
                      <span className="font-semibold text-slate-800">
                        {businessProfile?.easypaisaTitle || 'Store Account'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                      EasyPaisa Transaction ID (Trx ID / TID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 38291048291"
                      value={easypaisaTrxId}
                      onChange={(e) => setEasypaisaTrxId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-400 font-mono font-bold"
                    />
                    <p className="text-[10px] text-emerald-700 mt-1">
                      Customer receives this 11-digit Trx ID via SMS upon sending money.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Invoice Notes / Remarks
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Cleared via online receipt, remaining to be paid next week"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>
            </div>

            {/* Right: Calculations */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold">{currency} {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Discount Amount:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-28 px-2 py-1 text-right text-xs bg-white border border-slate-200 rounded-lg text-emerald-600 font-bold"
                />
              </div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                <span>Grand Total:</span>
                <span className="text-indigo-700">{currency} {grandTotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                <div>
                  <span className="font-bold text-emerald-700">Amount Paid Now:</span>
                  <p className="text-[10px] text-slate-400">Leave blank for full immediate payment</p>
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
                  <span>Balance Due (Adds to Khata):</span>
                  <span>{currency} {balanceDue.toLocaleString()}</span>
                </div>
              )}
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
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Save & View Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
