import React from 'react';
import { Printer, Download, Share2, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

export default function InvoicePrintModal({ isOpen, onClose, invoice, businessProfile }) {
  if (!invoice) return null;

  const currency = businessProfile?.currency || 'Rs.';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice #${invoice.invoiceNo}`} maxWidth="max-w-2xl">
      <div className="flex justify-end gap-2 mb-4 no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* The Printable Area */}
      <div id="printable-invoice" className="border border-slate-200 rounded-xl p-6 bg-white text-slate-800 text-sm">
        {/* Business Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-indigo-700">{businessProfile?.name || 'Hissab Kitab Store'}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{businessProfile?.tagline}</p>
            <p className="text-xs text-slate-600 mt-1">{businessProfile?.address}</p>
            <p className="text-xs text-slate-600">Tel: {businessProfile?.phone}</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs uppercase tracking-wider mb-2">
              Sales Tax Invoice
            </span>
            <p className="font-bold text-base text-slate-800">{invoice.invoiceNo}</p>
            <p className="text-xs text-slate-500">Date: {invoice.date}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-slate-50 rounded-xl p-4 mb-5 flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billed To:</span>
            <p className="font-bold text-slate-800 text-base mt-0.5">{invoice.customerName || 'Cash Customer'}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Status:</span>
            <div className="mt-0.5">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                invoice.status === 'Partial' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">Item Description</th>
                <th className="py-2.5 px-2 text-right">Price</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoice.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-2 text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-2 font-medium text-slate-900">{item.name}</td>
                  <td className="py-2.5 px-2 text-right">{currency} {Number(item.unitPrice).toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-center">{item.qty}</td>
                  <td className="py-2.5 px-2 text-right font-medium">{currency} {Number(item.total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="border-t border-slate-200 pt-4 flex justify-between items-start gap-4">
          <div className="text-xs text-slate-500 max-w-sm space-y-2">
            <div>
              <span className="font-semibold text-slate-700">Payment Mode: </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold ${
                invoice.paymentMethod === 'EasyPaisa' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {invoice.paymentMethod === 'EasyPaisa' ? '📱 EasyPaisa Mobile Account' : (invoice.paymentMethod || 'Cash')}
              </span>
            </div>

            {/* EasyPaisa TID if present */}
            {invoice.easypaisaTrxId && (
              <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-900">
                <span className="font-bold text-[11px] block">EasyPaisa Transaction ID (Trx ID):</span>
                <span className="font-mono text-xs font-bold text-emerald-800">{invoice.easypaisaTrxId}</span>
              </div>
            )}

            {invoice.notes && <p className="italic text-slate-600">Note: {invoice.notes}</p>}

            {/* Store EasyPaisa Details for customer reference */}
            {businessProfile?.easypaisaNumber && (
              <div className="p-2.5 bg-slate-50 border border-dashed border-emerald-300 rounded-xl text-slate-700 space-y-0.5">
                <div className="font-bold text-[11px] text-emerald-800 flex items-center gap-1">
                  <span>📱 EasyPaisa Accepted Here</span>
                </div>
                <div className="text-[11px] flex justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="font-bold font-mono text-slate-800">{businessProfile.easypaisaNumber}</span>
                </div>
                {businessProfile.easypaisaTitle && (
                  <div className="text-[11px] flex justify-between">
                    <span className="text-slate-500">Title:</span>
                    <span className="font-medium text-slate-800">{businessProfile.easypaisaTitle}</span>
                  </div>
                )}
              </div>
            )}

            <p className="pt-1 text-[11px] text-slate-400">Thank you for your business! Powered by Hissab Kitab.</p>
          </div>
          <div className="w-64 space-y-2 text-right text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium">{currency} {Number(invoice.subtotal).toLocaleString()}</span>
            </div>
            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-medium">- {currency} {Number(invoice.discount).toLocaleString()}</span>
              </div>
            )}
            {Number(invoice.tax) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax / GST:</span>
                <span className="font-medium">+ {currency} {Number(invoice.tax).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Grand Total:</span>
              <span>{currency} {Number(invoice.total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Amount Paid:</span>
              <span>{currency} {Number(invoice.paidAmount).toLocaleString()}</span>
            </div>
            {Number(invoice.balanceAdded) > 0 && (
              <div className="flex justify-between text-rose-600 font-bold border-t border-dashed border-slate-200 pt-1">
                <span>Balance Due (Udhar):</span>
                <span>{currency} {Number(invoice.balanceAdded).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
