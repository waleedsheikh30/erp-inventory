const express = require('express');
const { createInvoice, getInvoices, downloadInvoice } = require('../controllers/invoiceController');
const { getCustomers } = require('../controllers/customerController');
const { getVendors, addVendor } = require('../controllers/vendorController');
const { getProducts } = require('../controllers/productController');

const router = express.Router();

router.post('/invoices', createInvoice);
router.get('/invoices', getInvoices);
router.get('/customers', getCustomers);
router.get('/vendors', getVendors);
router.post('/vendors', addVendor);
router.get('/products', getProducts);
router.get('/invoices/download/:invoiceId', downloadInvoice);


module.exports = router;
