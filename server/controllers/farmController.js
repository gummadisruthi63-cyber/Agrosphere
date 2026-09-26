import Farm from '../models/Farm.js';
import Shed from '../models/Shed.js';
import Animal from '../models/Animal.js';
import PoultryBatch from '../models/PoultryBatch.js';

export const getFarmProfile = async (req, res, next) => {
  try {
    let farm = await Farm.findOne();
    if (!farm) {
      farm = await Farm.create({
        name: 'AgroSphere Integrated Dairy & Poultry Farm',
        ownerName: 'Vikramaditya Patil',
        email: 'vikram.patil@agrosphere.com',
        phone: '+91 98451 22345',
        address: {
          street: 'Plot 45, Green Valley Agro Hub',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '412207',
          country: 'India'
        },
        farmType: 'Integrated Mixed Farm',
        registrationNumber: 'AGRO-MH-2022-8941',
        establishedYear: 2021,
        totalArea: 48,
        areaUnit: 'Acres',
        currency: { code: 'INR', symbol: '₹' }
      });
    }
    res.json({ success: true, farm });
  } catch (error) {
    next(error);
  }
};

export const updateFarmProfile = async (req, res, next) => {
  try {
    let farm = await Farm.findOne();
    if (!farm) {
      farm = await Farm.create(req.body);
    } else {
      farm = await Farm.findByIdAndUpdate(farm._id, req.body, { new: true, runValidators: true });
    }
    res.json({ success: true, farm });
  } catch (error) {
    next(error);
  }
};

export const getSheds = async (req, res, next) => {
  try {
    const sheds = await Shed.find().sort({ shedNumber: 1 });
    // Dynamically update currentOccupancy from animals and poultry
    for (const shed of sheds) {
      if (shed.type.includes('Dairy') || shed.type.includes('Buffalo')) {
        const count = await Animal.countDocuments({ shed: shed._id, healthStatus: { $ne: 'Deceased' } });
        if (shed.currentOccupancy !== count) {
          shed.currentOccupancy = count;
          await shed.save();
        }
      } else if (shed.type.includes('Poultry')) {
        const batches = await PoultryBatch.find({ shed: shed._id, status: 'Active' });
        const count = batches.reduce((sum, b) => sum + (b.currentCount || 0), 0);
        if (shed.currentOccupancy !== count) {
          shed.currentOccupancy = count;
          await shed.save();
        }
      }
    }
    res.json({ success: true, sheds });
  } catch (error) {
    next(error);
  }
};

export const createShed = async (req, res, next) => {
  try {
    const shed = await Shed.create(req.body);
    res.status(201).json({ success: true, shed });
  } catch (error) {
    next(error);
  }
};

export const updateShed = async (req, res, next) => {
  try {
    const shed = await Shed.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!shed) return res.status(404).json({ success: false, message: 'Shed not found' });
    res.json({ success: true, shed });
  } catch (error) {
    next(error);
  }
};

export const deleteShed = async (req, res, next) => {
  try {
    const shed = await Shed.findByIdAndDelete(req.params.id);
    if (!shed) return res.status(404).json({ success: false, message: 'Shed not found' });
    res.json({ success: true, message: 'Shed deleted successfully' });
  } catch (error) {
    next(error);
  }
};
