import mongoose from 'mongoose';

const milkProductionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: true
    },
    morningQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    eveningQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    fatPercentage: {
      type: Number,
      default: 4.2
    },
    snfPercentage: {
      type: Number,
      default: 8.5
    },
    recordedBy: {
      type: String,
      default: 'Farm Operator'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('MilkProduction', milkProductionSchema);
