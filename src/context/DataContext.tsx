import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Service,
  ServiceCategory,
  Client,
  Transaction,
  TransactionItem,
  Expense,
  BusinessSettings,
  PaymentMethod,
  ChartTimeframe,
} from '../types';
import {
  initialCategories,
  initialServices,
  initialClients,
  initialSettings,
  generateSeedTransactions,
  initialExpenses,
  defaultCleanSettings,
  starterCategories,
} from '../data/seedData';
import { roundMoney, isDateInPreset } from '../lib/calculations';

interface NewTransactionInput {
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  items: Array<{
    serviceId?: string;
    serviceName: string;
    unitPrice: number;
    quantity: number;
  }>;
  discount: number;
  paymentMethod: PaymentMethod;
  transactionDate?: string;
  notes?: string;
}

interface DataContextType {
  services: Service[];
  serviceCategories: ServiceCategory[];
  clients: Client[];
  transactions: Transaction[];
  expenses: Expense[];
  settings: BusinessSettings;

  // Computed metrics
  todayIncome: number;
  thisMonthIncome: number;
  thisYearIncome: number;
  todayTransactions: Transaction[];
  todayTotal: number;
  totalTransactionsCount: number;
  totalClientsCount: number;
  averageTransaction: number;

  // Client computed stats
  getClientStats: (clientId: string) => {
    visitsCount: number;
    totalSpent: number;
    lastVisit: string | null;
    transactions: Transaction[];
  };

