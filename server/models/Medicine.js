import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Antibiotic', 'Vaccine', 'Vitamin / Supplement', 'Dewormer', 'Antiseptic', 'Hormone', 'Painkiller / Anti-inflammatory', 'Other'],
      required: true
    },
    targetSpecies: {
      type: String,
      enum: ['All', 'Cattle', 'Buffalo', 'Poultry'],
      default: 'All'
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['vials', 'ml', 'doses', 'tablets', 'bottles', 'sachets'],
      default: 'vials'
    },
    batchNumber: {
      type: String,
      trim: true,
      default: ''
    },
    unitCost: {
      type: Number,
      default: 0
    },
    supplier: {
      type: String,
      default: ''
    },
    expiryDate: {
      type: Date,
      required: true
    },
    minStockAlert: {
      type: Number,
      default: 10
    },
    administrationRoute: {
      type: String,
      enum: ['Intramuscular (IM)', 'Subcutaneous (SC)', 'Oral / In Feed / Water', 'Topical', 'Intravenous (IV)'],
      default: 'Intramuscular (IM)'
    },
    storageConditions: {
      type: String,
      default: 'Refrigerated 2-8°C'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('Medicine', medicineSchema);
