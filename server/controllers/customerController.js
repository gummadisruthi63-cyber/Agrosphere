import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    const filter = {};

    if (type && type !== 'All') filter.customerType = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter).sort({ name: 1 });

    const totalOutstanding = customers.reduce((s, c) => s + (c.outstandingBalance || 0), 0);
    const totalLifetimePurchases = customers.reduce((s, c) => s + (c.totalPurchases || 0), 0);

    res.json({
      success: true,
      count: customers.length,
      customers,
      stats: {
        totalCustomers: customers.length,
        totalOutstanding,
        totalLifetimePurchases
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const salesHistory = await Sale.find({ customer: customer._id }).sort({ saleDate: -1 });

    res.json({
      success: true,
      customer,
      salesHistory
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
