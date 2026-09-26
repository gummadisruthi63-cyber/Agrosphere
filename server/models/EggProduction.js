import mongoose from 'mongoose';

const eggProductionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoultryBatch',
      required: true
    },
    totalEggs: {
      type: Number,
      required: true,
      min: 0
    },
    goodEggs: {
      type: Number,
      required: true,
      min: 0
    },
    brokenEggs: {
      type: Number,
      default: 0,
      min: 0
    },
    damagedEggs: {
      type: Number,
      default: 0,
      min: 0
    },
    layRatePercentage: {
      type: Number,
      default: 0
    },
    collectedBy: {
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

export default mongoose.model('EggProduction', eggProductionSchema);
