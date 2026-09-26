import React, { useState, useEffect } from 'react';
import { Boxes, Plus, AlertTriangle, ArrowUpDown, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { inventoryService } from '../../services/api';
import { InventoryItem } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const InventoryManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<any>({ totalItems: 0, totalValuation: 0, lowStockCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; item: InventoryItem | null }>({
    open: false,
    item: null
  });

  // Forms
  const [formData, setFormData] = useState({
    name: '',
    category: 'Dairy Supplies',
    itemCode: '',
    quantity: 10,
    unit: 'pieces',
    purchasePrice: 100,
    sellingPrice: 0,
    supplier: '',
    minStockAlert: 5,
    shedLocation: 'Central Store',
    notes: ''
  });

  const [adjustType, setAdjustType] = useState('Stock In');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await inventoryService.getAll({
        category: categoryFilter,
        status: statusFilter
      });
      setItems(res.data.items || []);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Dairy Supplies',
      itemCode: `INV-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      quantity: 10,
      unit: 'pieces',
      purchasePrice: 100,
      sellingPrice: 0,
      supplier: 'DeLaval India',
      minStockAlert: 5,
      shedLocation: 'Central Store',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      itemCode: item.itemCode || '',
      quantity: item.quantity,
      unit: item.unit,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice || 0,
      supplier: item.supplier || '',
      minStockAlert: item.minStockAlert,
      shedLocation: item.shedLocation || 'Central Store',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryService.update(editingItem._id, formData);
      } else {
        await inventoryService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving inventory item');
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal.item) return;

    try {
      await inventoryService.adjustStock(adjustModal.item._id, {
        adjustmentType: adjustType,
        quantity: Number(adjustQty),
        reason: adjustReason
      });
      setAdjustModal({ open: false, item: null });
      setAdjustQty('');
      setAdjustReason('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adjusting stock');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inventory item?')) return;
    try {
      await inventoryService.delete(id);
      fetchData();
    } catch (err) {
      alert('Error deleting item');
    }
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: 'name',
      header: 'Item & SKU',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800">{item.name}</span>
          <span className="block text-[10px] text-slate-400 font-mono">{item.itemCode || 'SKU-NONE'}</span>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => <span className="text-xs font-semibold text-slate-700">{item.category}</span>
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      render: (item) => (
        <span className="font-extrabold text-slate-900 text-sm">
          {item.quantity.toLocaleString()} {item.unit}
        </span>
      )
    },
    {
      key: 'purchasePrice',
      header: 'Unit Cost',
      sortable: true,
      render: (item) => <span className="font-medium text-slate-700">{formatCurrency(item.purchasePrice)}</span>
    },
    {
      key: 'totalValue',
      header: 'Stock Valuation',
      render: (item) => (
        <span className="font-bold text-emerald-700">
          {formatCurrency(item.quantity * item.purchasePrice)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} size="sm" />
    },
    {
      key: 'shedLocation',
      header: 'Storage Location',
      render: (item) => <span className="text-xs text-slate-600">{item.shedLocation || 'Central Store'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) =>
        canManage ? (
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAdjustModal({ open: true, item })}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Stock In / Out"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Adjust</span>
            </button>
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
            Centralized Farm Inventory & Assets
          </h1>
          <p className="text-xs text-slate-500">
            Unified stock control across dairy supplies, poultry equipment, sanitary chemicals, and spare parts
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Inventory Item</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cataloged Items</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalItems || 0} Items</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Inventory Asset Value</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(stats.totalValuation || 0)}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Reorders Needed</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {stats.lowStockCount || 0} Items
          </h3>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        searchPlaceholder="Search by item name, SKU code, or supplier..."
        filterComponent={
          <div className="flex items-center space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Dairy Supplies">Dairy Supplies</option>
              <option value="Poultry Supplies">Poultry Supplies</option>
              <option value="Farm Equipment">Farm Equipment</option>
              <option value="Cleaning & Sanitation">Sanitation</option>
              <option value="Feed">Feed</option>
              <option value="Medicines">Medicines</option>
              <option value="Other Items">Other Items</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Inventory Item' : 'Add New Inventory Asset'}
        subtitle="Specify SKU, valuation, minimum threshold, and storage compartment"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Silicone Milking Machine Liners"
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
                <option value="Dairy Supplies">Dairy Supplies</option>
                <option value="Poultry Supplies">Poultry Supplies</option>
                <option value="Farm Equipment">Farm Equipment</option>
                <option value="Cleaning & Sanitation">Cleaning & Sanitation</option>
                <option value="Feed">Feed</option>
                <option value="Medicines">Medicines</option>
                <option value="Other Items">Other Items</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity in Stock *</label>
              <input
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measure</label>
              <input
                type="text"
                placeholder="e.g. sets / pieces / trays"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Cost (₹) *</label>
              <input
                type="number"
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Alert Threshold *</label>
              <input
                type="number"
                required
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Storage Location Shed</label>
              <input
                type="text"
                placeholder="e.g. Central Store / Workshop"
                value={formData.shedLocation}
                onChange={(e) => setFormData({ ...formData, shedLocation: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Supplier</label>
              <input
                type="text"
                placeholder="e.g. DeLaval India"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
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
              Save Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Modal */}
      <Modal
        isOpen={adjustModal.open}
        onClose={() => setAdjustModal({ open: false, item: null })}
        title={`Adjust Stock: ${adjustModal.item?.name}`}
        subtitle={`Current quantity: ${adjustModal.item?.quantity} ${adjustModal.item?.unit}`}
        maxWidth="sm"
      >
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment Action</label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            >
              <option value="Stock In">Stock In (Add)</option>
              <option value="Stock Out">Stock Out (Deduct / Issue)</option>
              <option value="Set Absolute">Set Exact Count (Physical Audit)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
            <input
              type="number"
              required
              min={1}
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Reference</label>
            <input
              type="text"
              required
              placeholder="e.g. Broken in transit / Routine replenishment"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setAdjustModal({ open: false, item: null })}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
