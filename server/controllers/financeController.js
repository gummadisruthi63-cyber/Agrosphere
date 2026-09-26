import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';

export const getFinancialOverview = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const targetYear = Number(year);

    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);

    // All sales and expenses for the year
    const sales = await Sale.find({ saleDate: { $gte: yearStart, $lte: yearEnd } });
    const expenses = await Expense.find({ date: { $gte: yearStart, $lte: yearEnd } });

    // Lifetime figures
    const allSales = await Sale.find();
    const allExpenses = await Expense.find();

    const totalRevenue = sales.reduce((s, sale) => s + (sale.netAmount || 0), 0);
    const totalCollected = sales.reduce((s, sale) => s + (sale.amountPaid || 0), 0);
    const totalExpenses = expenses.reduce((s, exp) => s + (exp.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const outstandingPayments = sales.reduce((s, sale) => s + (sale.balanceDue || 0), 0);

    // Monthly breakdown for the year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCashFlow = [];

    for (let m = 0; m < 12; m++) {
      const mStart = new Date(targetYear, m, 1);
      const mEnd = new Date(targetYear, m + 1, 0, 23, 59, 59);

      const mSales = sales.filter(s => new Date(s.saleDate) >= mStart && new Date(s.saleDate) <= mEnd);
      const mExpenses = expenses.filter(e => new Date(e.date) >= mStart && new Date(e.date) <= mEnd);

      const rev = mSales.reduce((sum, s) => sum + (s.netAmount || 0), 0);
      const exp = mExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const cashIn = mSales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
      const cashOut = exp;

      monthlyCashFlow.push({
        month: monthNames[m],
        monthIndex: m + 1,
        revenue: rev,
        expenses: exp,
        netProfit: rev - exp,
        cashInflow: cashIn,
        cashOutflow: cashOut,
        netCashFlow: cashIn - cashOut
      });
    }

    // Sales by Product Category
    const salesByCategoryMap = {};
    sales.forEach(s => {
      salesByCategoryMap[s.productType] = (salesByCategoryMap[s.productType] || 0) + s.netAmount;
    });
    const salesByCategory = Object.keys(salesByCategoryMap).map(type => ({
      name: type,
      value: salesByCategoryMap[type]
    })).sort((a, b) => b.value - a.value);

    // Expenses by Category
    const expByCategoryMap = {};
    expenses.forEach(e => {
      expByCategoryMap[e.category] = (expByCategoryMap[e.category] || 0) + e.amount;
    });
    const expensesByCategory = Object.keys(expByCategoryMap).map(cat => ({
      name: cat,
      value: expByCategoryMap[cat]
    })).sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      year: targetYear,
      metrics: {
        totalRevenue,
        totalCollected,
        totalExpenses,
        grossIncome: totalRevenue,
        netProfit,
        profitMargin: totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0,
        outstandingPayments
      },
      lifetimeMetrics: {
        totalRevenue: allSales.reduce((s, sale) => s + (sale.netAmount || 0), 0),
        totalExpenses: allExpenses.reduce((s, exp) => s + (exp.amount || 0), 0)
      },
      charts: {
        monthlyCashFlow,
        salesByCategory,
        expensesByCategory
      }
    });
  } catch (error) {
    next(error);
  }
};
