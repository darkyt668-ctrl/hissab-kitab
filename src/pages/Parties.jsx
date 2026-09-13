import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  UserCheck, 
  Phone, 
  MapPin, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Edit2, 
  Trash2, 
  DollarSign, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';

export default function Parties({ 
  parties, 
  invoices,
  currency, 
  businessProfile,
  onSaveParty, 
  onDeleteParty, 
  onRecordPayment 
}) {
  const [activeTab, setActiveTab] = useState('Customer'); // 'Customer' or 'Supplier'
  const [search, setSearch] = useState('');

  // Add/Edit Party Modal
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [partyForm, setPartyForm] = useState({
    name: '',
    phone: '',
    type: 'Customer',
    balance: '',
    address: '',
    notes: ''
  });

  // Settle Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [settlingParty, setSettlingParty] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState('Cash');
  const [settleTrxId, setSettleTrxId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Ledger History Modal
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerParty, setLedgerParty] = useState(null);

  const filteredParties = useMemo(() => {
    return parties.filter(p => {
      const matchType = p.type === activeTab;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.phone && p.phone.includes(search));
      return matchType && matchSearch;
    });
  }, [parties, activeTab, search]);

  // Aggregate stats
  const totalReceivables = useMemo(() => {
    return parties
      .filter(p => p.type === 'Customer' && (p.balance || 0) > 0)
      .reduce((sum, p) => sum + p.balance, 0);
  }, [parties]);

  const totalPayables = useMemo(() => {
    return parties
      .filter(p => p.type === 'Supplier' && (p.balance || 0) < 0)
      .reduce((sum, p) => sum + Math.abs(p.balance), 0);
  }, [parties]);

  const handleOpenAdd = () => {
    setEditingParty(null);
    setPartyForm({
      name: '',
      phone: '',
      type: activeTab,
      balance: '',
      address: '',
      notes: ''
    });
    setIsPartyModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingParty(p);
    setPartyForm({
      name: p.name,
      phone: p.phone || '',
      type: p.type,
      balance: p.balance || '',
      address: p.address || '',
      notes: p.notes || ''
    });
    setIsPartyModalOpen(true);
  };

  const handlePartySubmit = (e) => {
    e.preventDefault();
    if (!partyForm.name.trim()) return alert('Name is required');

    onSaveParty({
      ...(editingParty ? { id: editingParty.id } : {}),
      name: partyForm.name.trim(),
      phone: partyForm.phone.trim(),
      type: partyForm.type,
      balance: Number(partyForm.balance) || 0,
      address: partyForm.address.trim(),
      notes: partyForm.notes.trim()
    });

    setIsPartyModalOpen(false);
  };

  const handleOpenPayment = (party) => {
    setSettlingParty(party);
    setPaymentAmount('');
    setSettleMethod('Cash');
    setSettleTrxId('');
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return alert('Enter a valid amount');

    // If customer, it's 'received' (money collected, reducing receivable)
    // If supplier, it's 'paid' (money paid, reducing payable)
    const type = settlingParty.type === 'Customer' ? 'received' : 'paid';
    
    let combinedNote = paymentNotes.trim();
    if (settleMethod === 'EasyPaisa') {
      const epNote = `[EasyPaisa${settleTrxId ? ` TID: ${settleTrxId.trim()}` : ''}]`;
      combinedNote = combinedNote ? `${combinedNote} ${epNote}` : epNote;
    } else if (settleMethod !== 'Cash') {
      const mNote = `[${settleMethod}]`;
      combinedNote = combinedNote ? `${combinedNote} ${mNote}` : mNote;
    }

    onRecordPayment(settlingParty.id, amount, type, combinedNote);
    setIsPaymentModalOpen(false);
  };

  const handleOpenLedger = (party) => {
    setLedgerParty(party);
    setIsLedgerModalOpen(true);
  };

  const partyInvoices = useMemo(() => {
    if (!ledgerParty) return [];
    return invoices.filter(inv => inv.customerId === ledgerParty.id);
  }, [invoices, ledgerParty]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Party Ledger & Khata</h2>
          <p className="text-xs text-slate-500">Track Customer Udhar (Receivables) and Supplier balances (Payables).</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab}
        </button>
      </div>

      {/* Top Metric Cards for Receivables & Payables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
          activeTab === 'Customer' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20' : 'bg-white border-slate-200/80'
        }`} onClick={() => setActiveTab('Customer')}>
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Total Customer Receivables (Udhar)</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{currency} {totalReceivables.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Due from {parties.filter(p => p.type === 'Customer' && p.balance > 0).length} customers</p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
          activeTab === 'Supplier' ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/20' : 'bg-white border-slate-200/80'
        }`} onClick={() => setActiveTab('Supplier')}>
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Total Supplier Payables</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{currency} {totalPayables.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Due to {parties.filter(p => p.type === 'Supplier' && p.balance < 0).length} wholesale vendors</p>
          </div>
          <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Toggle between Customer and Supplier */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('Customer')}
            className={`flex-1 sm:flex-initial px-5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Customer'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customers ({parties.filter(p => p.type === 'Customer').length})
          </button>
          <button
            onClick={() => setActiveTab('Supplier')}
            className={`flex-1 sm:flex-initial px-5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'Supplier'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suppliers ({parties.filter(p => p.type === 'Supplier').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()} by name or phone...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Parties Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">{activeTab} Details</th>
                <th className="py-3.5 px-4">Contact & Location</th>
                <th className="py-3.5 px-4 text-right">Khata Balance</th>
                <th className="py-3.5 px-4 text-center">Quick Payment</th>
                <th className="py-3.5 px-4 text-center">Ledger History</th>
                <th className="py-3.5 px-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredParties.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No {activeTab.toLowerCase()}s found. Click "Add {activeTab}" to record your contacts!
                  </td>
                </tr>
              ) : (
                filteredParties.map((party) => {
                  const isReceivable = party.type === 'Customer' && party.balance > 0;
                  const isPayable = party.type === 'Supplier' && party.balance < 0;
                  const isSettled = party.balance === 0;

                  return (
                    <tr key={party.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{party.name}</div>
                        {party.notes && <span className="text-[11px] text-slate-400">{party.notes}</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{party.phone || 'No phone'}</span>
                        </div>
                        {party.address && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{party.address}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className={`font-extrabold text-sm ${
                          isReceivable ? 'text-amber-600' :
                          isPayable ? 'text-rose-600' :
                          'text-emerald-600'
                        }`}>
                          {currency} {Math.abs(party.balance || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {party.type === 'Customer'
                            ? (party.balance > 0 ? 'You will receive' : party.balance < 0 ? 'Advance paid' : 'Settled')
                            : (party.balance < 0 ? 'You owe supplier' : party.balance > 0 ? 'Supplier advance' : 'Settled')
                          }
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenPayment(party)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          {party.type === 'Customer' ? 'Receive Cash' : 'Pay Cash'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenLedger(party)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Ledger
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(party)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${party.name}"?`)) onDeleteParty(party.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* Add / Edit Party Modal */}
      <Modal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        title={editingParty ? `Edit ${editingParty.type}` : `Add New ${partyForm.type}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePartySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPartyForm({ ...partyForm, type: 'Customer' })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  partyForm.type === 'Customer'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Customer (Grahak)
              </button>
              <button
                type="button"
                onClick={() => setPartyForm({ ...partyForm, type: 'Supplier' })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  partyForm.type === 'Supplier'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Supplier (Wholesaler)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Muhammad Tariq"
              value={partyForm.name}
              onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="0300-1234567"
              value={partyForm.phone}
              onChange={(e) => setPartyForm({ ...partyForm, phone: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Opening Balance ({currency})
            </label>
            <input
              type="number"
              placeholder="0"
              value={partyForm.balance}
              onChange={(e) => setPartyForm({ ...partyForm, balance: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              For Customers: positive = they owe you. For Suppliers: negative = you owe them.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Address</label>
            <input
              type="text"
              placeholder="Shop or Residential address"
              value={partyForm.address}
              onChange={(e) => setPartyForm({ ...partyForm, address: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Notes</label>
            <textarea
              rows="2"
              placeholder="Any payment terms or notes..."
              value={partyForm.notes}
              onChange={(e) => setPartyForm({ ...partyForm, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPartyModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
            >
              {editingParty ? 'Save Changes' : 'Create Party'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Settle Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={settlingParty?.type === 'Customer' ? `Receive Payment: ${settlingParty?.name}` : `Make Payment: ${settlingParty?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Balance:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {currency} {Math.abs(settlingParty?.balance || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Amount ({currency}) *
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 2000"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <SearchableSelect
              options={[
                { value: 'Cash', label: '💵 Cash' },
                { value: 'EasyPaisa', label: '📱 EasyPaisa Mobile Account' },
                { value: 'JazzCash', label: '📱 JazzCash Mobile Account' },
                { value: 'Bank Transfer', label: '🏦 Online Bank / Raast Transfer' },
                { value: 'Cheque', label: '🧾 Cheque' }
              ]}
              value={settleMethod}
              onChange={(val) => setSettleMethod(val)}
              placeholder="Select Payment Method"
              searchPlaceholder="Search method..."
            />
          </div>

          {settleMethod === 'EasyPaisa' && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  EasyPaisa Settlement
                </span>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Mobile Wallet
                </span>
              </div>

              {businessProfile?.easypaisaNumber && (
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200 text-xs space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Your EasyPaisa No:</span>
                    <span className="font-mono font-bold text-slate-900">{businessProfile.easypaisaNumber}</span>
                  </div>
                  {businessProfile.easypaisaTitle && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Title:</span>
                      <span className="font-medium text-slate-800">{businessProfile.easypaisaTitle}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                  EasyPaisa Trx ID (TID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 39281938201"
                  value={settleTrxId}
                  onChange={(e) => setSettleTrxId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-400 font-mono font-bold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Remarks / Payment Note
            </label>
            <input
              type="text"
              placeholder="e.g. Received via EasyPaisa"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Party Ledger History Modal */}
      <Modal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        title={`Ledger History: ${ledgerParty?.name || ''}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Party Type:</span>
              <p className="font-bold text-slate-800 text-sm">{ledgerParty?.type}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 uppercase font-semibold">Current Balance:</span>
              <p className="font-extrabold text-indigo-700 text-base">
                {currency} {Math.abs(ledgerParty?.balance || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Related Invoices</h4>
            {partyInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No specific invoices linked to this party yet.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-right">Paid</th>
                      <th className="py-2.5 px-3 text-right">Udhar Balance</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partyInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2.5 px-3 font-bold text-indigo-600">{inv.invoiceNo}</td>
                        <td className="py-2.5 px-3 text-slate-500">{inv.date}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{currency} {Number(inv.total).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">{currency} {Number(inv.paidAmount).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-bold">{currency} {Number(inv.balanceAdded).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
