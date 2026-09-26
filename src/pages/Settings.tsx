import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Save, RotateCcw, Download, Upload, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, clearAllData, resetToDemoData, exportData, importData } = useData();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [currency, setCurrency] = useState(settings.currency);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedMessage, setSavedMessage] = useState('Business settings saved successfully.');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: businessName.trim(),
      currency: currency.trim() || 'DT',
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      receiptFooter: receiptFooter.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incomeflow_backup_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportStatus('Database successfully restored!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Invalid backup file format.');
        setTimeout(() => setImportStatus(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950">
          System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business profile, currency symbol, receipt layouts, and local database backups
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Business settings saved successfully.</span>
        </div>
      )}

      {importStatus && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 text-xs font-semibold ${
            importStatus.includes('success')
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {importStatus.includes('success') ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{importStatus}</span>
        </div>
      )}

      {/* Business Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Business Profile & Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            This information appears on printed receipts and customer checkout screens
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business / Store Name
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Currency Symbol
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-24 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 font-mono-numbers font-bold"
              />
              {/* Quick Currency Selectors */}
              <div className="flex items-center gap-1">
                {['DT', '$', '€', '£', 'MAD'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-2 py-1.5 text-xs rounded border transition-colors ${
                      currency === c
                        ? 'bg-slate-900 text-white font-bold border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receipt Footer Message
            </label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Maintenance */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Database Management & Backups</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export a full JSON backup of transactions, services, and clients, or reset to sample data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Clear Everything */}
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200/70 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-rose-950 block">Clear & Wipe All Data</span>
              <p className="text-[11px] text-rose-700/80 mt-1">
                Wipe all transactions, clients, services, and expenses for a completely clean slate.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Everything</span>
            </button>
          </div>

          {/* Export JSON */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Export Backup</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Save complete dataset as portable JSON file to your device.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Import Backup</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Restore data from a previously exported backup file.
              </p>
            </div>
            <label className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Load Sample Demo Data */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Sample Demo Data</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Load sample demo barbershop data to preview features.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="Clear and Wipe All Data"
        message="Are you sure you want to clear and wipe everything? All transactions, services, clients, and expenses will be completely emptied. This action cannot be undone."
        confirmLabel="Wipe Everything"
        isDestructive={true}
        onConfirm={() => {
          clearAllData();
          setBusinessName('IncomeFlow');
          setCurrency('DT');
          setPhone('');
          setEmail('');
          setAddress('');
          setReceiptFooter('Thank you for your visit!');
          setConfirmClearOpen(false);
          setSavedMessage('All data cleared and cleaned successfully.');
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />

      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="Load Sample Demo Data"
        message="This will load the sample dataset (including haircut services, clients, and sample sales history). Any unsaved changes will be overwritten. Proceed?"
        confirmLabel="Load Demo Data"
        isDestructive={false}
        onConfirm={() => {
          resetToDemoData();
          setConfirmResetOpen(false);
          setBusinessName('Barber & Spa Lounge');
          setCurrency('DT');
          setSavedMessage('Sample demo data loaded successfully.');
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
