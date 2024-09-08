const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const Payment = require('../models/Payment');

// Create a new vendor
router.post('/', async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint to handle vendor payment
router.post('/:id/pay', async (req, res) => {
  const { amount } = req.body;
  const { id } = req.params;

  try {
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.totalPaid += parseFloat(amount);
    vendor.remaining = vendor.totalPayable - vendor.totalPaid;
    vendor.status = vendor.remaining > 0 ? 'PAYABLE' : 'PAID';
    await vendor.save();

    const lastPayment = await Payment.findOne().sort({ paymentSlipId: -1 }).exec();
    const newPaymentSlipId = lastPayment ? lastPayment.paymentSlipId + 1 : 101;

    const payment = new Payment({
      vendorId: vendor._id,
      paymentSlipId: newPaymentSlipId,
      paidAmount: parseFloat(amount),
      date: new Date(),
    });
    await payment.save();

    res.json({
      message: 'Payment successful',
      payment
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update vendor balance
// Update customer name
router.put('/:id/name', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: 'Error updating name' });
  }
});


// Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting vendor' });
  }
});

module.exports = router;
