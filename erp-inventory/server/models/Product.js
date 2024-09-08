const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productID: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model('Product', productSchema);
