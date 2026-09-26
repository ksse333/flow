import React from 'react';
import { Transaction } from '../types';
import { useData } from '../context/DataContext';
import { formatCurrency, formatTime } from '../lib/calculations';
import { ChevronRight, CreditCard, Banknote, ArrowRightLeft, MoreHorizontal } from 'lucide-react';

interface TodayTransactionsTableProps {
  onSelectTransaction: (tx: Transaction) => void;
  onAddNew: () => void;
}

export const TodayTransactionsTable: React.FC<TodayTransactionsTableProps> = ({
  onSelectTransaction,
  onAddNew,
}) => {
  const { todayTransactions, todayTotal, settings } = useData();

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'Card':
        return <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 'Bank Transfer':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      default:
        return <MoreHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Today's Transactions</h3>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono-numbers text-slate-500">
              {todayTransactions.length} recorded today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of today's customer sales
          </p>
        </div>

        <button
          type="button"
          onClick={onAddNew}
          className="text-xs font-semibold text-slate-900 hover:text-slate-700 hover:underline flex items-center gap-1"
        >
          + Add New
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1 min-h-[220px]">
        {todayTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-700">No transactions recorded today yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;+ Add Transaction&quot; to log the first customer payment.
            </p>
            <button
              onClick={onAddNew}
              className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              + Add Transaction
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Time</th>
                <th className="py-2.5 px-3 font-semibold">Client</th>
                <th className="py-2.5 px-3 font-semibold">Service</th>
                <th className="py-2.5 px-3 font-semibold">Payment</th>
                <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayTransactions.map((tx) => {
                const serviceSummary = tx.items.map((i) => i.serviceName).join(', ');

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-mono-numbers text-slate-600 whitespace-nowrap">
                      {formatTime(tx.transactionDate)}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {tx.clientName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate" title={serviceSummary}>
                      {serviceSummary}
                      {tx.items.length > 1 && (
                        <span className="text-[10px] text-slate-400 ml-1 font-mono-numbers">
                          (+{tx.items.length - 1})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {getPaymentIcon(tx.paymentMethod)}
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(tx.total, settings.currency)}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300 group-hover:text-slate-600">
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Total as specified in Section 3: Today's Total: 185 DT */}
      <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 -mx-6 -mb-6 px-6 py-3.5 rounded-b-xl">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Today&apos;s Total
        </span>
        <span className="text-base font-bold font-mono-numbers text-slate-950">
          {formatCurrency(todayTotal, settings.currency)}
        </span>
      </div>
    </div>
  );
};
