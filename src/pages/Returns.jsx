import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  Trash2, 
  RotateCcw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Package, 
  DollarSign, 
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';

export default function Returns({
  saleReturns = [],
  purchaseReturns = [],
  products = [],
  parties = [],
  invoices = [],
  purchaseInvoices = [],
  currency = 'Rs.',
  businessProfile = {},
  onCreateSaleReturn,
  onDeleteSaleReturn,
  onCreatePurchaseReturn,
  onDeletePurchaseReturn,
  onViewReturn,
}) {
  const [activeTab, setActiveTab] = useState('sale_return'); // 'sale_return' or 'purchase_return'
  const [search, setSearch] = useState('');

  // Modals
  const [isSaleReturnModalOpen, setIsSaleReturnModalOpen] = useState(false);
  const [isPurchaseReturnModalOpen, setIsPurchaseReturnModalOpen] = useState(false);

  // ── Sale Return Form State ──
  const [srCustomerId, setSrCustomerId] = useState('');
  const [srDate, setSrDate] = useState(new Date().toISOString().split('T')[0]);
  const [srReason, setSrReason] = useState('');
  const [srRefundAmount, setSrRefundAmount] = useState('0'); // Cash given back to customer
  const [srItems, setSrItems] = useState([
    { productId: '', name: '', unitPrice: 0, qty: 1, total: 0 }
  ]);

  // ── Purchase Return Form State ──
  const [prSupplierId, setPrSupplierId] = useState('');
  const [prDate, setPrDate] = useState(new Date().toISOString().split('T')[0]);
  const [prReason, setPrReason] = useState('');
  const [prRefundAmount, setPrRefundAmount] = useState('0'); // Cash received back from supplier
  const [prItems, setPrItems] = useState([
    { productId: '', name: '', unitPrice: 0, qty: 1, total: 0 }
  ]);

  // Customer options
  const customerParties = useMemo(() => parties.filter(p => p.type === 'Customer'), [parties]);
  const customerOptions = useMemo(() => [
    { value: '', label: '-- Select Customer --' },
    ...customerParties.map(p => ({
      value: p.id,
      label: p.name,
      sublabel: p.phone ? `Phone: ${p.phone}` : undefined,
      badge: p.balance > 0 ? `Receivable: ${currency} ${p.balance.toLocaleString()}` : (p.balance === 0 ? 'Clear' : undefined)
    }))
  ], [customerParties, currency]);

  // Supplier options
  const supplierParties = useMemo(() => parties.filter(p => p.type === 'Supplier'), [parties]);
  const supplierOptions = useMemo(() => [
    { value: '', label: '-- Select Supplier --' },
    ...supplierParties.map(p => ({
      value: p.id,
      label: p.name,
      sublabel: p.phone ? `Phone: ${p.phone}` : undefined,
      badge: p.balance < 0 ? `Payable: ${currency} ${Math.abs(p.balance).toLocaleString()}` : (p.balance === 0 ? 'Clear' : undefined)
    }))
  ], [supplierParties, currency]);

  // Product options
  const productOptionsSale = useMemo(() => products.map(p => ({
    value: p.id,
    label: p.name,
    sublabel: `Stock: ${p.stock} | Selling Price: ${currency} ${Number(p.sellingPrice).toLocaleString()}`
  })), [products, currency]);

  const productOptionsPurchase = useMemo(() => products.map(p => ({
    value: p.id,
    label: p.name,
    sublabel: `Stock: ${p.stock} | Cost Price: ${currency} ${Number(p.costPrice).toLocaleString()}`
  })), [products, currency]);

  // Calculations for current Sale Return modal
  const srSubtotal = useMemo(() => {
    return srItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  }, [srItems]);

  const srBalanceAdjusted = useMemo(() => {
    const refund = Number(srRefundAmount) || 0;
    return Math.max(0, srSubtotal - refund);
  }, [srSubtotal, srRefundAmount]);

  // Calculations for current Purchase Return modal
  const prSubtotal = useMemo(() => {
    return prItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  }, [prItems]);

  const prBalanceAdjusted = useMemo(() => {
    const refund = Number(prRefundAmount) || 0;
    return Math.max(0, prSubtotal - refund);
  }, [prSubtotal, prRefundAmount]);

  // ── Handlers for Sale Return Items ──
  const handleSrProductSelect = (index, prodId) => {
    const prod = products.find(p => p.id === prodId);
    const updated = [...srItems];
    if (prod) {
      updated[index] = {
        productId: prod.id,
        name: prod.name,
        unitPrice: prod.sellingPrice || 0,
        qty: 1,
        total: prod.sellingPrice || 0
      };
    } else {
      updated[index] = { productId: '', name: '', unitPrice: 0, qty: 1, total: 0 };
    }
    setSrItems(updated);
  };

  const handleSrQtyChange = (index, qty) => {
    const parsedQty = Math.max(1, Number(qty) || 1);
    const updated = [...srItems];
    updated[index].qty = parsedQty;
    updated[index].total = parsedQty * (Number(updated[index].unitPrice) || 0);
    setSrItems(updated);
  };

  const handleSrPriceChange = (index, price) => {
    const parsedPrice = Number(price) || 0;
    const updated = [...srItems];
    updated[index].unitPrice = parsedPrice;
    updated[index].total = (Number(updated[index].qty) || 1) * parsedPrice;
    setSrItems(updated);
  };

  const handleSrAddRow = () => {
    setSrItems([...srItems, { productId: '', name: '', unitPrice: 0, qty: 1, total: 0 }]);
  };

  const handleSrRemoveRow = (idx) => {
    if (srItems.length === 1) return;
    setSrItems(srItems.filter((_, i) => i !== idx));
  };

  // ── Handlers for Purchase Return Items ──
  const handlePrProductSelect = (index, prodId) => {
    const prod = products.find(p => p.id === prodId);
    const updated = [...prItems];
    if (prod) {
      updated[index] = {
        productId: prod.id,
        name: prod.name,
        unitPrice: prod.costPrice || 0,
        qty: 1,
        total: prod.costPrice || 0
      };
    } else {
      updated[index] = { productId: '', name: '', unitPrice: 0, qty: 1, total: 0 };
    }
    setPrItems(updated);
  };

  const handlePrQtyChange = (index, qty) => {
    const parsedQty = Math.max(1, Number(qty) || 1);
    const updated = [...prItems];
    updated[index].qty = parsedQty;
    updated[index].total = parsedQty * (Number(updated[index].unitPrice) || 0);
    setPrItems(updated);
  };

  const handlePrPriceChange = (index, price) => {
    const parsedPrice = Number(price) || 0;
    const updated = [...prItems];
    updated[index].unitPrice = parsedPrice;
    updated[index].total = (Number(updated[index].qty) || 1) * parsedPrice;
    setPrItems(updated);
  };

  const handlePrAddRow = () => {
    setPrItems([...prItems, { productId: '', name: '', unitPrice: 0, qty: 1, total: 0 }]);
  };

  const handlePrRemoveRow = (idx) => {
    if (prItems.length === 1) return;
    setPrItems(prItems.filter((_, i) => i !== idx));
  };

  // ── Submit Sale Return ──
  const handleSubmitSaleReturn = (e) => {
    e.preventDefault();
    const validItems = srItems.filter(i => i.productId && i.qty > 0);
    if (validItems.length === 0) return alert('Kam az kam 1 product add karein');

    let customerName = 'Cash Customer';
    let customerPhone = '';
    if (srCustomerId) {
      const party = parties.find(p => p.id === srCustomerId);
      if (party) {
        customerName = party.name;
        customerPhone = party.phone || '';
      }
    }

    const newReturn = onCreateSaleReturn({
      customerId: srCustomerId || null,
      customerName,
      customerPhone,
      date: srDate,
      items: validItems,
      total: srSubtotal,
      refundAmount: Number(srRefundAmount) || 0,
      reason: srReason
    });

    setIsSaleReturnModalOpen(false);
    if (newReturn && onViewReturn) onViewReturn(newReturn);
  };

  // ── Submit Purchase Return ──
  const handleSubmitPurchaseReturn = (e) => {
    e.preventDefault();
    const validItems = prItems.filter(i => i.productId && i.qty > 0);
    if (validItems.length === 0) return alert('Kam az kam 1 product add karein');
    if (!prSupplierId) return alert('Supplier select karein');

    const party = parties.find(p => p.id === prSupplierId);
    const supplierName = party?.name || 'Supplier';
    const supplierPhone = party?.phone || '';

    const newReturn = onCreatePurchaseReturn({
      supplierId: prSupplierId,
      supplierName,
      supplierPhone,
      date: prDate,
      items: validItems,
      total: prSubtotal,
      refundAmount: Number(prRefundAmount) || 0,
      reason: prReason
    });

    setIsPurchaseReturnModalOpen(false);
    if (newReturn && onViewReturn) onViewReturn(newReturn);
  };

  // Filtering
  const filteredSaleReturns = useMemo(() => {
    return (saleReturns || []).filter(r => {
      const matchSearch = (r.returnNo || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.customerName || '').toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [saleReturns, search]);

  const filteredPurchaseReturns = useMemo(() => {
    return (purchaseReturns || []).filter(r => {
      const matchSearch = (r.returnNo || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.supplierName || '').toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [purchaseReturns, search]);

  const selectedCustomerObj = parties.find(p => p.id === srCustomerId);
  const selectedSupplierObj = parties.find(p => p.id === prSupplierId);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-indigo-600" />
            Returns Management (Sale & Purchase Returns)
          </h2>
          <p className="text-xs text-slate-500">
            Sale Return par stock plus (+) aur customer khata adjust hoga. Purchase Return par stock minus (-) aur supplier balance adjust hoga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSrCustomerId('');
              setSrDate(new Date().toISOString().split('T')[0]);
              setSrReason('');
              setSrRefundAmount('0');
              setSrItems([{ productId: '', name: '', unitPrice: 0, qty: 1, total: 0 }]);
              setIsSaleReturnModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            + New Sale Return
          </button>

          <button
            onClick={() => {
              setPrSupplierId('');
              setPrDate(new Date().toISOString().split('T')[0]);
              setPrReason('');
              setPrRefundAmount('0');
              setPrItems([{ productId: '', name: '', unitPrice: 0, qty: 1, total: 0 }]);
              setIsPurchaseReturnModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            + New Purchase Return
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('sale_return')}
            className={`flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 justify-center ${
              activeTab === 'sale_return'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-indigo-600" />
            Sale Returns ({saleReturns.length})
          </button>
          <button
            onClick={() => setActiveTab('purchase_return')}
            className={`flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 justify-center ${
              activeTab === 'purchase_return'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-600" />
            Purchase Returns ({purchaseReturns.length})
          </button>
        </div>

        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'sale_return' ? 'sale returns' : 'purchase returns'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* SALE RETURNS TABLE */}
      {activeTab === 'sale_return' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full max-w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-indigo-50/70 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Return #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-center">Items (Stock +)</th>
                  <th className="py-3.5 px-4 text-right">Return Value</th>
                  <th className="py-3.5 px-4 text-right">Cash Refunded</th>
                  <th className="py-3.5 px-4 text-right">Khata Adjusted</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSaleReturns.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      Koi Sale Return record nahi mila. "+ New Sale Return" click karein.
                    </td>
                  </tr>
                ) : (
                  filteredSaleReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-indigo-600">{ret.returnNo}</td>
                      <td className="py-3.5 px-4 text-slate-500">{ret.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{ret.customerName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          +{ret.items?.reduce((s, i) => s + (Number(i.qty) || 0), 0)} Pcs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {currency} {Number(ret.total).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        {currency} {Number(ret.refundAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {Number(ret.balanceAdjusted) > 0 ? `-${currency} ${Number(ret.balanceAdjusted).toLocaleString()}` : 'Rs. 0'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{ret.reason || '-'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewReturn && onViewReturn(ret)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Print / View Return Voucher"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Sale Return #${ret.returnNo} delete karein? Stock aur Khata adjustment wapis revert ho jaye ga.`)) {
                                onDeleteSaleReturn(ret.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Return"
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
      )}

      {/* PURCHASE RETURNS TABLE */}
      {activeTab === 'purchase_return' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full max-w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-purple-50/70 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Return #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4 text-center">Items (Stock -)</th>
                  <th className="py-3.5 px-4 text-right">Return Value</th>
                  <th className="py-3.5 px-4 text-right">Cash Received</th>
                  <th className="py-3.5 px-4 text-right">Supplier Udhar Reduced</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPurchaseReturns.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      Koi Purchase Return record nahi mila. "+ New Purchase Return" click karein.
                    </td>
                  </tr>
                ) : (
                  filteredPurchaseReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-purple-600">{ret.returnNo}</td>
                      <td className="py-3.5 px-4 text-slate-500">{ret.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{ret.supplierName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                          -{ret.items?.reduce((s, i) => s + (Number(i.qty) || 0), 0)} Pcs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {currency} {Number(ret.total).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        {currency} {Number(ret.refundAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {Number(ret.balanceAdjusted) > 0 ? `-${currency} ${Number(ret.balanceAdjusted).toLocaleString()}` : 'Rs. 0'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{ret.reason || '-'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewReturn && onViewReturn(ret)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Print / View Return Voucher"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Purchase Return #${ret.returnNo} delete karein? Stock aur Supplier Udhar adjustment wapis revert ho jaye ga.`)) {
                                onDeletePurchaseReturn(ret.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Return"
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
      )}

      {/* NEW SALE RETURN MODAL */}
      <Modal
        isOpen={isSaleReturnModalOpen}
        onClose={() => setIsSaleReturnModalOpen(false)}
        title="New Sale Return (Grahak Ka Mal Wapis - Stock +)"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmitSaleReturn} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer (Khata Party)
              </label>
              <SearchableSelect
                options={customerOptions}
                value={srCustomerId}
                onChange={(val) => setSrCustomerId(val)}
                placeholder="-- Select Customer --"
                searchPlaceholder="Search customer..."
              />
              {selectedCustomerObj && (
                <p className="text-[11px] text-slate-600 mt-1">
                  Current Khata Balance: <span className="font-bold text-amber-600">{currency} {selectedCustomerObj.balance?.toLocaleString()}</span> (You will receive)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Return Date
              </label>
              <input
                type="date"
                value={srDate}
                onChange={(e) => setSrDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Returned Items */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-indigo-50/60 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Returned Products (Inventory Stock Mein Plus Ho Jayega)
              </span>
              <button
                type="button"
                onClick={handleSrAddRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="p-3 space-y-2 max-h-56 overflow-y-auto">
              {srItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex-1 min-w-[200px]">
                    <SearchableSelect
                      options={productOptionsSale}
                      value={item.productId}
                      onChange={(val) => handleSrProductSelect(idx, val)}
                      placeholder="-- Product Select Karein --"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleSrPriceChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-right"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleSrQtyChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div className="w-28 text-right font-bold text-xs text-slate-800 self-center">
                    {currency} {Number(item.total).toLocaleString()}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSrRemoveRow(idx)}
                    disabled={srItems.length === 1}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Refund & Balance Adjustment Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Return Reason / Remarks
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Expired product, damaged packaging, customer changed mind..."
                value={srReason}
                onChange={(e) => setSrReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              ></textarea>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200/60 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>Total Return Value:</span>
                <span className="text-indigo-700">{currency} {srSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between border-t border-indigo-200/60 pt-2">
                <div>
                  <span className="font-semibold text-slate-700">Cash Refunded to Customer:</span>
                  <p className="text-[10px] text-slate-400">Agar nagad wapis kiya to raqam likhein, warna 0</p>
                </div>
                <input
                  type="number"
                  min="0"
                  max={srSubtotal}
                  value={srRefundAmount}
                  onChange={(e) => setSrRefundAmount(e.target.value)}
                  className="w-28 px-2 py-1 text-right text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-700"
                />
              </div>

              <div className="flex justify-between items-center bg-emerald-50 p-2.5 rounded-xl text-emerald-800 border border-emerald-200 font-bold">
                <span>Customer Khata se Minus Hoga:</span>
                <span>-{currency} {srBalanceAdjusted.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mal wapis lene par Product ka Stock automatically plus (+) ho jayega!</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSaleReturnModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Save Sale Return
            </button>
          </div>
        </form>
      </Modal>

      {/* NEW PURCHASE RETURN MODAL */}
      <Modal
        isOpen={isPurchaseReturnModalOpen}
        onClose={() => setIsPurchaseReturnModalOpen(false)}
        title="New Purchase Return (Supplier Ko Mal Wapis - Stock -)"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmitPurchaseReturn} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-200/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier *
              </label>
              <SearchableSelect
                options={supplierOptions}
                value={prSupplierId}
                onChange={(val) => setPrSupplierId(val)}
                placeholder="-- Select Supplier --"
                searchPlaceholder="Search supplier..."
              />
              {selectedSupplierObj && (
                <p className="text-[11px] text-slate-600 mt-1">
                  Current Payable to Supplier: <span className="font-bold text-rose-600">{currency} {Math.abs(selectedSupplierObj.balance || 0).toLocaleString()}</span> (You owe)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Return Date
              </label>
              <input
                type="date"
                value={prDate}
                onChange={(e) => setPrDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Returned Items */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-purple-50/60 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Returned Products (Inventory Stock Se Minus Ho Jayega)
              </span>
              <button
                type="button"
                onClick={handlePrAddRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="p-3 space-y-2 max-h-56 overflow-y-auto">
              {prItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex-1 min-w-[200px]">
                    <SearchableSelect
                      options={productOptionsPurchase}
                      value={item.productId}
                      onChange={(val) => handlePrProductSelect(idx, val)}
                      placeholder="-- Product Select Karein --"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Cost"
                      value={item.unitPrice}
                      onChange={(e) => handlePrPriceChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-right"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handlePrQtyChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div className="w-28 text-right font-bold text-xs text-slate-800 self-center">
                    {currency} {Number(item.total).toLocaleString()}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrRemoveRow(idx)}
                    disabled={prItems.length === 1}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Refund & Balance Adjustment Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Return Reason / Remarks
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Defective stock returned to vendor, over-shipment..."
                value={prReason}
                onChange={(e) => setPrReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              ></textarea>
            </div>

            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200/60 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>Total Return Value:</span>
                <span className="text-purple-700">{currency} {prSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between border-t border-purple-200/60 pt-2">
                <div>
                  <span className="font-semibold text-slate-700">Cash Received from Supplier:</span>
                  <p className="text-[10px] text-slate-400">Agar supplier ne nagad wapis diya to likhein, warna 0</p>
                </div>
                <input
                  type="number"
                  min="0"
                  max={prSubtotal}
                  value={prRefundAmount}
                  onChange={(e) => setPrRefundAmount(e.target.value)}
                  className="w-28 px-2 py-1 text-right text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-700"
                />
              </div>

              <div className="flex justify-between items-center bg-emerald-50 p-2.5 rounded-xl text-emerald-800 border border-emerald-200 font-bold">
                <span>Supplier Udhar Kam Hoga:</span>
                <span>-{currency} {prBalanceAdjusted.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-1.5 text-rose-700 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mal wapis bhaijne par Product ka Stock automatically minus (-) ho jayega!</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPurchaseReturnModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 active:scale-95 transition-all"
            >
              Save Purchase Return
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
