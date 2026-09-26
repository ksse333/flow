import React from 'react';
import { ActiveNavTab } from '../types';
import { Plus, LayoutDashboard, Receipt, Tag, Users, BarChart3, Wallet, Settings, Menu, X } from 'lucide-react';
import { useData } from '../context/DataContext';

interface NavigationProps {
  currentTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onOpenNewTransaction: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTransaction,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { settings } = useData();

  const navLinks: { tab: ActiveNavTab; label: string }[] = [
    { tab: 'dashboard', label: 'Dashboard' },
    { tab: 'transactions', label: 'Transactions' },
    { tab: 'services', label: 'Services' },
    { tab: 'clients', label: 'Clients' },
    { tab: 'reports', label: 'Reports' },
    { tab: 'expenses', label: 'Expenses' },
    { tab: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-md"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('dashboard');
            }}
            className="text-lg font-bold tracking-tight text-slate-950 font-sans hover:opacity-90 transition-opacity"
          >
            {settings.businessName || 'IncomeFlow'}
          </a>
        </div>

        {/* Zone 2: 4-7 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.tab}
              type="button"
              onClick={() => onSelectTab(link.tab)}
              className={`hover:text-slate-950 transition-colors py-1 relative whitespace-nowrap ${
                currentTab === link.tab
                  ? 'text-slate-950 font-bold border-b-2 border-slate-950'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.tab}
              type="button"
              onClick={() => {
                onSelectTab(link.tab);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-between ${
                currentTab === link.tab
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
