const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  customerName: { type: String },
  vendorName: { type: String },
  products: [productSchema],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true }, 
  paid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
