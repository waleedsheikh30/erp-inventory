const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    accountBalance: { type: Number, required: true, default: 0 },
    mobileNo: { type: Number, required: true },
    company: { type: String, required: true },
    cashType: { type: String, required: true },
    khatta: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    status: { type: String }
});

module.exports = mongoose.model('Customer', customerSchema);
