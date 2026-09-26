import mongoose from 'mongoose';

const shedSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shed name is required'],
      trim: true
    },
    shedNumber: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Dairy Cattle', 'Buffalo Barn', 'Poultry Broiler', 'Poultry Layer', 'Feed Storage', 'Quarantine / Hospital'],
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    currentOccupancy: {
      type: Number,
      default: 0
    },
    locationNotes: {
      type: String,
      default: ''
    },
    ventilationType: {
      type: String,
      default: 'Cross Ventilation & Fans'
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Cleaning', 'Inactive'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Shed', shedSchema);
