import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import {
  seedIfNeeded,
  getShops, saveShop, deleteShop, getShopById,
  getPlatformSettings, savePlatformSettings,
  getSubscriptionTransactions, recordSubscriptionPayment,
  getProducts, saveProduct, deleteProduct, adjustStock,
  getParties, saveParty, deleteParty, recordPartyPayment,
  getInvoices, createInvoice, deleteInvoice,
  getExpenses, saveExpense, deleteExpense,
  computeFinancialMetrics,
  calculateShopSubscriptionStatus,
  toggleShopPause,
  simulateShopSubscription,
} from './services/firestoreService';

import Login from './pages/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Parties from './pages/Parties';
import Expenses from './pages/Expenses';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Settings from './pages/Settings';
import AdminPortal from './pages/AdminPortal';
import InvoicePrintModal from './components/InvoicePrintModal';
import ShopPausedOverlay from './components/ShopPausedOverlay';
import SubscriptionReminderBanner from './components/SubscriptionReminderBanner';
import ShopRenewalModal from './components/ShopRenewalModal';
import { Loader2 } from 'lucide-react';

// Admin emails — only these get 'admin' role
const ADMIN_EMAILS = ['admin@hissabkitab.pk', 'admin@hissabkitab.com'];

export default function App() {
  // ─── Auth State ───────────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── App State ────────────────────────────────────────────────────────────
  const [dataLoading, setDataLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role based on login email
  const [userRole, setUserRoleState] = useState('admin');

  // Multi-Shop & Platform State
  const [shops, setShops] = useState([]);
  const [activeShopId, setActiveShopIdState] = useState('shop-1');
  const [platformSettings, setPlatformSettings] = useState({});
  const [transactions, setTransactions] = useState([]);

  // Active Shop Data
  const [profile, setProfile] = useState({});
  const [products, setProducts] = useState([]);
  const [parties, setParties] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [metrics, setMetrics] = useState({
    totalSales: 0, totalCogs: 0, grossProfit: 0, totalExpenses: 0,
    netProfit: 0, totalReceivables: 0, totalPayables: 0,
    lowStockCount: 0, totalCashCollected: 0, totalProducts: 0, totalInvoices: 0,
  });

  // Deep-link navigation state
  const [inventoryLowStockFilter, setInventoryLowStockFilter] = useState(false);
  const [openNewInvoiceOnMount, setOpenNewInvoiceOnMount] = useState(false);
  const [openNewExpenseOnMount, setOpenNewExpenseOnMount] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  // ─── Auth Listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        try {
          // Seed if first time (only works when Firestore is online)
          await seedIfNeeded();

          // Determine role: admin emails OR check if email matches a shop's ownerEmail
          const allShops = await getShops();
          const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase());

          if (isAdmin) {
            setUserRoleState('admin');
            await refreshAllState(allShops[0]?.id || 'shop-1', 'admin');
          } else {
            // Find which shop this user owns by email
            const ownedShop = allShops.find(
              s => s.ownerEmail?.toLowerCase() === user.email?.toLowerCase()
            );
            if (ownedShop) {
              setUserRoleState('shop_owner');
              await refreshAllState(ownedShop.id, 'shop_owner');
            } else {
              // Unknown user — default to first shop as shop_owner
              setUserRoleState('shop_owner');
              await refreshAllState(allShops[0]?.id || 'shop-1', 'shop_owner');
            }
          }
        } catch (err) {
          console.error('Data load error (Firestore may not be enabled yet):', err);
        }
      } else {
        setAuthUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ─── Data Loader ──────────────────────────────────────────────────────────
  const refreshAllState = useCallback(async (targetShopId, role) => {
    setDataLoading(true);
    try {
      const [allShops, pSettings, txList, prods, pts, invs, exps] = await Promise.all([
        getShops(),
        getPlatformSettings(),
        getSubscriptionTransactions(),
        getProducts(targetShopId),
        getParties(targetShopId),
        getInvoices(targetShopId),
        getExpenses(targetShopId),
      ]);

      const activeShop = allShops.find(s => s.id === targetShopId) || allShops[0] || {};

      setShops(allShops);
      setPlatformSettings(pSettings);
      setTransactions(txList);
      setProfile(activeShop);
      setProducts(prods);
      setParties(pts);
      setInvoices(invs);
      setExpenses(exps);
      setMetrics(computeFinancialMetrics(invs, exps, prods, pts));
      setActiveShopIdState(targetShopId);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // ─── Shop Switching ───────────────────────────────────────────────────────
  const handleSelectShop = async (shopId) => {
    setActiveShopIdState(shopId);
    await refreshAllState(shopId, userRole);
  };

  // ─── Role Toggle (for testing) ────────────────────────────────────────────
  const handleToggleRole = () => {
    const nextRole = userRole === 'admin' ? 'shop_owner' : 'admin';
    setUserRoleState(nextRole);
    if (nextRole === 'shop_owner' && (currentTab === 'admin_portal' || currentTab === 'plans')) {
      setCurrentTab('dashboard');
    }
  };

  // ─── Navigation ───────────────────────────────────────────────────────────
  const handleNavigate = (tabId, params = {}) => {
    if (userRole === 'shop_owner' && (tabId === 'admin_portal' || tabId === 'plans')) {
      return setCurrentTab('dashboard');
    }
    setCurrentTab(tabId);
    if (params.filterLowStock !== undefined) setInventoryLowStockFilter(params.filterLowStock);
    if (params.openNew !== undefined) {
      if (tabId === 'invoices') setOpenNewInvoiceOnMount(true);
      if (tabId === 'expenses') setOpenNewExpenseOnMount(true);
    }
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── CRUD Handlers ────────────────────────────────────────────────────────
  const handleSaveProduct = async (prod) => {
    await saveProduct(prod, activeShopId);
    await refreshAllState(activeShopId, userRole);
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id, activeShopId);
    await refreshAllState(activeShopId, userRole);
  };

  const handleAdjustStock = async (id, delta) => {
    await adjustStock(id, delta, activeShopId);
    await refreshAllState(activeShopId, userRole);
  };

  const handleCreateInvoice = async (invoiceData) => {
    const created = await createInvoice(invoiceData, activeShopId);
    await refreshAllState(activeShopId, userRole);
    return created;
  };

  const handleDeleteInvoice = async (id) => {
    await deleteInvoice(id, activeShopId);
    await refreshAllState(activeShopId, userRole);
  };

  const handleSaveParty = async (party) => {
    await saveParty(party, activeShopId);
    await refreshAllState(activeShopId, userRole);
  };

  const handleDeleteParty = async (id) => {
    await deleteParty(id, activeShopId);
    await refreshAllState(activeShopId, userRole);
  };

  const handleRecordPartyPayment = async (partyId, amount, type, notes) => {
    await recordPartyPayment(partyId, amount, type, notes, activeShopId);
    await refreshAllState(activeShopId, userRole);
  };

  const handleSaveExpense = async (exp) => {
    await saveExpense(exp, activeShopId);
    await refreshAllState(activeShopId, userRole);
  };

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id, activeShopId);
    await refreshAllState(activeShopId, userRole);
  };

  const handleSaveProfile = async (newProfile) => {
    await saveShop(newProfile);
    await refreshAllState(activeShopId, userRole);
  };

  const handleSaveShop = async (shopData) => {
    await saveShop(shopData);
    await refreshAllState(activeShopId, userRole);
  };

  const handleDeleteShop = async (shopId) => {
    await deleteShop(shopId);
    const remaining = shops.filter(s => s.id !== shopId);
    const nextId = remaining[0]?.id || 'shop-1';
    await refreshAllState(nextId, userRole);
  };

  const handleSavePlatformSettings = async (settings) => {
    await savePlatformSettings(settings);
    setPlatformSettings(settings);
  };

  const handleRecordSubscriptionPayment = async (paymentData) => {
    const recorded = await recordSubscriptionPayment(paymentData);
    await refreshAllState(activeShopId, userRole);
    return recorded;
  };

  const handleToggleShopPause = async (shopId, shouldPause) => {
    await toggleShopPause(shopId, shouldPause);
    await refreshAllState(activeShopId, userRole);
  };

  const handleSimulateSubscription = async (shopId, scenario) => {
    await simulateShopSubscription(shopId, scenario);
    await refreshAllState(activeShopId, userRole);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAuthUser(null);
    setCurrentTab('dashboard');
  };

  // ─── Current Shop Subscription Evaluation ─────────────────────────────────
  const subStatus = calculateShopSubscriptionStatus(profile);

  // ─── Auth Loading Screen ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-600 font-semibold">Hissab Kitab loading...</p>
          <p className="text-slate-400 text-sm mt-1">Connecting to cloud database</p>
        </div>
      </div>
    );
  }

  // ─── Login Screen ─────────────────────────────────────────────────────────
  if (!authUser) {
    return <Login onLogin={(user) => setAuthUser(user)} />;
  }

  // ─── Data Loading Overlay ─────────────────────────────────────────────────
  if (dataLoading && products.length === 0 && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">Loading your shop data...</p>
          <p className="text-slate-400 text-sm mt-1">Fetching from Firebase cloud</p>
        </div>
      </div>
    );
  }

  // ─── Main App ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative w-full max-w-full overflow-x-hidden">
      {/* SHOP OWNER FULL LOCKOUT SCREEN IF PAUSED */}
      {subStatus.isPaused && userRole === 'shop_owner' && (
        <ShopPausedOverlay
          shop={profile}
          subStatus={subStatus}
          platformSettings={platformSettings}
          userRole="shop_owner"
          onLogout={handleLogout}
        />
      )}

      <Navbar
        profile={profile}
        shops={shops}
        activeShopId={activeShopId}
        onSelectShop={handleSelectShop}
        lowStockCount={metrics.lowStockCount}
        onNavigate={handleNavigate}
        onRefresh={() => refreshAllState(activeShopId, userRole)}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        userRole={userRole}
        authUser={authUser}
        onLogout={handleLogout}
        subStatus={subStatus}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => handleNavigate(tab)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          lowStockCount={metrics.lowStockCount}
          userRole={userRole}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 w-full max-w-full overflow-x-hidden mb-16 md:mb-0">
          {/* SUPER ADMIN PAUSED BANNER (Admin can still navigate & unpause) */}
          {subStatus.isPaused && userRole === 'admin' && (
            <ShopPausedOverlay
              shop={profile}
              subStatus={subStatus}
              platformSettings={platformSettings}
              userRole="admin"
              onUnpause={() => handleToggleShopPause(profile.id, false)}
              onOpenPayment={() => setIsRenewalModalOpen(true)}
            />
          )}

          {/* 30-DAY EXPIRY REMINDER BANNER (2-Day Grace Period Active) */}
          {subStatus.isReminder && (
            <SubscriptionReminderBanner
              shop={profile}
              subStatus={subStatus}
              platformSettings={platformSettings}
              onOpenPayment={() => setIsRenewalModalOpen(true)}
            />
          )}

          {/* SUPER ADMIN PORTAL (Only visible in admin role) */}
          {currentTab === 'admin_portal' && userRole === 'admin' && (
            <AdminPortal
              shops={shops}
              activeShopId={activeShopId}
              onSelectShop={handleSelectShop}
              onSaveShop={handleSaveShop}
              onDeleteShop={handleDeleteShop}
              platformSettings={platformSettings}
              onSavePlatformSettings={handleSavePlatformSettings}
              transactions={transactions}
              onRecordSubscriptionPayment={handleRecordSubscriptionPayment}
              onSwitchToShopOwnerView={handleToggleRole}
              onTogglePause={handleToggleShopPause}
              onSimulateSubscription={handleSimulateSubscription}
            />
          )}

          {currentTab === 'dashboard' && (
            <Dashboard
              metrics={metrics}
              profile={profile}
              invoices={invoices}
              products={products}
              expenses={expenses}
              onNavigate={handleNavigate}
              onViewInvoice={(inv) => setViewingInvoice(inv)}
            />
          )}

          {currentTab === 'inventory' && (
            <Inventory
              products={products}
              currency={profile.currency || 'Rs.'}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onAdjustStock={handleAdjustStock}
              initialFilterLowStock={inventoryLowStockFilter}
            />
          )}

          {currentTab === 'invoices' && (
            <Invoices
              invoices={invoices}
              products={products}
              parties={parties}
              currency={profile.currency || 'Rs.'}
              businessProfile={profile}
              onCreateInvoice={handleCreateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onViewInvoice={(inv) => setViewingInvoice(inv)}
              initialOpenNew={openNewInvoiceOnMount}
            />
          )}

          {currentTab === 'parties' && (
            <Parties
              parties={parties}
              invoices={invoices}
              currency={profile.currency || 'Rs.'}
              businessProfile={profile}
              onSaveParty={handleSaveParty}
              onDeleteParty={handleDeleteParty}
              onRecordPayment={handleRecordPartyPayment}
            />
          )}

          {currentTab === 'expenses' && (
            <Expenses
              expenses={expenses}
              currency={profile.currency || 'Rs.'}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              initialOpenNew={openNewExpenseOnMount}
            />
          )}

          {currentTab === 'plans' && userRole === 'admin' && (
            <SubscriptionPlans
              currentPlan={profile.plan}
              onSelectPlan={(planName) => {
                const priceMap = { Free: 0, Basic: 999, Pro: 1999, Business: 3999 };
                const newPrice = priceMap[planName] !== undefined ? priceMap[planName] : profile.monthlyPrice;
                handleSaveProfile({ ...profile, plan: planName, monthlyPrice: newPrice });
              }}
              currency={profile.currency || 'Rs.'}
            />
          )}

          {currentTab === 'settings' && (
            <Settings
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onRefresh={() => refreshAllState(activeShopId, userRole)}
            />
          )}
        </main>
      </div>

      <InvoicePrintModal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        businessProfile={profile}
      />

      {/* Shop Owner Subscription Renewal & Payment Details Modal */}
      <ShopRenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        shop={profile}
        platformSettings={platformSettings}
        onRecordPayment={async (paymentData) => {
          await handleRecordSubscriptionPayment(paymentData);
        }}
      />
    </div>
  );
}
