import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
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
    role: {
      type: String,
      enum: ['Farm Manager', 'Herdsman / Cattle Handler', 'Milking Specialist', 'Poultry Flock Supervisor', 'Veterinary Assistant', 'Feed & Inventory Keeper', 'General Farm Worker'],
      required: true
    },
    salary: {
      type: Number,
      required: true,
      min: 0
    },
    salaryType: {
      type: String,
      enum: ['Monthly', 'Daily', 'Weekly'],
      default: 'Monthly'
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    address: {
      type: String,
      default: ''
    },
    assignedShed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shed'
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Terminated'],
      default: 'Active'
    },
    emergencyContact: {
      type: String,
      default: ''
    },
    skills: [String],
    activeTasks: [
      {
        task: String,
        dueDate: Date,
        completed: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
