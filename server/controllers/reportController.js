import MilkProduction from '../models/MilkProduction.js';
import EggProduction from '../models/EggProduction.js';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Inventory from '../models/Inventory.js';
import Animal from '../models/Animal.js';
import PoultryBatch from '../models/PoultryBatch.js';
import Customer from '../models/Customer.js';

export const getReportData = async (req, res, next) => {
  try {
    const { type = 'milk', startDate, endDate, category, animalId, batchId } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    let reportData = [];
    let summary = {};

    switch (type) {
      case 'milk': {
        const query = {};
        if (startDate && endDate) query.date = dateFilter;
        if (animalId && animalId !== 'All') query.animal = animalId;

        reportData = await MilkProduction.find(query).populate('animal', 'tagNumber name animalType breed').sort({ date: -1 });
        const totalYield = reportData.reduce((s, r) => s + (r.totalQuantity || 0), 0);
        const morningYield = reportData.reduce((s, r) => s + (r.morningQuantity || 0), 0);
        const eveningYield = reportData.reduce((s, r) => s + (r.eveningQuantity || 0), 0);
        summary = { totalYield, morningYield, eveningYield, recordCount: reportData.length };
        break;
      }

      case 'egg': {
        const query = {};
        if (startDate && endDate) query.date = dateFilter;
        if (batchId && batchId !== 'All') query.batch = batchId;

        reportData = await EggProduction.find(query).populate('batch', 'batchId batchName breed').sort({ date: -1 });
        const totalEggs = reportData.reduce((s, r) => s + (r.totalEggs || 0), 0);
        const goodEggs = reportData.reduce((s, r) => s + (r.goodEggs || 0), 0);
        const brokenEggs = reportData.reduce((s, r) => s + (r.brokenEggs || 0), 0);
        summary = { totalEggs, goodEggs, brokenEggs, recordCount: reportData.length };
        break;
      }

      case 'sales': {
        const query = {};
        if (startDate && endDate) query.saleDate = dateFilter;
        if (category && category !== 'All') query.productType = category;

        reportData = await Sale.find(query).populate('customer', 'name phone').sort({ saleDate: -1 });
        const totalSalesAmount = reportData.reduce((s, r) => s + (r.netAmount || 0), 0);
        const totalPaid = reportData.reduce((s, r) => s + (r.amountPaid || 0), 0);
        const totalPending = reportData.reduce((s, r) => s + (r.balanceDue || 0), 0);
        summary = { totalSalesAmount, totalPaid, totalPending, invoiceCount: reportData.length };
        break;
      }

      case 'expense': {
        const query = {};
        if (startDate && endDate) query.date = dateFilter;
        if (category && category !== 'All') query.category = category;

        reportData = await Expense.find(query).sort({ date: -1 });
        const totalExpenses = reportData.reduce((s, r) => s + (r.amount || 0), 0);
        summary = { totalExpenses, transactionCount: reportData.length };
        break;
      }

      case 'inventory': {
        const query = {};
        if (category && category !== 'All') query.category = category;
        reportData = await Inventory.find(query).sort({ category: 1, name: 1 });
        const totalValuation = reportData.reduce((s, r) => s + (r.quantity * r.purchasePrice), 0);
        summary = { totalItems: reportData.length, totalValuation };
        break;
      }

      case 'animal': {
        const query = {};
        if (category && category !== 'All') query.animalType = category;
        reportData = await Animal.find(query).populate('shed', 'name shedNumber').sort({ tagNumber: 1 });
        summary = {
          totalAnimals: reportData.length,
          cows: reportData.filter(a => a.animalType === 'Cow').length,
          buffaloes: reportData.filter(a => a.animalType === 'Buffalo').length
        };
        break;
      }

      case 'poultry': {
        reportData = await PoultryBatch.find().populate('shed', 'name shedNumber').sort({ arrivalDate: -1 });
        const totalBirds = reportData.reduce((s, b) => s + (b.currentCount || 0), 0);
        const totalMortality = reportData.reduce((s, b) => s + (b.mortalityCount || 0), 0);
        summary = { totalBatches: reportData.length, totalBirds, totalMortality };
        break;
      }

      case 'customer': {
        reportData = await Customer.find().sort({ totalPurchases: -1 });
        const totalOutstanding = reportData.reduce((s, c) => s + (c.outstandingBalance || 0), 0);
        const totalPurchases = reportData.reduce((s, c) => s + (c.totalPurchases || 0), 0);
        summary = { totalCustomers: reportData.length, totalOutstanding, totalPurchases };
        break;
      }

      case 'profit_loss': {
        const saleQuery = startDate && endDate ? { saleDate: dateFilter } : {};
        const expQuery = startDate && endDate ? { date: dateFilter } : {};

        const sales = await Sale.find(saleQuery);
        const expenses = await Expense.find(expQuery);

        const rev = sales.reduce((s, r) => s + (r.netAmount || 0), 0);
        const exp = expenses.reduce((s, r) => s + (r.amount || 0), 0);
        const profit = rev - exp;

        reportData = [
          { item: 'Total Farm Revenue (Sales)', amount: rev },
          { item: 'Total Operational Expenses', amount: exp },
          { item: 'Net Operating Profit / (Loss)', amount: profit, isNet: true }
        ];
        summary = { revenue: rev, expenses: exp, netProfit: profit };
        break;
      }

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.json({
      success: true,
      reportType: type,
      summary,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};
