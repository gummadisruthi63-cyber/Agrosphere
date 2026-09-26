import React, { useState, useEffect } from 'react';
import { Pill, Activity, Plus, CheckCircle, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { medicineService, animalService, poultryService } from '../../services/api';
import { Vaccination, HealthRecord, Animal, PoultryBatch } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const HealthVaccination: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [batches, setBatches] = useState<PoultryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  // Forms
  const [vaccineForm, setVaccineForm] = useState({
    targetType: 'Animal',
    targetId: '',
    targetName: '',
    vaccineName: '',
    diseasePrevented: '',
    dueDate: new Date().toISOString().split('T')[0],
    veterinarian: 'Dr. Anand Joshi',
    notes: ''
  });

  const [healthForm, setHealthForm] = useState({
    targetType: 'Animal',
    targetId: '',
    targetName: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medicationsPrescribed: '',
    treatmentCost: '0',
    veterinarian: 'Dr. Anand Joshi',
    status: 'Active'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [vRes, hRes, aRes, bRes] = await Promise.all([
        medicineService.getVaccinations(),
        medicineService.getHealthRecords(),
        animalService.getAll(),
        poultryService.getAll()
      ]);
      setVaccinations(vRes.data.vaccinations || []);
      setHealthRecords(hRes.data.records || []);
      setAnimals(aRes.data.animals || []);
      setBatches(bRes.data.batches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkVaccineComplete = async (vId: string) => {
    try {
      await medicineService.updateVaccination(vId, {
        status: 'Completed',
        administeredDate: new Date()
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await medicineService.createVaccination(vaccineForm);
      setIsVaccineModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error scheduling vaccination');
    }
  };

  const handleSaveHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await medicineService.createHealthRecord(healthForm);
      setIsHealthModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving clinical case');
    }
  };

  const vaccineColumns: Column<Vaccination>[] = [
    {
      key: 'targetName',
      header: 'Target (Animal / Flock)',
      sortable: true,
      render: (item) => <span className="font-bold text-slate-800">{item.targetName}</span>
    },
    {
      key: 'vaccineName',
      header: 'Vaccine & Disease',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-800">{item.vaccineName}</span>
          <span className="block text-xs text-slate-500">{item.diseasePrevented || 'Scheduled Booster'}</span>
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (item) => <span className="font-medium text-slate-700">{formatDate(item.dueDate)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} size="sm" />
    },
    {
      key: 'veterinarian',
      header: 'Veterinarian',
      render: (item) => <span className="text-xs text-slate-600">{item.veterinarian}</span>
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) =>
        item.status !== 'Completed' && canManage ? (
          <button
            onClick={() => handleMarkVaccineComplete(item._id)}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-colors flex items-center space-x-1"
          >
            <CheckCircle className="w-3 h-3" />
            <span>Administered</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400">Done</span>
        )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Herd Health & Vaccination Schedules
          </h1>
          <p className="text-xs text-slate-500">
            Preventative immunology calendar, clinical diagnoses, and veterinary treatments
          </p>
        </div>

        {canManage && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsVaccineModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Vaccine</span>
            </button>
            <button
              onClick={() => setIsHealthModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Clinical Case</span>
            </button>
          </div>
        )}
      </div>

      {/* Vaccinations Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Pill className="w-4 h-4 text-emerald-600" />
          <span>Scheduled & Administered Vaccinations</span>
        </h3>
        <DataTable
          columns={vaccineColumns}
          data={vaccinations}
          isLoading={isLoading}
          searchPlaceholder="Search vaccine schedules..."
        />
      </div>

      {/* Clinical Diagnosis Section */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Active Veterinary Clinical Records & Diagnoses</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthRecords.map((record) => (
            <div key={record._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {formatDate(record.recordDate)}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{record.diagnosis}</h4>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{record.targetName}</p>
                </div>
                <StatusBadge status={record.status} size="sm" />
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p>
                  <strong className="text-slate-800">Symptoms:</strong> {record.symptoms}
                </p>
                <p>
                  <strong className="text-slate-800">Treatment:</strong> {record.treatment}
                </p>
                {record.medicationsPrescribed && (
                  <p>
                    <strong className="text-slate-800">Prescription:</strong> {record.medicationsPrescribed}
                  </p>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>Vet: {record.veterinarian}</span>
                  {record.treatmentCost ? (
                    <span className="font-bold text-slate-700">Cost: {formatCurrency(record.treatmentCost)}</span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Vaccine Modal */}
      <Modal
        isOpen={isVaccineModalOpen}
        onClose={() => setIsVaccineModalOpen(false)}
        title="Schedule Herd / Flock Vaccination"
        subtitle="Set disease booster and due date"
      >
        <form onSubmit={handleSaveVaccine} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Type</label>
            <select
              value={vaccineForm.targetType}
              onChange={(e) => setVaccineForm({ ...vaccineForm, targetType: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            >
              <option value="Animal">Dairy Cattle / Buffalo</option>
              <option value="PoultryBatch">Poultry Flock Batch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Target *</label>
            <select
              required
              value={vaccineForm.targetId}
              onChange={(e) => {
                const id = e.target.value;
                let name = '';
                if (vaccineForm.targetType === 'Animal') {
                  const a = animals.find((x) => x._id === id);
                  if (a) name = `${a.animalType} #${a.tagNumber} (${a.name || a.breed})`;
                } else {
                  const b = batches.find((x) => x._id === id);
                  if (b) name = `Flock ${b.batchId} (${b.breed})`;
                }
                setVaccineForm({ ...vaccineForm, targetId: id, targetName: name });
              }}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            >
              <option value="">-- Choose Animal or Batch --</option>
              {vaccineForm.targetType === 'Animal'
                ? animals.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.animalType} #{a.tagNumber} ({a.name || a.breed})
                    </option>
                  ))
                : batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      Flock {b.batchId} ({b.breed})
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vaccine Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. FMD Raksha-Ovac Booster"
              value={vaccineForm.vaccineName}
              onChange={(e) => setVaccineForm({ ...vaccineForm, vaccineName: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Disease</label>
            <input
              type="text"
              placeholder="e.g. Foot and Mouth Disease / Ranikhet"
              value={vaccineForm.diseasePrevented}
              onChange={(e) => setVaccineForm({ ...vaccineForm, diseasePrevented: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={vaccineForm.dueDate}
              onChange={(e) => setVaccineForm({ ...vaccineForm, dueDate: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsVaccineModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              Schedule Vaccine
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Clinical Case Modal */}
      <Modal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        title="Log Veterinary Clinical Case"
        subtitle="Record diagnosis and medication prescribed"
      >
        <form onSubmit={handleSaveHealth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Animal / Flock</label>
            <select
              required
              value={healthForm.targetId}
              onChange={(e) => {
                const id = e.target.value;
                const a = animals.find((x) => x._id === id);
                setHealthForm({
                  ...healthForm,
                  targetId: id,
                  targetName: a ? `${a.animalType} #${a.tagNumber} (${a.name || a.breed})` : ''
                });
              }}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            >
              <option value="">-- Choose Animal --</option>
              {animals.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.animalType} #{a.tagNumber} ({a.name || a.breed})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis / Condition *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mild Mastitis / Foot Rot"
              value={healthForm.diagnosis}
              onChange={(e) => setHealthForm({ ...healthForm, diagnosis: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms *</label>
            <input
              type="text"
              required
              placeholder="e.g. Swollen quarter, slight fever"
              value={healthForm.symptoms}
              onChange={(e) => setHealthForm({ ...healthForm, symptoms: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Performed *</label>
            <input
              type="text"
              required
              placeholder="e.g. Intramammary infusion & anti-inflammatory"
              value={healthForm.treatment}
              onChange={(e) => setHealthForm({ ...healthForm, treatment: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Medications Prescribed</label>
            <input
              type="text"
              placeholder="e.g. Mastalone + Flunixin"
              value={healthForm.medicationsPrescribed}
              onChange={(e) => setHealthForm({ ...healthForm, medicationsPrescribed: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Cost (₹)</label>
            <input
              type="number"
              placeholder="e.g. 1200"
              value={healthForm.treatmentCost}
              onChange={(e) => setHealthForm({ ...healthForm, treatmentCost: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsHealthModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Log Case
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
