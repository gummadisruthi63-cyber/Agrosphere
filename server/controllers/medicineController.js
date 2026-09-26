import Medicine from '../models/Medicine.js';
import Vaccination from '../models/Vaccination.js';
import HealthRecord from '../models/HealthRecord.js';
import Animal from '../models/Animal.js';
import PoultryBatch from '../models/PoultryBatch.js';

export const getMedicines = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const medicines = await Medicine.find(filter).sort({ expiryDate: 1 });

    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

    const expiredCount = medicines.filter(m => new Date(m.expiryDate) < now).length;
    const expiringSoonCount = medicines.filter(m => new Date(m.expiryDate) >= now && new Date(m.expiryDate) <= thirtyDaysAhead).length;
    const lowStockCount = medicines.filter(m => m.currentStock <= m.minStockAlert).length;

    res.json({
      success: true,
      count: medicines.length,
      medicines,
      alerts: {
        expiredCount,
        expiringSoonCount,
        lowStockCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, medicine });
  } catch (error) {
    next(error);
  }
};

export const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, medicine });
  } catch (error) {
    next(error);
  }
};

export const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Vaccinations
export const getVaccinations = async (req, res, next) => {
  try {
    const { status, targetType } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (targetType && targetType !== 'All') filter.targetType = targetType;

    const vaccinations = await Vaccination.find(filter).sort({ dueDate: 1 });
    res.json({ success: true, count: vaccinations.length, vaccinations });
  } catch (error) {
    next(error);
  }
};

export const createVaccination = async (req, res, next) => {
  try {
    const { targetType, targetId, vaccineName, diseasePrevented, dueDate, veterinarian, notes } = req.body;
    let targetName = 'Target';

    if (targetType === 'Animal' && targetId) {
      const animal = await Animal.findById(targetId);
      if (animal) targetName = `${animal.animalType} #${animal.tagNumber} (${animal.name || animal.breed})`;
    } else if (targetType === 'PoultryBatch' && targetId) {
      const batch = await PoultryBatch.findById(targetId);
      if (batch) targetName = `Flock ${batch.batchId} (${batch.breed})`;
    }

    const vaccination = await Vaccination.create({
      targetType,
      animal: targetType === 'Animal' ? targetId : undefined,
      poultryBatch: targetType === 'PoultryBatch' ? targetId : undefined,
      targetName: req.body.targetName || targetName,
      vaccineName,
      diseasePrevented,
      dueDate,
      veterinarian: veterinarian || 'Dr. R. Sharma (Vet)',
      notes
    });

    res.status(201).json({ success: true, vaccination });
  } catch (error) {
    next(error);
  }
};

export const updateVaccination = async (req, res, next) => {
  try {
    const vaccination = await Vaccination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vaccination) return res.status(404).json({ success: false, message: 'Vaccination record not found' });
    res.json({ success: true, vaccination });
  } catch (error) {
    next(error);
  }
};

// Health Records
export const getHealthRecords = async (req, res, next) => {
  try {
    const { status, targetType } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (targetType && targetType !== 'All') filter.targetType = targetType;

    const records = await HealthRecord.find(filter).sort({ recordDate: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

export const createHealthRecord = async (req, res, next) => {
  try {
    const { targetType, targetId, diagnosis, symptoms, treatment, medicationsPrescribed, veterinarian, followUpDate, treatmentCost, status, notes } = req.body;
    let targetName = 'Target';

    if (targetType === 'Animal' && targetId) {
      const animal = await Animal.findById(targetId);
      if (animal) {
        targetName = `${animal.animalType} #${animal.tagNumber} (${animal.name || animal.breed})`;
        // Update animal's health status if sick or under treatment
        if (status === 'Active' || status === 'Critical') {
          animal.healthStatus = 'Under Treatment';
          await animal.save();
        } else if (status === 'Recovered') {
          animal.healthStatus = 'Healthy';
          await animal.save();
        }
      }
    } else if (targetType === 'PoultryBatch' && targetId) {
      const batch = await PoultryBatch.findById(targetId);
      if (batch) targetName = `Flock ${batch.batchId} (${batch.breed})`;
    }

    const record = await HealthRecord.create({
      targetType,
      animal: targetType === 'Animal' ? targetId : undefined,
      poultryBatch: targetType === 'PoultryBatch' ? targetId : undefined,
      targetName: req.body.targetName || targetName,
      diagnosis,
      symptoms,
      treatment,
      medicationsPrescribed,
      veterinarian: veterinarian || 'Dr. R. Sharma (Vet)',
      followUpDate,
      treatmentCost: Number(treatmentCost) || 0,
      status: status || 'Active',
      notes
    });

    res.status(201).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};
