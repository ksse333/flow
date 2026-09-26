import React from 'react';
import { X, User, Phone, Mail, FileText, Calendar, Plus, Clock, ChevronRight } from 'lucide-react';
import { Client, Transaction } from '../types';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDateDisplay, formatTime } from '../lib/calculations';

interface ClientDetailsModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onAddTransactionForClient: (client: Client) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  client,
  onClose,
  onSelectTransaction,
  onAddTransactionForClient,
}) => {
  const { getClientStats, settings } = useData();

  if (!isOpen || !client) return null;

  const stats = getClientStats(client.id);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {client.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{client.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{client.phone || 'No phone'}</span>
                {client.email && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{client.email}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Spent
              </span>
              <span className="text-xl font-bold font-mono-numbers text-slate-950 mt-1 block">
                {formatCurrency(stats.totalSpent, settings.currency)}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Visits
              </span>
              <span className="text-xl font-bold font-mono-numbers text-slate-950 mt-1 block">
                {stats.visitsCount}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Last Visit
              </span>
              <span className="text-sm font-semibold text-slate-900 mt-2 block truncate">
                {stats.lastVisit ? formatDateDisplay(stats.lastVisit) : 'Never'}
              </span>
            </div>
          </div>

          {/* Notes if any */}
          {client.notes && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-amber-900">
              <span className="font-semibold block mb-0.5">Preferences / Notes:</span>
              <p>{client.notes}</p>
            </div>
          )}

          {/* Client's Transaction History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Visit History ({stats.transactions.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddTransactionForClient(client);
                }}
                className="text-xs font-semibold text-slate-900 hover:text-slate-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Transaction
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Service(s)</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No transactions recorded for this client yet.
                      </td>
                    </tr>
                  ) : (
                    stats.transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        onClick={() => {
                          onClose();
                          onSelectTransaction(tx);
                        }}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-2.5 px-3 font-mono-numbers text-slate-600 whitespace-nowrap">
                          {formatDateDisplay(tx.transactionDate)} · {formatTime(tx.transactionDate)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">
                          {tx.items.map((i) => i.serviceName).join(', ')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-numbers font-semibold text-slate-950">
                          {formatCurrency(tx.total, settings.currency)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-300 group-hover:text-slate-600">
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onAddTransactionForClient(client);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Add Transaction for {client.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
