import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, User, Sparkles, CreditCard } from 'lucide-react';
import { useData } from '../context/DataContext';
import { PaymentMethod, Transaction } from '../types';
import { formatCurrency, roundMoney } from '../lib/calculations';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tx: Transaction) => void;
  initialClientId?: string;
  editTransaction?: Transaction | null;
}

interface LineItemDraft {
  serviceId: string;
  serviceName: string;
  unitPrice: number;
  quantity: number;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialClientId,
  editTransaction,
}) => {
  const { services, serviceCategories, clients, addTransaction, updateTransaction, settings } = useData();

  // Active services for selection
  const activeServices = services.filter((s) => s.active || (editTransaction && editTransaction.items.some((it) => it.serviceId === s.id)));

  // Form State
  const [clientInput, setClientInput] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [clientPhone, setClientPhone] = useState('');
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const [items, setItems] = useState<LineItemDraft[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [transactionDate, setTransactionDate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      setShowSuccessToast(false);
      if (editTransaction) {
        setClientInput(editTransaction.clientName);
        setSelectedClientId(editTransaction.clientId);
        setClientPhone(editTransaction.clientPhone || '');
        setItems(
          editTransaction.items.map((it) => ({
            serviceId: it.serviceId || '',
            serviceName: it.serviceName,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
          }))
        );
        setDiscount(editTransaction.discount);
        setPaymentMethod(editTransaction.paymentMethod);
        setTransactionDate(editTransaction.transactionDate.substring(0, 16));
        setNotes(editTransaction.notes || '');
      } else {
        // Default new transaction
        if (initialClientId) {
          const matched = clients.find((c) => c.id === initialClientId);
          if (matched) {
            setSelectedClientId(matched.id);
            setClientInput(matched.name);
            setClientPhone(matched.phone || '');
          }
        } else {
          setClientInput('');
          setSelectedClientId(undefined);
          setClientPhone('');
        }

        // Default with first active service if available
        const defaultService = activeServices[0];
        if (defaultService) {
          setItems([
            {
              serviceId: defaultService.id,
              serviceName: defaultService.name,
              unitPrice: defaultService.price,
              quantity: 1,
            },
          ]);
        } else {
          setItems([
            {
              serviceId: '',
              serviceName: '',
              unitPrice: 0,
              quantity: 1,
            },
          ]);
        }

        setDiscount(0);
        setPaymentMethod('Cash');
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setTransactionDate(now.toISOString().substring(0, 16));
        setNotes('');
      }
    }
  }, [isOpen, editTransaction, initialClientId]);

  if (!isOpen) return null;

  // Filter clients matching input
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
        ...next[index],
        serviceId: srv.id,
        serviceName: srv.name,
        unitPrice: srv.price, // Automatically loaded!
      };
      return next;
    });
  };

  const handleQuantityChange = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const newQty = Math.max(1, next[index].quantity + delta);
      next[index] = { ...next[index], quantity: newQty };
      return next;
    });
  };

  const handleQuantityInput = (index: number, val: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], quantity: Math.max(1, val || 1) };
      return next;
    });
  };

  const handleAddLineItem = () => {
    const defaultService = activeServices[0];
    if (defaultService) {
      setItems((prev) => [
        ...prev,
        {
          serviceId: defaultService.id,
          serviceName: defaultService.name,
          unitPrice: defaultService.price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveLineItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Subtotal & Total calculation
  const subtotal = roundMoney(
    items.reduce((acc, it) => acc + (it.unitPrice || 0) * (it.quantity || 1), 0)
  );
  const total = Math.max(0, roundMoney(subtotal - (discount || 0)));

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Ensure at least one valid item
    const validItems = items.filter((it) => it.serviceName.trim() && it.unitPrice >= 0);
    if (validItems.length === 0) {
      alert('Please select at least one valid service.');
      return;
    }

    const payloadDate = transactionDate ? new Date(transactionDate).toISOString() : new Date().toISOString();

    if (editTransaction) {
      updateTransaction(editTransaction.id, {
        clientName: clientInput.trim() || 'Walk-in Client',
        clientPhone: clientPhone.trim(),
        clientId: selectedClientId,
        items: validItems.map((it, idx) => ({
          id: editTransaction.items[idx]?.id || `item-edit-${idx}`,
          transactionId: editTransaction.id,
          serviceId: it.serviceId,
          serviceName: it.serviceName,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          total: roundMoney(it.unitPrice * it.quantity),
        })),
        discount: discount || 0,
        subtotal,
        total,
        paymentMethod,
        transactionDate: payloadDate,
        notes,
      });

      setShowSuccessToast(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      const savedTx = addTransaction({
        clientId: selectedClientId,
        clientName: clientInput.trim() || 'Walk-in Client',
        clientPhone: clientPhone.trim(),
        items: validItems,
        discount: discount || 0,
        paymentMethod,
        transactionDate: payloadDate,
        notes,
      });

      setShowSuccessToast(true);
      if (onSuccess) {
        onSuccess(savedTx);
      }
      setTimeout(() => {
        onClose();
      }, 650);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editTransaction ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <p className="text-xs text-slate-500">
              Fast payment recording with automatic revenue calculation
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {showSuccessToast && (
          <div className="bg-emerald-500 text-white px-6 py-3 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Transaction {editTransaction ? 'updated' : 'added'} successfully. Revenue updated.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Client Section */}
          <div className="space-y-1.5 relative">
            <label className="block text-xs font-semibold text-slate-700">
              Client Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type existing client name or enter new..."
                value={clientInput}
                onChange={(e) => {
                  setClientInput(e.target.value);
                  setSelectedClientId(undefined);
                  setClientDropdownOpen(true);
                }}
                onFocus={() => setClientDropdownOpen(true)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
              />
              {selectedClientId && (
                <span className="absolute right-3 top-2.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Existing Client
                </span>
              )}
            </div>

            {/* Client Autocomplete Suggestions */}
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
                      <span className="font-medium text-slate-800">{client.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono-numbers">{client.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Optional Phone if client is new */}
          {!selectedClientId && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-600">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g. 21 345 678"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
          )}

          {/* Services & Items Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Services & Items
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs font-medium text-slate-700 hover:text-slate-950 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add another service
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    {/* Service Selector with categories, or manual entry if catalog is empty */}
                    <div className="flex-1">
                      {activeServices.length === 0 ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter service name (e.g. Haircut)"
                            value={item.serviceName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItems((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], serviceName: val };
                                return next;
                              });
                            }}
                            className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-800 text-slate-800"
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
                            className="w-24 px-2 py-1.5 text-xs font-mono-numbers font-semibold bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-800 text-slate-800"
                          />
                        </div>
                      ) : (
                        <select
                          value={item.serviceId}
                          onChange={(e) => handleServiceChange(idx, e.target.value)}
                          className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-800 text-slate-800"
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
                    <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, -1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityInput(idx, parseInt(e.target.value, 10))}
                        className="w-10 text-center text-xs font-mono-numbers font-medium focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="w-24 text-right font-mono-numbers text-xs font-bold text-slate-900 shrink-0">
                      {formatCurrency(roundMoney(item.unitPrice * item.quantity), settings.currency)}
                    </div>

                    {/* Remove button if multiple items */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between px-1">
                    <span>
                      Unit Price: <span className="font-mono-numbers font-medium text-slate-700">{item.unitPrice} {settings.currency}</span>
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
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount ({settings.currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={discount === 0 ? '' : discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-xs font-mono-numbers bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Date & Notes (Expandable / Clean) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono-numbers bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Special requests or payment note"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          {/* Automatic Calculation Summary as specified in Section 4 */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1.5">
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
            <div className="pt-2 border-t border-slate-700/80 flex justify-between items-baseline">
              <span className="text-sm font-semibold tracking-wide uppercase text-slate-200">Total:</span>
              <span className="text-xl font-bold font-mono-numbers text-emerald-400">
                {formatCurrency(total, settings.currency)}
              </span>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <span className="text-[11px] text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">Enter</kbd> to save
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{editTransaction ? 'Update Transaction' : 'Save Transaction'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
