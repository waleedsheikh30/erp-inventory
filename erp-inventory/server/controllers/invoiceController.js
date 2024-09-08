const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


const updateCustomerOrVendorBalance = async (type, customerId, vendorId, totalAmount, paidAmount) => {
  if (type === 'sales') {
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalPayable += totalAmount;
      customer.totalPaid += Number(paidAmount);
      customer.remaining = customer.totalPayable - customer.totalPaid;
      customer.status = customer.remaining > 0 ? 'PAYABLE' : 'PAID';
      await customer.save();
    }
  } else if (type === 'purchase') {
    const vendor = await Vendor.findById(vendorId);
    if (vendor) {
      vendor.totalPayable += totalAmount;
      vendor.totalPaid += Number(paidAmount);
      vendor.remaining = vendor.totalPayable - vendor.totalPaid;
      vendor.status = vendor.remaining > 0 ? 'PAYABLE' : 'PAID';
      await vendor.save();
    }
  }
};


const createInvoice = async (req, res) => {
  try {
    const { type, customerId, vendorId, products, totalAmount, paidAmount } = req.body;

    if (!type || (!customerId && !vendorId) || !products || totalAmount === undefined || paidAmount === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let vendorName;
    if (type === 'purchase' && vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(400).json({ message: 'Vendor not found' });
      }
      vendorName = vendor.name;
    }

    let customerName;
    if (type === 'sales' && customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(400).json({ message: 'Customer not found' });
      }
      customerName = customer.name;
    }

    const detailedProducts = await Promise.all(products.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      return {
        productId: product._id,
        productName: product.name,
        description: product.description,
        quantity: item.quantity,
        price: product.price 
      };
    }));
    
    const invoice = new Invoice({
      type,
      customerId,
      customerName,
      vendorId,
      vendorName,
      products: detailedProducts,
      totalAmount,
      paidAmount,
      paid: paidAmount >= totalAmount,
    });
    await invoice.save();

    await updateCustomerOrVendorBalance(type, customerId, vendorId, totalAmount, paidAmount);


    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: 'Product not found' });
      }
      if (type === 'sales') {
        product.quantity -= Number(item.quantity);
      } else if (type === 'purchase') {
        product.quantity += Number(item.quantity);
      }
      await product.save();
    }

    if (type === 'sales' && customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(400).json({ message: 'Customer not found' });
      }

      let remainingInvoiceBalance = totalAmount - paidAmount;
      let newKhatta = customer.khatta || 0;

      if (remainingInvoiceBalance > 0) {
        newKhatta += remainingInvoiceBalance;
      } else {
        newKhatta = 0;
      }

      customer.accountBalance -= paidAmount;
      customer.khatta = newKhatta;

      await customer.save();
    } else if (type === 'purchase' && vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(400).json({ message: 'Vendor not found' });
      }

      let remainingInvoiceBalance = totalAmount - paidAmount;
      let newKhatta = vendor.khatta || 0;

      if (remainingInvoiceBalance > 0) {
        newKhatta += remainingInvoiceBalance;
      } else {
        newKhatta = 0;
      }

      vendor.accountBalance -= paidAmount;
      vendor.khatta = newKhatta;

      await vendor.save();
    }

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const { type } = req.query;
    const invoices = await Invoice.find(type ? { type } : {});
    res.json(invoices);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Utility function to generate invoice PDF

const generateInvoicePDF = (invoice, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Title
      doc.fontSize(28).text('Invoice', { align: 'center' });
      doc.moveDown(2);

      // Invoice Information
      doc.fontSize(12).font('Helvetica-Bold').text(`Invoice ID:`, 50, 120, { continued: true }).font('Helvetica').text(`${String(invoice._id).replace(/[^0-9]/g, '').slice(-3)}`);
      doc.font('Helvetica-Bold').text(`Date:`, 50, 140, { continued: true }).font('Helvetica').text(` ${new Date().toLocaleDateString()}`);

      // Customer or Vendor Information
      const entity = invoice.customerId ? invoice.customerId : invoice.vendorId;
      doc.font('Helvetica-Bold').text(`${invoice.customerId ? 'Customer' : 'Vendor'}:`, 50, 160, { continued: true }).font('Helvetica').text(` ${entity.name}`);
      doc.font('Helvetica-Bold').text(`Mobile No:`, 50, 180, { continued: true }).font('Helvetica').text(` ${entity.mobileNo}`);
      doc.font('Helvetica-Bold').text(`Company:`, 50, 200, { continued: true }).font('Helvetica').text(` ${entity.company}`);
      doc.font('Helvetica-Bold').text(`Cash Type:`, 50, 220, { continued: true }).font('Helvetica').text(` ${entity.cashType}`);

      // Table Headings
      doc.moveDown(2).fontSize(12).font('Helvetica-Bold').text('Items:', 50, 260);
      
      // Draw the header box
      doc.rect(50, 280, 500, 20).fillAndStroke('gray', 'black');
      doc.fillColor('white').font('Helvetica-Bold').text('Name', 55, 285)
        .text('Description', 150, 285)
        .text('Quantity', 290, 285)
        .text('Price', 375, 285)
        .text('Total Amount', 450, 285);
      
      // Initial Y-coordinate for items
      let yCoordinate = 300;

      // Table Data
      invoice.products.forEach((product) => {
        const productName = product.productName || 'Unknown';
        const productDescription = product.description || '';
        const quantity = product.quantity || 0;
        const price = product.price || 0;
        const itemTotal = price * quantity;

        const formattedQuantity = quantity.toString().padStart(2, '0');

        // Draw the item box
        doc.rect(50, yCoordinate, 500, 20).stroke();
        doc.fillColor('black').fontSize(10).font('Helvetica').text(productName, 55, yCoordinate + 5)
          .text(productDescription, 150, yCoordinate + 5)
          .text(formattedQuantity, 300, yCoordinate + 5)
          .text(price.toFixed(2), 375, yCoordinate + 5)
          .text(itemTotal.toFixed(2), 453, yCoordinate + 5);
        
        yCoordinate += 20;
      });

      // Adding some space after the last item
      yCoordinate += 20;

      // Total and Paid Amount
      doc.fontSize(12).font('Helvetica-Bold').text(`Total Amount: ${invoice.totalAmount}`, 50, yCoordinate, { align: 'right', width: 500 });
      yCoordinate += 20;
      doc.text(`Paid Amount: ${invoice.paidAmount}`, 50, yCoordinate, { align: 'right', width: 500 });

      doc.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

// Download invoice endpoint
const downloadInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const invoice = await Invoice.findById(invoiceId).populate('customerId').populate('vendorId');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Create a temporary file path
    const filePath = path.join(__dirname, `../../invoices/invoice-${invoiceId}.pdf`);

    await generateInvoicePDF(invoice, filePath);

    // Send the PDF file as a response
    res.download(filePath, `invoice-${invoiceId}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).json({ message: 'Error downloading the file' });
      }
      // Delete the file after sending it
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting the file:', err);
      });
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = { createInvoice, getInvoices, downloadInvoice };
