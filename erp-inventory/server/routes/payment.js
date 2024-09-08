// routes/payment.js

const express = require('express');
const router = express.Router();
const { createPayment, getPayments, getPaymentById } = require('../controllers/paymentController');

// Create a new payment
router.post('/:id/pay', createPayment);

// Get all payments
router.get('/', getPayments);

// Get payment by ID
router.get('/:id', getPaymentById);

module.exports = router;
