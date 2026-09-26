import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, Mail, MapPin, DollarSign, Edit2, Trash2, Eye } from 'lucide-react';
import { customerService } from '../../services/api';
import { Customer } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const CustomerManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<any>({ totalCustomers: 0, totalOutstanding: 0, totalLifetimePurchases: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewHistoryCustomer, setViewHistoryCustomer] = useState<any | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    customerType: 'Wholesaler / Distributor',
    creditLimit: 50000,
    notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await customerService.getAll();
      setCustomers(res.data.customers || []);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      customerType: 'Wholesaler / Distributor',
      creditLimit: 50000,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      customerType: c.customerType,
      creditLimit: c.creditLimit || 50000,
      notes: c.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer._id, formData);
      } else {
        await customerService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving customer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this customer profile?')) return;
    try {
      await customerService.delete(id);
      fetchData();
    } catch (err) {
      alert('Error deleting customer');
    }
  };

  const handleViewHistory = async (c: Customer) => {
    try {
      const res = await customerService.getById(c._id);
      setViewHistoryCustomer(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Buyer / Client Name',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800">{item.name}</span>
          <span className="block text-xs text-slate-500">{item.customerType}</span>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact Information',
      render: (item) => (
        <div>
          <span className="font-medium text-slate-800">{item.phone}</span>
          {item.email && <span className="block text-xs text-slate-400">{item.email}</span>}
        </div>
      )
    },
    {
      key: 'totalPurchases',
      header: 'Lifetime Purchases',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-emerald-700 text-sm">
          {formatCurrency(item.totalPurchases || 0)}
        </span>
      )
    },
    {
      key: 'outstandingBalance',
      header: 'Receivable Due',
      sortable: true,
      render: (item) => (
        <span
          className={`font-extrabold text-sm ${
            item.outstandingBalance > 0 ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          {formatCurrency(item.outstandingBalance || 0)}
        </span>
      )
    },
    {
      key: 'address',
      header: 'Address',
      render: (item) => <span className="text-xs text-slate-600 truncate max-w-xs block">{item.address || '-'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleViewHistory(item)}
            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
            title="Purchase History"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canManage && (
            <>
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
            Customer & Cooperative Directory
          </h1>
          <p className="text-xs text-slate-500">
            Manage dairy unions, supermarkets, wholesalers, hotel buyers, and monitor credit ledger balances
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Clients</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalCustomers || 0} Buyers</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Lifetime Business</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(stats.totalLifetimePurchases || 0)}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Receivables</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${stats.totalOutstanding > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {formatCurrency(stats.totalOutstanding || 0)}
          </h3>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        searchPlaceholder="Search customer by name, phone, or email..."
        onRowClick={(c) => handleViewHistory(c)}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Profile' : 'Add New Customer / Buyer'}
        subtitle="Manage contact details and credit balance limit"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Entity Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sahyadri Supermarkets"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98XXX XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="procurement@client.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Category</label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Dairy Cooperative">Dairy Cooperative</option>
                <option value="Wholesaler / Distributor">Wholesaler / Distributor</option>
                <option value="Local Retailer">Local Retailer</option>
                <option value="Hotel / Restaurant">Hotel / Restaurant</option>
                <option value="Individual Consumer">Individual Consumer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Credit Limit (₹)</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address / Dispatch Destination</label>
            <input
              type="text"
              placeholder="e.g. Pune City Distribution Center"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Commercial Notes</label>
            <textarea
              rows={2}
              placeholder="Settlement terms, payment cycle notes..."
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
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* View Customer History Modal */}
      {viewHistoryCustomer && (
        <Modal
          isOpen={!!viewHistoryCustomer}
          onClose={() => setViewHistoryCustomer(null)}
          title={`Client Profile: ${viewHistoryCustomer.customer?.name}`}
          subtitle={`Type: ${viewHistoryCustomer.customer?.customerType} • Phone: ${viewHistoryCustomer.customer?.phone}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Lifetime Purchases</span>
                <span className="text-base font-bold text-emerald-700">
                  {formatCurrency(viewHistoryCustomer.customer?.totalPurchases)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Current Balance Outstanding</span>
                <span className="text-base font-bold text-rose-600">
                  {formatCurrency(viewHistoryCustomer.customer?.outstandingBalance)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Order & Invoicing History ({viewHistoryCustomer.salesHistory?.length || 0})
              </h4>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {viewHistoryCustomer.salesHistory?.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">No invoices recorded yet</p>
                ) : (
                  viewHistoryCustomer.salesHistory?.map((sale: any) => (
                    <div key={sale._id} className="p-3 flex justify-between items-center text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800">{sale.invoiceNumber}</span>
                        <span className="block text-slate-500">
                          {sale.productType} • {sale.quantity} {sale.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{formatCurrency(sale.netAmount)}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                            sale.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {sale.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
