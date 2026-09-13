import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  AlertTriangle, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Eye, 
  CheckCircle2, 
  Clock, 
  ShoppingBag,
  Layers
} from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function Dashboard({ 
  metrics, 
  profile, 
  invoices, 
  products, 
  expenses,
  onNavigate,
  onViewInvoice 
}) {
  const currency = profile?.currency || 'Rs.';

  const lowStockItems = products.filter(p => (p.stock || 0) <= (p.minStockAlert || 5));
  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-600/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-indigo-100 backdrop-blur-xs mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Financial Overview
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile?.name}
            </h2>
            <p className="text-sm text-indigo-100/90 mt-1 max-w-xl">
              Track your daily sales, inventory levels, customer receivables, and net profit at a glance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('invoices', { openNew: true })}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              New Sale Invoice
            </button>
            <button
              onClick={() => onNavigate('expenses', { openNew: true })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-white font-semibold text-sm border border-indigo-400/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Strip (If Any) */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Low-Stock Warning: {lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''} running out!
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                {lowStockItems.map(p => `${p.name} (${p.stock} left)`).slice(0, 3).join(', ')}
                {lowStockItems.length > 3 ? ` and ${lowStockItems.length - 3} more...` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventory', { filterLowStock: true })}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            Review & Restock
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sales"
          value={`${currency} ${(metrics.totalSales || 0).toLocaleString()}`}
          subtext={`${metrics.totalInvoices || 0} invoices issued`}
          icon={Receipt}
          color="indigo"
        />

        <MetricCard
          title="Cost of Goods (COGS)"
          value={`${currency} ${(metrics.totalCogs || 0).toLocaleString()}`}
          subtext="Purchase cost of sold items"
          icon={ShoppingBag}
          color="blue"
        />

        <MetricCard
          title="Gross Profit"
          value={`${currency} ${(metrics.grossProfit || 0).toLocaleString()}`}
          subtext={`Margin: ${metrics.totalSales ? Math.round((metrics.grossProfit / metrics.totalSales) * 100) : 0}% of sales`}
          icon={TrendingUp}
          color="green"
        />

        <MetricCard
          title="Net Profit"
          value={`${currency} ${(metrics.netProfit || 0).toLocaleString()}`}
          subtext={`After ${currency} ${(metrics.totalExpenses || 0).toLocaleString()} expenses`}
          icon={metrics.netProfit >= 0 ? TrendingUp : TrendingDown}
          color={metrics.netProfit >= 0 ? 'purple' : 'rose'}
        />
      </div>

      {/* Second Row: Receivables vs Payables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Receivables (Udhar) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Receivables (Customer Udhar)</h4>
                <p className="text-xs text-slate-500">Money to collect from customers</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('parties')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Khata
            </button>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {currency} {(metrics.totalReceivables || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prompt recovery keeps your cash flow healthy.
          </p>
        </div>

        {/* Supplier Payables */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Payables (Due to Suppliers)</h4>
                <p className="text-xs text-slate-500">Pending payments for wholesale inventory</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('parties')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Suppliers
            </button>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {currency} {(metrics.totalPayables || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pay on time to get better wholesale discounts.
          </p>
        </div>
      </div>

      {/* Third Section: Recent Invoices & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Sales Invoices</h3>
              <p className="text-xs text-slate-500">Latest customer orders</p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No invoices recorded yet. Click "New Sale Invoice" to start!
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-indigo-600">{inv.invoiceNo}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-[140px] truncate">
                        {inv.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        {currency} {Number(inv.total).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'Partial' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View & Print Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Snapshot (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Expense Breakdown</h3>
                <p className="text-xs text-slate-500">Latest business operational overhead</p>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {expenses.slice(0, 4).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{exp.title}</p>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">{exp.category} • {exp.date}</span>
                  </div>
                  <div className="text-xs font-bold text-rose-600">
                    - {currency} {Number(exp.amount).toLocaleString()}
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">No expenses recorded yet.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Expenses:</span>
            <span className="font-bold text-rose-600 text-sm">
              {currency} {(metrics.totalExpenses || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
