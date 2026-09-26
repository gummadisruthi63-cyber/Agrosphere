import Feed from '../models/Feed.js';

export const getFeedItems = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Feed.find(filter).populate('storageShed', 'name shedNumber').sort({ name: 1 });

    const totalStockKg = items.reduce((s, i) => s + (i.unit === 'kg' ? i.currentStock : i.unit.includes('bag') ? i.currentStock * 50 : i.currentStock), 0);
    const totalValuation = items.reduce((s, i) => s + (i.currentStock * i.unitCost), 0);
    const lowStockCount = items.filter(i => i.currentStock <= i.minStockAlert).length;

    res.json({
      success: true,
      count: items.length,
      items,
      stats: {
        totalStockKg,
        totalValuation,
        lowStockCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createFeedItem = async (req, res, next) => {
  try {
    const item = await Feed.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

export const updateFeedItem = async (req, res, next) => {
  try {
    const item = await Feed.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Feed item not found' });
    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

export const logFeedConsumption = async (req, res, next) => {
  try {
    const { consumedQuantity, notes } = req.body;
    const item = await Feed.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Feed item not found' });

    const qty = Number(consumedQuantity);
    if (qty > item.currentStock) {
      return res.status(400).json({ success: false, message: `Cannot consume ${qty} ${item.unit}. Only ${item.currentStock} ${item.unit} available in stock.` });
    }

    item.currentStock -= qty;
    if (notes) {
      item.notes = (item.notes ? item.notes + ' | ' : '') + `Used ${qty} ${item.unit} on ${new Date().toLocaleDateString()}: ${notes}`;
    }
    await item.save();

    res.json({ success: true, item, message: `Successfully logged consumption of ${qty} ${item.unit}. Remaining: ${item.currentStock} ${item.unit}` });
  } catch (error) {
    next(error);
  }
};

export const restockFeed = async (req, res, next) => {
  try {
    const { quantityAdded, unitCost, supplier } = req.body;
    const item = await Feed.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Feed item not found' });

    item.currentStock += Number(quantityAdded);
    if (unitCost) item.unitCost = Number(unitCost);
    if (supplier) item.supplier = supplier;
    item.lastRestocked = new Date();
    await item.save();

    res.json({ success: true, item, message: `Restocked ${quantityAdded} ${item.unit}. Current stock: ${item.currentStock} ${item.unit}` });
  } catch (error) {
    next(error);
  }
};

export const deleteFeedItem = async (req, res, next) => {
  try {
    const item = await Feed.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Feed item not found' });
    res.json({ success: true, message: 'Feed item removed successfully' });
  } catch (error) {
    next(error);
  }
};
