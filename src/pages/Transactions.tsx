import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Transaction, PaymentMethod, DateRangePreset } from '../types';
import {
  formatCurrency,
  formatTime,
  formatDateDisplay,
  isDateInPreset,
} from '../lib/calculations';
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronRight,
  Trash2,
  Calendar,
  X,
  CreditCard,
  Banknote,
  ArrowRightLeft,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface TransactionsPageProps {
  onSelectTransaction: (tx: Transaction) => void;
  onOpenNewTransaction: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onSelectTransaction,
  onOpenNewTransaction,
}) => {
  const { transactions, services, serviceCategories, deleteTransaction, settings } = useData();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DateRangePreset | 'all'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search term (Client Name, ID, or Service Name)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesClient = tx.clientName.toLowerCase().includes(query);
        const matchesId = tx.id.toLowerCase().includes(query);
        const matchesService = tx.items.some((it) => it.serviceName.toLowerCase().includes(query));
        if (!matchesClient && !matchesId && !matchesService) return false;
      }

      // Payment method
      if (selectedPaymentMethod !== 'all' && tx.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      // Service filter
      if (selectedServiceId) {
        const matchesSrv = tx.items.some(
          (it) =>
            it.serviceId === selectedServiceId ||
            it.serviceName.toLowerCase() ===
              services.find((s) => s.id === selectedServiceId)?.name.toLowerCase()
        );
        if (!matchesSrv) return false;
      }

      // Category filter
      if (selectedCategory) {
        const serviceIdsInCat = services
          .filter((s) => s.categoryId === selectedCategory)
          .map((s) => s.id);
        const serviceNamesInCat = services
          .filter((s) => s.categoryId === selectedCategory)
          .map((s) => s.name.toLowerCase());

        const matchesCat = tx.items.some(
          (it) =>
            (it.serviceId && serviceIdsInCat.includes(it.serviceId)) ||
            serviceNamesInCat.includes(it.serviceName.toLowerCase())
        );
        if (!matchesCat) return false;
      }

      // Date preset
      if (datePreset !== 'all') {
        const inRange = isDateInPreset(
          tx.transactionDate,
          datePreset as DateRangePreset,
          customStart,
          customEnd
        );
        if (!inRange) return false;
      }

      return true;
    });
  }, [
    transactions,
    searchTerm,
    selectedPaymentMethod,
    selectedServiceId,
    selectedCategory,
    datePreset,
    customStart,
    customEnd,
    services,
  ]);

  // Aggregate totals of filtered rows
  const filteredTotal = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => acc + (tx.total || 0), 0);
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Time',
      'Client',
      'Services',
      'Quantity',
      'Subtotal',
      'Discount',
      'Total',
      'Payment Method',
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      formatDateDisplay(tx.transactionDate),
      formatTime(tx.transactionDate),
      `"${tx.clientName.replace(/"/g, '""')}"`,
      `"${tx.items.map((i) => i.serviceName).join(' + ')}"`,
      tx.items.reduce((sum, it) => sum + it.quantity, 0),
      tx.subtotal,
      tx.discount,
      tx.total,
      tx.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'Card':
        return <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 'Bank Transfer':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      default:
        return null;
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedServiceId('');
    setSelectedCategory('');
    setSelectedPaymentMethod('all');
    setDatePreset('all');
    setCustomStart('');
    setCustomEnd('');
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedServiceId) ||
    Boolean(selectedCategory) ||
    selectedPaymentMethod !== 'all' ||
    datePreset !== 'all';

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Transaction History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete audit trail with itemized historical snapshots
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, ID, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 transition-colors"
            />
          </div>

          {/* Date Presets */}
          <div>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-800"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-800"
            >
              <option value="">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-800"
            >
              <option value="all">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Custom Range Inputs if selected */}
        {datePreset === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        )}

        {/* Active Filter Clear indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-600 hover:text-slate-950 font-medium flex items-center gap-1 hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Main Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {transactions.length === 0 ? 'No transactions recorded yet' : 'No transactions matched your search'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {transactions.length === 0
                          ? 'Start by recording your first customer sale. Revenue and reports will update in real time.'
                          : 'Try adjusting your date range, search query, or payment method filters.'}
                      </p>
                      {transactions.length === 0 && (
                        <button
                          type="button"
                          onClick={onOpenNewTransaction}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          + Add First Transaction
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const totalQty = tx.items.reduce((sum, it) => sum + it.quantity, 0);
                  const serviceSummary = tx.items.map((it) => it.serviceName).join(', ');

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono-numbers text-slate-700 whitespace-nowrap">
                        {formatDateDisplay(tx.transactionDate)}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers text-slate-500 whitespace-nowrap">
                        {formatTime(tx.transactionDate)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {tx.clientName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[220px] truncate" title={serviceSummary}>
                        {serviceSummary}
                        {tx.items.length > 1 && (
                          <span className="text-[10px] text-slate-400 ml-1 font-mono-numbers">
                            (+{tx.items.length - 1})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono-numbers text-slate-600 whitespace-nowrap">
                        {totalQty}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          {getPaymentIcon(tx.paymentMethod)}
                          <span>{tx.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono-numbers font-bold text-slate-950 whitespace-nowrap">
                        {formatCurrency(tx.total, settings.currency)}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onSelectTransaction(tx)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                            title="View Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTxToDelete(tx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="text-slate-500">
            Total records: <span className="font-semibold text-slate-800">{filteredTransactions.length}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
              Filtered Total Revenue:
            </span>
            <span className="text-base font-bold font-mono-numbers text-slate-950">
              {formatCurrency(filteredTotal, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(txToDelete)}
        title="Delete Transaction"
        message={`Are you sure you want to delete transaction ${txToDelete?.id} (${txToDelete?.clientName})? Revenue calculations will immediately adjust.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};
