import Animal from '../models/Animal.js';
import PoultryBatch from '../models/PoultryBatch.js';
import MilkProduction from '../models/MilkProduction.js';
import EggProduction from '../models/EggProduction.js';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Inventory from '../models/Inventory.js';
import Feed from '../models/Feed.js';
import Medicine from '../models/Medicine.js';
import Vaccination from '../models/Vaccination.js';
import HealthRecord from '../models/HealthRecord.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';

export const getUnifiedDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // 1. Livestock & Poultry Counts
    const cattleCount = await Animal.countDocuments({ animalType: 'Cow', healthStatus: { $ne: 'Deceased' } });
    const buffaloCount = await Animal.countDocuments({ animalType: 'Buffalo', healthStatus: { $ne: 'Deceased' } });
    const totalAnimals = cattleCount + buffaloCount;

    const activeBatches = await PoultryBatch.find({ status: 'Active' });
    const totalPoultry = activeBatches.reduce((sum, b) => sum + (b.currentCount || 0), 0);

    // 2. Today's Production
    const todayMilkRecords = await MilkProduction.find({
      date: { $gte: today, $lt: tomorrow }
    });
    const todayMilkProduction = todayMilkRecords.reduce((sum, r) => sum + (r.totalQuantity || 0), 0);

    const todayEggRecords = await EggProduction.find({
      date: { $gte: today, $lt: tomorrow }
    });
    const todayEggProduction = todayEggRecords.reduce((sum, r) => sum + (r.totalEggs || 0), 0);
    const todayGoodEggs = todayEggRecords.reduce((sum, r) => sum + (r.goodEggs || 0), 0);

    // 3. Monthly Financials (Sales & Expenses)
    const monthlySalesRecords = await Sale.find({
      saleDate: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const monthlySales = monthlySalesRecords.reduce((sum, s) => sum + (s.netAmount || 0), 0);

    const monthlyExpenseRecords = await Expense.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const monthlyExpenses = monthlyExpenseRecords.reduce((sum, e) => sum + (e.amount || 0), 0);

    const netProfitLoss = monthlySales - monthlyExpenses;

    // 4. Current Inventory Value
    const inventoryItems = await Inventory.find();
    const inventoryValue = inventoryItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.purchasePrice || 0)), 0);

    const feedItems = await Feed.find();
    const feedStockValue = feedItems.reduce((sum, f) => sum + ((f.currentStock || 0) * (f.unitCost || 0)), 0);

    const totalInventoryValue = inventoryValue + feedStockValue;

    // 5. Trends Data for Charts (Last 7 Days Milk & Egg)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      // milk
      const dayMilk = await MilkProduction.find({ date: { $gte: d, $lt: nextD } });
      const milkYield = dayMilk.reduce((sum, r) => sum + (r.totalQuantity || 0), 0);

      // egg
      const dayEgg = await EggProduction.find({ date: { $gte: d, $lt: nextD } });
      const eggYield = dayEgg.reduce((sum, r) => sum + (r.goodEggs || 0), 0);

      last7Days.push({
        date: dayStr,
        milk: milkYield,
        eggs: eggYield
      });
    }

    // 6. Monthly Financial Trend (Last 6 Months)
    const monthlyFinancials = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date();
      mDate.setMonth(mDate.getMonth() - i);
      const y = mDate.getFullYear();
      const m = mDate.getMonth();
      const mStart = new Date(y, m, 1);
      const mEnd = new Date(y, m + 1, 0, 23, 59, 59);

      const mSales = await Sale.find({ saleDate: { $gte: mStart, $lte: mEnd } });
      const revenue = mSales.reduce((acc, s) => acc + (s.netAmount || 0), 0);

      const mExp = await Expense.find({ date: { $gte: mStart, $lte: mEnd } });
      const expenses = mExp.reduce((acc, e) => acc + (e.amount || 0), 0);

      monthlyFinancials.push({
        month: monthNames[m],
        revenue,
        expenses,
        profit: revenue - expenses
      });
    }

    // 7. Feed Consumption Summary
    const feedBreakdown = feedItems.map(f => ({
      name: f.name,
      stock: f.currentStock,
      unit: f.unit,
      minAlert: f.minStockAlert,
      category: f.category
    }));

    // 8. Alerts
    // Low stock feed & inventory
    const lowStockInventory = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minStockAlert'] }
    }).limit(5);

    const lowStockFeeds = await Feed.find({
      $expr: { $lte: ['$currentStock', '$minStockAlert'] }
    }).limit(5);

    // Medicine expiry within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringMedicines = await Medicine.find({
      expiryDate: { $lte: thirtyDaysFromNow }
    }).limit(5);

    // Vaccination Due
    const upcomingVaccinations = await Vaccination.find({
      dueDate: { $gte: today, $lte: thirtyDaysFromNow },
      status: { $ne: 'Completed' }
    }).limit(5);

    // Animal health follow up
    const healthFollowUps = await HealthRecord.find({
      status: 'Active'
    }).limit(5);

    // Pending payments from customers
    const pendingSales = await Sale.find({
      paymentStatus: { $in: ['Pending', 'Partially Paid'] }
    }).limit(5);

    // Upcoming employee tasks
    const employeesWithTasks = await Employee.find({
      'activeTasks.completed': false
    }).select('name role activeTasks').limit(5);

    const pendingTasks = [];
    employeesWithTasks.forEach(emp => {
      emp.activeTasks.filter(t => !t.completed).forEach(t => {
        pendingTasks.push({
          employeeName: emp.name,
          employeeRole: emp.role,
          task: t.task,
          dueDate: t.dueDate
        });
      });
    });

    // Recent Sales
    const recentSales = await Sale.find().sort({ saleDate: -1 }).limit(5);

    // Recent Expenses
    const recentExpenses = await Expense.find().sort({ date: -1 }).limit(5);

    // Response structure
    res.json({
      success: true,
      summary: {
        totalAnimals,
        cattleCount,
        buffaloCount,
        totalPoultry,
        todayMilkProduction,
        todayEggProduction,
        todayGoodEggs,
        monthlySales,
        monthlyExpenses,
        netProfitLoss,
        totalInventoryValue
      },
      trends: {
        productionLast7Days: last7Days,
        monthlyFinancials,
        feedBreakdown
      },
      alerts: {
        lowStockItems: [...lowStockInventory.map(i => ({ type: 'Inventory', name: i.name, stock: `${i.quantity} ${i.unit}`, threshold: i.minStockAlert })),
                         ...lowStockFeeds.map(f => ({ type: 'Feed', name: f.name, stock: `${f.currentStock} ${f.unit}`, threshold: f.minStockAlert }))],
        expiringMedicines: expiringMedicines.map(m => ({ name: m.name, expiryDate: m.expiryDate, stock: `${m.currentStock} ${m.unit}` })),
        vaccinationsDue: upcomingVaccinations.map(v => ({ vaccine: v.vaccineName, target: v.targetName, dueDate: v.dueDate })),
        healthFollowUps: healthFollowUps.map(h => ({ target: h.targetName, diagnosis: h.diagnosis, followUpDate: h.followUpDate, status: h.status })),
        pendingPayments: pendingSales.map(s => ({ invoice: s.invoiceNumber, customer: s.customerName, amount: s.balanceDue || s.netAmount, date: s.saleDate })),
        upcomingTasks: pendingTasks.slice(0, 5)
      },
      recentTransactions: {
        sales: recentSales,
        expenses: recentExpenses
      }
    });
  } catch (error) {
    next(error);
  }
};
