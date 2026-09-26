import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Expense, ExpenseCategory } from '../types';
import { formatCurrency, formatDateDisplay, getTodayString } from '../lib/calculations';
import { Plus, Trash2, Edit2, DollarSign, Calendar, Tag, X, Filter } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, settings } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Supplies');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');

  // Filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const categories: ExpenseCategory[] = [
    'Rent',
    'Electricity',
    'Supplies',
    'Equipment',
    'Salaries',
    'Marketing',
    'Other',
  ];

  const openNewExpenseModal = () => {
    setEditingExpense(null);
    setName('');
    setCategory('Supplies');
    setAmount('');
    setDate(getTodayString());
    setNotes('');
    setModalOpen(true);
  };

  const openEditExpenseModal = (exp: Expense) => {
    setEditingExpense(exp);
    setName(exp.name);
    setCategory(exp.category);
    setAmount(exp.amount);
    setDate(exp.date);
    setNotes(exp.notes || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount === '') return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        name: name.trim(),
        category,
        amount: Number(amount),
        date,
        notes: notes.trim(),
      });
    } else {
      addExpense({
        name: name.trim(),
        category,
        amount: Number(amount),
        date,
        notes: notes.trim(),
      });
    }

    setModalOpen(false);
  };

  const filteredExpenses = expenses.filter((e) => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    return true;
  });

  const totalExpenseSum = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Business Expenses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log overhead, supplies, rent, and utility costs to compute net business profit
          </p>
        </div>

        <button
          type="button"
          onClick={openNewExpenseModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expense Categories Filter & Total Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-600 flex items-baseline gap-2">
          <span>Total Filtered:</span>
          <span className="text-base font-bold font-mono-numbers text-rose-600">
            {formatCurrency(totalExpenseSum, settings.currency)}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {expenses.length === 0 ? 'No expenses recorded yet' : 'No expenses in this category'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {expenses.length === 0
                          ? 'Track business costs like rent, utilities, and inventory to calculate net profit.'
                          : 'Try selecting a different category or choose All Categories.'}
                      </p>
                      {expenses.length === 0 && (
                        <button
                          type="button"
                          onClick={openNewExpenseModal}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          + Log First Expense
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono-numbers text-slate-600 whitespace-nowrap">
                      {formatDateDisplay(exp.date)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {exp.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {exp.category}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {exp.notes || '--'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-numbers font-bold text-rose-600 whitespace-nowrap">
                      -{formatCurrency(exp.amount, settings.currency)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditExpenseModal(exp)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseToDelete(exp)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900">
                {editingExpense ? 'Edit Expense' : 'Log New Expense'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Rent, Pomades Wholesale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ({settings.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Invoice number or supplier notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  {editingExpense ? 'Save Changes' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        title="Delete Expense"
        message={`Are you sure you want to delete ${expenseToDelete?.name} (${formatCurrency(expenseToDelete?.amount || 0, settings.currency)})?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
