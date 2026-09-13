import React, { useState } from 'react';
import { 
  Smartphone, 
  Copy, 
  Check, 
  CreditCard, 
  CheckCircle2, 
  PhoneCall, 
  AlertCircle,
  X,
  Send
} from 'lucide-react';
import Modal from './Modal';

export default function ShopRenewalModal({
  isOpen,
  onClose,
  shop,
  platformSettings,
  onRecordPayment
}) {
  const [copied, setCopied] = useState(false);
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const adminPhone = platformSettings?.adminEasypaisaNumber || '0301-8889990';
  const adminTitle = platformSettings?.adminEasypaisaTitle || 'Hissab Kitab Platform (Admin)';
  const fee = shop?.monthlyPrice || 999;

  const handleCopy = () => {
    navigator.clipboard.writeText(adminPhone.replace(/[^0-9]/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trxId.trim()) {
      alert('Please enter your 11-digit EasyPaisa Transaction ID (TID)');
      return;
    }

    if (onRecordPayment) {
      onRecordPayment({
        shopId: shop.id,
        shopName: shop.name,
        planName: shop.plan || 'Basic',
        amount: fee,
        paymentMethod: 'EasyPaisa',
        trxId: trxId.trim(),
        senderNumber: senderNumber.trim()
      });
    }

    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setTrxId('');
    setSenderNumber('');
    onClose();
  };

  const whatsappMessage = `Assalam-o-Alaikum Admin! Maine ${encodeURIComponent(shop?.name || 'Shop')} ki monthly subscription fee Rs. ${fee.toLocaleString()} bhej di hai.%0A%0A*Payment Details:*%0A• EasyPaisa TID: ${encodeURIComponent(trxId || 'Pending verification')}%0A• Plan: ${encodeURIComponent(shop?.plan || 'Basic')}%0A• Sender: ${encodeURIComponent(senderNumber || shop?.phone || '')}%0A%0APlease check and confirm.`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Renew Subscription &amp; Pay Fee"
      maxWidth="max-w-lg"
    >
      {isSubmitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900">Receipt Submitted Successfully!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
              Aapki EasyPaisa Transaction ID <strong>({trxId})</strong> submit ho gayi hai. System update ho raha hai.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Shop Name:</span>
              <span className="font-bold text-slate-800">{shop?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fee Paid:</span>
              <span className="font-bold text-emerald-700">Rs. {fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Trx ID (TID):</span>
              <span className="font-mono font-bold text-slate-900">{trxId}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href={`https://wa.me/92${adminPhone.replace(/[^0-9]/g, '').slice(-10)}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              Share Receipt on WhatsApp with Admin
            </a>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Plan Summary Header */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-indigo-300 uppercase font-black tracking-wider">
                Store Subscription
              </span>
              <h4 className="text-base font-black text-white">{shop?.name}</h4>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-500/30 border border-indigo-400/30 rounded-md text-[10px] text-indigo-200 font-bold">
                {shop?.plan} Plan Tier
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee Due</span>
              <span className="text-2xl font-black text-emerald-400">Rs. {fee.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block">/ 30 Days</span>
            </div>
          </div>

          {/* Admin EasyPaisa Account Details with Copy Button */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                Admin EasyPaisa Account
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Number'}
              </button>
            </div>

            <div className="bg-white rounded-xl p-3 border border-emerald-100 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">EasyPaisa Mobile Number:</span>
                <span className="font-extrabold text-slate-900 text-sm font-mono tracking-wider">{adminPhone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Account Title:</span>
                <span className="font-bold text-slate-800">{adminTitle}</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed">
              👉 Apne EasyPaisa app se oper diye gaye number par <strong>Rs. {fee.toLocaleString()}</strong> transfer karein aur neeche 11-digit Transaction ID (TID) enter karein.
            </p>
          </div>

          {/* Verification Form Inputs */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                EasyPaisa Transaction ID (TID) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 94829104821 (SMS / Receipt TID)"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Sender Mobile Number (Optional)
              </label>
              <input
                type="text"
                placeholder="0300-1234567"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Payment Receipt
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
