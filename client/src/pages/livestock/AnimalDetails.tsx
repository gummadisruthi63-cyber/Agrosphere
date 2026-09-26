import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Milk,
  Pill,
  Activity,
  Calendar,
  Layers,
  Scale,
  DollarSign,
  Heart,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { animalService, milkService } from '../../services/api';
import { Animal, MilkRecord, Vaccination, HealthRecord } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const AnimalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [history, setHistory] = useState<{
    milkRecords: MilkRecord[];
    vaccinations: Vaccination[];
    healthRecords: HealthRecord[];
    stats: any;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'milk' | 'vaccines' | 'health'>('milk');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    animalService.getById(id)
      .then((res) => {
        setAnimal(res.data.animal);
        setHistory(res.data.history);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading || !animal) {
    return <LoadingState message="Loading animal profile and veterinary history..." />;
  }

  // Format chart data for 14-day yield
  const milkChartData = (history?.milkRecords || []).slice(0, 14).reverse().map((r) => ({
    date: formatDate(r.date),
    morning: r.morningQuantity,
    evening: r.eveningQuantity,
    total: r.totalQuantity
  }));

  const shedObj = typeof animal.shed === 'object' ? animal.shed : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/livestock/animals')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Animals Registry</span>
      </button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {animal.name ? animal.name.charAt(0) : animal.animalType.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                  {animal.name || `Tag #${animal.tagNumber}`}
                </h1>
                <StatusBadge status={animal.healthStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tag: <span className="font-mono font-bold text-slate-700">{animal.tagNumber}</span> • ID:{' '}
                <span className="font-mono font-bold text-slate-700">{animal.animalId}</span> • {animal.animalType} (
                {animal.breed})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={animal.lactationStatus} />
            <StatusBadge status={animal.pregnancyStatus} />
          </div>
        </div>

        {/* Attribute Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Daily Avg Yield</span>
            <span className="font-extrabold text-emerald-700 text-sm mt-0.5 block">
              {animal.dailyAverageYield || 0} Litres/day
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Live Weight</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {animal.weight || '-'} kg
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Housing Shed</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">
              {shedObj?.name || 'Main Shed A'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Expected Calving</span>
            <span className="font-bold text-purple-700 text-sm mt-0.5 block">
              {formatDate(animal.expectedCalvingDate)}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Purchase Cost</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {formatCurrency(animal.purchasePrice || 0)}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Date of Birth</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {formatDate(animal.dateOfBirth)}
            </span>
          </div>
        </div>

        {animal.notes && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/60 text-xs text-slate-700">
            <span className="font-bold text-emerald-900 mr-1">Notes:</span>
            {animal.notes}
          </div>
        )}
      </div>

      {/* Tabs for Milk History, Vaccination, and Health */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('milk')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'milk'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Milk className="w-4 h-4" />
            <span>Milk Production History ({history?.milkRecords.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('vaccines')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'vaccines'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Vaccination Records ({history?.vaccinations.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'health'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Veterinary Clinical Cases ({history?.healthRecords.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: Milk Records */}
        {activeTab === 'milk' && (
          <div className="space-y-5">
            {milkChartData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Daily Milk Output Trend (Litres)</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={milkChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Daily Yield (L)"
                        stroke="#16a34a"
                        fill="#dcfce7"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Morning</th>
                    <th className="py-3 px-4 text-center">Evening</th>
                    <th className="py-3 px-4 text-center">Total Yield</th>
                    <th className="py-3 px-4 text-center">Fat %</th>
                    <th className="py-3 px-4">Milker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(history?.milkRecords || []).map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-800">{formatDate(r.date)}</td>
                      <td className="py-3 px-4 text-center text-slate-600">{r.morningQuantity} L</td>
                      <td className="py-3 px-4 text-center text-slate-600">{r.eveningQuantity} L</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">{r.totalQuantity} L</td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">{r.fatPercentage || 4.2}%</td>
                      <td className="py-3 px-4 text-slate-500">{r.recordedBy || 'Milker'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Vaccinations */}
        {activeTab === 'vaccines' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Vaccine Name</th>
                  <th className="py-3 px-4">Target Disease</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Administered</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Veterinarian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(history?.vaccinations || []).map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-800">{v.vaccineName}</td>
                    <td className="py-3 px-4 text-slate-600">{v.diseasePrevented || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{formatDate(v.dueDate)}</td>
                    <td className="py-3 px-4 text-slate-500">{v.administeredDate ? formatDate(v.administeredDate) : 'Pending'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-600">{v.veterinarian || 'Dr. Sharma'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Health Records */}
        {activeTab === 'health' && (
          <div className="space-y-3">
            {(history?.healthRecords || []).map((h) => (
              <div key={h._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-soft space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{h.diagnosis}</h4>
                    <span className="text-[11px] text-slate-400">Examined on {formatDate(h.recordDate)} by {h.veterinarian}</span>
                  </div>
                  <StatusBadge status={h.status} size="sm" />
                </div>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Symptoms:</span> {h.symptoms}
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Treatment:</span> {h.treatment}
                </p>
                {h.medicationsPrescribed && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Prescription:</span> {h.medicationsPrescribed}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
