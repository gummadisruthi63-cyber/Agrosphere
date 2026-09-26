import mongoose from 'mongoose';

const feedSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Cattle Feed', 'Buffalo Concentrate', 'Poultry Starter', 'Poultry Grower', 'Poultry Layer Mash', 'Supplements', 'Minerals & Salts', 'Green Fodder', 'Dry Fodder / Silage'],
      required: true
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'bags (50kg)', 'quintal', 'tons', 'litres'],
      default: 'kg'
    },
    minStockAlert: {
      type: Number,
      required: true,
      default: 100
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    supplier: {
      type: String,
      trim: true,
      default: ''
    },
    supplierContact: {
      type: String,
      default: ''
    },
    lastRestocked: {
      type: Date,
      default: Date.now
    },
    dailyConsumptionRate: {
      type: Number,
      default: 0
    },
    expiryDate: {
      type: Date
    },
    storageShed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shed'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('Feed', feedSchema);
