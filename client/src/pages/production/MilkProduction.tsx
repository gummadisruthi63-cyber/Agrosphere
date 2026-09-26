import React, { useState, useEffect } from 'react';
import { Milk, Plus, Calendar, Filter, Trash2, TrendingUp, Sun, Moon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { milkService, animalService } from '../../services/api';
import { MilkRecord, Animal } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const MilkProduction: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [stats, setStats] = useState<any>({ todayTotal: 0, todayMorning: 0, todayEvening: 0, trend: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedAnimal, setSelectedAnimal] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    animal: '',
    morningQuantity: '',
    eveningQuantity: '',
    fatPercentage: '4.2',
    snfPercentage: '8.6',
    recordedBy: 'Milking Team',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [recRes, statRes, animRes] = await Promise.all([
        milkService.getAll({ animalId: selectedAnimal }),
        milkService.getStats(),
        animalService.getAll()
      ]);
      setRecords(recRes.data.records || []);
      setStats(statRes.data.stats || {});
      setAnimals(animRes.data.animals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAnimal]);

  const handleOpenAdd = () => {
    const lactating = animals.filter((a) => a.lactationStatus === 'Lactating');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      animal: lactating[0]?._id || animals[0]?._id || '',
      morningQuantity: '12.0',
      eveningQuantity: '10.5',
      fatPercentage: '4.2',
      snfPercentage: '8.6',
      recordedBy: 'Milking Team',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const morning = Number(formData.morningQuantity) || 0;
      const evening = Number(formData.eveningQuantity) || 0;
      await milkService.record({
        ...formData,
        morningQuantity: morning,
        eveningQuantity: evening,
        totalQuantity: morning + evening
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording milk output');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this milk production entry?')) return;
    try {
      await milkService.delete(id);
      fetchData();
    } catch (err: any) {
      alert('Error deleting record');
    }
  };

  const columns: Column<MilkRecord>[] = [
    {
      key: 'date',
      header: 'Milking Date',
      sortable: true,
      render: (item) => <span className="font-semibold text-slate-800">{formatDate(item.date)}</span>
    },
    {
      key: 'animal',
      header: 'Animal (Tag & Name)',
      render: (item) => {
        const anim = typeof item.animal === 'object' ? item.animal : null;
        return (
          <div>
            <span className="font-bold text-slate-800">Tag #{anim?.tagNumber || '-'}</span>
            <span className="block text-xs text-slate-500">
              {anim?.animalType} • {anim?.name || anim?.breed}
            </span>
          </div>
        );
      }
    },
    {
      key: 'morningQuantity',
      header: 'Morning',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-amber-700 flex items-center gap-1">
          <Sun className="w-3 h-3 text-amber-500" />
          {item.morningQuantity} L
        </span>
      )
    },
    {
      key: 'eveningQuantity',
      header: 'Evening',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-indigo-700 flex items-center gap-1">
          <Moon className="w-3 h-3 text-indigo-500" />
          {item.eveningQuantity} L
        </span>
      )
    },
    {
      key: 'totalQuantity',
      header: 'Total Yield',
      sortable: true,
      render: (item) => <span className="font-extrabold text-emerald-700 text-sm">{item.totalQuantity} L</span>
    },
    {
      key: 'fatPercentage',
      header: 'Quality (Fat & SNF)',
      render: (item) => (
        <span className="text-xs text-slate-700 font-medium">
          Fat: {item.fatPercentage || 4.2}% • SNF: {item.snfPercentage || 8.6}%
        </span>
      )
    },
    {
      key: 'recordedBy',
      header: 'Milker / Recorder',
      render: (item) => <span className="text-xs text-slate-500">{item.recordedBy || 'Milker'}</span>
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
            Daily Milk Production & Yield
          </h1>
          <p className="text-xs text-slate-500">
            Log morning and evening milk outputs, test fat percentages, and track animal lactations
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Milk Yield</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Total</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.todayTotal || 0} L</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Morning Session</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.todayMorning || 0} L</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Evening Session</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">{stats.todayEvening || 0} L</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">14-Day Daily Average</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.averageDailyYield || 0} L/day</h3>
        </div>
      </div>

      {/* 14-Day Production Trend Chart */}
      {stats.trend && stats.trend.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <h3 className="text-sm font-bold text-slate-800 mb-2">14-Day Milk Production Trend (Morning vs Evening)</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="morningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="eveningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="morning"
                  name="Morning Session (L)"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#morningGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="evening"
                  name="Evening Session (L)"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#eveningGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Production Logs Table */}
      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        searchPlaceholder="Search by tag, animal, date..."
        filterComponent={
          <select
            value={selectedAnimal}
            onChange={(e) => setSelectedAnimal(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white"
          >
            <option value="All">All Animals</option>
            {animals.map((a) => (
              <option key={a._id} value={a._id}>
                {a.animalType} #{a.tagNumber} ({a.name || a.breed})
              </option>
            ))}
          </select>
        }
      />

      {/* Record Milk Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Daily Milk Production"
        subtitle="Specify morning and evening quantities with fat test results"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Animal *</label>
            <select
              required
              value={formData.animal}
              onChange={(e) => setFormData({ ...formData, animal: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            >
              <option value="">-- Choose Animal --</option>
              {animals.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.animalType} #{a.tagNumber} ({a.name || a.breed}) - {a.lactationStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Milking Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Milker / Staff Name</label>
              <input
                type="text"
                placeholder="Ramesh Kulkarni"
                value={formData.recordedBy}
                onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Morning Yield (L) *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="12.0"
                value={formData.morningQuantity}
                onChange={(e) => setFormData({ ...formData, morningQuantity: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Evening Yield (L) *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="10.5"
                value={formData.eveningQuantity}
                onChange={(e) => setFormData({ ...formData, eveningQuantity: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fat % (Standard 4.2%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.fatPercentage}
                onChange={(e) => setFormData({ ...formData, fatPercentage: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SNF % (Standard 8.5%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.snfPercentage}
                onChange={(e) => setFormData({ ...formData, snfPercentage: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Normal yield, good milk flow"
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
              Record Milk Yield
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
