import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Eye, Edit2, Trash2, Filter } from 'lucide-react';
import { animalService, farmService } from '../../services/api';
import { Animal, Shed } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { useAuth } from '../../context/AuthContext';

export const AnimalsList: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [stats, setStats] = useState<any>({ totalCows: 0, totalBuffaloes: 0, lactatingCount: 0, pregnantCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [lactationFilter, setLactationFilter] = useState('All');
  const [healthFilter, setHealthFilter] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; animalId: string | null }>({
    open: false,
    animalId: null
  });

  const [formData, setFormData] = useState({
    animalId: '',
    tagNumber: '',
    name: '',
    animalType: 'Cow',
    breed: 'Holstein Friesian Cross',
    gender: 'Female',
    weight: 450,
    healthStatus: 'Healthy',
    lactationStatus: 'Lactating',
    pregnancyStatus: 'Not Pregnant',
    dailyAverageYield: 18.5,
    shed: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [animRes, statRes, shedRes] = await Promise.all([
        animalService.getAll({
          type: typeFilter,
          lactationStatus: lactationFilter,
          healthStatus: healthFilter
        }),
        animalService.getStats(),
        farmService.getSheds()
      ]);
      setAnimals(animRes.data.animals || []);
      setStats(statRes.data.stats || {});
      setSheds(shedRes.data.sheds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, lactationFilter, healthFilter]);

  const handleOpenAdd = () => {
    setEditingAnimal(null);
    const count = animals.length + 101;
    setFormData({
      animalId: `ANIM-${count}`,
      tagNumber: `IND-9021-${String(count).slice(-2)}`,
      name: '',
      animalType: 'Cow',
      breed: 'Holstein Friesian Cross',
      gender: 'Female',
      weight: 460,
      healthStatus: 'Healthy',
      lactationStatus: 'Lactating',
      pregnancyStatus: 'Not Pregnant',
      dailyAverageYield: 18,
      shed: sheds[0]?._id || '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormData({
      animalId: animal.animalId,
      tagNumber: animal.tagNumber,
      name: animal.name,
      animalType: animal.animalType,
      breed: animal.breed,
      gender: animal.gender,
      weight: animal.weight || 450,
      healthStatus: animal.healthStatus,
      lactationStatus: animal.lactationStatus,
      pregnancyStatus: animal.pregnancyStatus,
      dailyAverageYield: animal.dailyAverageYield || 0,
      shed: typeof animal.shed === 'object' ? animal.shed?._id || '' : animal.shed || '',
      notes: animal.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnimal) {
        await animalService.update(editingAnimal._id, formData);
      } else {
        await animalService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving animal');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.animalId) return;
    try {
      await animalService.delete(deleteConfirm.animalId);
      setDeleteConfirm({ open: false, animalId: null });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting animal');
    }
  };

  const columns: Column<Animal>[] = [
    {
      key: 'tagNumber',
      header: 'Tag & ID',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800">{item.tagNumber}</span>
          <span className="block text-[10px] text-slate-400 font-mono">{item.animalId}</span>
        </div>
      )
    },
    {
      key: 'name',
      header: 'Name & Breed',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-800">{item.name || item.breed}</span>
          <span className="block text-xs text-slate-500">
            {item.animalType} • {item.breed}
          </span>
        </div>
      )
    },
    {
      key: 'lactationStatus',
      header: 'Lactation',
      sortable: true,
      render: (item) => <StatusBadge status={item.lactationStatus} size="sm" />
    },
    {
      key: 'pregnancyStatus',
      header: 'Reproduction',
      sortable: true,
      render: (item) => <StatusBadge status={item.pregnancyStatus} size="sm" />
    },
    {
      key: 'dailyAverageYield',
      header: 'Daily Yield',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-emerald-700">
          {item.dailyAverageYield ? `${item.dailyAverageYield} L/day` : '-'}
        </span>
      )
    },
    {
      key: 'healthStatus',
      header: 'Health',
      sortable: true,
      render: (item) => <StatusBadge status={item.healthStatus} size="sm" />
    },
    {
      key: 'shed',
      header: 'Housing Shed',
      render: (item) => {
        const shedObj = typeof item.shed === 'object' ? item.shed : null;
        return <span className="text-xs text-slate-600">{shedObj?.name || 'Main Barn'}</span>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/livestock/animals/${item._id}`)}
            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            title="View Animal Details & Milk History"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canManage && (
            <>
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Animal"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm({ open: true, animalId: item._id })}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Animal"
              >
                <Trash2 className="w-4 h-4" />
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
            Livestock Registry (Cattle & Buffaloes)
          </h1>
          <p className="text-xs text-slate-500">
            Track individual animal profiles, ear tags, lactation cycles, pregnancy and health states
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Animal</span>
          </button>
        )}
      </div>

      {/* Mini KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Dairy Cattle</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalCows || 0} Head</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Murrah Buffaloes</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalBuffaloes || 0} Head</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Currently Lactating</p>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">{stats.lactatingCount || 0} Milking</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pregnant / In Calf</p>
          <h3 className="text-2xl font-bold text-purple-700 mt-1">{stats.pregnantCount || 0} Cows</h3>
        </div>
      </div>

      {/* Filter Component */}
      <DataTable
        columns={columns}
        data={animals}
        isLoading={isLoading}
        searchPlaceholder="Search by tag number, name, breed, or ID..."
        searchField={(a) => `${a.tagNumber} ${a.name} ${a.breed} ${a.animalId}`}
        onRowClick={(item) => navigate(`/livestock/animals/${item._id}`)}
        filterComponent={
          <div className="flex items-center space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Types</option>
              <option value="Cow">Cows Only</option>
              <option value="Buffalo">Buffaloes Only</option>
            </select>

            <select
              value={lactationFilter}
              onChange={(e) => setLactationFilter(e.target.value)}
              className="text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Lactation</option>
              <option value="Lactating">Lactating</option>
              <option value="Dry">Dry</option>
              <option value="Heifer">Heifer</option>
            </select>

            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Health</option>
              <option value="Healthy">Healthy</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Sick">Sick</option>
            </select>
          </div>
        }
      />

      {/* Modal for Add / Edit Animal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnimal ? 'Edit Animal Record' : 'Register New Animal'}
        subtitle="Complete RFID tag number and breeding attributes"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tag Number *</label>
              <input
                type="text"
                required
                placeholder="IND-9021-09"
                value={formData.tagNumber}
                onChange={(e) => setFormData({ ...formData, tagNumber: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Animal ID *</label>
              <input
                type="text"
                required
                placeholder="COW-109"
                value={formData.animalId}
                onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Name / Call Sign</label>
              <input
                type="text"
                placeholder="e.g. Ganga"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Animal Species *</label>
              <select
                value={formData.animalType}
                onChange={(e) => setFormData({ ...formData, animalType: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cow">Cow</option>
                <option value="Buffalo">Buffalo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Breed *</label>
              <input
                type="text"
                required
                placeholder="Holstein / Murrah / Gir"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lactation State</label>
              <select
                value={formData.lactationStatus}
                onChange={(e) => setFormData({ ...formData, lactationStatus: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Lactating">Lactating</option>
                <option value="Dry">Dry</option>
                <option value="Heifer">Heifer</option>
                <option value="Calf">Calf</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pregnancy State</label>
              <select
                value={formData.pregnancyStatus}
                onChange={(e) => setFormData({ ...formData, pregnancyStatus: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Not Pregnant">Not Pregnant</option>
                <option value="Inseminated">Inseminated</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Calved Recently">Calved Recently</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Health Status</label>
              <select
                value={formData.healthStatus}
                onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Healthy">Healthy</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Sick">Sick</option>
                <option value="Quarantined">Quarantined</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Daily Yield (L)</label>
              <input
                type="number"
                step="0.1"
                value={formData.dailyAverageYield}
                onChange={(e) => setFormData({ ...formData, dailyAverageYield: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Housing Shed</label>
              <select
                value={formData.shed}
                onChange={(e) => setFormData({ ...formData, shed: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Barn/Shed --</option>
                {sheds.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.shedNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes & Pedigree Info</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Save Animal Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, animalId: null })}
        onConfirm={handleDelete}
        title="Remove Animal Record"
        message="Are you sure you want to remove this animal from the registry? Historical milk logs will remain archived."
      />
    </div>
  );
};
