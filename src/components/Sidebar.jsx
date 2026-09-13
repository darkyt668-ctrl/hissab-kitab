import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  Wallet, 
  Crown, 
  Settings, 
  X,
  TrendingUp,
  AlertCircle,
  Building2,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  onSelectTab, 
  isMobileOpen, 
  onCloseMobile,
  lowStockCount,
  userRole = 'admin' 
}) {
  const isShopOwner = userRole === 'shop_owner';

  const navItems = useMemo(() => {
    if (isShopOwner) {
      // SHOP OWNER VIEW: Plans, pricing, multi-shop manager completely HIDDEN!
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'inventory', label: 'Inventory / Stock', icon: Package, badgeKey: 'lowStock' },
        { id: 'invoices', label: 'Sales & Invoices', icon: Receipt, badge: null },
        { id: 'parties', label: 'Customers & Suppliers', icon: Users, badge: null },
        { id: 'expenses', label: 'Daily Expenses', icon: Wallet, badge: null },
        { id: 'settings', label: 'Store Settings', icon: Settings, badge: null }
      ];
    }

    // SUPER ADMIN VIEW: Full Platform Access
    return [
      { id: 'admin_portal', label: '👑 Admin & All Shops', icon: Building2, badge: 'SaaS' },
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
      { id: 'inventory', label: 'Inventory / Stock', icon: Package, badgeKey: 'lowStock' },
      { id: 'invoices', label: 'Sales & Invoices', icon: Receipt, badge: null },
      { id: 'parties', label: 'Customers & Suppliers', icon: Users, badge: null },
      { id: 'expenses', label: 'Daily Expenses', icon: Wallet, badge: null },
      { id: 'plans', label: 'Pricing & MRR Model', icon: Crown, badge: 'Admin' },
      { id: 'settings', label: 'Store Settings', icon: Settings, badge: null }
    ];
  }, [isShopOwner]);

  const renderNavLinks = (isMobile = false) => (
    <nav className="space-y-1.5 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        const showLowStockBadge = item.badgeKey === 'lowStock' && lowStockCount > 0;

        return (
          <button
            key={item.id}
            onClick={() => {
              onSelectTab(item.id);
              if (isMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </div>

            {showLowStockBadge && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                {lowStockCount} Low
              </span>
            )}

            {item.badge && !showLowStockBadge && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-indigo-800 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 bg-white min-h-[calc(100vh-61px)] shrink-0">
        <div className="flex-1">
          <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{isShopOwner ? 'Store Operations' : 'Platform & Store'}</span>
            {!isShopOwner && (
              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                Admin
              </span>
            )}
          </div>
          {renderNavLinks(false)}
        </div>

        {/* Small Advice / Role Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-3.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isShopOwner ? 'Store Mode' : 'Super Admin Mode'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isShopOwner 
                ? 'Managing daily sales, billing, and Udhar khata.' 
                : 'Managing all client shops and SaaS subscription revenue.'}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/50 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-extrabold text-base text-slate-900">Hissab Kitab Menu</span>
              <button onClick={onCloseMobile} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderNavLinks(true)}
            </div>
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          ...(!isShopOwner ? [{ id: 'admin_portal', label: 'Admin', icon: Building2 }] : []),
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'inventory', label: 'Stock', icon: Package, badge: lowStockCount },
          { id: 'invoices', label: 'Billing', icon: Receipt },
          { id: 'parties', label: 'Khata', icon: Users },
          { id: 'expenses', label: 'Expense', icon: Wallet },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
