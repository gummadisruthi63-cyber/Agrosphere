import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Feed', 'Medicines', 'Farm Equipment', 'Poultry Supplies', 'Dairy Supplies', 'Cleaning & Sanitation', 'Other Items'],
      required: true
    },
    itemCode: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      default: 'units'
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      default: 0
    },
    supplier: {
      type: String,
      default: ''
    },
    supplierPhone: {
      type: String,
      default: ''
    },
    minStockAlert: {
      type: Number,
      default: 5
    },
    expiryDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Expired'],
      default: 'In Stock'
    },
    shedLocation: {
      type: String,
      default: 'Central Store'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Pre-save calculate status
inventorySchema.pre('save', function (next) {
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    this.status = 'Expired';
  } else if (this.quantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.minStockAlert) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

export default mongoose.model('Inventory', inventorySchema);
