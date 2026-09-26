import React, { useState } from 'react';
import { X, Trash2, Edit3, Printer, Calendar, Clock, User, CreditCard, Tag } from 'lucide-react';
import { Transaction } from '../types';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDateTimeDisplay, formatTime } from '../lib/calculations';
import { ConfirmDialog } from './ConfirmDialog';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onPrintReceipt: (tx: Transaction) => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onPrintReceipt,
  onEditTransaction,
}) => {
  const { deleteTransaction, settings } = useData();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    setShowConfirmDelete(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Transaction Details
                </span>
                <span className="text-xs font-mono-numbers font-semibold text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded">
                  {transaction.id}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {formatCurrency(transaction.total, settings.currency)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Client</span>
                  <span className="font-semibold text-slate-900 text-sm">{transaction.clientName}</span>
                  {transaction.clientPhone && (
                    <span className="text-slate-500 text-xs block">{transaction.clientPhone}</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Payment Method</span>
                  <span className="font-semibold text-slate-900 text-sm">{transaction.paymentMethod}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Date</span>
                  <span className="font-medium text-slate-900">
                    {formatDateTimeDisplay(transaction.transactionDate).split('·')[0]}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Time</span>
                  <span className="font-mono-numbers font-medium text-slate-900">
                    {formatTime(transaction.transactionDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Services Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Services & Items
                </h3>
                <span className="text-xs text-slate-500">
                  {transaction.items.length} {transaction.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Service</th>
                      <th className="py-2.5 px-3 font-medium text-center">Qty</th>
                      <th className="py-2.5 px-3 font-medium text-right">Unit Price</th>
                      <th className="py-2.5 px-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transaction.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-medium text-slate-900">{item.serviceName}</td>
                        <td className="py-3 px-3 text-center font-mono-numbers text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-numbers text-slate-600">
                          {formatCurrency(item.unitPrice, settings.currency)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-numbers font-semibold text-slate-900">
                          {formatCurrency(item.total, settings.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono-numbers font-medium text-slate-900">
                  {formatCurrency(transaction.subtotal, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span className="font-mono-numbers font-medium text-rose-600">
                  {transaction.discount > 0
                    ? `-${formatCurrency(transaction.discount, settings.currency)}`
                    : `0 ${settings.currency}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-950">
                <span>Total Amount:</span>
                <span className="font-mono-numbers text-base text-slate-950">
                  {formatCurrency(transaction.total, settings.currency)}
                </span>
              </div>
            </div>

            {transaction.notes && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Notes:</span>
                <p className="text-slate-600">{transaction.notes}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPrintReceipt(transaction)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>

              {onEditTransaction && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditTransaction(transaction);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete transaction ${transaction.id} for ${transaction.clientName}? This action cannot be undone and will update revenue totals.`}
        confirmLabel="Delete Transaction"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  );
};
