import React, { useState, useEffect } from 'react';
import { Egg, Plus, Calendar, Filter, Trash2, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { eggService, poultryService } from '../../services/api';
import { EggRecord, PoultryBatch } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const EggProduction: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [records, setRecords] = useState<EggRecord[]>([]);
  const [batches, setBatches] = useState<PoultryBatch[]>([]);
  const [stats, setStats] = useState<any>({ todayTotal: 0, todayGood: 0, todayBroken: 0, trend: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedBatch, setSelectedBatch] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    batch: '',
    totalEggs: '',
    goodEggs: '',
    brokenEggs: '0',
    damagedEggs: '0',
    collectedBy: 'Poultry Team',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [recRes, statRes, batchRes] = await Promise.all([
        eggService.getAll({ batchId: selectedBatch }),
        eggService.getStats(),
        poultryService.getAll()
      ]);
      setRecords(recRes.data.records || []);
      setStats(statRes.data.stats || {});
      setBatches(batchRes.data.batches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBatch]);

  const handleOpenAdd = () => {
    const layerBatches = batches.filter((b) => b.birdType === 'Layer' || b.birdType === 'Dual-Purpose');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      batch: layerBatches[0]?._id || batches[0]?._id || '',
      totalEggs: '2200',
      goodEggs: '2170',
      brokenEggs: '20',
      damagedEggs: '10',
      collectedBy: 'Poultry Team',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eggService.record(formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording egg output');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this egg collection entry?')) return;
    try {
      await eggService.delete(id);
      fetchData();
    } catch (err: any) {
      alert('Error deleting record');
    }
  };

  const columns: Column<EggRecord>[] = [
    {
      key: 'date',
      header: 'Collection Date',
      sortable: true,
      render: (item) => <span className="font-semibold text-slate-800">{formatDate(item.date)}</span>
    },
    {
      key: 'batch',
      header: 'Poultry Flock Batch',
      render: (item) => {
        const b = typeof item.batch === 'object' ? item.batch : null;
        return (
          <div>
            <span className="font-bold text-slate-800">{b?.batchName || b?.batchId}</span>
            <span className="block text-xs text-slate-500">{b?.breed}</span>
          </div>
        );
      }
    },
    {
      key: 'totalEggs',
      header: 'Total Harvested',
      sortable: true,
      render: (item) => <span className="font-bold text-slate-900">{item.totalEggs.toLocaleString()}</span>
    },
    {
      key: 'goodEggs',
      header: 'Grade-A Good Eggs',
      sortable: true,
      render: (item) => <span className="font-extrabold text-emerald-700">{item.goodEggs.toLocaleString()}</span>
    },
    {
      key: 'brokenEggs',
      header: 'Broken / Damaged',
      sortable: true,
      render: (item) => (
        <span className="text-rose-600 font-medium">
          {item.brokenEggs} {item.damagedEggs ? `(+${item.damagedEggs})` : ''}
        </span>
      )
    },
    {
      key: 'layRatePercentage',
      header: 'Lay Rate %',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-xs">
          {item.layRatePercentage ? `${item.layRatePercentage}%` : '-'}
        </span>
      )
    },
    {
      key: 'collectedBy',
      header: 'Collector',
      render: (item) => <span className="text-xs text-slate-500">{item.collectedBy || 'Staff'}</span>
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) =>
        canManage ? (
          <button
            onClick={() => handleDelete(item._id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
            title="Delete Log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Daily Egg Production & Quality Grading
          </h1>
          <p className="text-xs text-slate-500">
            Monitor daily flock lay rates, grade-A marketable eggs, broken ratios, and packing batches
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Egg Collection</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Total Harvest</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.todayTotal?.toLocaleString() || 0} Eggs</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Grade-A Good Eggs</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.todayGood?.toLocaleString() || 0} Eggs</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Broken / Discarded</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.todayBroken || 0} Eggs</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Egg Damage Ratio</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.damagedRate || 0}%</h3>
        </div>
      </div>

      {/* 14-Day Collection Chart */}
      {stats.trend && stats.trend.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <h3 className="text-sm font-bold text-slate-800 mb-2">14-Day Daily Egg Collection Trend</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="goodEggs"
                  name="Grade-A Eggs"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#eggGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        searchPlaceholder="Search by flock name, date, collector..."
        filterComponent={
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white"
          >
            <option value="All">All Flocks</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName} ({b.birdType})
              </option>
            ))}
          </select>
        }
      />

      {/* Record Eggs Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Daily Egg Collection"
        subtitle="Specify total eggs, good marketable count, and cracked ratio"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Poultry Flock *</label>
            <select
              required
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            >
              <option value="">-- Choose Flock --</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.batchName} ({b.breed} - {b.currentCount} birds)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Collection Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Collector / Staff Name</label>
              <input
                type="text"
                value={formData.collectedBy}
                onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Harvested *</label>
              <input
                type="number"
                required
                value={formData.totalEggs}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    totalEggs: val,
                    goodEggs: val
                  });
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grade-A Good</label>
              <input
                type="number"
                value={formData.goodEggs}
                onChange={(e) => setFormData({ ...formData, goodEggs: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Broken / Cracked</label>
              <input
                type="number"
                value={formData.brokenEggs}
                onChange={(e) => setFormData({ ...formData, brokenEggs: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              placeholder="e.g. Belt collection smooth, clean shells"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
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
              Save Egg Collection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
