import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Egg, Skull, Wheat, Layers, Calendar, Pill, Activity, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { poultryService } from '../../services/api';
import { PoultryBatch, EggRecord, Vaccination, HealthRecord } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export const BatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [batch, setBatch] = useState<PoultryBatch | null>(null);
  const [history, setHistory] = useState<{
    eggRecords: EggRecord[];
    vaccinations: Vaccination[];
    healthRecords: HealthRecord[];
    stats: any;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    poultryService.getById(id)
      .then((res) => {
        setBatch(res.data.batch);
        setHistory(res.data.history);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading || !batch) {
    return <LoadingState message="Loading poultry flock performance history..." />;
  }

  const shedObj = typeof batch.shed === 'object' ? batch.shed : null;
  const mortalityRate = batch.initialCount ? ((batch.mortalityCount / batch.initialCount) * 100).toFixed(1) : 0;

  // Chart data
  const eggChartData = (history?.eggRecords || []).slice(0, 14).reverse().map((r) => ({
    date: formatDate(r.date),
    good: r.goodEggs,
    broken: r.brokenEggs,
    total: r.totalEggs
  }));

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/poultry/batches')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Poultry Batches</span>
      </button>

      {/* Main Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              <Egg className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">{batch.batchName}</h1>
                <StatusBadge status={batch.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Batch ID: <span className="font-mono font-bold text-slate-700">{batch.batchId}</span> • {batch.breed} (
                {batch.birdType})
              </p>
            </div>
          </div>

          <StatusBadge status={batch.healthStatus} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Current Birds</span>
            <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
              {batch.currentCount.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Initial Count</span>
            <span className="font-bold text-slate-700 text-sm mt-0.5 block">
              {batch.initialCount.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Mortality Rate</span>
            <span className="font-bold text-rose-600 text-sm mt-0.5 block">
              {batch.mortalityCount} ({mortalityRate}%)
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Flock Age</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {batch.ageWeeks} Weeks
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Daily Feed Intake</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {batch.dailyFeedIntakeKg || 0} kg/day
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl">
            <span className="text-slate-400 block font-medium">Assigned Shed</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block truncate">
              {shedObj?.name || 'Layer House 1'}
            </span>
          </div>
        </div>

        {batch.notes && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-700">
            <span className="font-bold text-amber-900 mr-1">Batch Notes:</span>
            {batch.notes}
          </div>
        )}
      </div>

      {/* Production & Collection History */}
      <div className="space-y-4">
        {eggChartData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Daily Egg Yield Collection Trend</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eggChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="good"
                    name="Good Eggs"
                    stroke="#f59e0b"
                    fill="#fef3c7"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Egg Production Collection Records</h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Eggs Collected: <strong className="text-emerald-700">{history?.stats?.totalEggsCollected?.toLocaleString() || 0}</strong>
            </span>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Total Eggs</th>
                <th className="py-3 px-4 text-center">Good / Grade-A</th>
                <th className="py-3 px-4 text-center">Broken / Damaged</th>
                <th className="py-3 px-4 text-center">Lay Rate %</th>
                <th className="py-3 px-4">Collector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(history?.eggRecords || []).map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-800">{formatDate(r.date)}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">{r.totalEggs.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">{r.goodEggs.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center text-rose-600">{r.brokenEggs}</td>
                  <td className="py-3 px-4 text-center font-semibold text-blue-700">
                    {r.layRatePercentage ? `${r.layRatePercentage}%` : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{r.collectedBy || 'Staff'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
