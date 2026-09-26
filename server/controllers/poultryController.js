import PoultryBatch from '../models/PoultryBatch.js';
import EggProduction from '../models/EggProduction.js';
import Vaccination from '../models/Vaccination.js';
import HealthRecord from '../models/HealthRecord.js';

export const getBatches = async (req, res, next) => {
  try {
    const { status, birdType, breed, search } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (birdType && birdType !== 'All') filter.birdType = birdType;
    if (breed && breed !== 'All') filter.breed = breed;

    if (search) {
      filter.$or = [
        { batchId: { $regex: search, $options: 'i' } },
        { batchName: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }

    const batches = await PoultryBatch.find(filter).populate('shed', 'name shedNumber').sort({ createdAt: -1 });
    res.json({ success: true, count: batches.length, batches });
  } catch (error) {
    next(error);
  }
};

export const getBatchById = async (req, res, next) => {
  try {
    const batch = await PoultryBatch.findById(req.params.id).populate('shed', 'name shedNumber');
    if (!batch) return res.status(404).json({ success: false, message: 'Poultry batch not found' });

    const eggRecords = await EggProduction.find({ batch: batch._id }).sort({ date: -1 }).limit(30);
    const vaccinations = await Vaccination.find({ poultryBatch: batch._id }).sort({ dueDate: -1 });
    const healthRecords = await HealthRecord.find({ poultryBatch: batch._id }).sort({ recordDate: -1 });

    const totalEggsCollected = eggRecords.reduce((sum, r) => sum + (r.totalEggs || 0), 0);
    const totalGoodEggs = eggRecords.reduce((sum, r) => sum + (r.goodEggs || 0), 0);

    res.json({
      success: true,
      batch,
      history: {
        eggRecords,
        vaccinations,
        healthRecords,
        stats: {
          totalEggsCollected,
          totalGoodEggs,
          mortalityRate: batch.initialCount ? ((batch.mortalityCount / batch.initialCount) * 100).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.currentCount && data.initialCount) {
      data.currentCount = data.initialCount - (data.mortalityCount || 0);
    }
    const batch = await PoultryBatch.create(data);
    res.status(201).json({ success: true, batch });
  } catch (error) {
    next(error);
  }
};

export const updateBatch = async (req, res, next) => {
  try {
    const batch = await PoultryBatch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!batch) return res.status(404).json({ success: false, message: 'Poultry batch not found' });
    res.json({ success: true, batch });
  } catch (error) {
    next(error);
  }
};

export const recordMortality = async (req, res, next) => {
  try {
    const { count, reason } = req.body;
    const batch = await PoultryBatch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    batch.mortalityCount = (batch.mortalityCount || 0) + Number(count);
    batch.currentCount = Math.max(0, batch.currentCount - Number(count));
    if (reason) {
      batch.notes = (batch.notes ? batch.notes + ' | ' : '') + `Mortality: -${count} birds on ${new Date().toLocaleDateString()}: ${reason}`;
    }
    await batch.save();

    res.json({ success: true, batch, message: `Recorded mortality of ${count} birds.` });
  } catch (error) {
    next(error);
  }
};

export const deleteBatch = async (req, res, next) => {
  try {
    const batch = await PoultryBatch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    next(error);
  }
};
