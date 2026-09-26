import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    customerName: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      default: ''
    },
    productType: {
      type: String,
      enum: ['Fresh Cow Milk', 'Buffalo Milk', 'Table Eggs', 'Hatching Eggs', 'Broiler Birds', 'Live Cattle / Calf', 'Live Buffalo', 'Organic Compost / Manure', 'Silage / Fodder', 'Other Farm Products'],
      required: true
    },
    itemDescription: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1
    },
    unit: {
      type: String,
      required: true,
      default: 'Litres'
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partially Paid', 'Pending'],
      default: 'Paid'
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI / QR', 'Bank Transfer (NEFT/IMPS)', 'Cheque', 'Credit'],
      default: 'Cash'
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    balanceDue: {
      type: Number,
      default: 0
    },
    saleDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('Sale', saleSchema);
