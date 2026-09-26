/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { ActiveNavTab, Transaction, Client } from './types';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/Transactions';
import { ServicesPage } from './pages/Services';
import { ClientsPage } from './pages/Clients';
import { ReportsPage } from './pages/Reports';
import { ExpensesPage } from './pages/Expenses';
import { SettingsPage } from './pages/Settings';
import { NewTransactionPage } from './pages/NewTransactionPage';
import { TransactionFormModal } from './components/TransactionFormModal';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { ReceiptModal } from './components/ReceiptModal';

function AppContent() {
  const { settings } = useData();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<ActiveNavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransactionDetails, setSelectedTransactionDetails] = useState<Transaction | null>(null);
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const [initialClientIdForNewTx, setInitialClientIdForNewTx] = useState<string | undefined>(undefined);

  // Keyboard shortcut: Alt + N opens new transaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || (e.metaKey && e.shiftKey)) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setEditingTransaction(null);
        setInitialClientIdForNewTx(undefined);
        setNewTransactionModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewTransaction = (clientId?: string) => {
    setEditingTransaction(null);
    setInitialClientIdForNewTx(clientId);
    setNewTransactionModalOpen(true);
  };

  const handleSelectTransaction = (tx: Transaction) => {
    setSelectedTransactionDetails(tx);
  };

  const handlePrintReceipt = (tx: Transaction) => {
    setReceiptTransaction(tx);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setNewTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation Bar complying with Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewTransaction={() => handleOpenNewTransaction()}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            onOpenNewTransaction={() => handleOpenNewTransaction()}
            onSelectTransaction={handleSelectTransaction}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'new_transaction' && (
          <NewTransactionPage
            onTransactionSaved={(tx) => {
              // Stay on page with success or jump to dashboard
            }}
            onPrintReceipt={handlePrintReceipt}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsPage
            onSelectTransaction={handleSelectTransaction}
            onOpenNewTransaction={() => handleOpenNewTransaction()}
          />
        )}

        {currentTab === 'services' && <ServicesPage />}

        {currentTab === 'clients' && (
          <ClientsPage
            onSelectTransaction={handleSelectTransaction}
            onOpenNewTransactionWithClient={(client) => handleOpenNewTransaction(client.id)}
          />
        )}

        {currentTab === 'reports' && <ReportsPage />}

        {currentTab === 'expenses' && <ExpensesPage />}

        {currentTab === 'settings' && <SettingsPage />}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-800">{settings.businessName}</span>
            <span className="mx-2">·</span>
            <span>Business Income & Revenue Management</span>
          </div>
          <div className="text-slate-400">
            Automated calculations in {settings.currency} · All data stored locally and securely
          </div>
        </div>
      </footer>

      {/* Global Quick New / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={newTransactionModalOpen}
        onClose={() => {
          setNewTransactionModalOpen(false);
          setEditingTransaction(null);
          setInitialClientIdForNewTx(undefined);
        }}
        onSuccess={(tx) => {
          // Open receipt optionally if desired
        }}
        initialClientId={initialClientIdForNewTx}
        editTransaction={editingTransaction}
      />

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={Boolean(selectedTransactionDetails)}
        transaction={selectedTransactionDetails}
        onClose={() => setSelectedTransactionDetails(null)}
        onPrintReceipt={handlePrintReceipt}
        onEditTransaction={handleEditTransaction}
      />

      {/* Printable Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(receiptTransaction)}
        transaction={receiptTransaction}
        settings={settings}
        onClose={() => setReceiptTransaction(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