  // Actions
  addTransaction: (input: NewTransactionInput) => Transaction;
  updateTransaction: (id: string, input: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addService: (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Service;
  updateService: (id: string, data: Partial<Service>) => void;
  toggleServiceActive: (id: string) => void;
  deleteService: (id: string) => void;

  addCategory: (name: string) => ServiceCategory;
  deleteCategory: (id: string) => void;

  addClient: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  updateSettings: (data: Partial<BusinessSettings>) => void;
  clearAllData: () => void;
  resetToDemoData: () => void;
  loadStarterCategories: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;

  // Chart aggregation helper
  getChartData: (timeframe: ChartTimeframe) => Array<{ label: string; amount: number; count: number }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SERVICES: 'incomeflow_v2_services',
  CATEGORIES: 'incomeflow_v2_categories',
  CLIENTS: 'incomeflow_v2_clients',
  TRANSACTIONS: 'incomeflow_v2_transactions',
  EXPENSES: 'incomeflow_v2_expenses',
  SETTINGS: 'incomeflow_v2_settings',
};

// Immediately clean up legacy v1 storage if exists
if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'incomeflow_services_v1',
      'incomeflow_categories_v1',
      'incomeflow_clients_v1',
      'incomeflow_transactions_v1',
      'incomeflow_expenses_v1',
      'incomeflow_settings_v1',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore storage issues in test/SSR
  }
}

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial clean states from localStorage (defaults to completely empty and clean)
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : defaultCleanSettings;
    } catch {
      return defaultCleanSettings;
    }
  });

  // Persist whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(serviceCategories));
  }, [serviceCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Real-time calculations
  const todayTransactions = useMemo(() => {
    return transactions.filter((tx) => isDateInPreset(tx.transactionDate, 'today'));
  }, [transactions]);

  const todayIncome = useMemo(() => {
    return roundMoney(todayTransactions.reduce((acc, tx) => acc + (tx.total || 0), 0));
  }, [todayTransactions]);

  const todayTotal = todayIncome;

  const thisMonthIncome = useMemo(() => {
    const monthTxs = transactions.filter((tx) => isDateInPreset(tx.transactionDate, 'this_month'));
    return roundMoney(monthTxs.reduce((acc, tx) => acc + (tx.total || 0), 0));
  }, [transactions]);

  const thisYearIncome = useMemo(() => {
    const yearTxs = transactions.filter((tx) => isDateInPreset(tx.transactionDate, 'this_year'));
    return roundMoney(yearTxs.reduce((acc, tx) => acc + (tx.total || 0), 0));
  }, [transactions]);

  const totalTransactionsCount = transactions.length;
  const totalClientsCount = clients.length;

  const averageTransaction = useMemo(() => {
    if (transactions.length === 0) return 0;
    const totalAll = transactions.reduce((acc, tx) => acc + (tx.total || 0), 0);
    return roundMoney(totalAll / transactions.length);
  }, [transactions]);

  // Client stats helper
  const getClientStats = (clientId: string) => {
    const clientTxs = transactions.filter(
      (tx) => tx.clientId === clientId || (tx.clientName && tx.clientName.toLowerCase() === clientId.toLowerCase())
    );
    const totalSpent = roundMoney(clientTxs.reduce((acc, tx) => acc + (tx.total || 0), 0));
    const sorted = [...clientTxs].sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );
    const lastVisit = sorted.length > 0 ? sorted[0].transactionDate : null;

    return {
      visitsCount: clientTxs.length,
      totalSpent,
      lastVisit,
      transactions: sorted,
    };
  };

  // Transaction creation
  const addTransaction = (input: NewTransactionInput): Transaction => {
    const nowIso = input.transactionDate || new Date().toISOString();
    
    // Check or auto-register client if new name entered
    let assignedClientId = input.clientId;
    if (!assignedClientId && input.clientName.trim()) {
      const trimmed = input.clientName.trim();
      const existing = clients.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (existing) {
        assignedClientId = existing.id;
      } else {
        const newClient: Client = {
          id: `cl-${Date.now()}`,
          name: trimmed,
          phone: input.clientPhone?.trim() || '',
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        setClients((prev) => [newClient, ...prev]);
        assignedClientId = newClient.id;
      }
    }

    const txIdNumber = transactions.length > 0
      ? Math.max(...transactions.map((t) => parseInt(t.id.replace(/\D/g, '') || '1000', 10)), 1053) + 1
      : 1001;
    const txId = `TX-${txIdNumber}`;

    const items: TransactionItem[] = input.items.map((item, idx) => ({
      id: `item-${txIdNumber}-${idx + 1}`,
      transactionId: txId,
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      unitPrice: roundMoney(item.unitPrice),
      quantity: Math.max(1, item.quantity),
      total: roundMoney(item.unitPrice * item.quantity),
    }));

    const subtotal = roundMoney(items.reduce((acc, it) => acc + it.total, 0));
    const discount = Math.max(0, roundMoney(input.discount || 0));
    const total = Math.max(0, roundMoney(subtotal - discount));

    const newTx: Transaction = {
      id: txId,
      clientId: assignedClientId,
      clientName: input.clientName.trim() || 'Walk-in Client',
      clientPhone: input.clientPhone?.trim(),
      items,
      subtotal,
      discount,
      total,
      paymentMethod: input.paymentMethod,
      transactionDate: nowIso,
      notes: input.notes?.trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update client updatedAt
    if (assignedClientId) {
      setClients((prev) =>
        prev.map((c) => (c.id === assignedClientId ? { ...c, updatedAt: nowIso } : c))
      );
    }

    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== id) return tx;
        const updated = {
          ...tx,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        if (updates.items) {
          const subtotal = roundMoney(updates.items.reduce((acc, it) => acc + it.total, 0));
          const discount = updates.discount !== undefined ? updates.discount : tx.discount;
          updated.subtotal = subtotal;
          updated.total = Math.max(0, roundMoney(subtotal - discount));
        }
        return updated;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // Service Management
  const addService = (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service => {
    const newService: Service = {
      ...data,
      id: `srv-${Date.now()}`,
      price: roundMoney(data.price),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setServices((prev) => [...prev, newService]);
    return newService;
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              ...data,
              price: data.price !== undefined ? roundMoney(data.price) : s.price,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );
  };

  const toggleServiceActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active, updatedAt: new Date().toISOString() } : s))
    );
  };

  const deleteService = (id: string) => {
    // Permanent deletion or deactivation
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Category Management
  const addCategory = (name: string): ServiceCategory => {
    const newCat: ServiceCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setServiceCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const deleteCategory = (id: string) => {
    setServiceCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Client Management
  const addClient = (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
    const newClient: Client = {
      ...data,
      id: `cl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Expenses Management
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      amount: roundMoney(data.amount),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = (id: string, data: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...data,
              amount: data.amount !== undefined ? roundMoney(data.amount) : e.amount,
            }
          : e
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateSettings = (data: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
  };

  const clearAllData = () => {
    setServiceCategories([]);
    setServices([]);
    setClients([]);
    setTransactions([]);
    setExpenses([]);
    setSettings(defaultCleanSettings);

    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultCleanSettings));

      const legacyKeys = [
        'incomeflow_services_v1',
        'incomeflow_categories_v1',
        'incomeflow_clients_v1',
        'incomeflow_transactions_v1',
        'incomeflow_expenses_v1',
        'incomeflow_settings_v1',
      ];
      legacyKeys.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  };

  const loadStarterCategories = () => {
    setServiceCategories(starterCategories);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(starterCategories));
  };

  const resetToDemoData = () => {
    const freshTransactions = generateSeedTransactions();
    setServiceCategories(initialCategories);
    setServices(initialServices);
    setClients(initialClients);
    setTransactions(freshTransactions);
    setExpenses(initialExpenses);
    setSettings(initialSettings);

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(initialServices));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initialClients));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(freshTransactions));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
  };

  const exportData = (): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      serviceCategories,
      services,
      clients,
      transactions,
      expenses,
      settings,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.services && data.transactions) {
        if (data.serviceCategories) setServiceCategories(data.serviceCategories);
        if (data.services) setServices(data.services);
        if (data.clients) setClients(data.clients);
        if (data.transactions) setTransactions(data.transactions);
        if (data.expenses) setExpenses(data.expenses);
        if (data.settings) setSettings(data.settings);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  };

  // Helper for Chart timeframes: Daily, Weekly, Monthly, Yearly
  const getChartData = (timeframe: ChartTimeframe) => {
    const now = new Date();
    const result: Array<{ label: string; amount: number; count: number }> = [];

    if (timeframe === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;

        const dayTxs = transactions.filter((tx) => {
          const tTime = new Date(tx.transactionDate).getTime();
          return tTime >= dayStart && tTime <= dayEnd;
        });

        const dayTotal = roundMoney(dayTxs.reduce((sum, tx) => sum + (tx.total || 0), 0));
        const label = i === 0 ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
        result.push({ label, amount: dayTotal, count: dayTxs.length });
      }
    } else if (timeframe === 'weekly') {
      // Last 6 weeks
      for (let w = 5; w >= 0; w--) {
        const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
        const weekStart = new Date(weekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
        weekStart.setHours(0, 0, 0, 0);
        weekEnd.setHours(23, 59, 59, 999);

        const wTxs = transactions.filter((tx) => {
          const tTime = new Date(tx.transactionDate).getTime();
          return tTime >= weekStart.getTime() && tTime <= weekEnd.getTime();
        });

        const wTotal = roundMoney(wTxs.reduce((sum, tx) => sum + (tx.total || 0), 0));
        const label = `Wk ${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
        result.push({ label, amount: wTotal, count: wTxs.length });
      }
    } else if (timeframe === 'monthly') {
      // 12 months of current year
      const year = now.getFullYear();
      for (let m = 0; m < 12; m++) {
        const mTxs = transactions.filter((tx) => {
          const t = new Date(tx.transactionDate);
          return t.getFullYear() === year && t.getMonth() === m;
        });
        const mTotal = roundMoney(mTxs.reduce((sum, tx) => sum + (tx.total || 0), 0));
        const monthName = new Date(year, m, 1).toLocaleDateString('en-GB', { month: 'short' });
        result.push({ label: monthName, amount: mTotal, count: mTxs.length });
      }
    } else if (timeframe === 'yearly') {
      // Past 5 years
      const currentYear = now.getFullYear();
      for (let y = currentYear - 4; y <= currentYear; y++) {
        const yTxs = transactions.filter((tx) => {
          const t = new Date(tx.transactionDate);
          return t.getFullYear() === y;
        });
        const yTotal = roundMoney(yTxs.reduce((sum, tx) => sum + (tx.total || 0), 0));
        result.push({ label: `${y}`, amount: yTotal, count: yTxs.length });
      }
    }

    return result;
  };

  return (
    <DataContext.Provider
      value={{
        services,
        serviceCategories,
        clients,
        transactions,
        expenses,
        settings,
        todayIncome,
        thisMonthIncome,
        thisYearIncome,
        todayTransactions,
        todayTotal,
        totalTransactionsCount,
        totalClientsCount,
        averageTransaction,
        getClientStats,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addService,
        updateService,
        toggleServiceActive,
        deleteService,
        addCategory,
        deleteCategory,
        addClient,
        updateClient,
        deleteClient,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        clearAllData,
        resetToDemoData,
        loadStarterCategories,
        exportData,
        importData,
        getChartData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
