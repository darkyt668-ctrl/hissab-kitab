import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Crown, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Lock, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Play,
  Pause,
  Clock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';
import { subscriptionPlans } from '../services/dataSeed';
import { calculateShopSubscriptionStatus } from '../services/firestoreService';

export default function AdminPortal({
  shops,
  activeShopId,
  onSelectShop,
  onSaveShop,
  onDeleteShop,
  platformSettings,
  onSavePlatformSettings,
  transactions,
  onRecordSubscriptionPayment,
  onSwitchToShopOwnerView,
  onTogglePause,
  onSimulateSubscription,
  initialTab = 'shops'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'shops', 'payments', 'plans', 'settings'

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleDeleteShopClick = (shop) => {
    if (shops.length <= 1) {
      alert("At least one shop must remain active in the system.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${shop.name}"? All data for this shop will be permanently removed.`)) {
      onDeleteShop(shop.id);
    }
  };
  
  // Modals
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [shopForm, setShopForm] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    plan: 'Basic',
    monthlyPrice: 999,
    status: 'Active',
    easypaisaNumber: '',
    easypaisaTitle: ''
  });

  // Payment Checkout Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedShopForPayment, setSelectedShopForPayment] = useState(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('EasyPaisa'); // 'EasyPaisa' or 'Card'
  const [trxId, setTrxId] = useState('');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(null);

  // Platform Admin EasyPaisa Settings state
  const [adminSettingsForm, setAdminSettingsForm] = useState({ ...platformSettings });
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  // Total MRR across all active shops
  const totalMonthlyRecurringRevenue = useMemo(() => {
    return shops.reduce((sum, s) => sum + (Number(s.monthlyPrice) || 0), 0);
  }, [shops]);

  const totalCollectedToAdmin = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [transactions]);

  // Open Create Shop Modal
  const handleOpenAddShop = () => {
    setEditingShop(null);
    setShopForm({
      name: '',
      ownerName: '',
      ownerEmail: '',
      phone: '',
      email: '',
      address: '',
      plan: 'Basic',
      monthlyPrice: 999,
      status: 'Active',
      easypaisaNumber: '',
      easypaisaTitle: ''
    });
    setIsShopModalOpen(true);
  };

  // Open Edit Shop Modal
  const handleOpenEditShop = (shop) => {
    setEditingShop(shop);
    setShopForm({
      name: shop.name,
      ownerName: shop.ownerName || '',
      ownerEmail: shop.ownerEmail || '',
      phone: shop.phone || '',
      email: shop.email || '',
      address: shop.address || '',
      plan: shop.plan || 'Basic',
      monthlyPrice: shop.monthlyPrice || 999,
      status: shop.status || 'Active',
      easypaisaNumber: shop.easypaisaNumber || '',
      easypaisaTitle: shop.easypaisaTitle || ''
    });
    setIsShopModalOpen(true);
  };

  const handleShopSubmit = (e) => {
    e.preventDefault();
    if (!shopForm.name.trim()) return alert('Shop Name is required');

    onSaveShop({
      ...(editingShop ? { id: editingShop.id } : {}),
      name: shopForm.name.trim(),
      ownerName: shopForm.ownerName.trim(),
      ownerEmail: (shopForm.ownerEmail || '').trim().toLowerCase(),
      phone: shopForm.phone.trim(),
      email: shopForm.email.trim(),
      address: shopForm.address.trim(),
      plan: shopForm.plan,
      monthlyPrice: Number(shopForm.monthlyPrice) || 0,
      status: shopForm.status,
      easypaisaNumber: shopForm.easypaisaNumber.trim(),
      easypaisaTitle: shopForm.easypaisaTitle.trim()
    });

    setIsShopModalOpen(false);
  };

  // Open Subscription Checkout Modal for a specific shop
  const handleOpenCheckout = (shop, planName = null) => {
    const planObj = subscriptionPlans.find(p => p.name.toLowerCase() === (planName || shop.plan || 'basic').toLowerCase()) || subscriptionPlans[1];
    setSelectedShopForPayment(shop);
    setSelectedPlanForPayment(planObj);
    setPaymentMethod('EasyPaisa');
    setTrxId('');
    setCardForm({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
    setPaymentSuccessMsg(null);
    setIsPaymentModalOpen(true);
  };

  const handleProcessSubscription = (e) => {
    e.preventDefault();
    if (paymentMethod === 'EasyPaisa' && !trxId.trim()) {
      return alert('Please enter EasyPaisa Transaction ID (Trx ID)');
    }
    if (paymentMethod === 'Card') {
      if (!cardForm.cardNumber.trim() || cardForm.cardNumber.replace(/\s/g, '').length < 15) {
        return alert('Please enter a valid 16-digit Card Number');
      }
      if (!cardForm.expiry.trim() || !cardForm.cvv.trim()) {
        return alert('Please complete card expiry and CVV');
      }
    }

    const cardLast4 = paymentMethod === 'Card' ? cardForm.cardNumber.replace(/\s/g, '').slice(-4) : '';
    
    onRecordSubscriptionPayment({
      shopId: selectedShopForPayment.id,
      shopName: selectedShopForPayment.name,
      planName: selectedPlanForPayment.name,
      amount: selectedPlanForPayment.price,
      paymentMethod: paymentMethod === 'EasyPaisa' ? 'EasyPaisa' : 'Credit / Debit Card',
      trxId: trxId.trim(),
      cardLast4,
      cardBrand: 'Visa / Mastercard'
    });

    setPaymentSuccessMsg(`Payment of Rs. ${selectedPlanForPayment.price.toLocaleString()} confirmed! Funds routed to your Admin EasyPaisa Account (${platformSettings.adminEasypaisaNumber}).`);
    setTimeout(() => {
      setIsPaymentModalOpen(false);
      setPaymentSuccessMsg(null);
    }, 2500);
  };

  const handleSaveAdminSettings = (e) => {
    e.preventDefault();
    onSavePlatformSettings(adminSettingsForm);
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Super Admin Notice Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Super Admin Control Panel (Private)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Multi-Shop & SaaS Revenue Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              This area is <strong>hidden from shopkeepers</strong>. Manage all client stores, set custom pricing plans, and collect subscription payments directly into your EasyPaisa account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddShop}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Open New Shop
            </button>
            <button
              onClick={onSwitchToShopOwnerView}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
              title="Preview what shopkeepers see"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              Switch to Shop Owner View
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Monthly Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Monthly MRR</span>
            <h3 className="text-2xl font-black text-indigo-700 mt-1">
              Rs. {totalMonthlyRecurringRevenue.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">from {shops.length} active client shops</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Collected to Admin EasyPaisa */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Collected in Admin EasyPaisa</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              Rs. {totalCollectedToAdmin.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-700 font-mono mt-0.5">Acc: {platformSettings.adminEasypaisaNumber}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>

        {/* Total Shops Managed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Registered Client Shops</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {shops.length} Shops
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Each with independent data</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex overflow-x-auto max-w-full p-1 rounded-2xl bg-slate-200/70 gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'shops' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏪 Client Shops ({shops.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'payments' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          💳 Subscriptions ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'settings' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚙️ Payout Settings
        </button>
      </div>

      {/* TAB 1: CLIENT SHOPS MANAGEMENT */}
      {activeTab === 'shops' && (
        <div className="space-y-6">
          {/* Subscription Enforcement Rules & Demo Guide */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-indigo-500/30 shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Auto-Enforcement Active
                  </span>
                  <h4 className="font-extrabold text-sm text-white">
                    30-Day Billing Cycle &amp; 2-Day Auto-Pause Rules
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  <strong>1 Month (30 Days):</strong> Agar koi shopkeeper 30 din baad payment na kare toh pehle <strong>Reminder (2-day grace period)</strong> warning jati hai. 
                  Uske 2 din baad system <strong>Automatically Pause</strong> ho jata hai aur shopkeeper locked out ho jata hai jab tak aap unpause na karein ya fee na bharein.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active (30d)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Reminder (2d grace)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Paused / Locked
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Registered Stores ({shops.length})</h3>
              <p className="text-xs text-slate-500">Manage client subscriptions, live billing status, and pause/unpause permissions.</p>
            </div>
            <button
              onClick={handleOpenAddShop}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Another Shop
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {shops.map((shop) => {
              const isActiveWorkspace = shop.id === activeShopId;
              const subStatus = calculateShopSubscriptionStatus(shop);

              return (
                <div
                  key={shop.id}
                  className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                    isActiveWorkspace
                      ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-500/20'
                      : subStatus.isPaused 
                        ? 'border-rose-300 shadow-sm bg-rose-50/20' 
                        : 'border-slate-200 shadow-sm hover:shadow'
                  }`}
                >
                  <div>
                    {/* Header: Name, Plan Badge & Action Buttons */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base leading-snug">{shop.name}</h4>
                        <p className="text-[11px] text-slate-400">{shop.tagline || 'Retail Business'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {shop.plan} Plan
                        </span>
                        <button
                          onClick={() => handleOpenEditShop(shop)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Shop Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteShopClick(shop)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Shop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Owner & Contact details */}
                    <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 my-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Owner:</span>
                        <span className="font-semibold text-slate-800">{shop.ownerName || 'Merchant'}</span>
                      </div>
                      {shop.ownerEmail && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Login Email:</span>
                          <span className="font-mono text-[11px] text-indigo-600">{shop.ownerEmail}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-medium text-slate-700">{shop.phone || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly Fee:</span>
                        <span className="font-bold text-indigo-700">Rs. {Number(shop.monthlyPrice || 0).toLocaleString()} /mo</span>
                      </div>

                      {/* LIVE SUBSCRIPTION STATUS BADGE */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                        <span className="text-slate-400">Subscription:</span>
                        {subStatus.status === 'Active' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Active ({subStatus.daysRemaining}d left)
                          </span>
                        )}
                        {subStatus.status === 'Reminder' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full animate-pulse border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Reminder ({subStatus.graceDaysRemaining}d to pause)
                          </span>
                        )}
                        {subStatus.status === 'Paused' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300">
                            <Pause className="w-3 h-3 text-rose-600" />
                            System Paused
                          </span>
                        )}
                      </div>

                      {/* Next Due / Grace details */}
                      <div className="text-[10px] text-slate-400 flex justify-between pt-0.5">
                        <span>Due Date: {subStatus.nextDueDate || '-'}</span>
                        {subStatus.isReminder && (
                          <span className="text-amber-600 font-bold">Auto-pause on: {subStatus.graceUntilDate}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectShop(shop.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isActiveWorkspace
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isActiveWorkspace ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active Workspace
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3.5 h-3.5" />
                            Open Shop Data
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenCheckout(shop)}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                        title="Collect fee & automatically renew 30 days"
                      >
                        Collect Fee
                      </button>
                    </div>

                    {/* Admin Pause / Unpause Control Button */}
                    <div className="flex gap-2">
                      {subStatus.isPaused ? (
                        <button
                          onClick={() => onTogglePause && onTogglePause(shop.id, false)}
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Unpause / Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => onTogglePause && onTogglePause(shop.id, true)}
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          Pause Shop
                        </button>
                      )}
                    </div>

                    {/* 1-Click Interactive Demo & Simulator Controls */}
                    <div className="bg-slate-100/80 rounded-2xl p-2 space-y-1.5 text-center">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                        ⚡ Quick Demo / Simulator
                      </span>
                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        <button
                          onClick={() => onSimulateSubscription && onSimulateSubscription(shop.id, 'due')}
                          className="py-1 px-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-slate-200 rounded-lg font-bold transition-colors"
                          title="Simulate 30 days elapsed -> triggers 2-day reminder grace period"
                        >
                          🟡 30d Due
                        </button>
                        <button
                          onClick={() => onSimulateSubscription && onSimulateSubscription(shop.id, 'overdue_pause')}
                          className="py-1 px-1.5 bg-white hover:bg-rose-50 text-rose-800 border border-slate-200 rounded-lg font-bold transition-colors"
                          title="Simulate 32+ days elapsed -> triggers automatic system pause!"
                        >
                          🔴 Auto-Pause
                        </button>
                        <button
                          onClick={() => onSimulateSubscription && onSimulateSubscription(shop.id, 'active')}
                          className="py-1 px-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 rounded-lg font-bold transition-colors"
                          title="Reset to 30 days active"
                        >
                          🟢 Renew
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 px-1">
                      <button
                        onClick={() => handleOpenEditShop(shop)}
                        className="text-slate-500 hover:text-indigo-600 font-semibold inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Plan &amp; Info
                      </button>
                      {shops.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete shop "${shop.name}" and all its records?`)) onDeleteShop(shop.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 font-semibold inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION TRANSACTIONS LEDGER */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Subscription Payments Received</h3>
              <p className="text-xs text-slate-500">Plan fees collected from shops via EasyPaisa and Card into your Admin account.</p>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              Deposited to: {platformSettings.adminEasypaisaNumber} ({platformSettings.adminEasypaisaTitle})
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Shop</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Trx ID / Card</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No subscription transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{tx.shopName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                          {tx.planName}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-emerald-700 text-sm">
                        Rs. {Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {tx.paymentMethod === 'EasyPaisa' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            EasyPaisa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-indigo-800 font-bold">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                            Card ({tx.cardLast4 ? `*${tx.cardLast4}` : 'Online'})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{tx.trxId || '-'}</td>
                      <td className="py-3 px-3 text-slate-500">{tx.date}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN PAYOUT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm max-w-2xl space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Your Receiving Account (Where Shop Money is Deposited)</h3>
            <p className="text-xs text-slate-500">
              When any shop subscribes or enters their card/EasyPaisa, funds will be directed to this account.
            </p>
          </div>

          {savedSettingsMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Admin payment credentials updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveAdminSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin EasyPaisa Mobile Number (For Receiving Fees) *
              </label>
              <input
                type="text"
                required
                placeholder="0301-8889990"
                value={adminSettingsForm.adminEasypaisaNumber || ''}
                onChange={(e) => setAdminSettingsForm({ ...adminSettingsForm, adminEasypaisaNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin EasyPaisa Account Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hissab Kitab Platform (Admin)"
                value={adminSettingsForm.adminEasypaisaTitle || ''}
                onChange={(e) => setAdminSettingsForm({ ...adminSettingsForm, adminEasypaisaTitle: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Card Payout Bank / Gateway Title
                </label>
                <input
                  type="text"
                  value={adminSettingsForm.adminBankTitle || ''}
                  onChange={(e) => setAdminSettingsForm({ ...adminSettingsForm, adminBankTitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Super Admin Security PIN
                </label>
                <input
                  type="password"
                  value={adminSettingsForm.adminPin || '786'}
                  onChange={(e) => setAdminSettingsForm({ ...adminSettingsForm, adminPin: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Payout Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE / EDIT SHOP MODAL */}
      <Modal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        title={editingShop ? `Edit Shop: ${editingShop.name}` : 'Create New Client Shop'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleShopSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shop / Store Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Madina Electronics & Mobile"
              value={shopForm.name}
              onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Owner / Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Zubair Ahmed"
                value={shopForm.ownerName}
                onChange={(e) => setShopForm({ ...shopForm, ownerName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="0300-1234567"
                value={shopForm.phone}
                onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Owner Login Email — used for role-based access */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2">
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
              🔑 Shop Owner Login Email
            </label>
            <input
              type="email"
              placeholder="shopowner@gmail.com"
              value={shopForm.ownerEmail || ''}
              onChange={(e) => setShopForm({ ...shopForm, ownerEmail: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
            <p className="text-[11px] text-amber-700">
              Jab shop owner is email se login kare ga → sirf apni shop dikhe gi (admin portal hidden).
            </p>
          </div>

          {/* Plan & Pricing Tier Configuration for THIS Shop */}
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
              SaaS Subscription Plan & Custom Pricing
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Plan Tier</label>
                <SearchableSelect
                  options={[
                    { value: 'Free', label: 'Free (Rs. 0)' },
                    { value: 'Basic', label: 'Basic (Rs. 999/mo)' },
                    { value: 'Pro', label: 'Pro (Rs. 1,999/mo)' },
                    { value: 'Business', label: 'Business (Rs. 3,999/mo)' }
                  ]}
                  value={shopForm.plan}
                  onChange={(val) => {
                    const priceMap = { Free: 0, Basic: 999, Pro: 1999, Business: 3999 };
                    setShopForm({ ...shopForm, plan: val, monthlyPrice: priceMap[val] || 999 });
                  }}
                  placeholder="Select Plan"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Custom Monthly Fee (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={shopForm.monthlyPrice}
                  onChange={(e) => setShopForm({ ...shopForm, monthlyPrice: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-indigo-200 rounded-xl font-bold text-indigo-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shop Address
            </label>
            <input
              type="text"
              placeholder="Shop #, Plaza, Market"
              value={shopForm.address}
              onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsShopModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              {editingShop ? 'Save Changes' : 'Create Shop'}
            </button>
          </div>
        </form>
      </Modal>

      {/* SUBSCRIPTION CHECKOUT MODAL (EasyPaisa & Card into Admin Account) */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Subscription Checkout: ${selectedShopForPayment?.name || ''}`}
        maxWidth="max-w-lg"
      >
        {paymentSuccessMsg ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Subscription Activated!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">{paymentSuccessMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleProcessSubscription} className="space-y-4">
            {/* Plan Info Card */}
            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Selected Plan:</span>
                <p className="font-extrabold text-slate-900 text-base">{selectedPlanForPayment?.name} Plan</p>
                <p className="text-[11px] text-slate-500">Shop: {selectedShopForPayment?.name}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Total Due:</span>
                <p className="font-black text-indigo-700 text-xl">
                  Rs. {selectedPlanForPayment?.price.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">/month</span>
              </div>
            </div>

            {/* Payment Method Switcher (EasyPaisa vs Card) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('EasyPaisa')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'EasyPaisa'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>EasyPaisa Direct</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'Card'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-400 ring-2 ring-indigo-400/20 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Debit / Credit Card</span>
                </button>
              </div>
            </div>

            {/* EASYPAISA INSTRUCTIONS & TRX ID */}
            {paymentMethod === 'EasyPaisa' && (
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
                    Send Payment to Admin EasyPaisa:
                  </span>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Admin Account No:</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        {platformSettings.adminEasypaisaNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Title:</span>
                      <span className="font-semibold text-slate-800">{platformSettings.adminEasypaisaTitle}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    Enter EasyPaisa Transaction ID (Trx ID / TID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 73829104829"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-400"
                  />
                  <p className="text-[10px] text-emerald-700 mt-1">
                    You receive this 11-digit Trx ID via SMS upon sending money.
                  </p>
                </div>
              </div>
            )}

            {/* CARD INPUTS (ROUTED TO ADMIN EASYPAISA ACCOUNT) */}
            {paymentMethod === 'Card' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Funds automatically settle directly to Admin EasyPaisa Account</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="4242 •••• •••• 4242"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry MM/YY *</label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">CVV / CVC *</label>
                    <input
                      type="password"
                      maxLength="4"
                      required
                      placeholder="123"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Cardholder Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name on card"
                    value={cardForm.cardName}
                    onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Confirm & Activate Subscription
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
