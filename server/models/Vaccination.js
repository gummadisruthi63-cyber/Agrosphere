import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema(
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
    vaccineName: {
      type: String,
      required: true,
      trim: true
    },
    diseasePrevented: {
      type: String,
      default: '' // e.g., FMD, Brucellosis, Ranikhet/ND, Marek's
    },
    administeredDate: {
      type: Date
    },
    dueDate: {
      type: Date,
      required: true
    },
    nextDueDate: {
      type: Date
    },
    veterinarian: {
      type: String,
      default: 'Dr. R. Sharma (Vet)'
    },
    batchNumber: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Overdue'],
      default: 'Scheduled'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('Vaccination', vaccinationSchema);
