import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { DateRangePreset } from '../types';
import {
  formatCurrency,
  isDateInPreset,
  formatDateDisplay,
  roundMoney,
} from '../lib/calculations';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Download,
  Printer,
  MinusCircle,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { transactions, expenses, services, settings } = useData();

  // Date Range state
  const [preset, setPreset] = useState<DateRangePreset>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filtered transactions for the report period
  const periodTransactions = useMemo(() => {
    return transactions.filter((tx) =>
      isDateInPreset(tx.transactionDate, preset, customStart, customEnd)
    );
  }, [transactions, preset, customStart, customEnd]);

  // Filtered expenses for the period
  const periodExpenses = useMemo(() => {
    return expenses.filter((exp) =>
      isDateInPreset(exp.date, preset, customStart, customEnd)
    );
  }, [expenses, preset, customStart, customEnd]);

  // Financial aggregates
  const totalRevenue = useMemo(() => {
    return roundMoney(periodTransactions.reduce((acc, tx) => acc + (tx.total || 0), 0));
  }, [periodTransactions]);

  const totalExpenseAmount = useMemo(() => {
    return roundMoney(periodExpenses.reduce((acc, e) => acc + (e.amount || 0), 0));
  }, [periodExpenses]);

  const netProfit = roundMoney(totalRevenue - totalExpenseAmount);

  const transactionsCount = periodTransactions.length;

  const averageTransaction = transactionsCount > 0
    ? roundMoney(totalRevenue / transactionsCount)
    : 0;

  // Unique clients in period
  const uniqueClientsCount = useMemo(() => {
    const set = new Set<string>();
    periodTransactions.forEach((tx) => {
      if (tx.clientId) set.add(tx.clientId);
      else if (tx.clientName) set.add(tx.clientName.toLowerCase());
    });
    return set.size;
  }, [periodTransactions]);

  // Revenue by Service Breakdown
  const serviceBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; count: number }>();

    periodTransactions.forEach((tx) => {
      tx.items.forEach((item) => {
        const key = item.serviceName || 'Other';
        const existing = map.get(key) || { name: key, amount: 0, count: 0 };
        existing.amount = roundMoney(existing.amount + item.total);
        existing.count += item.quantity;
        map.set(key, existing);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [periodTransactions]);

  // Revenue by Payment Method
  const paymentMethodBreakdown = useMemo(() => {
    const map: Record<string, number> = {
      Cash: 0,
      Card: 0,
      'Bank Transfer': 0,
      Other: 0,
    };

    periodTransactions.forEach((tx) => {
      const m = tx.paymentMethod || 'Other';
      map[m] = roundMoney((map[m] || 0) + (tx.total || 0));
    });

    return [
      { method: 'Cash', amount: map['Cash'] || 0, icon: <Banknote className="w-4 h-4 text-emerald-600" /> },
      { method: 'Card', amount: map['Card'] || 0, icon: <CreditCard className="w-4 h-4 text-blue-600" /> },
      { method: 'Bank Transfer', amount: map['Bank Transfer'] || 0, icon: <ArrowRightLeft className="w-4 h-4 text-indigo-600" /> },
      { method: 'Other', amount: map['Other'] || 0, icon: <DollarSign className="w-4 h-4 text-slate-500" /> },
    ];
  }, [periodTransactions]);

  // Daily revenue breakdown ledger table
  const dailyBreakdown = useMemo(() => {
    const map = new Map<string, { date: string; amount: number; count: number }>();

    periodTransactions.forEach((tx) => {
      const dayKey = tx.transactionDate.split('T')[0];
      const existing = map.get(dayKey) || { date: dayKey, amount: 0, count: 0 };
      existing.amount = roundMoney(existing.amount + (tx.total || 0));
      existing.count += 1;
      map.set(dayKey, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [periodTransactions]);

  const presetLabels: { key: DateRangePreset; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'this_week', label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'this_year', label: 'This Year' },
    { key: 'custom', label: 'Custom Range' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated revenue analytics, category performance & net profit
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector Segmented Buttons */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {presetLabels.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPreset(p.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                preset === p.key
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-600 font-medium">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
            <span className="text-slate-600 font-medium">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Primary Revenue Summary (Section 9 & 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Revenue
          </span>
          <div className="text-2xl font-bold font-mono-numbers text-slate-950 mt-1">
            {formatCurrency(totalRevenue, settings.currency)}
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            {transactionsCount} sales recorded
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Transaction
          </span>
          <div className="text-2xl font-bold font-mono-numbers text-slate-950 mt-1">
            {formatCurrency(averageTransaction, settings.currency)}
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Average spending per ticket
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Expenses
          </span>
          <div className="text-2xl font-bold font-mono-numbers text-rose-600 mt-1">
            {formatCurrency(totalExpenseAmount, settings.currency)}
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            {periodExpenses.length} expense entries
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Net Profit
          </span>
          <div
            className={`text-2xl font-bold font-mono-numbers mt-1 ${
              netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netProfit, settings.currency)}
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Revenue minus expenses
          </span>
        </div>
      </div>

      {/* Revenue by Service & Payment Method Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue by Service</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Service rankings and contribution to gross income
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {serviceBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No service data recorded for this period.
              </p>
            ) : (
              serviceBreakdown.map((item) => {
                const percent = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono-numbers">
                          ({item.count} sold · {percent.toFixed(1)}%)
                        </span>
                        <span className="font-mono-numbers font-bold text-slate-950">
                          {formatCurrency(item.amount, settings.currency)}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-slate-800 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Revenue by Payment Method */}
        <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue by Payment Method</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown by cash, card, and electronic transfers
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {paymentMethodBreakdown.map((pm) => {
              const percent = totalRevenue > 0 ? (pm.amount / totalRevenue) * 100 : 0;

              return (
                <div
                  key={pm.method}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      {pm.icon}
                      <span>{pm.method}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono-numbers">
                        {percent.toFixed(1)}%
                      </span>
                      <span className="font-mono-numbers font-bold text-slate-950 text-sm">
                        {formatCurrency(pm.amount, settings.currency)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-slate-800 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue by Day Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Daily Revenue Ledger</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Day-by-day revenue receipts for the selected period
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-center">Transactions</th>
                <th className="py-2.5 px-4 text-right">Day Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    No transactions recorded in this period.
                  </td>
                </tr>
              ) : (
                dailyBreakdown.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono-numbers font-medium text-slate-800">
                      {formatDateDisplay(row.date)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono-numbers text-slate-600">
                      {row.count}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono-numbers font-bold text-slate-950">
                      {formatCurrency(row.amount, settings.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
