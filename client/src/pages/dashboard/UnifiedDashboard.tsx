import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wheat,
  Milk,
  Egg,
  DollarSign,
  TrendingUp,
  Boxes,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/api';
import { DashboardCard } from '../../components/common/DashboardCard';
import { LoadingState } from '../../components/common/LoadingState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { QuickActionsModal } from '../../components/common/QuickActionsModal';

export const UnifiedDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [quickActionModal, setQuickActionModal] = useState<{ open: boolean; action: string }>({
    open: false,
    action: 'record_milk'
  });

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getUnifiedDashboard();
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Listen to global quick action refresh
    const handleRefresh = () => fetchDashboard();
    window.addEventListener('agrosphere_refresh_data', handleRefresh);
    return () => window.removeEventListener('agrosphere_refresh_data', handleRefresh);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading || !dashboardData) {
    return <LoadingState message="Aggregating live livestock, production & financial metrics..." />;
  }

  const { summary, trends, alerts, recentTransactions } = dashboardData;

  const openAction = (actionName: string) => {
    setQuickActionModal({ open: true, action: actionName });
  };

  // Pie chart colors for population
  const POPULATION_COLORS = ['#16a34a', '#0284c7', '#f59e0b'];
  const populationData = [
    { name: 'Dairy Cattle', value: summary.cattleCount },
    { name: 'Murrah Buffaloes', value: summary.buffaloCount },
    { name: 'Poultry Birds', value: summary.totalPoultry }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 md:p-8 shadow-card overflow-hidden">
        {/* Subtle background graphics */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Wheat className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Unified Farm Business Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Patil'}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Here is your farm business overview combining livestock status, daily yields, feed stocks, sales revenue, and net profit.
            </p>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openAction('record_milk')}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <Milk className="w-3.5 h-3.5 text-emerald-700" />
              <span>Record Milk</span>
            </button>
            <button
              onClick={() => openAction('record_egg')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-500/40 transition-all flex items-center space-x-1.5"
            >
              <Egg className="w-3.5 h-3.5" />
              <span>Record Eggs</span>
            </button>
            <button
              onClick={() => openAction('add_sale')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-500/40 transition-all flex items-center space-x-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>New Sale</span>
            </button>
            <button
              onClick={() => openAction('add_expense')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-500/40 transition-all flex items-center space-x-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Total Animals */}
        <DashboardCard
          title="Total Livestock"
          value={`${summary.totalAnimals} Head`}
          subtitle={`${summary.cattleCount} Cows • ${summary.buffaloCount} Buffaloes`}
          icon={Sparkles}
          colorScheme="emerald"
          onClick={() => navigate('/livestock/animals')}
        />

        {/* Total Poultry */}
        <DashboardCard
          title="Poultry Flocks"
          value={`${summary.totalPoultry.toLocaleString()} Birds`}
          subtitle="Layers, Broilers & Dual Purpose"
          icon={Egg}
          colorScheme="blue"
          onClick={() => navigate('/poultry/batches')}
        />

        {/* Today's Milk */}
        <DashboardCard
          title="Today's Milk Yield"
          value={`${summary.todayMilkProduction} L`}
          subtitle="Morning + Evening Recorded"
          icon={Milk}
          colorScheme="teal"
          trend={{ value: '4.2% Fat Avg', isPositive: true, label: 'Standard quality' }}
          onClick={() => navigate('/production/milk')}
        />

        {/* Today's Eggs */}
        <DashboardCard
          title="Today's Egg Collection"
          value={`${summary.todayEggProduction.toLocaleString()} Eggs`}
          subtitle={`${summary.todayGoodEggs.toLocaleString()} Grade-A Good Eggs`}
          icon={Egg}
          colorScheme="amber"
          trend={{ value: '98.5%', isPositive: true, label: 'Good egg rate' }}
          onClick={() => navigate('/production/eggs')}
        />

        {/* Monthly Sales */}
        <DashboardCard
          title="Monthly Farm Sales"
          value={formatCurrency(summary.monthlySales)}
          subtitle="From dairy, eggs & livestock"
          icon={TrendingUp}
          colorScheme="emerald"
          onClick={() => navigate('/business/sales')}
        />

        {/* Monthly Expenses */}
        <DashboardCard
          title="Monthly Farm Expenses"
          value={formatCurrency(summary.monthlyExpenses)}
          subtitle="Feed, staff payroll, electricity, vet"
          icon={DollarSign}
          colorScheme="rose"
          onClick={() => navigate('/business/expenses')}
        />

        {/* Net Profit / Loss */}
        <DashboardCard
          title="Net Operating Profit"
          value={formatCurrency(summary.netProfitLoss)}
          subtitle={summary.netProfitLoss >= 0 ? 'Operating in Profit' : 'Operating at Loss'}
          icon={Activity}
          colorScheme={summary.netProfitLoss >= 0 ? 'emerald' : 'rose'}
          trend={{
            value: formatCurrency(Math.abs(summary.netProfitLoss)),
            isPositive: summary.netProfitLoss >= 0,
            label: 'Net Balance'
          }}
          onClick={() => navigate('/finance')}
        />

        {/* Inventory Value */}
        <DashboardCard
          title="Total Inventory Value"
          value={formatCurrency(summary.totalInventoryValue)}
          subtitle="Feed, medicine & farm supplies"
          icon={Boxes}
          colorScheme="purple"
          onClick={() => navigate('/resources/inventory')}
        />
      </div>

      {/* 3. Operational & Financial Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trends Chart (7 Days) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daily Milk & Egg Production (Last 7 Days)</h3>
              <p className="text-xs text-slate-500">Live comparison between dairy output and egg collection</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="flex items-center text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-1.5"></span>
                Milk (Litres)
              </span>
              <span className="flex items-center text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
                Eggs (Good)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.productionLast7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="milkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="eggGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#16a34a" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#f59e0b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="milk"
                  name="Milk (L)"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#milkGradient)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="eggs"
                  name="Good Eggs"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#eggGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue vs Expenses Financial Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sales vs Expenses (6-Month Trend)</h3>
              <p className="text-xs text-slate-500">Monthly cash performance and margin analysis</p>
            </div>
            <button
              onClick={() => navigate('/finance')}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center"
            >
              Full P&L →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends.monthlyFinancials} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" name="Sales Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Operating Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Smart Alerts Center Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Critical Farm Alerts & Follow-Ups</h3>
              <p className="text-xs text-slate-500">Automated proactive alerts across stock, health, and finance</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Manage Alerts Center
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Low Stock Alerts */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                <Boxes className="w-3.5 h-3.5 text-amber-600" />
                <span>Low Inventory & Feed</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {alerts.lowStockItems.length}
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {alerts.lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic">All feeds and items sufficiently stocked</p>
              ) : (
                alerts.lowStockItems.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{item.name}</span>
                    <span className="text-amber-700 font-bold shrink-0">{item.stock} left</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Medicine Expiry */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Medicine Expiry Alert</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {alerts.expiringMedicines.length}
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {alerts.expiringMedicines.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No medicines nearing expiry</p>
              ) : (
                alerts.expiringMedicines.slice(0, 3).map((med: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <span className="font-medium text-slate-700 truncate max-w-[140px]">{med.name}</span>
                    <span className="text-rose-600 font-semibold shrink-0">Exp: {formatDate(med.expiryDate)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vaccination Due */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Vaccinations Due</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {alerts.vaccinationsDue.length}
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {alerts.vaccinationsDue.length === 0 ? (
                <p className="text-xs text-slate-400 italic">All herd vaccinations up to date</p>
              ) : (
                alerts.vaccinationsDue.slice(0, 3).map((v: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{v.vaccine}</span>
                    <span className="text-blue-700 font-semibold shrink-0">{formatDate(v.dueDate)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Population Breakdown & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Population Breakdown Pie */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Livestock & Poultry Population</h3>
            <p className="text-xs text-slate-500 mb-4">Total headcount across active sheds and barns</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={populationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {populationData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={POPULATION_COLORS[index % POPULATION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-2"></span>
                Dairy Cows
              </span>
              <span className="font-bold text-slate-800">{summary.cattleCount} Head</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 mr-2"></span>
                Murrah Buffaloes
              </span>
              <span className="font-bold text-slate-800">{summary.buffaloCount} Head</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                Poultry Birds
              </span>
              <span className="font-bold text-slate-800">{summary.totalPoultry.toLocaleString()} Birds</span>
            </div>
          </div>
        </div>

        {/* Recent Sales Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Recent Sales Invoices</h3>
              <button
                onClick={() => navigate('/business/sales')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.sales.slice(0, 4).map((s: any) => (
                <div key={s._id} className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{s.customerName}</p>
                    <p className="text-[11px] text-slate-500">{s.productType} • {s.quantity} {s.unit}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-emerald-700">+{formatCurrency(s.netAmount)}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      s.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {s.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => openAction('add_sale')}
            className="w-full mt-4 py-2 border border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New Sale Invoice</span>
          </button>
        </div>

        {/* Recent Farm Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Recent Operating Expenses</h3>
              <button
                onClick={() => navigate('/business/expenses')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.expenses.slice(0, 4).map((e: any) => (
                <div key={e._id} className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{e.description}</p>
                    <p className="text-[11px] text-slate-500">{e.category} • {formatDate(e.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-rose-600">-{formatCurrency(e.amount)}</p>
                    <span className="text-[10px] text-slate-400">{e.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => openAction('add_expense')}
            className="w-full mt-4 py-2 border border-dashed border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Farm Expense</span>
          </button>
        </div>
      </div>

      {/* Global Quick Action Modal */}
      <QuickActionsModal
        isOpen={quickActionModal.open}
        initialAction={quickActionModal.action}
        onClose={() => setQuickActionModal({ open: false, action: 'record_milk' })}
        onSuccess={() => fetchDashboard()}
      />
    </div>
  );
};
