import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Calendar, Tag, CreditCard, PieChart as PieIcon, Trash2, Edit2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { expenseService } from '../../services/api';
import { Expense } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const ExpenseManagement: React.FC = () => {
  const { hasRole, user } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<any>({ totalExpenseAmount: 0, categoryBreakdown: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form
  const [formData, setFormData] = useState({
    category: 'Feed & Nutrition',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'Cash',
    vendor: '',
    receiptNumber: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await expenseService.getAll({ category: categoryFilter });
      setExpenses(res.data.expenses || []);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      category: 'Feed & Nutrition',
      amount: 5000,
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'UPI / QR',
      vendor: '',
      receiptNumber: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (e: Expense) => {
    setEditingExpense(e);
    setFormData({
      category: e.category,
      amount: e.amount,
      date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
      description: e.description,
      paymentMethod: e.paymentMethod,
      vendor: e.vendor || '',
      receiptNumber: e.receiptNumber || '',
      notes: e.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await expenseService.update(editingExpense._id, formData);
      } else {
        await expenseService.create({
          ...formData,
          amount: Number(formData.amount),
          recordedBy: user?.name || 'Admin'
        });
      }
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await expenseService.delete(id);
      fetchData();
    } catch (err) {
      alert('Error deleting expense');
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

  const columns: Column<Expense>[] = [
    {
      key: 'date',
      header: 'Expense Date',
      sortable: true,
      render: (item) => <span className="font-semibold text-slate-800">{formatDate(item.date)}</span>
    },
    {
      key: 'description',
      header: 'Description & Vendor',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800">{item.description}</span>
          <span className="block text-xs text-slate-500">
            {item.category} {item.vendor ? `• ${item.vendor}` : ''}
          </span>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
          {item.category}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (item) => <span className="font-extrabold text-rose-600 text-sm">-{formatCurrency(item.amount)}</span>
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (item) => <span className="text-xs text-slate-600 font-medium">{item.paymentMethod}</span>
    },
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (item) => <span className="text-xs text-slate-400 font-mono">{item.receiptNumber || '-'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) =>
        canManage ? (
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleOpenEdit(item)}
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(item._id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Farm Expense Tracking & Outflow
          </h1>
          <p className="text-xs text-slate-500">
            Itemize operational costs across animal feeds, vaccines, labor payroll, energy, and maintenance
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Farm Expense</span>
          </button>
        )}
      </div>

      {/* KPI & Category Breakdown Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Recorded Expenses</p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-2">
              {formatCurrency(stats.totalExpenseAmount || 0)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Across {expenses.length} operating disbursements</p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            Integrated automatically with the Unified Dashboard and Profit & Loss report.
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-soft">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Expense Allocation by Operating Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {(stats.categoryBreakdown || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-2 text-xs">
              {(stats.categoryBreakdown || []).map((cat: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center truncate max-w-[170px]">
                    <span
                      className="w-2 h-2 rounded-full mr-1.5 shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></span>
                    {cat.category}
                  </span>
                  <span className="font-bold shrink-0">{formatCurrency(cat.amount)} ({cat.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={expenses}
        isLoading={isLoading}
        searchPlaceholder="Search expense by description, category, or vendor..."
        filterComponent={
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white"
          >
            <option value="All">All Expense Categories</option>
            <option value="Feed & Nutrition">Feed & Nutrition</option>
            <option value="Salaries & Wages">Salaries & Wages</option>
            <option value="Electricity & Power">Electricity & Power</option>
            <option value="Medicine & Vaccines">Medicine & Vaccines</option>
            <option value="Transportation & Logistics">Transportation</option>
            <option value="Farm Maintenance & Repair">Maintenance</option>
            <option value="Packaging Materials">Packaging</option>
          </select>
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Farm Expense'}
        subtitle="Itemize costs for real-time net profit calculations"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expense Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Feed & Nutrition">Feed & Nutrition</option>
                <option value="Medicine & Vaccines">Medicine & Vaccines</option>
                <option value="Salaries & Wages">Salaries & Wages</option>
                <option value="Electricity & Power">Electricity & Power</option>
                <option value="Water & Irrigation">Water & Irrigation</option>
                <option value="Transportation & Logistics">Transportation & Logistics</option>
                <option value="Farm Maintenance & Repair">Farm Maintenance & Repair</option>
                <option value="Animal Purchase">Animal Purchase</option>
                <option value="Poultry Chicks Purchase">Poultry Chicks Purchase</option>
                <option value="Machinery & Equipment">Machinery & Equipment</option>
                <option value="Packaging Materials">Packaging Materials</option>
                <option value="Other Operational Expenses">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expense Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Purchased 10 bags of Layer Mash feed"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Payee</label>
              <input
                type="text"
                placeholder="e.g. Kisan Feeds Ltd"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receipt / Invoice Ref #</label>
              <input
                type="text"
                placeholder="RCP-9012"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Cash">Cash</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
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
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
