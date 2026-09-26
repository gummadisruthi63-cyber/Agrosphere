import Inventory from '../models/Inventory.js';

export const getInventory = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Inventory.find(filter).sort({ category: 1, name: 1 });

    const totalValuation = items.reduce((s, i) => s + (i.quantity * i.purchasePrice), 0);
    const lowStockCount = items.filter(i => i.status === 'Low Stock' || i.quantity <= i.minStockAlert).length;
    const outOfStockCount = items.filter(i => i.quantity <= 0).length;

    res.json({
      success: true,
      count: items.length,
      items,
      stats: {
        totalItems: items.length,
        totalValuation,
        lowStockCount,
        outOfStockCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { adjustmentType, quantity, reason } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const qty = Number(quantity);
    if (adjustmentType === 'Stock In') {
      item.quantity += qty;
    } else if (adjustmentType === 'Stock Out') {
      if (qty > item.quantity) {
        return res.status(400).json({ success: false, message: `Cannot remove ${qty}. Only ${item.quantity} in stock.` });
      }
      item.quantity -= qty;
    } else if (adjustmentType === 'Set Absolute') {
      item.quantity = qty;
    }

    if (reason) {
      item.notes = (item.notes ? item.notes + ' | ' : '') + `Stock adjustment (${adjustmentType} ${qty}) on ${new Date().toLocaleDateString()}: ${reason}`;
    }

    await item.save();

    res.json({ success: true, item, message: `Stock adjusted successfully. New quantity: ${item.quantity} ${item.unit}` });
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
