export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';

export interface ServiceCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  serviceId?: string;
  serviceName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Transaction {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  transactionDate: string; // ISO date-time string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Supplies'
  | 'Equipment'
  | 'Salaries'
  | 'Marketing'
  | 'Other';

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  currency: string;
  phone: string;
  email: string;
  address: string;
  receiptFooter: string;
  taxRate: number; // percentage, default 0
}

export type ChartTimeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export type ActiveNavTab =
  | 'dashboard'
  | 'new_transaction'
  | 'transactions'
  | 'services'
  | 'clients'
  | 'reports'
  | 'expenses'
  | 'settings';
