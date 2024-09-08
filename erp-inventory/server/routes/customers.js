const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

// Create a new customer
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint to handle customer payment
router.post('/:id/pay', async (req, res) => {
  const { amount } = req.body;
  const { id: customerId } = req.params;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Ensure invoices array is defined
    if (!customer.invoices) {
      customer.invoices = [];
    }

    // Fetch the latest payment slip ID
    const latestPayment = await Payment.findOne().sort({ paymentSlipId: -1 }).exec();
    let newPaymentSlipId = 101; // Starting payment slip ID

    if (latestPayment && latestPayment.paymentSlipId) {
      newPaymentSlipId = latestPayment.paymentSlipId + 1;
    }

    // Update customer totalPaid with the new amount
    customer.totalPaid += parseFloat(amount);

    // Recalculate remaining amount
    customer.remaining = customer.totalPayable - customer.totalPaid;
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
});

// Update customer name
router.put('/:id/name', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Error updating name' });
  }
});


// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting customer' });
  }
});

module.exports = router;
