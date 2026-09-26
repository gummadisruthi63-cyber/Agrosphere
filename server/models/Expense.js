import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['Feed & Nutrition', 'Medicine & Vaccines', 'Salaries & Wages', 'Electricity & Power', 'Water & Irrigation', 'Transportation & Logistics', 'Farm Maintenance & Repair', 'Animal Purchase', 'Poultry Chicks Purchase', 'Machinery & Equipment', 'Packaging Materials', 'Veterinary Consultation', 'Other Operational Expenses'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI / QR', 'Bank Transfer', 'Cheque', 'Credit Card'],
      default: 'Cash'
    },
    vendor: {
      type: String,
      trim: true,
      default: ''
    },
    receiptNumber: {
      type: String,
      trim: true,
      default: ''
    },
    recordedBy: {
      type: String,
      default: 'Admin'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
