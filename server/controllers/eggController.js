import EggProduction from '../models/EggProduction.js';
import PoultryBatch from '../models/PoultryBatch.js';

export const getEggRecords = async (req, res, next) => {
  try {
    const { startDate, endDate, batchId } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (batchId && batchId !== 'All') {
      filter.batch = batchId;
    }

    const records = await EggProduction.find(filter)
      .populate('batch', 'batchId batchName breed currentCount')
      .sort({ date: -1, createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

export const recordEggs = async (req, res, next) => {
  try {
    const { date, batch, totalEggs, goodEggs, brokenEggs, damagedEggs, collectedBy, notes } = req.body;
    const total = Number(totalEggs) || (Number(goodEggs) + Number(brokenEggs) + (Number(damagedEggs) || 0));
    const good = Number(goodEggs) || 0;
    const broken = Number(brokenEggs) || 0;
    const damaged = Number(damagedEggs) || 0;

    // Calculate lay rate percentage if batch count is known
    const poultryBatch = await PoultryBatch.findById(batch);
    let layRate = 0;
    if (poultryBatch && poultryBatch.currentCount > 0) {
      layRate = Number(((total / poultryBatch.currentCount) * 100).toFixed(1));
    }

    const record = await EggProduction.create({
      date: date || new Date(),
      batch,
      totalEggs: total,
      goodEggs: good,
      brokenEggs: broken,
      damagedEggs: damaged,
      layRatePercentage: layRate,
      collectedBy: collectedBy || 'Poultry Staff',
      notes: notes || ''
    });

    const populatedRecord = await EggProduction.findById(record._id).populate('batch', 'batchId batchName breed currentCount');
    res.status(201).json({ success: true, record: populatedRecord });
  } catch (error) {
    next(error);
  }
};

export const getEggStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayRecords = await EggProduction.find({ date: { $gte: today, $lt: tomorrow } });
    const todayTotal = todayRecords.reduce((s, r) => s + (r.totalEggs || 0), 0);
    const todayGood = todayRecords.reduce((s, r) => s + (r.goodEggs || 0), 0);
    const todayBroken = todayRecords.reduce((s, r) => s + (r.brokenEggs || 0), 0);

    const monthRecords = await EggProduction.find({ date: { $gte: startOfMonth } });
    const monthTotal = monthRecords.reduce((s, r) => s + (r.totalEggs || 0), 0);
    const monthGood = monthRecords.reduce((s, r) => s + (r.goodEggs || 0), 0);

    // 14-day egg trend
    const trend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);

      const dayRecords = await EggProduction.find({ date: { $gte: d, $lt: nd } });
      const g = dayRecords.reduce((s, r) => s + (r.goodEggs || 0), 0);
      const b = dayRecords.reduce((s, r) => s + (r.brokenEggs || 0), 0);

      trend.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        goodEggs: g,
        brokenEggs: b,
        totalEggs: g + b
      });
    }

    res.json({
      success: true,
      stats: {
        todayTotal,
        todayGood,
        todayBroken,
        monthTotal,
        monthGood,
        damagedRate: todayTotal ? ((todayBroken / todayTotal) * 100).toFixed(1) : 0,
        trend
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEggRecord = async (req, res, next) => {
  try {
    const record = await EggProduction.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Egg record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
