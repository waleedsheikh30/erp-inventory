const Payment = require('../models/Payment');
const Customer = require('../models/Customer');

const createPayment = async (req, res) => {
  const { amount } = req.body;
  const { id: customerId } = req.params;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Fetch the latest payment slip ID
    const latestPayment = await Payment.findOne().sort({ paymentSlipId: -1 }).exec();
    let newPaymentSlipId = 101; // Starting payment slip ID

    if (latestPayment && latestPayment.paymentSlipId) {
      newPaymentSlipId = latestPayment.paymentSlipId + 1;
    }

    const amountToPay = parseFloat(amount);
    const currentTotalPaid = parseFloat(customer.totalPaid);

    // Update the totalPaid amount by adding the new payment amount
    customer.totalPaid = currentTotalPaid + amountToPay;
    customer.remaining = customer.totalPaid - customer.totalPayable;
    customer.status = customer.remaining > 0 ? 'PAYABLE' : 'PAID';
    await customer.save();

    const payment = new Payment({
      customerId: customer._id,
      paymentSlipId: newPaymentSlipId,
      paidAmount: parseFloat(amount),
      date: new Date(),
    });
    await payment.save();

    res.json({
      message: 'Payment successful',
      payment,
    });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ message: err.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
};
