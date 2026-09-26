import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Printer, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { salesService, customerService, farmService } from '../../services/api';
import { Sale, Customer, Farm } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const SalesManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [stats, setStats] = useState<any>({ totalRevenue: 0, paidRevenue: 0, pendingAmount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);

  // Form
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customer: '',
    customerName: '',
    customerPhone: '',
    productType: 'Fresh Cow Milk',
    itemDescription: '',
    quantity: 100,
    unit: 'Litres',
    unitPrice: 42,
    discount: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer (NEFT/IMPS)',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sRes, cRes, fRes] = await Promise.all([
        salesService.getAll({
          paymentStatus: paymentFilter,
          productType: productFilter
        }),
        customerService.getAll(),
        farmService.getProfile()
      ]);
      setSales(sRes.data.sales || []);
      setStats(sRes.data.stats || {});
      setCustomers(cRes.data.customers || []);
      setFarm(fRes.data.farm || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [paymentFilter, productFilter]);

  const handleOpenAdd = () => {
    const nextInv = `INV-${new Date().getFullYear()}-${String(sales.length + 101).padStart(4, '0')}`;
    setFormData({
      invoiceNumber: nextInv,
      customer: customers[0]?._id || '',
      customerName: customers[0]?.name || '',
      customerPhone: customers[0]?.phone || '',
      productType: 'Fresh Cow Milk',
      itemDescription: 'Daily chilled bulk milk dispatch',
      quantity: 500,
      unit: 'Litres',
      unitPrice: 42,
      discount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Bank Transfer (NEFT/IMPS)',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salesService.create(formData);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording sale invoice');
    }
  };

  const columns: Column<Sale>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800">{item.invoiceNumber}</span>
          <span className="block text-[10px] text-slate-400">{formatDate(item.saleDate)}</span>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Buyer / Customer',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-800">{item.customerName}</span>
          {item.customerPhone && <span className="block text-xs text-slate-500">{item.customerPhone}</span>}
        </div>
      )
    },
    {
      key: 'productType',
      header: 'Product & Volume',
      render: (item) => (
        <div>
          <span className="font-medium text-slate-800">{item.productType}</span>
          <span className="block text-xs text-slate-500">
            {item.quantity} {item.unit} @ {formatCurrency(item.unitPrice)}
          </span>
        </div>
      )
    },
    {
      key: 'netAmount',
      header: 'Net Total',
      sortable: true,
      render: (item) => <span className="font-extrabold text-slate-900 text-sm">{formatCurrency(item.netAmount)}</span>
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.paymentStatus} size="sm" />
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      render: (item) =>
        item.balanceDue > 0 ? (
          <span className="font-bold text-rose-600 text-xs">{formatCurrency(item.balanceDue)}</span>
        ) : (
          <span className="text-xs text-emerald-700 font-semibold">Settled</span>
        )
    },
    {
      key: 'actions',
      header: 'Invoice',
      render: (item) => (
        <button
          onClick={() => setSelectedInvoice(item)}
          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          title="View & Print Invoice"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Invoice</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Sales Invoicing & Revenue Management
          </h1>
          <p className="text-xs text-slate-500">
            Generate official invoices for milk, eggs, live birds and cattle sales with payment reconciliation
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Sale Invoice</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Billed Revenue</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{formatCurrency(stats.totalRevenue || 0)}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cash / Bank Received</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(stats.paidRevenue || 0)}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Receivables Due</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${stats.pendingAmount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {formatCurrency(stats.pendingAmount || 0)}
          </h3>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={sales}
        isLoading={isLoading}
        searchPlaceholder="Search by invoice number, customer name, product..."
        filterComponent={
          <div className="flex items-center space-x-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Products</option>
              <option value="Fresh Cow Milk">Fresh Cow Milk</option>
              <option value="Buffalo Milk">Buffalo Milk</option>
              <option value="Table Eggs">Table Eggs</option>
              <option value="Broiler Birds">Broiler Birds</option>
              <option value="Other Farm Products">Other Products</option>
            </select>
          </div>
        }
      />

      {/* Add Sale Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Farm Sale Invoice"
        subtitle="Automatic customer balance updates and invoice generation"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveSale} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer</label>
              <select
                value={formData.customer}
                onChange={(e) => {
                  const cId = e.target.value;
                  const c = customers.find((x) => x._id === cId);
                  setFormData({
                    ...formData,
                    customer: cId,
                    customerName: c ? c.name : '',
                    customerPhone: c ? c.phone : ''
                  });
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="">-- Direct Retail / Choose Existing --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.customerType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Buyer Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Type *</label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Fresh Cow Milk">Fresh Cow Milk</option>
                <option value="Buffalo Milk">Buffalo Milk</option>
                <option value="Table Eggs">Table Eggs</option>
                <option value="Broiler Birds">Broiler Birds</option>
                <option value="Live Cattle / Calf">Live Cattle / Calf</option>
                <option value="Organic Compost / Manure">Organic Compost / Manure</option>
                <option value="Other Farm Products">Other Products</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Description</label>
              <input
                type="text"
                placeholder="e.g. Bulk chilled morning dispatch"
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Litres">Litres</option>
                <option value="Pieces">Pieces</option>
                <option value="kg">kg</option>
                <option value="Trays (30 eggs)">Trays (30 eggs)</option>
                <option value="Bags">Bags</option>
                <option value="Head">Head</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount (₹)</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Paid">Paid in Full</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT/IMPS)</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit">Credit</option>
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
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Modal for Viewing and Printing */}
      <InvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        sale={selectedInvoice}
        farm={farm}
      />
    </div>
  );
};
