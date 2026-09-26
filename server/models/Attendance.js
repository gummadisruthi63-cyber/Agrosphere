import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'On Leave'],
      default: 'Present'
    },
    checkInTime: {
      type: String,
      default: '07:00 AM'
    },
    checkOutTime: {
      type: String,
      default: '05:00 PM'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
