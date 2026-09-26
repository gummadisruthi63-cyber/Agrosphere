import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    farmType: {
      type: String,
      enum: ['Dairy & Buffalo', 'Poultry', 'Integrated Mixed Farm'],
      default: 'Integrated Mixed Farm'
    },
    registrationNumber: {
      type: String,
      trim: true
    },
    establishedYear: {
      type: Number
    },
    totalArea: {
      type: Number
    },
    areaUnit: {
      type: String,
      enum: ['Acres', 'Hectares', 'Sq Ft'],
      default: 'Acres'
    },
    currency: {
      code: { type: String, default: 'INR' },
      symbol: { type: String, default: '₹' }
    },
    logo: String
  },
  { timestamps: true }
);

export default mongoose.model('Farm', farmSchema);
