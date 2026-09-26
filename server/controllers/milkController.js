import MilkProduction from '../models/MilkProduction.js';
import Animal from '../models/Animal.js';

export const getMilkRecords = async (req, res, next) => {
  try {
    const { startDate, endDate, animalId } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (animalId && animalId !== 'All') {
      filter.animal = animalId;
    }

    const records = await MilkProduction.find(filter)
      .populate('animal', 'tagNumber name animalType breed')
      .sort({ date: -1, createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

export const recordMilk = async (req, res, next) => {
  try {
    const { date, animal, morningQuantity, eveningQuantity, fatPercentage, snfPercentage, recordedBy, notes } = req.body;
    const morning = Number(morningQuantity) || 0;
    const evening = Number(eveningQuantity) || 0;
    const total = morning + evening;

    const record = await MilkProduction.create({
      date: date || new Date(),
      animal,
      morningQuantity: morning,
      eveningQuantity: evening,
      totalQuantity: total,
      fatPercentage: Number(fatPercentage) || 4.2,
      snfPercentage: Number(snfPercentage) || 8.5,
      recordedBy: recordedBy || 'Farm Operator',
      notes: notes || ''
    });

    // Update animal's daily average yield
    const allRecords = await MilkProduction.find({ animal });
    if (allRecords.length > 0) {
      const avg = (allRecords.reduce((acc, r) => acc + r.totalQuantity, 0) / allRecords.length).toFixed(1);
      await Animal.findByIdAndUpdate(animal, { dailyAverageYield: Number(avg) });
    }

    const populatedRecord = await MilkProduction.findById(record._id).populate('animal', 'tagNumber name animalType breed');
    res.status(201).json({ success: true, record: populatedRecord });
  } catch (error) {
    next(error);
  }
};

export const getMilkStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayRecords = await MilkProduction.find({ date: { $gte: today, $lt: tomorrow } });
    const todayMorning = todayRecords.reduce((s, r) => s + (r.morningQuantity || 0), 0);
    const todayEvening = todayRecords.reduce((s, r) => s + (r.eveningQuantity || 0), 0);
    const todayTotal = todayMorning + todayEvening;

    const monthRecords = await MilkProduction.find({ date: { $gte: startOfMonth } });
    const monthTotal = monthRecords.reduce((s, r) => s + (r.totalQuantity || 0), 0);

    // 14-day production trend
    const trend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);

      const dayRecords = await MilkProduction.find({ date: { $gte: d, $lt: nd } });
      const m = dayRecords.reduce((s, r) => s + (r.morningQuantity || 0), 0);
      const e = dayRecords.reduce((s, r) => s + (r.eveningQuantity || 0), 0);

      trend.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        morning: m,
        evening: e,
        total: m + e
      });
    }

    // Breed-wise breakdown
    const animals = await Animal.find({ lactationStatus: 'Lactating' });
    const cowYield = monthRecords.filter(r => r.animal?.animalType === 'Cow').reduce((s, r) => s + r.totalQuantity, 0);
    const buffaloYield = monthRecords.filter(r => r.animal?.animalType === 'Buffalo').reduce((s, r) => s + r.totalQuantity, 0);

    res.json({
      success: true,
      stats: {
        todayTotal,
        todayMorning,
        todayEvening,
        monthTotal,
        averageDailyYield: trend.length ? (trend.reduce((s, t) => s + t.total, 0) / trend.length).toFixed(1) : 0,
        trend,
        activeMilkingAnimals: animals.length,
        cowYield,
        buffaloYield
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMilkRecord = async (req, res, next) => {
  try {
    const record = await MilkProduction.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Milk record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
