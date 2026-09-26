import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Client, Transaction } from '../types';
import { formatCurrency, formatDateDisplay } from '../lib/calculations';
import { Search, Plus, Edit2, Trash2, ChevronRight, User, Phone, Mail, X } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ClientDetailsModal } from './ClientDetailsModal';

interface ClientsPageProps {
  onSelectTransaction: (tx: Transaction) => void;
  onOpenNewTransactionWithClient: (client: Client) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  onSelectTransaction,
  onOpenNewTransactionWithClient,
}) => {
  const { clients, addClient, updateClient, deleteClient, getClientStats, settings } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientForView, setSelectedClientForView] = useState<Client | null>(null);

  // Add / Edit Modal
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Delete Confirm
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const openNewClientModal = () => {
    setEditingClient(null);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientNotes('');
    setClientModalOpen(true);
  };

  const openEditClientModal = (c: Client) => {
    setEditingClient(c);
    setClientName(c.name);
    setClientPhone(c.phone || '');
    setClientEmail(c.email || '');
    setClientNotes(c.notes || '');
    setClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    if (editingClient) {
      updateClient(editingClient.id, {
        name: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        notes: clientNotes.trim(),
      });
    } else {
      addClient({
        name: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        notes: clientNotes.trim(),
      });
    }

    setClientModalOpen(false);
  };

  const filteredClients = clients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(searchQuery.trim());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Clients Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer relationship records with lifetime value & visit histories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openNewClientModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredClients.length}</span> clients
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-center">Visits</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {clients.length === 0 ? 'No clients registered yet' : 'No clients found matching search'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {clients.length === 0
                          ? 'Add clients manually or let them be created automatically whenever you record a new transaction.'
                          : 'Check your search query or clear the filter.'}
                      </p>
                      {clients.length === 0 && (
                        <button
                          type="button"
                          onClick={openNewClientModal}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          + Add Client
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const stats = getClientStats(client.id);

                  return (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedClientForView(client)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                            {client.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div>{client.name}</div>
                            {client.notes && (
                              <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                                {client.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-numbers text-slate-600 whitespace-nowrap">
                        {client.phone || '--'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono-numbers font-medium text-slate-700 whitespace-nowrap">
                        {stats.visitsCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-slate-950 text-sm whitespace-nowrap">
                        {formatCurrency(stats.totalSpent, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 font-mono-numbers text-slate-600 whitespace-nowrap">
                        {stats.lastVisit ? formatDateDisplay(stats.lastVisit) : 'Never'}
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenNewTransactionWithClient(client)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            title="New Transaction"
                          >
                            + Sale
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditClientModal(client)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Edit Client"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setClientToDelete(client)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button
                onClick={() => setClientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmed Ben Ali"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 21 345 678"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="client@email.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferences / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Special preferences or notes..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClientModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  {editingClient ? 'Save Changes' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      <ClientDetailsModal
        isOpen={Boolean(selectedClientForView)}
        client={selectedClientForView}
        onClose={() => setSelectedClientForView(null)}
        onSelectTransaction={onSelectTransaction}
        onAddTransactionForClient={(c) => {
          setSelectedClientForView(null);
          onOpenNewTransactionWithClient(c);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(clientToDelete)}
        title="Delete Client"
        message={`Are you sure you want to delete ${clientToDelete?.name}? Their historical transactions will remain safe in the transaction ledger.`}
        confirmLabel="Delete Client"
        isDestructive={true}
        onConfirm={() => {
          if (clientToDelete) {
            deleteClient(clientToDelete.id);
            setClientToDelete(null);
          }
        }}
        onCancel={() => setClientToDelete(null)}
      />
    </div>
  );
};
