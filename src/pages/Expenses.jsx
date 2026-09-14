import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Wallet, 
  TrendingDown, 
  Trash2, 
  Edit2, 
  Calendar, 
  Tag, 
  CreditCard 
} from 'lucide-react';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';

const EXPENSE_CATEGORIES = [
  'Utilities',
  'Salaries',
  'Refreshment',
  'Transport',
  'Rent',
  'Maintenance',
  'Packaging',
  'Marketing',
  'Miscellaneous'
];

export default function Expenses({ 
  expenses, 
  currency, 
  onSaveExpense, 
  onDeleteExpense,
  initialOpenNew = false 
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(initialOpenNew);
  const [editingExpense, setEditingExpense] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Utilities',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    notes: ''
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchSearch = exp.title.toLowerCase().includes(search.toLowerCase()) ||
                          (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()));
      const matchCat = selectedCategory === 'All' || exp.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [expenses, search, selectedCategory]);

  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  // Category breakdown
  const categoryTotals = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'Utilities',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      title: exp.title,
      category: exp.category || 'Utilities',
      amount: exp.amount || '',
      date: exp.date || new Date().toISOString().split('T')[0],
      paymentMethod: exp.paymentMethod || 'Cash',
      notes: exp.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('Expense title is required');
    if (!formData.amount || Number(formData.amount) <= 0) return alert('Enter a valid amount');

    onSaveExpense({
      ...(editingExpense ? { id: editingExpense.id } : {}),
      title: formData.title.trim(),
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim()
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-x-hidden">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Business Expenses</h2>
          <p className="text-xs text-slate-500">Record daily overhead costs to calculate true net profit.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* KPI & Category Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expenses Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Expenses</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{currency} {totalExpenseAmount.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{expenses.length} expense entries</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Top Expense Categories Preview */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Top Expense Categories
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categoryTotals.slice(0, 4).map(([cat, amt]) => (
                <div key={cat} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-600 truncate">{cat}</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{currency} {amt.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense description or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="w-full sm:w-52">
          <SearchableSelect
            options={[
              { value: 'All', label: '📂 All Categories' },
              ...EXPENSE_CATEGORIES.map(c => ({ value: c, label: `🏷️ ${c}` }))
            ]}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            placeholder="Filter Category"
            searchPlaceholder="Search category..."
          />
        </div>
      </div>

      {/* Expenses List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm w-full max-w-full overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Title & Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Paid Via</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No expenses recorded. Click "Add Expense" to track costs!
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{exp.title}</div>
                      {exp.notes && <span className="text-[11px] text-slate-400">{exp.notes}</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium text-[11px]">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">{exp.date}</td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {exp.paymentMethod || 'Cash'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-rose-600 text-sm">
                      - {currency} {Number(exp.amount).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete expense "${exp.title}"?`)) onDeleteExpense(exp.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense' : 'Add Business Expense'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Expense Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Electricity Bill or Tea Stall Tally"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
              <SearchableSelect
                options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                placeholder="Select Category"
                searchPlaceholder="Search category..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount ({currency}) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Method</label>
              <SearchableSelect
                options={[
                  { value: 'Cash', label: '💵 Cash' },
                  { value: 'EasyPaisa', label: '📱 EasyPaisa' },
                  { value: 'JazzCash', label: '📱 JazzCash' },
                  { value: 'Bank Transfer', label: '🏦 Bank Transfer' },
                  { value: 'Card', label: '💳 Card' }
                ]}
                value={formData.paymentMethod}
                onChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                placeholder="Payment Method"
                searchPlaceholder="Search method..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Notes / Remarks</label>
            <textarea
              rows="2"
              placeholder="e.g. Paid online, receipt attached"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
            >
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
