import { Transaction, Expense, DateRangeFilter } from '../types';

export function formatCurrency(amount: number, currency: string = 'DT'): string {
  const formatted = new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function parseDateOnly(dateString: string): string {
  if (!dateString) return '';
  return dateString.split('T')[0];
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(isoString: string): string {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateDisplay(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTimeDisplay(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  const dateStr = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dateStr} · ${timeStr}`;
}

export function isDateInPreset(dateStr: string, preset: DateRangeFilter['preset'], customStart?: string, customEnd?: string): boolean {
  const target = new Date(dateStr);
  const now = new Date();
  
  // Normalize dates to start of day
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  switch (preset) {
    case 'today':
      return targetDay === todayStart;

    case 'yesterday':
      return targetDay === todayStart - oneDayMs;

    case 'this_week': {
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const diffToMonday = (dayOfWeek + 6) % 7;
      const monday = todayStart - diffToMonday * oneDayMs;
      const sunday = monday + 6 * oneDayMs;
      return targetDay >= monday && targetDay <= sunday;
    }

    case 'this_month': {
      return target.getFullYear() === now.getFullYear() && target.getMonth() === now.getMonth();
    }

    case 'last_month': {
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      return target.getFullYear() === lastMonthYear && target.getMonth() === lastMonth;
    }

    case 'this_year': {
      return target.getFullYear() === now.getFullYear();
    }

    case 'custom': {
      if (!customStart || !customEnd) return true;
      const start = new Date(customStart + 'T00:00:00').getTime();
      const end = new Date(customEnd + 'T23:59:59').getTime();
      const targetTime = target.getTime();
      return targetTime >= start && targetTime <= end;
    }

    default:
      return true;
  }
}

export function filterTransactionsByRange(transactions: Transaction[], range: DateRangeFilter): Transaction[] {
  return transactions.filter((tx) =>
    isDateInPreset(tx.transactionDate, range.preset, range.startDate, range.endDate)
  );
}

export function filterExpensesByRange(expenses: Expense[], range: DateRangeFilter): Expense[] {
  return expenses.filter((exp) =>
    isDateInPreset(exp.date, range.preset, range.startDate, range.endDate)
  );
}
