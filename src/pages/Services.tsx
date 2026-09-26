import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Service, ServiceCategory } from '../types';
import { formatCurrency } from '../lib/calculations';
import { Plus, Edit2, Trash2, Check, Power, FolderPlus, Tag, X } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ServicesPage: React.FC = () => {
  const {
    services,
    serviceCategories,
    addService,
    updateService,
    toggleServiceActive,
    deleteService,
    addCategory,
    deleteCategory,
    loadStarterCategories,
    settings,
  } = useData();

  // Active filter tab
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Service Modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategoryId, setServiceCategoryId] = useState('');
  const [servicePrice, setServicePrice] = useState<number | ''>('');
  const [serviceActive, setServiceActive] = useState(true);

  // Category Modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Deletion confirm
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const openNewServiceModal = () => {
    setEditingService(null);
    setServiceName('');
    setServiceCategoryId(serviceCategories[0]?.id || '');
    setServicePrice('');
    setServiceActive(true);
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (srv: Service) => {
    setEditingService(srv);
    setServiceName(srv.name);
    setServiceCategoryId(srv.categoryId);
    setServicePrice(srv.price);
    setServiceActive(srv.active);
    setServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || servicePrice === '') return;

    let targetCatId = serviceCategoryId;
    if (!targetCatId) {
      if (serviceCategories.length === 0) {
        const genCat = addCategory('General');
        targetCatId = genCat.id;
      } else {
        targetCatId = serviceCategories[0].id;
      }
    }

    if (editingService) {
      updateService(editingService.id, {
        name: serviceName.trim(),
        categoryId: targetCatId,
        price: Number(servicePrice),
        active: serviceActive,
      });
    } else {
      addService({
        name: serviceName.trim(),
        categoryId: targetCatId,
        price: Number(servicePrice),
        active: serviceActive,
      });
    }

    setServiceModalOpen(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
    setCategoryModalOpen(false);
  };

  const getCategoryName = (catId: string) => {
    const found = serviceCategories.find((c) => c.id === catId);
    return found ? found.name : 'Uncategorized';
  };

  // Filter services
  const filteredServices = services.filter((s) => {
    if (selectedCategoryTab !== 'all' && s.categoryId !== selectedCategoryTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = s.name.toLowerCase().includes(q);
      const inCat = getCategoryName(s.categoryId).toLowerCase().includes(q);
      if (!inName && !inCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Services & Pricing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure reusable service catalog. Prices are automatically loaded during checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            <span>Manage Categories</span>
          </button>

          <button
            type="button"
            onClick={openNewServiceModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Category Tabs (Segmented Buttons allowed per Zero-Pill Constitution) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setSelectedCategoryTab('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedCategoryTab === 'all'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Categories ({services.length})
        </button>

        {serviceCategories.map((cat) => {
          const count = services.filter((s) => s.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryTab(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategoryTab === cat.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {services.length === 0 ? 'No services created yet' : 'No services found in this category'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {services.length === 0
                          ? 'Add your services and prices to start recording transactions.'
                          : 'Try switching categories or clear your search filter.'}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={openNewServiceModal}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          + Add Service
                        </button>
                        {serviceCategories.length === 0 && (
                          <button
                            type="button"
                            onClick={loadStarterCategories}
                            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Load Starter Categories
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {srv.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {getCategoryName(srv.categoryId)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-slate-950 text-sm">
                      {formatCurrency(srv.price, settings.currency)}
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Zero-Pill Compliant text status */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            srv.active ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        />
                        <span className={srv.active ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                          {srv.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleServiceActive(srv.id)}
                          className={`p-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                            srv.active
                              ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                              : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                          title={srv.active ? 'Deactivate service' : 'Activate service'}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {srv.active ? 'Deactivate' : 'Activate'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditServiceModal(srv)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setServiceToDelete(srv)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Service"
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

      {/* Add / Edit Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={() => setServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haircut, Facial, Beard Grooming"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={serviceCategoryId}
                  onChange={(e) => setServiceCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                >
                  {serviceCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="e.g. 25"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={serviceActive}
                  onChange={(e) => setServiceActive(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900/10 border-slate-300"
                />
                <label htmlFor="activeToggle" className="text-xs font-medium text-slate-700">
                  Active (available for selection in checkout)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  {editingService ? 'Save Changes' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900">Manage Service Categories</h2>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Add form */}
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name (e.g. Nails, Spa)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                >
                  Add
                </button>
              </form>

              {/* Existing Categories list */}
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {serviceCategories.map((c) => {
                  const linkedServices = services.filter((s) => s.categoryId === c.id).length;
                  return (
                    <div
                      key={c.id}
                      className="px-3 py-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <span className="text-[11px] text-slate-400 ml-2">({linkedServices} services)</span>
                      </div>
                      {serviceCategories.length > 1 && linkedServices === 0 && (
                        <button
                          type="button"
                          onClick={() => deleteCategory(c.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          title="Delete empty category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(serviceToDelete)}
        title="Delete Service"
        message={`Are you sure you want to delete ${serviceToDelete?.name}? Tip: If this service has past transactions, consider deactivating it instead to preserve sales history.`}
        confirmLabel="Delete Service"
        isDestructive={true}
        onConfirm={() => {
          if (serviceToDelete) {
            deleteService(serviceToDelete.id);
            setServiceToDelete(null);
          }
        }}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  );
};
