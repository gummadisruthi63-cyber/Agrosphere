import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  Milk,
  Egg,
  TrendingUp,
  DollarSign,
  Boxes,
  Sparkles,
  Users
} from 'lucide-react';
import { reportService, animalService, poultryService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';
import { exportToCSV, formatCurrency, formatDate } from '../../utils/formatters';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<string>('milk');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [animalId, setAnimalId] = useState<string>('All');
  const [batchId, setBatchId] = useState<string>('All');

  const [reportData, setReportData] = useState<any>({ summary: {}, data: [] });
  const [animals, setAnimals] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize reference data
  useEffect(() => {
    animalService.getAll().then((r) => setAnimals(r.data.animals || []));
    poultryService.getAll().then((r) => setBatches(r.data.batches || []));
  }, []);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const res = await reportService.getData({
        type: reportType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        category: category !== 'All' ? category : undefined,
        animalId: animalId !== 'All' ? animalId : undefined,
        batchId: batchId !== 'All' ? batchId : undefined
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, category, animalId, batchId]);

  const handleExportCSV = () => {
    if (!reportData.data || !reportData.data.length) {
      alert('No data available to export');
      return;
    }
    // Flatten data for CSV
    const rows = reportData.data.map((item: any) => {
      const flattened: any = {};
      for (const [k, v] of Object.entries(item)) {
        if (typeof v === 'object' && v !== null) {
          flattened[k] = (v as any).name || (v as any).tagNumber || (v as any).batchName || JSON.stringify(v);
        } else {
          flattened[k] = v;
        }
      }
      return flattened;
    });

    exportToCSV(rows, `AgroSphere_${reportType}_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportTabs = [
    { id: 'milk', label: 'Milk Production', icon: Milk },
    { id: 'egg', label: 'Egg Production', icon: Egg },
    { id: 'sales', label: 'Sales & Invoices', icon: TrendingUp },
    { id: 'expense', label: 'Expense Ledger', icon: DollarSign },
    { id: 'profit_loss', label: 'Profit & Loss', icon: FileText },
    { id: 'inventory', label: 'Inventory Stock', icon: Boxes },
    { id: 'animal', label: 'Livestock Animals', icon: Sparkles },
    { id: 'poultry', label: 'Poultry Batches', icon: Egg },
    { id: 'customer', label: 'Customer Receivables', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Comprehensive Farm Reports & Audits
          </h1>
          <p className="text-xs text-slate-500">
            Filter, analyze, and export production, sales, expenses, and herd performance in CSV or printable format
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs (Hidden in Print) */}
      <div className="no-print flex flex-wrap gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-soft">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setReportType(tab.id);
                setStartDate('');
                setEndDate('');
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-soft flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-500">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-1.5 text-xs rounded-lg border border-slate-200"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-500">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-1.5 text-xs rounded-lg border border-slate-200"
          />
        </div>

        <button
          onClick={fetchReport}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Apply Date Filter
        </button>

        {reportType === 'milk' && (
          <select
            value={animalId}
            onChange={(e) => setAnimalId(e.target.value)}
            className="p-1.5 text-xs rounded-lg border border-slate-200 bg-white ml-auto"
          >
            <option value="All">All Milking Animals</option>
            {animals.map((a) => (
              <option key={a._id} value={a._id}>
                {a.animalType} #{a.tagNumber} ({a.name || a.breed})
              </option>
            ))}
          </select>
        )}

        {reportType === 'egg' && (
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="p-1.5 text-xs rounded-lg border border-slate-200 bg-white ml-auto"
          >
            <option value="All">All Poultry Flocks</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName} ({b.breed})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Printable Sheet View */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-soft print:border-none print:shadow-none print:p-0">
        {/* Printable Letterhead */}
        <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">AgroSphere Integrated Farm</h2>
            <p className="text-xs text-slate-500">
              Audit Report: <strong className="text-slate-800 uppercase">{reportType.replace('_', ' ')}</strong>
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p>Total Records: {reportData.data?.length || 0}</p>
          </div>
        </div>

        {/* Dynamic Metric Summary Bar */}
        {reportData.summary && Object.keys(reportData.summary).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6 text-xs">
            {Object.entries(reportData.summary).map(([key, val]: any) => (
              <div key={key}>
                <span className="text-slate-400 capitalize block font-medium">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="font-extrabold text-base text-slate-800 mt-0.5 block">
                  {typeof val === 'number' && key.toLowerCase().includes('amount') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('expense') || key.toLowerCase().includes('profit') || key.toLowerCase().includes('valuation')
                    ? formatCurrency(val)
                    : typeof val === 'number'
                    ? val.toLocaleString()
                    : String(val)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Report Content Table */}
        {isLoading ? (
          <LoadingState message="Generating structured audit report..." />
        ) : reportData.data?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No records found for the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 font-bold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                  {reportType === 'milk' && (
                    <>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Animal</th>
                      <th className="py-3 px-3 text-center">Morning (L)</th>
                      <th className="py-3 px-3 text-center">Evening (L)</th>
                      <th className="py-3 px-3 text-center">Total (L)</th>
                      <th className="py-3 px-3 text-center">Fat %</th>
                      <th className="py-3 px-3">Recorded By</th>
                    </>
                  )}
                  {reportType === 'egg' && (
                    <>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Flock Batch</th>
                      <th className="py-3 px-3 text-center">Total Eggs</th>
                      <th className="py-3 px-3 text-center">Good Marketable</th>
                      <th className="py-3 px-3 text-center">Broken</th>
                      <th className="py-3 px-3 text-center">Lay Rate %</th>
                      <th className="py-3 px-3">Collector</th>
                    </>
                  )}
                  {reportType === 'sales' && (
                    <>
                      <th className="py-3 px-3">Invoice #</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3 text-center">Quantity</th>
                      <th className="py-3 px-3 text-right">Net Amount</th>
                      <th className="py-3 px-3">Payment</th>
                    </>
                  )}
                  {reportType === 'expense' && (
                    <>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Vendor</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3">Method</th>
                    </>
                  )}
                  {reportType === 'profit_loss' && (
                    <>
                      <th className="py-3 px-4">Financial Statement Line Item</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                    </>
                  )}
                  {reportType === 'inventory' && (
                    <>
                      <th className="py-3 px-3">Item Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-center">Stock Quantity</th>
                      <th className="py-3 px-3 text-right">Unit Price</th>
                      <th className="py-3 px-3 text-right">Total Valuation</th>
                      <th className="py-3 px-3">Status</th>
                    </>
                  )}
                  {reportType === 'animal' && (
                    <>
                      <th className="py-3 px-3">Tag #</th>
                      <th className="py-3 px-3">Name</th>
                      <th className="py-3 px-3">Species</th>
                      <th className="py-3 px-3">Breed</th>
                      <th className="py-3 px-3">Lactation</th>
                      <th className="py-3 px-3">Health</th>
                    </>
                  )}
                  {reportType === 'poultry' && (
                    <>
                      <th className="py-3 px-3">Batch ID</th>
                      <th className="py-3 px-3">Name</th>
                      <th className="py-3 px-3">Breed</th>
                      <th className="py-3 px-3 text-center">Current Birds</th>
                      <th className="py-3 px-3 text-center">Mortality</th>
                      <th className="py-3 px-3">Status</th>
                    </>
                  )}
                  {reportType === 'customer' && (
                    <>
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3 text-right">Lifetime Sales</th>
                      <th className="py-3 px-3 text-right">Outstanding Due</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.data.map((row: any, idx: number) => (
                  <tr key={row._id || idx} className="hover:bg-slate-50/70">
                    {reportType === 'milk' && (
                      <>
                        <td className="py-3 px-3 font-medium text-slate-800">{formatDate(row.date)}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">Tag #{row.animal?.tagNumber || '-'}</td>
                        <td className="py-3 px-3 text-center">{row.morningQuantity}</td>
                        <td className="py-3 px-3 text-center">{row.eveningQuantity}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-700">{row.totalQuantity} L</td>
                        <td className="py-3 px-3 text-center">{row.fatPercentage}%</td>
                        <td className="py-3 px-3 text-slate-500">{row.recordedBy || 'Milker'}</td>
                      </>
                    )}
                    {reportType === 'egg' && (
                      <>
                        <td className="py-3 px-3 font-medium text-slate-800">{formatDate(row.date)}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{row.batch?.batchName || '-'}</td>
                        <td className="py-3 px-3 text-center font-bold">{row.totalEggs?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-700">{row.goodEggs?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center text-rose-600">{row.brokenEggs}</td>
                        <td className="py-3 px-3 text-center font-semibold text-blue-700">{row.layRatePercentage}%</td>
                        <td className="py-3 px-3 text-slate-500">{row.collectedBy || 'Staff'}</td>
                      </>
                    )}
                    {reportType === 'sales' && (
                      <>
                        <td className="py-3 px-3 font-bold text-slate-900">{row.invoiceNumber}</td>
                        <td className="py-3 px-3 text-slate-600">{formatDate(row.saleDate)}</td>
                        <td className="py-3 px-3 font-semibold">{row.customerName}</td>
                        <td className="py-3 px-3">{row.productType}</td>
                        <td className="py-3 px-3 text-center">{row.quantity} {row.unit}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">{formatCurrency(row.netAmount)}</td>
                        <td className="py-3 px-3 font-medium text-emerald-700">{row.paymentStatus}</td>
                      </>
                    )}
                    {reportType === 'expense' && (
                      <>
                        <td className="py-3 px-3 font-medium text-slate-800">{formatDate(row.date)}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{row.category}</td>
                        <td className="py-3 px-3">{row.description}</td>
                        <td className="py-3 px-3 text-slate-600">{row.vendor || '-'}</td>
                        <td className="py-3 px-3 text-right font-extrabold text-rose-600">-{formatCurrency(row.amount)}</td>
                        <td className="py-3 px-3 text-slate-500">{row.paymentMethod}</td>
                      </>
                    )}
                    {reportType === 'profit_loss' && (
                      <>
                        <td className={`py-3.5 px-4 font-bold ${row.isNet ? 'text-base text-emerald-800 bg-emerald-50/50' : 'text-slate-800'}`}>
                          {row.item}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-extrabold ${row.isNet ? 'text-base text-emerald-800 bg-emerald-50/50' : 'text-slate-900'}`}>
                          {formatCurrency(row.amount)}
                        </td>
                      </>
                    )}
                    {reportType === 'inventory' && (
                      <>
                        <td className="py-3 px-3 font-bold text-slate-800">{row.name}</td>
                        <td className="py-3 px-3 text-slate-600">{row.category}</td>
                        <td className="py-3 px-3 text-center font-bold">{row.quantity} {row.unit}</td>
                        <td className="py-3 px-3 text-right">{formatCurrency(row.purchasePrice)}</td>
                        <td className="py-3 px-3 text-right font-extrabold text-emerald-700">{formatCurrency(row.quantity * row.purchasePrice)}</td>
                        <td className="py-3 px-3">{row.status}</td>
                      </>
                    )}
                    {reportType === 'animal' && (
                      <>
                        <td className="py-3 px-3 font-bold text-slate-800">{row.tagNumber}</td>
                        <td className="py-3 px-3">{row.name || '-'}</td>
                        <td className="py-3 px-3">{row.animalType}</td>
                        <td className="py-3 px-3">{row.breed}</td>
                        <td className="py-3 px-3 font-semibold text-blue-700">{row.lactationStatus}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-700">{row.healthStatus}</td>
                      </>
                    )}
                    {reportType === 'poultry' && (
                      <>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{row.batchId}</td>
                        <td className="py-3 px-3 font-semibold">{row.batchName}</td>
                        <td className="py-3 px-3">{row.breed}</td>
                        <td className="py-3 px-3 text-center font-bold">{row.currentCount?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center text-rose-600 font-semibold">{row.mortalityCount}</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">{row.status}</td>
                      </>
                    )}
                    {reportType === 'customer' && (
                      <>
                        <td className="py-3 px-3 font-bold text-slate-800">{row.name}</td>
                        <td className="py-3 px-3 text-slate-600">{row.customerType}</td>
                        <td className="py-3 px-3">{row.phone}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700">{formatCurrency(row.totalPurchases)}</td>
                        <td className="py-3 px-3 text-right font-bold text-rose-600">{formatCurrency(row.outstandingBalance)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
