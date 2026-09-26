import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Egg, Plus, Eye, Edit2, AlertCircle, Skull, Layers } from 'lucide-react';
import { poultryService, farmService } from '../../services/api';
import { PoultryBatch, Shed } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const PoultryBatches: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [batches, setBatches] = useState<PoultryBatch[]>([]);
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mortalityModal, setMortalityModal] = useState<{ open: boolean; batch: PoultryBatch | null }>({
    open: false,
    batch: null
  });

  const [formData, setFormData] = useState({
    batchId: '',
    batchName: '',
    breed: 'BV-300 Commercial White',
    birdType: 'Layer',
    initialCount: 2000,
    currentCount: 2000,
    mortalityCount: 0,
    ageWeeks: 18,
    shed: '',
    feedType: 'Layer Mash Phase 1',
    dailyFeedIntakeKg: 220,
    healthStatus: 'Healthy',
    status: 'Active',
    notes: ''
  });

  const [mortalityCount, setMortalityCount] = useState('1');
  const [mortalityReason, setMortalityReason] = useState('Natural attrition');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [bRes, sRes] = await Promise.all([
        poultryService.getAll(),
        farmService.getSheds()
      ]);
      setBatches(bRes.data.batches || []);
      setSheds(sRes.data.sheds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    const nextNum = batches.length + 10;
    setFormData({
      batchId: `BATCH-FLK-${nextNum}`,
      batchName: `Layer Flock ${nextNum}`,
      breed: 'BV-300 Commercial White',
      birdType: 'Layer',
      initialCount: 2000,
      currentCount: 2000,
      mortalityCount: 0,
      ageWeeks: 16,
      shed: sheds.find((s) => s.type.includes('Poultry'))?._id || '',
      feedType: 'Layer Mash Phase 1',
      dailyFeedIntakeKg: 210,
      healthStatus: 'Healthy',
      status: 'Active',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await poultryService.create({
        ...formData,
        initialCount: Number(formData.initialCount),
        currentCount: Number(formData.initialCount) - Number(formData.mortalityCount || 0)
      });
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving poultry batch');
    }
  };

  const handleRecordMortality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mortalityModal.batch) return;

    try {
      await poultryService.recordMortality(mortalityModal.batch._id, Number(mortalityCount), mortalityReason);
      setMortalityModal({ open: false, batch: null });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error logging mortality');
    }
  };

  const columns: Column<PoultryBatch>[] = [
    {
      key: 'batchId',
      header: 'Batch ID & Name',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800">{item.batchName}</span>
          <span className="block text-[10px] text-slate-400 font-mono">{item.batchId}</span>
        </div>
      )
    },
    {
      key: 'birdType',
      header: 'Type & Breed',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-700">{item.birdType}</span>
          <span className="block text-xs text-slate-500">{item.breed}</span>
        </div>
      )
    },
    {
      key: 'currentCount',
      header: 'Current Birds',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 text-sm">{item.currentCount.toLocaleString()}</span>
          <span className="block text-[10px] text-slate-400">Orig: {item.initialCount.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'mortalityCount',
      header: 'Mortality',
      sortable: true,
      render: (item) => {
        const rate = item.initialCount ? ((item.mortalityCount / item.initialCount) * 100).toFixed(1) : 0;
        return (
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-rose-600">{item.mortalityCount} birds</span>
            <span className="text-[10px] text-slate-400">({rate}%)</span>
          </div>
        );
      }
    },
    {
      key: 'ageWeeks',
      header: 'Age',
      sortable: true,
      render: (item) => <span className="font-medium text-slate-700">{item.ageWeeks} weeks</span>
    },
    {
      key: 'healthStatus',
      header: 'Health',
      sortable: true,
      render: (item) => <StatusBadge status={item.healthStatus} size="sm" />
    },
    {
      key: 'status',
      header: 'Batch Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} size="sm" />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/poultry/batches/${item._id}`)}
            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            title="View Batch Details & Egg Logs"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canManage && (
            <button
              onClick={() => setMortalityModal({ open: true, batch: item })}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Record Mortality"
            >
              <Skull className="w-4 h-4" />
            </button>
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
            Poultry Flocks & Batches
          </h1>
          <p className="text-xs text-slate-500">
            Track commercial layer flocks, broiler cycles, feed consumption, mortality and egg productivity
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Poultry Batch</span>
          </button>
        )}
      </div>

      {/* Batches Table */}
      <DataTable
        columns={columns}
        data={batches}
        isLoading={isLoading}
        searchPlaceholder="Search by batch name, ID, breed, or type..."
        searchField={(b) => `${b.batchId} ${b.batchName} ${b.breed} ${b.birdType}`}
        onRowClick={(item) => navigate(`/poultry/batches/${item._id}`)}
      />

      {/* Add Batch Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Poultry Batch"
        subtitle="Initialize flock count, breed, age, and assigned housing shed"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveBatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch ID *</label>
              <input
                type="text"
                required
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Flock Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Layer House 1 Flock"
                value={formData.batchName}
                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bird Purpose *</label>
              <select
                value={formData.birdType}
                onChange={(e) => setFormData({ ...formData, birdType: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Layer">Commercial Layer (Eggs)</option>
                <option value="Broiler">Commercial Broiler (Meat)</option>
                <option value="Dual-Purpose">Dual-Purpose / Country</option>
                <option value="Breeder">Breeder Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Breed *</label>
              <input
                type="text"
                required
                placeholder="e.g. BV-300 / Cobb 500"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Bird Count *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.initialCount}
                onChange={(e) => setFormData({ ...formData, initialCount: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age in Weeks *</label>
              <input
                type="number"
                required
                value={formData.ageWeeks}
                onChange={(e) => setFormData({ ...formData, ageWeeks: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Feed Type</label>
              <input
                type="text"
                placeholder="e.g. Layer Mash Phase 1"
                value={formData.feedType}
                onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Housing Shed</label>
              <select
                value={formData.shed}
                onChange={(e) => setFormData({ ...formData, shed: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="">-- Choose Poultry Shed --</option>
                {sheds.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.shedNumber})
                  </option>
                ))}
              </select>
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
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              Register Batch
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Mortality Modal */}
      <Modal
        isOpen={mortalityModal.open}
        onClose={() => setMortalityModal({ open: false, batch: null })}
        title="Record Flock Mortality"
        subtitle={`Log mortality for ${mortalityModal.batch?.batchName}`}
        maxWidth="sm"
      >
        <form onSubmit={handleRecordMortality} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Number of Birds Lost *</label>
            <input
              type="number"
              required
              min={1}
              max={mortalityModal.batch?.currentCount || 1000}
              value={mortalityCount}
              onChange={(e) => setMortalityCount(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cause / Reason</label>
            <input
              type="text"
              required
              placeholder="e.g. Heat stress / Normal attrition"
              value={mortalityReason}
              onChange={(e) => setMortalityReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setMortalityModal({ open: false, batch: null })}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
            >
              Confirm Mortality Log
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
