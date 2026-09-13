import React from 'react';
import { 
  PauseCircle, 
  AlertTriangle, 
  PhoneCall, 
  Smartphone, 
  ShieldAlert, 
  Play, 
  CreditCard,
  Building2,
  Clock,
  Sparkles,
  LogOut
} from 'lucide-react';

export default function ShopPausedOverlay({ 
  shop, 
  subStatus, 
  platformSettings, 
  userRole = 'shop_owner', 
  onUnpause, 
  onOpenPayment,
  onLogout
}) {
  const isAdmin = userRole === 'admin';
  const adminPhone = platformSettings?.adminEasypaisaNumber || '0301-8889990';
  const adminTitle = platformSettings?.adminEasypaisaTitle || 'Hissab Kitab Platform (Admin)';
  const fee = shop?.monthlyPrice || 999;

  // If Admin is viewing, show an actionable top alert banner so admin can still manage the shop
  if (isAdmin) {
    return (
      <div className="mb-6 bg-rose-500 text-white p-4 rounded-2xl shadow-lg border border-rose-600 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-600 rounded-xl">
            <PauseCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-wider bg-rose-700/80 px-2 py-0.5 rounded-md">
                Shop Paused / Locked
              </span>
              <span className="text-xs font-semibold text-rose-100">
                {subStatus?.reason || 'Non-payment or manual pause.'}
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-0.5">
              Shopkeeper currently cannot access hissab-kitab. As Super Admin, you can unpause or renew:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onUnpause && (
            <button
              onClick={onUnpause}
              className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Unpause Shop
            </button>
          )}
          {onOpenPayment && (
            <button
              onClick={onOpenPayment}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl border border-rose-400 flex items-center gap-1.5 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              Record Payment (+30d)
            </button>
          )}
        </div>
      </div>
    );
  }

  // SHOPKEEPER VIEW: Full Screen Lockout Screen
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-center animate-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs border border-white/20">
            <PauseCircle className="w-10 h-10 text-white" />
          </div>
          <span className="inline-block px-3 py-1 bg-rose-800/60 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-rose-100 mb-2">
            System Paused (Payment Overdue)
          </span>
          <h2 className="text-2xl font-black">{shop?.name || 'Your Store'}</h2>
          <p className="text-xs text-rose-100 mt-1">
            Subscription cycle expired &amp; grace period has ended
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-left">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <strong className="block font-bold mb-0.5">Aapka Hissab Kitab Pause Ho Gaya Hai</strong>
              Aapka 1 month (30 din) subscription plan expire ho chuka hai aur 2 din ka grace period bhi khatam ho gaya hai. Dobara chalane ke liye monthly fee ada karein.
            </div>
          </div>

          {/* Admin EasyPaisa Details Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                EasyPaisa Payment Details
              </div>
              <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-900 text-[10px] font-black rounded-md uppercase">
                Fee: Rs. {fee.toLocaleString()}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-emerald-100 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">EasyPaisa Account:</span>
                <span className="font-extrabold text-slate-900 text-sm tracking-wide">{adminPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Title:</span>
                <span className="font-semibold text-slate-800">{adminTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Assigned:</span>
                <span className="font-semibold text-indigo-600">{shop?.plan || 'Basic'} Plan</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-700">
              Payment bhej kar screenshot Admin ko WhatsApp karein. Admin foran aapka account unpause kar dega!
            </p>
          </div>

          {/* Contact Action & Logout */}
          <div className="pt-2 space-y-2">
            <a
              href={`https://wa.me/92${adminPhone.replace(/[^0-9]/g, '').slice(-10)}?text=Assalam-o-Alaikum, maine ${encodeURIComponent(shop?.name || '')} ki subscription fee bhej di hai. Please system unpause karein.`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-center"
            >
              <PhoneCall className="w-4 h-4" />
              Contact Admin on WhatsApp ({adminPhone})
            </a>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-all text-center"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                Logout / Sign Out
              </button>
            )}
          </div>

          <div className="text-center">
            <p className="text-[11px] text-slate-400">
              System will remain paused until Admin confirms payment &amp; unpauses.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
