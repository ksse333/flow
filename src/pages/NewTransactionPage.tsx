import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PaymentMethod, Transaction } from '../types';
import { formatCurrency, roundMoney } from '../lib/calculations';
import { CheckCircle2, Plus, Trash2, User, Printer } from 'lucide-react';

interface NewTransactionPageProps {
  onTransactionSaved: (tx: Transaction) => void;
  onPrintReceipt: (tx: Transaction) => void;
}

export const NewTransactionPage: React.FC<NewTransactionPageProps> = ({
  onTransactionSaved,
  onPrintReceipt,
}) => {
  const { services, serviceCategories, clients, addTransaction, settings } = useData();

  const activeServices = services.filter((s) => s.active);

  // Form State
  const [clientInput, setClientInput] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [clientPhone, setClientPhone] = useState('');
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  // Default first line item
  const [items, setItems] = useState<
    Array<{ serviceId: string; serviceName: string; unitPrice: number; quantity: number }>
  >(() => {
    const first = activeServices[0];
    return [
      {
        serviceId: first?.id || '',
        serviceName: first?.name || '',
        unitPrice: first?.price || 0,
        quantity: 1,
      },
    ];
  });

  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');

  // Post-submit state
  const [savedTx, setSavedTx] = useState<Transaction | null>(null);

  // Autocomplete suggestions
  const filteredClients = clientInput.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientInput.toLowerCase()) ||
          c.phone.includes(clientInput.trim())
      )
    : clients.slice(0, 5);

  const handleSelectClient = (c: typeof clients[0]) => {
    setSelectedClientId(c.id);
    setClientInput(c.name);
    setClientPhone(c.phone || '');
    setClientDropdownOpen(false);
  };

  const handleServiceChange = (index: number, serviceId: string) => {
    const srv = services.find((s) => s.id === serviceId);
    if (!srv) return;

    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        serviceId: srv.id,
        serviceName: srv.name,
        unitPrice: srv.price, // Automatically loaded!
        quantity: next[index].quantity || 1,
      };
      return next;
    });
  };

  const handleQuantityChange = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        quantity: Math.max(1, next[index].quantity + delta),
      };
      return next;
    });
  };

  const handleAddLineItem = () => {
    const defaultSrv = activeServices[0];
    if (defaultSrv) {
      setItems((prev) => [
        ...prev,
        {
          serviceId: defaultSrv.id,
          serviceName: defaultSrv.name,
          unitPrice: defaultSrv.price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveLineItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Math
  const subtotal = roundMoney(
    items.reduce((acc, it) => acc + (it.unitPrice || 0) * (it.quantity || 1), 0)
  );
  const total = Math.max(0, roundMoney(subtotal - (discount || 0)));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter((it) => it.serviceName && it.unitPrice >= 0);
    if (validItems.length === 0) {
      alert('Please select at least one service.');
      return;
    }

    const tx = addTransaction({
      clientId: selectedClientId,
      clientName: clientInput.trim() || 'Walk-in Client',
      clientPhone: clientPhone.trim(),
      items: validItems,
      discount: discount || 0,
      paymentMethod,
      notes,
    });

    setSavedTx(tx);
    onTransactionSaved(tx);

    // Reset for next sale
    setClientInput('');
    setSelectedClientId(undefined);
    setClientPhone('');
    setDiscount(0);
    setNotes('');
    const first = activeServices[0];
    setItems([
      {
        serviceId: first?.id || '',
        serviceName: first?.name || '',
        unitPrice: first?.price || 0,
        quantity: 1,
      },
    ]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950">
          New Transaction
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast checkout counter: record customer payments with automatic revenue calculations
        </p>
      </div>

      {/* Success Notification Alert */}
      {savedTx && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                Transaction {savedTx.id} added successfully.
              </span>
              <span className="text-xs text-emerald-700">
                Dashboard totals updated immediately ({formatCurrency(savedTx.total, settings.currency)} · {savedTx.clientName}).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onPrintReceipt(savedTx)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={() => setSavedTx(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Checkout Form Container */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        {/* Client Section */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs font-semibold text-slate-700">
            Client Name
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search existing client or enter new name..."
              value={clientInput}
              onChange={(e) => {
                setClientInput(e.target.value);
                setSelectedClientId(undefined);
                setClientDropdownOpen(true);
              }}
              onFocus={() => setClientDropdownOpen(true)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 font-medium"
            />
            {selectedClientId && (
              <span className="absolute right-3 top-3 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Existing Client
              </span>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {clientDropdownOpen && filteredClients.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelectClient(client)}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{client.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono-numbers">{client.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Client Phone if new */}
        {!selectedClientId && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="e.g. 21 345 678"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
            />
          </div>
        )}

        {/* Services Selection Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Service
            </label>
            <button
              type="button"
              onClick={handleAddLineItem}
              className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another service
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  {/* Service dropdown with categories, or direct entry if catalog is empty */}
                  <div className="flex-1">
                    {activeServices.length === 0 ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Service Name (e.g. Haircut)"
                          value={item.serviceName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], serviceName: val };
                              return next;
                            });
                          }}
                          className="flex-1 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                        />
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder={`Price (${settings.currency})`}
                          value={item.unitPrice === 0 && !item.serviceName ? '' : item.unitPrice}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setItems((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], unitPrice: val };
                              return next;
                            });
                          }}
                          className="w-28 px-3 py-2 text-xs font-mono-numbers font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                        />
                      </div>
                    ) : (
                      <select
                        value={item.serviceId}
                        onChange={(e) => handleServiceChange(idx, e.target.value)}
                        className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                      >
                        <option value="" disabled>
                          Select Service...
                        </option>
                        {serviceCategories.map((cat) => {
                          const catServices = activeServices.filter((s) => s.categoryId === cat.id);
                          if (catServices.length === 0) return null;
                          return (
                            <optgroup key={cat.id} label={cat.name}>
                              {catServices.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.price} {settings.currency})
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, -1)}
                      className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-9 text-center text-xs font-mono-numbers font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, 1)}
                      className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="w-24 text-right font-mono-numbers text-sm font-bold text-slate-950 shrink-0">
                    {formatCurrency(roundMoney(item.unitPrice * item.quantity), settings.currency)}
                  </div>

                  {/* Remove line */}
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Price feedback */}
                <div className="text-[11px] text-slate-500 flex justify-between px-1">
                  <span>
                    Price: <span className="font-mono-numbers font-medium text-slate-700">{item.unitPrice} {settings.currency}</span>
                  </span>
                  <span>
                    {item.serviceName} × {item.quantity} = {item.unitPrice * item.quantity} {settings.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Discount
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0 DT"
                value={discount === 0 ? '' : discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">
                {settings.currency}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="Special instructions or voucher note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
          />
        </div>

        {/* Total Calculation Display (as specified in Section 4) */}
        <div className="bg-slate-900 text-white p-5 rounded-xl space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Subtotal:</span>
            <span className="font-mono-numbers">{formatCurrency(subtotal, settings.currency)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-300">
            <span>Discount:</span>
            <span className="font-mono-numbers">
              {discount > 0 ? `-${formatCurrency(discount, settings.currency)}` : `0 ${settings.currency}`}
            </span>
          </div>
          <div className="pt-2.5 border-t border-slate-700/80 flex justify-between items-baseline">
            <span className="text-sm font-bold tracking-wide uppercase text-slate-200">
              Total:
            </span>
            <span className="text-2xl font-bold font-mono-numbers text-emerald-400">
              {formatCurrency(total, settings.currency)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold text-white bg-slate-950 hover:bg-slate-900 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Save Transaction</span>
          </button>
        </div>
      </form>
    </div>
  );
};
