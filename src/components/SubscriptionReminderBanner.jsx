import React from 'react';
import { AlertTriangle, Clock, Smartphone, ChevronRight, X } from 'lucide-react';

export default function SubscriptionReminderBanner({ 
  shop, 
  subStatus, 
  platformSettings,
  onOpenPayment
}) {
  if (!subStatus?.isReminder) return null;

  const adminPhone = platformSettings?.adminEasypaisaNumber || '0301-8889990';
  const daysLeft = subStatus.graceDaysRemaining !== undefined ? subStatus.graceDaysRemaining : 2;

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white p-4 rounded-2xl shadow-lg border border-amber-400/30 animate-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-700/60 rounded-xl shrink-0 mt-0.5 sm:mt-0">
            <Clock className="w-5 h-5 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-800/80 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-amber-100">
                Grace Period: {daysLeft} Day{daysLeft !== 1 ? 's' : ''} Left
              </span>
              <span className="font-extrabold text-sm">
                30 Days Subscription Expired — Payment Reminder
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-1 leading-relaxed">
              Aapka 1 month ka hissab-kitab plan mukammal ho chuka hai. Agle <strong>{daysLeft} din</strong> mein payment na hui toh system <strong>automatically PAUSE</strong> ho jayega.
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-amber-100">
              <span>Admin EasyPaisa: <strong className="text-white">{adminPhone}</strong></span>
              <span>•</span>
              <span>Fee: <strong className="text-white">Rs. {shop?.monthlyPrice || 999}/mo</strong></span>
            </div>
          </div>
        </div>

        {onOpenPayment && (
          <button
            onClick={onOpenPayment}
            className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1 shrink-0 transition-transform active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-700" />
            <span>Pay / Renew Now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
