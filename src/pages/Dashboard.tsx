import React from 'react';
import { useData } from '../context/DataContext';
import { DashboardCard } from '../components/DashboardCard';
import { IncomeChart } from '../components/IncomeChart';
import { TodayTransactionsTable } from '../components/TodayTransactionsTable';
import { formatCurrency } from '../lib/calculations';
import { Transaction } from '../types';
import { DollarSign, Calendar, TrendingUp, Receipt, Users, PlusCircle } from 'lucide-react';

interface DashboardProps {
  onOpenNewTransaction: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewTransaction,
  onSelectTransaction,
  onNavigateTab,
}) => {
  const {
    todayIncome,
    thisMonthIncome,
    thisYearIncome,
    totalTransactionsCount,
    totalClientsCount,
    todayTransactions,
    settings,
  } = useData();

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb area with primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Business Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated financial metrics and daily income ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>+ Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Clean Slate Quick Actions Banner */}
      {totalTransactionsCount === 0 && (
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900">Clean Slate Initialized</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              All data has been cleared and reset. Add your services or start recording transactions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('services')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              Configure Services
            </button>
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              + Record Payment
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Today's Income"
          value={formatCurrency(todayIncome, settings.currency)}
          subtitle={`${todayTransactions.length} sales today`}
          trend={{ text: 'Live Feed', isPositive: true }}
          icon={<DollarSign className="w-4 h-4" />}
          onClick={onOpenNewTransaction}
        />

        <DashboardCard
          title="This Month"
          value={formatCurrency(thisMonthIncome, settings.currency)}
          subtitle="Current calendar month"
          icon={<Calendar className="w-4 h-4" />}
          onClick={() => onNavigateTab('reports')}
        />

        <DashboardCard
          title="This Year"
          value={formatCurrency(thisYearIncome, settings.currency)}
          subtitle="Cumulative yearly"
          icon={<TrendingUp className="w-4 h-4" />}
          onClick={() => onNavigateTab('reports')}
        />

        <DashboardCard
          title="Transactions"
          value={totalTransactionsCount.toLocaleString()}
          subtitle="Total recorded tickets"
          icon={<Receipt className="w-4 h-4" />}
          onClick={() => onNavigateTab('transactions')}
        />

        <DashboardCard
          title="Clients"
          value={totalClientsCount.toLocaleString()}
          subtitle="Registered customer base"
          icon={<Users className="w-4 h-4" />}
          onClick={() => onNavigateTab('clients')}
        />
      </div>

      {/* Main Charts & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <IncomeChart />
        </div>

        <div className="lg:col-span-5">
          <TodayTransactionsTable
            onSelectTransaction={onSelectTransaction}
            onAddNew={onOpenNewTransaction}
          />
        </div>
      </div>
    </div>
  );
};
