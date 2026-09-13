import React, { useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Crown, 
  Menu,
  ChevronDown,
  Store,
  Lock,
  LogOut,
} from 'lucide-react';

export default function Navbar({ 
  profile, 
  shops = [],
  activeShopId,
  onSelectShop,
  lowStockCount, 
  onNavigate, 
  onRefresh,
  toggleMobileMenu,
  userRole = 'admin',
  authUser,
  onLogout,
  subStatus,
}) {
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const isShopOwner = userRole === 'shop_owner';



  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Brand & Shop Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>

            {/* App Brand & Shop Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Hissab<span className="text-indigo-600">Kitab</span>
                </span>
                
                {/* Active Shop Selector (Admin can switch stores, Shop Owner sees only their store) */}
                <div className="relative">
                  {!isShopOwner ? (
                    <>
                      <button
                        onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
                        title="Switch Active Store (Admin)"
                      >
                        <Store className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="max-w-[120px] sm:max-w-[180px] truncate">{profile?.name || 'Store'}</span>
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>

                      {isShopDropdownOpen && (
                        <div 
                          className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95"
                          onClick={() => setIsShopDropdownOpen(false)}
                        >
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Switch Store Database ({shops.length} Available)
                          </div>
                          {shops.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => onSelectShop(s.id)}
                              className={`px-3 py-2 rounded-xl text-xs cursor-pointer flex items-center justify-between transition-colors ${
                                s.id === activeShopId ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <p className="truncate font-semibold">{s.name}</p>
                                <span className="text-[10px] text-slate-400 font-normal">{s.plan} Plan • Rs. {s.monthlyPrice}/mo</span>
                              </div>
                              {s.id === activeShopId && (
                                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-200">
                      <Store className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="max-w-[140px] sm:max-w-[200px] truncate">{profile?.name || 'My Store'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls: Role Badge, Manage Shops & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* SUPER ADMIN BADGE & SHORTCUT (Only visible when logged in as admin) */}
          {!isShopOwner && (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Super Admin</span>
              </div>

              <button
                onClick={() => onNavigate('admin_portal')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-xs transition-colors"
              >
                <span>Manage Shops</span>
              </button>
            </>
          )}

          {/* Shop Plan / Subscription Status Badge */}
          <div
            onClick={() => {
              if (!isShopOwner) onNavigate('admin_portal');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
              subStatus?.isPaused
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                : subStatus?.isReminder
                  ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse shadow-xs'
                  : !isShopOwner 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-800 cursor-pointer hover:bg-indigo-100' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 cursor-default'
            }`}
            title={
              subStatus?.isPaused
                ? 'Shop Paused / Payment Overdue'
                : subStatus?.isReminder
                  ? `Grace Period: ${subStatus.graceDaysRemaining} day(s) left before pause!`
                  : !isShopOwner ? "Open Admin Portal" : `Current Shop Plan: ${profile?.plan}`
            }
          >
            {subStatus?.isPaused ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>Paused</span>
              </>
            ) : subStatus?.isReminder ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Due in {subStatus.graceDaysRemaining || 1}d</span>
              </>
            ) : (
              <>
                <Crown className="w-3 h-3 text-indigo-600" />
                <span>
                  {profile?.plan && profile.plan.toLowerCase() !== 'free'
                    ? `${profile.plan} Plan`
                    : Number(profile?.monthlyPrice) > 0
                      ? 'Basic Plan'
                      : 'Free Plan'}
                </span>
              </>
            )}
          </div>

          {/* Low Stock Warning Button */}
          <button
            onClick={() => onNavigate('inventory', { filterLowStock: true })}
            className={`relative p-2 rounded-xl border transition-all ${
              lowStockCount > 0 
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title={lowStockCount > 0 ? `${lowStockCount} items low in stock!` : 'Stock levels normal'}
          >
            <AlertTriangle className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {lowStockCount}
              </span>
            )}
          </button>


          {/* Logged-in user + Logout */}
          {authUser && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden lg:inline truncate max-w-[120px]" title={authUser.email}>
                {authUser.email}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
