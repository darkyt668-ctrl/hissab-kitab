import React from 'react';
import { Printer } from 'lucide-react';
import Modal from './Modal';

export default function InvoicePrintModal({ isOpen, onClose, invoice, businessProfile }) {
  if (!invoice) return null;

  const currency = businessProfile?.currency || 'Rs.';
  const items = invoice.items || [];
  const subtotal = Number(invoice.subtotal || invoice.total || 0);
  const discount = Number(invoice.discount || 0);
  const tax = Number(invoice.tax || 0);
  const grandTotal = Number(invoice.total || 0);
  const paidAmount = Number(invoice.paidAmount !== undefined ? invoice.paidAmount : grandTotal);
  const balanceDue = Number(invoice.balanceAdded !== undefined ? invoice.balanceAdded : Math.max(0, grandTotal - paidAmount));

  // Dedicated, bulletproof print function using an isolated iframe
  const handlePrint = () => {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.setAttribute('aria-hidden', 'true');
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

    const statusBadgeColors = invoice.status === 'Paid'
      ? 'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;'
      : invoice.status === 'Partial'
      ? 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;'
      : 'background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3;';

    const invoiceHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Invoice #${invoice.invoiceNo} - ${businessProfile?.name || 'Hissab Kitab'}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            padding: 16px;
            font-size: 13px;
            line-height: 1.45;
          }
          .invoice-box {
            max-width: 820px;
            margin: 0 auto;
            background: #ffffff;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
            margin-bottom: 16px;
          }
          .shop-title {
            font-size: 24px;
            font-weight: 800;
            color: #4338ca;
            letter-spacing: -0.5px;
          }
          .shop-tagline {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .shop-meta {
            font-size: 12px;
            color: #334155;
            margin-top: 4px;
            line-height: 1.4;
          }
          .invoice-meta-box {
            text-align: right;
          }
          .invoice-type-pill {
            display: inline-block;
            background: #eef2ff;
            color: #4338ca;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
            border: 1px solid #c7d2fe;
          }
          .invoice-num {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
          }
          .invoice-date {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          
          .customer-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
          }
          .cust-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
          }
          .cust-name {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 2px;
          }
          .cust-phone {
            font-size: 12px;
            color: #475569;
            margin-top: 1px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            ${statusBadgeColors}
          }

          table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          table.items-table th {
            background: #f1f5f9;
            border-top: 1px solid #cbd5e1;
            border-bottom: 2px solid #94a3b8;
            padding: 9px 12px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #334155;
            letter-spacing: 0.5px;
          }
          table.items-table td {
            padding: 9px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12.5px;
            color: #1e293b;
          }
          table.items-table tbody tr:nth-child(even) {
            background-color: #fafbfc;
          }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }

          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-top: 2px solid #0f172a;
            padding-top: 14px;
            gap: 24px;
          }
          .summary-left {
            flex: 1;
            font-size: 12px;
            color: #475569;
          }
          .payment-pill {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 11px;
            background: ${invoice.paymentMethod === 'EasyPaisa' ? '#ecfdf5' : '#f1f5f9'};
            color: ${invoice.paymentMethod === 'EasyPaisa' ? '#065f46' : '#1e293b'};
            border: 1px solid ${invoice.paymentMethod === 'EasyPaisa' ? '#a7f3d0' : '#cbd5e1'};
            margin-bottom: 6px;
          }
          .trx-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 6px;
            padding: 6px 10px;
            margin-top: 6px;
            font-size: 11.5px;
            color: #166534;
          }
          .easypaisa-box {
            background: #f8fafc;
            border: 1px dashed #10b981;
            border-radius: 8px;
            padding: 8px 12px;
            margin-top: 8px;
            font-size: 11.5px;
          }
          .notes-box {
            margin-top: 8px;
            font-style: italic;
            color: #64748b;
            padding: 4px 8px;
            background: #f8fafc;
            border-left: 3px solid #cbd5e1;
            border-radius: 2px;
          }
          .summary-right {
            width: 270px;
            font-size: 12.5px;
          }
          .calc-line {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            color: #475569;
          }
          .calc-line.grand {
            border-top: 2px solid #cbd5e1;
            border-bottom: 2px solid #cbd5e1;
            padding: 8px 0;
            margin: 6px 0;
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
          }
          .calc-line.paid {
            color: #047857;
            font-weight: 700;
            font-size: 13px;
          }
          .calc-line.balance {
            background: #fff1f2;
            border: 1px dashed #f43f5e;
            border-radius: 6px;
            padding: 6px 10px;
            margin-top: 8px;
            color: #e11d48;
            font-weight: 800;
            font-size: 13px;
          }
          .branding {
            margin-top: 14px;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <!-- Business Header -->
          <div class="header-row">
            <div>
              <div class="shop-title">${businessProfile?.name || 'Hissab Kitab Store'}</div>
              ${businessProfile?.tagline ? `<div class="shop-tagline">${businessProfile.tagline}</div>` : ''}
              ${businessProfile?.address ? `<div class="shop-meta">📍 ${businessProfile.address}</div>` : ''}
              ${businessProfile?.phone ? `<div class="shop-meta">📞 Tel: ${businessProfile.phone}</div>` : ''}
            </div>
            <div class="invoice-meta-box">
              <div class="invoice-type-pill">Sales Tax Invoice</div>
              <div class="invoice-num">${invoice.invoiceNo}</div>
              <div class="invoice-date">Date: ${invoice.date}</div>
            </div>
          </div>

          <!-- Customer Strip -->
          <div class="customer-row">
            <div>
              <div class="cust-label">Billed To</div>
              <div class="cust-name">${invoice.customerName || 'Walk-in Cash Customer'}</div>
              ${invoice.customerPhone ? `<div class="cust-phone">Tel: ${invoice.customerPhone}</div>` : ''}
            </div>
            <div>
              <div class="cust-label" style="text-align: right; margin-bottom: 3px;">Payment Status</div>
              <span class="status-badge">${invoice.status}</span>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 35px;">#</th>
                <th class="text-left">Item Description</th>
                <th class="text-right" style="width: 90px;">Price</th>
                <th class="text-center" style="width: 50px;">Qty</th>
                <th class="text-right" style="width: 100px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, idx) => `
                <tr>
                  <td class="text-center" style="color: #94a3b8;">${idx + 1}</td>
                  <td class="text-left font-semibold">${item.name}</td>
                  <td class="text-right">${currency} ${Number(item.unitPrice).toLocaleString()}</td>
                  <td class="text-center font-bold">${item.qty}</td>
                  <td class="text-right font-bold">${currency} ${Number(item.total).toLocaleString()}</td>
                </tr>
              `).join('')}
              ${items.length === 0 ? `
                <tr>
                  <td colspan="5" class="text-center" style="padding: 20px; color: #94a3b8;">No items listed</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <!-- Footer Section -->
          <div class="summary-row">
            <div class="summary-left">
              <div>
                <strong style="color: #334155;">Payment Mode: </strong>
                <span class="payment-pill">
                  ${invoice.paymentMethod === 'EasyPaisa' ? '📱 EasyPaisa Mobile Account' : (invoice.paymentMethod || 'Cash')}
                </span>
              </div>

              ${invoice.easypaisaTrxId ? `
                <div class="trx-box">
                  <strong>EasyPaisa Transaction ID:</strong>
                  <span style="font-family: monospace; font-weight: bold; margin-left: 4px;">${invoice.easypaisaTrxId}</span>
                </div>
              ` : ''}

              ${businessProfile?.easypaisaNumber ? `
                <div class="easypaisa-box">
                  <div style="font-weight: bold; color: #065f46; margin-bottom: 2px;">📱 EasyPaisa Accepted Here</div>
                  <div>Account: <strong style="font-family: monospace;">${businessProfile.easypaisaNumber}</strong></div>
                  ${businessProfile?.easypaisaTitle ? `<div>Title: <strong>${businessProfile.easypaisaTitle}</strong></div>` : ''}
                </div>
              ` : ''}

              ${invoice.notes ? `
                <div class="notes-box">
                  <strong>Note:</strong> ${invoice.notes}
                </div>
              ` : ''}

              <div class="branding">Thank you for your business! Powered by Hissab Kitab.</div>
            </div>

            <div class="summary-right">
              <div class="calc-line">
                <span>Subtotal:</span>
                <span class="font-semibold">${currency} ${subtotal.toLocaleString()}</span>
              </div>
              ${discount > 0 ? `
                <div class="calc-line" style="color: #059669;">
                  <span>Discount:</span>
                  <span class="font-semibold">- ${currency} ${discount.toLocaleString()}</span>
                </div>
              ` : ''}
              ${tax > 0 ? `
                <div class="calc-line">
                  <span>Tax / GST:</span>
                  <span class="font-semibold">+ ${currency} ${tax.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="calc-line grand">
                <span>Grand Total:</span>
                <span>${currency} ${grandTotal.toLocaleString()}</span>
              </div>
              <div class="calc-line paid">
                <span>Amount Paid:</span>
                <span>${currency} ${paidAmount.toLocaleString()}</span>
              </div>
              ${balanceDue > 0 ? `
                <div class="calc-line balance">
                  <span>Balance Due (Udhar):</span>
                  <span>${currency} ${balanceDue.toLocaleString()}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(invoiceHtml);
    frameDoc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.error('Print frame error:', err);
        window.print();
      }
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch (e) {}
      }, 3000);
    }, 250);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice #${invoice.invoiceNo}`} maxWidth="max-w-3xl">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 no-print pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Preview Mode:</span>
          <span>Click "Print / Save PDF" to print or download.</span>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/25 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* The Printable Container (Rendered for on-screen preview & Ctrl+P support) */}
      <div id="printable-invoice" className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-white text-slate-800 shadow-xs">
        {/* Business Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-700 tracking-tight">
              {businessProfile?.name || 'Hissab Kitab Store'}
            </h1>
            {businessProfile?.tagline && (
              <p className="text-xs text-slate-500 mt-0.5">{businessProfile.tagline}</p>
            )}
            {businessProfile?.address && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <span>📍</span> {businessProfile.address}
              </p>
            )}
            {businessProfile?.phone && (
              <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                <span>📞</span> Tel: {businessProfile.phone}
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg text-xs uppercase tracking-wider mb-2">
              Sales Tax Invoice
            </span>
            <p className="font-extrabold text-lg text-slate-900">{invoice.invoiceNo}</p>
            <p className="text-xs text-slate-500 mt-0.5">Date: {invoice.date}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Billed To</span>
            <p className="font-bold text-slate-900 text-base mt-0.5">{invoice.customerName || 'Cash Customer'}</p>
            {invoice.customerPhone && (
              <p className="text-xs text-slate-500 mt-0.5">Tel: {invoice.customerPhone}</p>
            )}
          </div>
          <div className="sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Payment Status</span>
            <div className="mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                invoice.status === 'Partial' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-t border-b-2 border-slate-300 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-right w-24">Price</th>
                <th className="py-3 px-3 text-center w-16">Qty</th>
                <th className="py-3 px-3 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3 px-3 text-right">{currency} {Number(item.unitPrice).toLocaleString()}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">{item.qty}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{currency} {Number(item.total).toLocaleString()}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No items in this invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="border-t-2 border-slate-900 pt-5 flex flex-col sm:flex-row justify-between items-start gap-6">
          {/* Left: Notes & Payment Info */}
          <div className="text-xs text-slate-500 max-w-sm space-y-2.5 w-full">
            <div>
              <span className="font-semibold text-slate-700">Payment Mode: </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                invoice.paymentMethod === 'EasyPaisa' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}>
                {invoice.paymentMethod === 'EasyPaisa' ? '📱 EasyPaisa Mobile Account' : (invoice.paymentMethod || 'Cash')}
              </span>
            </div>

            {/* EasyPaisa TID if present */}
            {invoice.easypaisaTrxId && (
              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900">
                <span className="font-bold text-[11px] block text-emerald-800">EasyPaisa Transaction ID:</span>
                <span className="font-mono text-xs font-bold text-emerald-950 mt-0.5 block">{invoice.easypaisaTrxId}</span>
              </div>
            )}

            {/* Store EasyPaisa Details for customer reference */}
            {businessProfile?.easypaisaNumber && (
              <div className="p-3 bg-slate-50 border border-dashed border-emerald-300 rounded-xl text-slate-700 space-y-0.5">
                <div className="font-bold text-[11px] text-emerald-800 flex items-center gap-1">
                  <span>📱 EasyPaisa Accepted Here</span>
                </div>
                <div className="text-[11px] flex justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="font-bold font-mono text-slate-800">{businessProfile.easypaisaNumber}</span>
                </div>
                {businessProfile?.easypaisaTitle && (
                  <div className="text-[11px] flex justify-between">
                    <span className="text-slate-500">Title:</span>
                    <span className="font-medium text-slate-800">{businessProfile.easypaisaTitle}</span>
                  </div>
                )}
              </div>
            )}

            {invoice.notes && (
              <div className="p-2 bg-slate-50 border-l-2 border-slate-300 rounded text-slate-600 italic">
                Note: {invoice.notes}
              </div>
            )}

            <p className="pt-2 text-[11px] text-slate-400">
              Thank you for your business! Powered by Hissab Kitab.
            </p>
          </div>

          {/* Right: Calculations */}
          <div className="w-full sm:w-72 space-y-2 text-right text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium">{currency} {subtotal.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-medium">- {currency} {discount.toLocaleString()}</span>
              </div>
            )}

            {tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax / GST:</span>
                <span className="font-medium">+ {currency} {tax.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold text-slate-900 border-t-2 border-slate-300 pt-2.5">
              <span>Grand Total:</span>
              <span>{currency} {grandTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-emerald-700 font-bold text-sm">
              <span>Amount Paid:</span>
              <span>{currency} {paidAmount.toLocaleString()}</span>
            </div>

            {balanceDue > 0 && (
              <div className="flex justify-between text-rose-600 font-extrabold text-sm border border-dashed border-rose-300 bg-rose-50/70 p-2 rounded-xl mt-2">
                <span>Balance Due (Udhar):</span>
                <span>{currency} {balanceDue.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
