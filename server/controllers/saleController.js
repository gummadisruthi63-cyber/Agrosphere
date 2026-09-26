import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';

export const getSales = async (req, res, next) => {
  try {
    const { paymentStatus, productType, startDate, endDate, search } = req.query;
    const filter = {};

    if (paymentStatus && paymentStatus !== 'All') filter.paymentStatus = paymentStatus;
    if (productType && productType !== 'All') filter.productType = productType;
    if (startDate && endDate) {
      filter.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { productType: { $regex: search, $options: 'i' } }
      ];
    }

    const sales = await Sale.find(filter).populate('customer', 'name phone email').sort({ saleDate: -1 });

    const totalRevenue = sales.reduce((s, sale) => s + (sale.netAmount || 0), 0);
    const paidRevenue = sales.reduce((s, sale) => s + (sale.amountPaid || (sale.paymentStatus === 'Paid' ? sale.netAmount : 0)), 0);
    const pendingAmount = sales.reduce((s, sale) => s + (sale.balanceDue || (sale.paymentStatus === 'Pending' ? sale.netAmount : 0)), 0);

    res.json({
      success: true,
      count: sales.length,
      sales,
      stats: {
        totalRevenue,
        paidRevenue,
        pendingAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('customer');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale invoice not found' });
    res.json({ success: true, sale });
  } catch (error) {
    next(error);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Auto-generate invoice number if not provided
    if (!data.invoiceNumber) {
      const count = await Sale.countDocuments();
      data.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;
    }

    const qty = Number(data.quantity) || 1;
    const price = Number(data.unitPrice) || 0;
    const total = qty * price;
    const discount = Number(data.discount) || 0;
    const net = Math.max(0, total - discount);

    data.totalAmount = total;
    data.discount = discount;
    data.netAmount = net;

    if (data.paymentStatus === 'Paid') {
      data.amountPaid = net;
      data.balanceDue = 0;
    } else if (data.paymentStatus === 'Pending') {
      data.amountPaid = 0;
      data.balanceDue = net;
    } else if (data.paymentStatus === 'Partially Paid') {
      data.amountPaid = Number(data.amountPaid) || 0;
      data.balanceDue = Math.max(0, net - data.amountPaid);
    }

    const sale = await Sale.create(data);

    // If customer linked, update customer record
    if (data.customer) {
      const customer = await Customer.findById(data.customer);
      if (customer) {
        customer.totalPurchases += net;
        customer.outstandingBalance += data.balanceDue;
        await customer.save();
      }
    }

    res.status(201).json({ success: true, sale });
  } catch (error) {
    next(error);
  }
};

export const updateSale = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.quantity && data.unitPrice) {
      const qty = Number(data.quantity);
      const price = Number(data.unitPrice);
      data.totalAmount = qty * price;
      const discount = Number(data.discount) || 0;
      data.netAmount = Math.max(0, data.totalAmount - discount);
      if (data.paymentStatus === 'Paid') {
        data.amountPaid = data.netAmount;
        data.balanceDue = 0;
      }
    }

    const sale = await Sale.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, sale });
  } catch (error) {
    next(error);
  }
};

export const deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, message: 'Sale invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};
