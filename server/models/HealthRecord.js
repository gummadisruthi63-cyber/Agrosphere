import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['Animal', 'PoultryBatch'],
      required: true
    },
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal'
    },
    poultryBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoultryBatch'
    },
    targetName: {
      type: String,
      required: true
    },
    recordDate: {
      type: Date,
      default: Date.now
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    symptoms: {
      type: String,
      required: true
    },
    treatment: {
      type: String,
      required: true
    },
    medicationsPrescribed: {
      type: String,
      default: ''
    },
    veterinarian: {
      type: String,
      default: 'Dr. R. Sharma (Vet)'
    },
    followUpDate: {
      type: Date
    },
    treatmentCost: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Recovered', 'Critical', 'Monitoring'],
      default: 'Active'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('HealthRecord', healthRecordSchema);
