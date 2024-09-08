const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false,
  },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: false },

  paidAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentSlipId: {
    type: Number,
    required: true,
    unique: true,
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
