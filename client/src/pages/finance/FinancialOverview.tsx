import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Wallet,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { financeService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';
import { DashboardCard } from '../../components/common/DashboardCard';
import { formatCurrency } from '../../utils/formatters';

export const FinancialOverview: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [financeData, setFinanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinance = async () => {
    try {
      setIsLoading(true);
      const res = await financeService.getOverview(selectedYear);
      setFinanceData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [selectedYear]);

  if (isLoading || !financeData) {
    return <LoadingState message="Calculating real-time ledger revenue, cash flows & net profits..." />;
  }

  const { metrics, lifetimeMetrics, charts } = financeData;
  const isProfitable = metrics.netProfit >= 0;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Financial Management & Profitability
          </h1>
          <p className="text-xs text-slate-500">
            Combined financial ledger synthesized directly from sales receipts, vendor expenses, and customer credit
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-500">Fiscal Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value={2026}>FY 2026</option>
            <option value={2025}>FY 2025</option>
            <option value={2024}>FY 2024</option>
          </select>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <DashboardCard
          title="Annual Gross Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="Billed milk, eggs, livestock & products"
          icon={TrendingUp}
          colorScheme="emerald"
        />

        {/* Total Expenses */}
        <DashboardCard
          title="Annual Operating Cost"
          value={formatCurrency(metrics.totalExpenses)}
          subtitle="Feed, staff wages, power & logistics"
          icon={DollarSign}
          colorScheme="rose"
        />

        {/* Net Operating Profit */}
        <DashboardCard
          title="Net Operating Profit / (Loss)"
          value={formatCurrency(metrics.netProfit)}
          subtitle={`${metrics.profitMargin}% Profit Margin`}
          icon={Activity}
          colorScheme={isProfitable ? 'emerald' : 'rose'}
          trend={{
            value: `${metrics.profitMargin}%`,
            isPositive: isProfitable,
            label: 'Net Margin'
          }}
        />

        {/* Outstanding Receivables */}
        <DashboardCard
          title="Receivables Pending"
          value={formatCurrency(metrics.outstandingPayments)}
          subtitle="Uncollected customer balances"
          icon={Wallet}
          colorScheme="amber"
        />
      </div>

      {/* Main Charts Row: Cash Flow & Profit Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue vs Expense Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Revenue vs Operating Expenses ({selectedYear})</h3>
              <p className="text-xs text-slate-500">Database calculated comparison</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyCashFlow} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" name="Sales Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Operating Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Net Profit Trend Line */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Net Profit Trend ({selectedYear})</h3>
              <p className="text-xs text-slate-500">Revenue minus expenses across each operational month</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyCashFlow} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name="Net Profit (₹)"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#16a34a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Sales by Category & Expenses by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Sales Revenue by Farm Product</h3>
          <p className="text-xs text-slate-500 mb-4">Proportionate revenue share from dairy, poultry and crops</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.salesByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts.salesByCategory || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {(charts.salesByCategory || []).map((cat: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center truncate max-w-[160px]">
                    <span
                      className="w-2 h-2 rounded-full mr-2 shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></span>
                    {cat.name}
                  </span>
                  <span className="font-bold shrink-0">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Operating Expenses by Cost Center</h3>
          <p className="text-xs text-slate-500 mb-4">Feed, wages, power, and logistics distribution</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.expensesByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts.expensesByCategory || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {(charts.expensesByCategory || []).map((cat: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center truncate max-w-[160px]">
                    <span
                      className="w-2 h-2 rounded-full mr-2 shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></span>
                    {cat.name}
                  </span>
                  <span className="font-bold shrink-0">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
