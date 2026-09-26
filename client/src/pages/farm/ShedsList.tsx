import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { farmService } from '../../services/api';
import { Shed } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const ShedsList: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [sheds, setSheds] = useState<Shed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShed, setEditingShed] = useState<Shed | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; shedId: string | null }>({
    open: false,
    shedId: null
  });

  const [formData, setFormData] = useState({
    name: '',
    shedNumber: '',
    type: 'Dairy Cattle',
    capacity: 30,
    locationNotes: '',
    ventilationType: 'Cross Ventilation & Fans',
    status: 'Active'
  });

  const fetchSheds = async () => {
    try {
      setIsLoading(true);
      const res = await farmService.getSheds();
      setSheds(res.data.sheds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSheds();
  }, []);

  const handleOpenAdd = () => {
    setEditingShed(null);
    setFormData({
      name: '',
      shedNumber: `SHED-${String(sheds.length + 1).padStart(2, '0')}`,
      type: 'Dairy Cattle',
      capacity: 30,
      locationNotes: '',
      ventilationType: 'Cross Ventilation & Fans',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shed: Shed) => {
    setEditingShed(shed);
    setFormData({
      name: shed.name,
      shedNumber: shed.shedNumber,
      type: shed.type,
      capacity: shed.capacity,
      locationNotes: shed.locationNotes || '',
      ventilationType: shed.ventilationType || 'Cross Ventilation & Fans',
      status: shed.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShed) {
        await farmService.updateShed(editingShed._id, formData);
      } else {
        await farmService.createShed(formData);
      }
      setIsModalOpen(false);
      fetchSheds();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving shed');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.shedId) return;
    try {
      await farmService.deleteShed(deleteConfirm.shedId);
      setDeleteConfirm({ open: false, shedId: null });
      fetchSheds();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting shed');
    }
  };

  if (isLoading) return <LoadingState message="Loading farm sheds & enclosures..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Farm Sheds & Enclosures</h1>
          <p className="text-xs text-slate-500">
            Monitor compartmental occupancy, ventilation types, and livestock capacity allocations
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Shed</span>
          </button>
        )}
      </div>

      {/* Grid of Shed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sheds.map((shed) => {
          const occupancyRate = Math.min(100, Math.round(((shed.currentOccupancy || 0) / shed.capacity) * 100));
          const isOverCapacity = (shed.currentOccupancy || 0) > shed.capacity;

          return (
            <div
              key={shed._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft hover-lift flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {shed.shedNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 leading-tight">{shed.name}</h3>
                    </div>
                  </div>
                  <StatusBadge status={shed.status} size="sm" />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Compartment Type:</span>
                    <span className="font-semibold text-slate-700">{shed.type}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-400">Ventilation / Climate:</span>
                    <span className="font-medium text-slate-700">{shed.ventilationType}</span>
                  </div>

                  {shed.locationNotes && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mt-2">
                      {shed.locationNotes}
                    </div>
                  )}

                  {/* Occupancy Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-600">Current Occupancy</span>
                      <span className={`font-bold ${isOverCapacity ? 'text-rose-600' : 'text-slate-800'}`}>
                        {shed.currentOccupancy} / {shed.capacity} ({occupancyRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          occupancyRate > 90 ? 'bg-rose-500' : occupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {canManage && (
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEdit(shed)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit Shed"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ open: true, shedId: shed._id })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Shed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit Shed */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingShed ? 'Edit Shed / Compartment' : 'Add New Farm Shed'}
        subtitle="Specify capacity limits and ventilation setup"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shed Number *</label>
              <input
                type="text"
                required
                placeholder="SHED-01"
                value={formData.shedNumber}
                onChange={(e) => setFormData({ ...formData, shedNumber: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shed Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Milking Barn North"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Compartment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Dairy Cattle">Dairy Cattle</option>
                <option value="Buffalo Barn">Buffalo Barn</option>
                <option value="Poultry Broiler">Poultry Broiler</option>
                <option value="Poultry Layer">Poultry Layer</option>
                <option value="Feed Storage">Feed Storage</option>
                <option value="Quarantine / Hospital">Quarantine / Hospital</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Capacity Limit (Head / Birds) *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ventilation & Climate Type</label>
            <input
              type="text"
              placeholder="e.g. HVLS Fans, Foggers & Tunnel Ventilation"
              value={formData.ventilationType}
              onChange={(e) => setFormData({ ...formData, ventilationType: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location & Operational Notes</label>
            <textarea
              rows={2}
              placeholder="Notes on proximity to milking parlor or biosecurity protocols"
              value={formData.locationNotes}
              onChange={(e) => setFormData({ ...formData, locationNotes: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
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
              Save Shed
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, shedId: null })}
        onConfirm={handleDelete}
        title="Delete Shed Enclosure"
        message="Are you sure you want to delete this shed? Ensure no active animals or poultry batches are housed inside."
      />
    </div>
  );
};
