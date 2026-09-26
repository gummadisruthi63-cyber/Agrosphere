import Expense from '../models/Expense.js';

export const getExpenses = async (req, res, next) => {
  try {
    const { category, paymentMethod, startDate, endDate, search } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (paymentMethod && paymentMethod !== 'All') filter.paymentMethod = paymentMethod;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    const totalExpenseAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    // Group by category
    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      amount: categoryTotals[cat],
      percentage: totalExpenseAmount ? ((categoryTotals[cat] / totalExpenseAmount) * 100).toFixed(1) : 0
    })).sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      count: expenses.length,
      expenses,
      stats: {
        totalExpenseAmount,
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense record not found' });
    res.json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense record not found' });
    res.json({ success: true, message: 'Expense record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
