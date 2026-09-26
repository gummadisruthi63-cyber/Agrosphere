import React from 'react';
import { Printer, X, Wheat } from 'lucide-react';
import { Sale, Farm } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  farm?: Farm | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  sale,
  farm
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Action Bar (Hidden in Print) */}
          <div className="no-print flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Farm Tax Invoice Preview
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet */}
          <div className="p-8 font-sans text-slate-800" id="invoice-sheet">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Wheat className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {farm?.name || 'AgroSphere Farm Enterprise'}
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  {farm?.address?.street || 'Green Valley Agro Corridor'}, {farm?.address?.city || 'Pune'}, {farm?.address?.state || 'Maharashtra'} - {farm?.address?.pincode || '412207'}
                </p>
                <p className="text-xs text-slate-500">Phone: {farm?.phone || '+91 98450 11223'}</p>
                <p className="text-xs text-slate-500">Reg: {farm?.registrationNumber || 'AGRO-MH-2023-7741'}</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Tax Invoice
                </span>
                <p className="mt-2 text-sm font-bold text-slate-900">{sale.invoiceNumber}</p>
                <p className="text-xs text-slate-500">Date: {formatDate(sale.saleDate)}</p>
                <p className="text-xs text-slate-500">
                  Status: <span className="font-semibold text-emerald-700">{sale.paymentStatus}</span>
                </p>
              </div>
            </div>

            {/* Bill To */}
            <div className="py-6 border-b border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bill To Customer</p>
                <h4 className="mt-1 text-sm font-bold text-slate-900">{sale.customerName}</h4>
                {sale.customerPhone && <p className="text-xs text-slate-500">Phone: {sale.customerPhone}</p>}
                <p className="text-xs text-slate-500">Payment Mode: {sale.paymentMethod || 'Cash'}</p>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Summary</p>
                <p className="mt-1 text-xs text-slate-600">Total Net: {formatCurrency(sale.netAmount)}</p>
                <p className="text-xs text-emerald-700 font-semibold">Amount Paid: {formatCurrency(sale.amountPaid)}</p>
                {sale.balanceDue > 0 && (
                  <p className="text-xs text-rose-600 font-bold">Balance Due: {formatCurrency(sale.balanceDue)}</p>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="py-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5">Item & Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr>
                    <td className="py-3">
                      <p className="font-bold text-slate-900">{sale.productType}</p>
                      {sale.itemDescription && <p className="text-slate-500 mt-0.5">{sale.itemDescription}</p>}
                    </td>
                    <td className="py-3 text-center">
                      {sale.quantity} {sale.unit}
                    </td>
                    <td className="py-3 text-right">{formatCurrency(sale.unitPrice)}</td>
                    <td className="py-3 text-right font-semibold">{formatCurrency(sale.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Calculation */}
            <div className="border-t border-slate-200 pt-4 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(sale.totalAmount)}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>- {formatCurrency(sale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(sale.netAmount)}</span>
                </div>
              </div>
            </div>

            {/* Signature & Note */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-end text-xs text-slate-400">
              <div>
                <p className="font-medium text-slate-600">Thank you for your business!</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Computer generated invoice by AgroSphere Platform.</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-300 pb-8"></div>
                <p className="mt-1 text-[10px] font-semibold text-slate-600">Authorized Farm Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
