import mongoose from 'mongoose';

const poultryBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    batchName: {
      type: String,
      required: true,
      trim: true
    },
    breed: {
      type: String,
      required: true,
      trim: true
    },
    birdType: {
      type: String,
      enum: ['Broiler', 'Layer', 'Dual-Purpose', 'Breeder'],
      default: 'Layer'
    },
    initialCount: {
      type: Number,
      required: true,
      min: 1
    },
    currentCount: {
      type: Number,
      required: true,
      min: 0
    },
    mortalityCount: {
      type: Number,
      default: 0
    },
    arrivalDate: {
      type: Date,
      default: Date.now
    },
    ageWeeks: {
      type: Number,
      default: 1
    },
    shed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shed'
    },
    feedType: {
      type: String,
      default: 'Starter Mash'
    },
    dailyFeedIntakeKg: {
      type: Number,
      default: 0
    },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Alert', 'Sick', 'Quarantined'],
      default: 'Healthy'
    },
    status: {
      type: String,
      enum: ['Active', 'Sold', 'Completed', 'Culled'],
      default: 'Active'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('PoultryBatch', poultryBatchSchema);
