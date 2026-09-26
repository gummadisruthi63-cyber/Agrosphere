import React, { useState, useEffect } from 'react';
import { Pill, Plus, AlertTriangle, Calendar, ShieldAlert, Edit2, Trash2 } from 'lucide-react';
import { medicineService } from '../../services/api';
import { MedicineItem } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const MedicineManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [alerts, setAlerts] = useState<any>({ expiredCount: 0, expiringSoonCount: 0, lowStockCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Antibiotic',
    targetSpecies: 'All',
    currentStock: 10,
    unit: 'vials',
    batchNumber: '',
    unitCost: 150,
    supplier: '',
    expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
    minStockAlert: 5,
    administrationRoute: 'Intramuscular (IM)',
    storageConditions: 'Refrigerated 2-8°C',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await medicineService.getAll({ category: categoryFilter });
      setMedicines(res.data.medicines || []);
      setAlerts(res.data.alerts || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      category: 'Antibiotic',
      targetSpecies: 'All',
      currentStock: 10,
      unit: 'vials',
      batchNumber: `MED-B${Math.floor(100 + Math.random() * 900)}`,
      unitCost: 150,
      supplier: 'Baramati Vet Supplies',
      expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0],
      minStockAlert: 5,
      administrationRoute: 'Intramuscular (IM)',
      storageConditions: 'Refrigerated 2-8°C',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MedicineItem) => {
    setEditingMedicine(item);
    setFormData({
      name: item.name,
      category: item.category,
      targetSpecies: item.targetSpecies || 'All',
      currentStock: item.currentStock,
      unit: item.unit,
      batchNumber: item.batchNumber || '',
      unitCost: item.unitCost,
      supplier: item.supplier || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      minStockAlert: item.minStockAlert,
      administrationRoute: item.administrationRoute || 'Intramuscular (IM)',
      storageConditions: item.storageConditions || 'Refrigerated 2-8°C',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        await medicineService.update(editingMedicine._id, formData);
      } else {
        await medicineService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving medicine');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this medicine from inventory?')) return;
    try {
      await medicineService.delete(id);
      fetchData();
    } catch (err) {
      alert('Error deleting medicine');
    }
  };

  const columns: Column<MedicineItem>[] = [
    {
      key: 'name',
      header: 'Medicine & Formulation',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800">{item.name}</span>
          <span className="block text-xs text-slate-500">
            {item.category} • Batch: {item.batchNumber || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'currentStock',
      header: 'Available Stock',
      sortable: true,
      render: (item) => {
        const isLow = item.currentStock <= item.minStockAlert;
        return (
          <span className={`font-bold text-sm ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
            {item.currentStock} {item.unit}
          </span>
        );
      }
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      sortable: true,
      render: (item) => {
        const now = new Date();
        const exp = new Date(item.expiryDate);
        const thirtyDays = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const isExpired = exp < now;
        const isSoon = !isExpired && exp <= thirtyDays;

        return (
          <div>
            <span
              className={`font-semibold ${
                isExpired ? 'text-rose-600' : isSoon ? 'text-amber-600' : 'text-slate-700'
              }`}
            >
              {formatDate(item.expiryDate)}
            </span>
            {isExpired && <span className="block text-[10px] font-bold text-rose-600 uppercase">Expired</span>}
            {isSoon && <span className="block text-[10px] font-bold text-amber-600 uppercase">Expiring Soon</span>}
          </div>
        );
      }
    },
    {
      key: 'administrationRoute',
      header: 'Route & Species',
      render: (item) => (
        <span className="text-xs text-slate-600">
          {item.administrationRoute || 'IM'} ({item.targetSpecies || 'All'})
        </span>
      )
    },
    {
      key: 'unitCost',
      header: 'Cost',
      render: (item) => <span className="font-medium text-slate-700">{formatCurrency(item.unitCost)}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) =>
        canManage ? (
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleOpenEdit(item)}
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(item._id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Farm Pharmacy & Medicine Inventory
          </h1>
          <p className="text-xs text-slate-500">
            Track antibiotics, vaccines, hormones, antiseptics, batch serials, and expiry alert schedules
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medicine Item</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Medicine Formulations</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{medicines.length} Types</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Expiring Within 30 Days</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${alerts.expiringSoonCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {alerts.expiringSoonCount || 0} Batches
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Expired Medicines</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${alerts.expiredCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {alerts.expiredCount || 0} Batches
          </h3>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={medicines}
        isLoading={isLoading}
        searchPlaceholder="Search medicine by name, category, or batch number..."
        filterComponent={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Antibiotic">Antibiotic</option>
            <option value="Vaccine">Vaccine</option>
            <option value="Vitamin / Supplement">Vitamin / Supplement</option>
            <option value="Dewormer">Dewormer</option>
            <option value="Antiseptic">Antiseptic</option>
          </select>
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMedicine ? 'Edit Medicine Formulation' : 'Add New Medicine Formulation'}
        subtitle="Manage pharmacy batch stock and expiration date"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Terramycin LA 200mg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Antibiotic">Antibiotic</option>
                <option value="Vaccine">Vaccine</option>
                <option value="Vitamin / Supplement">Vitamin / Supplement</option>
                <option value="Dewormer">Dewormer</option>
                <option value="Antiseptic">Antiseptic</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock *</label>
              <input
                type="number"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="vials">vials</option>
                <option value="ml">ml</option>
                <option value="doses">doses</option>
                <option value="bottles">bottles</option>
                <option value="tablets">tablets</option>
                <option value="sachets">sachets</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch Number</label>
              <input
                type="text"
                placeholder="MED-4410"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Route</label>
              <select
                value={formData.administrationRoute}
                onChange={(e) => setFormData({ ...formData, administrationRoute: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                <option value="Subcutaneous (SC)">Subcutaneous (SC)</option>
                <option value="Oral / In Feed / Water">Oral / In Feed / Water</option>
                <option value="Topical">Topical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Save Medicine
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
