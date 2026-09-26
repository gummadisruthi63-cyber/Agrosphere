import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
  {
    animalId: {
      type: String,
      required: [true, 'Animal ID is required'],
      unique: true,
      trim: true
    },
    tagNumber: {
      type: String,
      required: [true, 'Tag number is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    animalType: {
      type: String,
      enum: ['Cow', 'Buffalo'],
      required: [true, 'Animal type is required']
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      trim: true
    },
    gender: {
      type: String,
      enum: ['Female', 'Male'],
      default: 'Female'
    },
    dateOfBirth: {
      type: Date
    },
    weight: {
      type: Number, // in kg
      min: 0
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    purchasePrice: {
      type: Number,
      default: 0
    },
    healthStatus: {
      type: String,
      enum: ['Healthy', 'Sick', 'Under Treatment', 'Quarantined', 'Deceased'],
      default: 'Healthy'
    },
    lactationStatus: {
      type: String,
      enum: ['Lactating', 'Dry', 'Heifer', 'Calf'],
      default: 'Lactating'
    },
    pregnancyStatus: {
      type: String,
      enum: ['Not Pregnant', 'Inseminated', 'Pregnant', 'Calved Recently'],
      default: 'Not Pregnant'
    },
    expectedCalvingDate: {
      type: Date
    },
    dailyAverageYield: {
      type: Number,
      default: 0 // Litres per day
    },
    shed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shed'
    },
    notes: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export default mongoose.model('Animal', animalSchema);
