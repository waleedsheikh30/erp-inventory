const express = require('express');
const { createInvoice, getInvoices, downloadInvoice } = require('../controllers/invoiceController');
const router = express.Router();

router.post('/invoices', createInvoice);
// router.get('/invoices', getInvoices);
router.get('/invoices/download/:invoiceId', downloadInvoice);

module.exports = router;
