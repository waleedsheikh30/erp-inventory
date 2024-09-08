const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// GET all products
router.get('/', getProducts);

// GET a product by ID
router.get('/:id', getProductById);

// POST a new product
router.post('/', createProduct);

// PUT (update) a product by ID
router.put('/:id', updateProduct);

// DELETE a product by ID
router.delete('/:id', deleteProduct);

module.exports = router;
