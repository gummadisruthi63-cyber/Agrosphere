import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    farmName: {
      type: String,
      default: 'AgroSphere Integrated Dairy & Poultry Farm'
    },
    currencySymbol: {
      type: String,
      default: '₹'
    },
    currencyCode: {
      type: String,
      default: 'INR'
    },
    unitWeight: {
      type: String,
      default: 'kg'
    },
    unitMilk: {
      type: String,
      default: 'Litres'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    lowStockAlertThreshold: {
      type: Number,
      default: 20
    },
    medicineExpiryAlertDays: {
      type: Number,
      default: 30
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    enableSmsAlerts: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model('Setting', settingSchema);
