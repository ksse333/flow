import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { Transaction, BusinessSettings } from '../types';
import { formatCurrency, formatDateTimeDisplay } from '../lib/calculations';

interface ReceiptModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  settings: BusinessSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  transaction,
  settings,
  onClose,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-800">Print Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white p-6 shadow-sm border border-slate-200 text-slate-900 rounded-sm font-sans"
          >
            {/* Business Header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <h2 className="text-base font-bold tracking-tight text-slate-950 uppercase">
                {settings.businessName}
              </h2>
              {settings.address && (
                <p className="text-xs text-slate-500 mt-0.5">{settings.address}</p>
              )}
              {settings.phone && (
                <p className="text-xs text-slate-500">{settings.phone}</p>
              )}
            </div>

            {/* Receipt Meta */}
            <div className="py-3 text-xs border-b border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Receipt #:</span>
                <span className="font-mono-numbers font-medium text-slate-900">{transaction.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date:</span>
                <span className="text-slate-900">{formatDateTimeDisplay(transaction.transactionDate)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Client:</span>
                <span className="font-medium text-slate-900">{transaction.clientName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment:</span>
                <span className="font-medium text-slate-900">{transaction.paymentMethod}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="py-3 border-b border-dashed border-slate-300">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-200">
                    <th className="text-left font-medium pb-1">Item</th>
                    <th className="text-center font-medium pb-1">Qty</th>
                    <th className="text-right font-medium pb-1">Price</th>
                    <th className="text-right font-medium pb-1">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transaction.items.map((item) => (
                    <tr key={item.id} className="py-1.5">
                      <td className="py-1.5 text-left font-medium text-slate-800">
                        {item.serviceName}
                      </td>
                      <td className="py-1.5 text-center font-mono-numbers text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="py-1.5 text-right font-mono-numbers text-slate-600">
                        {item.unitPrice}
                      </td>
                      <td className="py-1.5 text-right font-mono-numbers font-medium text-slate-900">
                        {item.total} {settings.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="py-3 space-y-1.5 text-xs border-b border-dashed border-slate-300">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono-numbers font-medium">
                  {formatCurrency(transaction.subtotal, settings.currency)}
                </span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span className="font-mono-numbers font-medium">
                    -{formatCurrency(transaction.discount, settings.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-950 pt-1 border-t border-slate-200">
                <span>Total Paid</span>
                <span className="font-mono-numbers">
                  {formatCurrency(transaction.total, settings.currency)}
                </span>
              </div>
            </div>

            {/* Receipt Footer Message */}
            <div className="pt-4 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Payment Received</span>
              </div>
              <p className="text-[11px] text-slate-500 italic max-w-xs mx-auto">
                {settings.receiptFooter || 'Thank you for your business!'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
