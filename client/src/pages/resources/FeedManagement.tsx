import React, { useState, useEffect } from 'react';
import { Wheat, Plus, AlertTriangle, ArrowDownRight, RefreshCw, Trash2, Edit2, Boxes } from 'lucide-react';
import { feedService, farmService } from '../../services/api';
import { FeedItem, Shed } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const FeedManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [stats, setStats] = useState<any>({ totalStockKg: 0, totalValuation: 0, lowStockCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedItem | null>(null);
  const [consumeModal, setConsumeModal] = useState<{ open: boolean; item: FeedItem | null }>({
    open: false,
    item: null
  });
  const [restockModal, setRestockModal] = useState<{ open: boolean; item: FeedItem | null }>({
    open: false,
    item: null
  });

  // Forms
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cattle Feed',
    currentStock: 1000,
    unit: 'kg',
    minStockAlert: 200,
    unitCost: 28,
    supplier: '',
    supplierContact: '',
    dailyConsumptionRate: 50,
    storageShed: '',
    notes: ''
  });

  const [consumeQty, setConsumeQty] = useState('');
  const [consumeNotes, setConsumeNotes] = useState('');
  const [restockQty, setRestockQty] = useState('');
  const [restockCost, setRestockCost] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [fRes, sRes] = await Promise.all([
        feedService.getAll({ category: categoryFilter }),
        farmService.getSheds()
      ]);
      setFeeds(fRes.data.items || []);
      setStats(fRes.data.stats || {});
      setSheds(sRes.data.sheds || []);
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
    setEditingFeed(null);
    setFormData({
      name: '',
      category: 'Cattle Feed',
      currentStock: 1000,
      unit: 'kg',
      minStockAlert: 200,
      unitCost: 28,
      supplier: '',
      supplierContact: '',
      dailyConsumptionRate: 50,
      storageShed: sheds[0]?._id || '',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: FeedItem) => {
    setEditingFeed(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      unit: item.unit,
      minStockAlert: item.minStockAlert,
      unitCost: item.unitCost,
      supplier: item.supplier || '',
      supplierContact: item.supplierContact || '',
      dailyConsumptionRate: item.dailyConsumptionRate || 0,
      storageShed: typeof item.storageShed === 'object' ? item.storageShed?._id || '' : item.storageShed || '',
      notes: item.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeed) {
        await feedService.update(editingFeed._id, formData);
      } else {
        await feedService.create(formData);
      }
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving feed inventory item');
    }
  };

  const handleConsume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumeModal.item) return;

    try {
      await feedService.consume(consumeModal.item._id, Number(consumeQty), consumeNotes);
      setConsumeModal({ open: false, item: null });
      setConsumeQty('');
      setConsumeNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error consuming feed');
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModal.item) return;

    try {
      await feedService.restock(restockModal.item._id, {
        quantityAdded: Number(restockQty),
        unitCost: restockCost ? Number(restockCost) : undefined
      });
      setRestockModal({ open: false, item: null });
      setRestockQty('');
      setRestockCost('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error restocking feed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feed inventory item?')) return;
    try {
      await feedService.delete(id);
      fetchData();
    } catch (err) {
      alert('Error deleting feed item');
    }
  };

  const columns: Column<FeedItem>[] = [
    {
      key: 'name',
      header: 'Feed Formulation',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800">{item.name}</span>
          <span className="block text-xs text-slate-500">{item.category}</span>
        </div>
      )
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      sortable: true,
      render: (item) => {
        const isLow = item.currentStock <= item.minStockAlert;
        return (
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-sm ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
              {item.currentStock.toLocaleString()} {item.unit}
            </span>
            {isLow && (
              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                Low Stock
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'unitCost',
      header: 'Unit Cost',
      sortable: true,
      render: (item) => <span className="font-medium text-slate-700">{formatCurrency(item.unitCost)} / {item.unit}</span>
    },
    {
      key: 'totalValue',
      header: 'Inventory Value',
      render: (item) => (
        <span className="font-bold text-emerald-700">
          {formatCurrency(item.currentStock * item.unitCost)}
        </span>
      )
    },
    {
      key: 'dailyConsumptionRate',
      header: 'Est. Daily Burn',
      render: (item) => (
        <span className="text-xs text-slate-600">
          {item.dailyConsumptionRate ? `${item.dailyConsumptionRate} ${item.unit}/day` : '-'}
        </span>
      )
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (item) => <span className="text-xs text-slate-600">{item.supplier || '-'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setConsumeModal({ open: true, item })}
            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            title="Log Consumption"
          >
            <ArrowDownRight className="w-3 h-3" />
            <span>Use</span>
          </button>
          {canManage && (
            <>
              <button
                onClick={() => setRestockModal({ open: true, item })}
                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                title="Restock Feed"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restock</span>
              </button>
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Feed Management & Nutrition Stocks
          </h1>
          <p className="text-xs text-slate-500">
            Monitor livestock feeds, layer mash, supplements, daily intake burn rates and low stock thresholds
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Feed Formulation</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Feed Stock On Hand</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalStockKg?.toLocaleString() || 0} kg</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Feed Asset Valuation</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(stats.totalValuation || 0)}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Formulations</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {stats.lowStockCount || 0} Items
          </h3>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={feeds}
        isLoading={isLoading}
        searchPlaceholder="Search feed by name, supplier, or category..."
        filterComponent={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white"
          >
            <option value="All">All Feed Categories</option>
            <option value="Cattle Feed">Cattle Feed</option>
            <option value="Buffalo Concentrate">Buffalo Concentrate</option>
            <option value="Poultry Layer Mash">Poultry Layer Mash</option>
            <option value="Poultry Starter">Poultry Starter</option>
            <option value="Dry Fodder / Silage">Silage & Fodder</option>
            <option value="Minerals & Salts">Minerals & Salts</option>
            <option value="Supplements">Supplements & Tonics</option>
          </select>
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingFeed ? 'Edit Feed Formulation' : 'Add New Feed Item'}
        subtitle="Manage inventory stocks, unit costs, and minimum threshold alert triggers"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveFeed} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Feed Item Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. High-Yield Dairy Pellets"
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
                <option value="Cattle Feed">Cattle Feed</option>
                <option value="Buffalo Concentrate">Buffalo Concentrate</option>
                <option value="Poultry Layer Mash">Poultry Layer Mash</option>
                <option value="Poultry Starter">Poultry Starter</option>
                <option value="Dry Fodder / Silage">Dry Fodder / Silage</option>
                <option value="Minerals & Salts">Minerals & Salts</option>
                <option value="Supplements">Supplements</option>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measure</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="kg">kg</option>
                <option value="bags (50kg)">bags (50kg)</option>
                <option value="tons">tons</option>
                <option value="litres">litres</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost (₹) *</label>
              <input
                type="number"
                required
                step="0.1"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Low Stock Alert Threshold *</label>
              <input
                type="number"
                required
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Feed Mill</label>
              <input
                type="text"
                placeholder="e.g. Godrej Agrovet Ltd"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Est. Daily Consumption Rate</label>
              <input
                type="number"
                value={formData.dailyConsumptionRate}
                onChange={(e) => setFormData({ ...formData, dailyConsumptionRate: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Save Feed Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Consume Modal */}
      <Modal
        isOpen={consumeModal.open}
        onClose={() => setConsumeModal({ open: false, item: null })}
        title={`Log Daily Consumption - ${consumeModal.item?.name}`}
        subtitle={`Current available: ${consumeModal.item?.currentStock} ${consumeModal.item?.unit}`}
        maxWidth="sm"
      >
        <form onSubmit={handleConsume} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantity Consumed ({consumeModal.item?.unit}) *
            </label>
            <input
              type="number"
              required
              step="0.1"
              max={consumeModal.item?.currentStock || 1000}
              placeholder="e.g. 50"
              value={consumeQty}
              onChange={(e) => setConsumeQty(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feeding Purpose / Shed</label>
            <input
              type="text"
              placeholder="e.g. Morning feed for Milking Cows in Barn A"
              value={consumeNotes}
              onChange={(e) => setConsumeNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setConsumeModal({ open: false, item: null })}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
            >
              Log Consumption
            </button>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal
        isOpen={restockModal.open}
        onClose={() => setRestockModal({ open: false, item: null })}
        title={`Restock Batch - ${restockModal.item?.name}`}
        subtitle="Add incoming shipment directly to farm inventory"
        maxWidth="sm"
      >
        <form onSubmit={handleRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantity Added ({restockModal.item?.unit}) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 500"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Updated Unit Cost (₹)</label>
            <input
              type="number"
              placeholder={String(restockModal.item?.unitCost || '')}
              value={restockCost}
              onChange={(e) => setRestockCost(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setRestockModal({ open: false, item: null })}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Confirm Restock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
