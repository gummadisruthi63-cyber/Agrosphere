import Animal from '../models/Animal.js';
import MilkProduction from '../models/MilkProduction.js';
import Vaccination from '../models/Vaccination.js';
import HealthRecord from '../models/HealthRecord.js';

export const getAnimals = async (req, res, next) => {
  try {
    const { type, breed, healthStatus, lactationStatus, search, shed } = req.query;
    const filter = {};

    if (type && type !== 'All') filter.animalType = type;
    if (breed && breed !== 'All') filter.breed = breed;
    if (healthStatus && healthStatus !== 'All') filter.healthStatus = healthStatus;
    if (lactationStatus && lactationStatus !== 'All') filter.lactationStatus = lactationStatus;
    if (shed && shed !== 'All') filter.shed = shed;

    if (search) {
      filter.$or = [
        { animalId: { $regex: search, $options: 'i' } },
        { tagNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }

    const animals = await Animal.find(filter).populate('shed', 'name shedNumber').sort({ createdAt: -1 });
    res.json({ success: true, count: animals.length, animals });
  } catch (error) {
    next(error);
  }
};

export const getAnimalById = async (req, res, next) => {
  try {
    const animal = await Animal.findById(req.params.id).populate('shed', 'name shedNumber');
    if (!animal) return res.status(404).json({ success: false, message: 'Animal not found' });

    // Fetch related records
    const milkRecords = await MilkProduction.find({ animal: animal._id }).sort({ date: -1 }).limit(30);
    const vaccinations = await Vaccination.find({ animal: animal._id }).sort({ dueDate: -1 });
    const healthRecords = await HealthRecord.find({ animal: animal._id }).sort({ recordDate: -1 });

    const totalYield = milkRecords.reduce((sum, r) => sum + (r.totalQuantity || 0), 0);
    const avgYield = milkRecords.length ? (totalYield / milkRecords.length).toFixed(1) : animal.dailyAverageYield;

    res.json({
      success: true,
      animal,
      history: {
        milkRecords,
        vaccinations,
        healthRecords,
        stats: {
          totalRecordedYield: totalYield,
          averageRecordedYield: avgYield,
          recordsCount: milkRecords.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createAnimal = async (req, res, next) => {
  try {
    const animal = await Animal.create(req.body);
    res.status(201).json({ success: true, animal });
  } catch (error) {
    next(error);
  }
};

export const updateAnimal = async (req, res, next) => {
  try {
    const animal = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!animal) return res.status(404).json({ success: false, message: 'Animal not found' });
    res.json({ success: true, animal });
  } catch (error) {
    next(error);
  }
};

export const deleteAnimal = async (req, res, next) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    if (!animal) return res.status(404).json({ success: false, message: 'Animal not found' });
    res.json({ success: true, message: 'Animal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAnimalStats = async (req, res, next) => {
  try {
    const totalCows = await Animal.countDocuments({ animalType: 'Cow', healthStatus: { $ne: 'Deceased' } });
    const totalBuffaloes = await Animal.countDocuments({ animalType: 'Buffalo', healthStatus: { $ne: 'Deceased' } });
    const lactatingCount = await Animal.countDocuments({ lactationStatus: 'Lactating', healthStatus: { $ne: 'Deceased' } });
    const pregnantCount = await Animal.countDocuments({ pregnancyStatus: 'Pregnant' });
    const sickCount = await Animal.countDocuments({ healthStatus: { $in: ['Sick', 'Under Treatment', 'Quarantined'] } });

    res.json({
      success: true,
      stats: {
        totalCows,
        totalBuffaloes,
        totalAnimals: totalCows + totalBuffaloes,
        lactatingCount,
        pregnantCount,
        sickCount
      }
    });
  } catch (error) {
    next(error);
  }
};
