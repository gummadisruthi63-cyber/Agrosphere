import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    customerType: {
      type: String,
      enum: ['Dairy Cooperative', 'Wholesaler / Distributor', 'Local Retailer', 'Hotel / Restaurant', 'Individual Consumer'],
      default: 'Wholesaler / Distributor'
    },
    totalPurchases: {
      type: Number,
      default: 0
    },
    outstandingBalance: {
      type: Number,
      default: 0
    },
    creditLimit: {
      type: Number,
      default: 50000
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('Customer', customerSchema);
