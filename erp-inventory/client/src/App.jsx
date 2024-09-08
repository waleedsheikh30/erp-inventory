import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SalesInvoice from './pages/SalesInvoice';
import PurchaseInvoice from './pages/PurchaseInvoice';
import AddCustomer from './pages/AddCustomer';
import AddProduct from './pages/AddProduct';
import AddVendor from './pages/AddVendor';
import VendorManagement from './pages/VendorManagement';
import CustomerManagement from './pages/CustomerManagement';
import CustomerPayment from './pages/CustomerPayment';
import VendorPayment from './pages/VendorPayment';
import './App.css'
import Stock from './pages/Stock';
import Invoices from './pages/Invoices';
import Navbar from './components/Navbar';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<Dashboard />} />
          <Route path="/sales" element={<SalesInvoice />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/add-vendor" element={<AddVendor />} />
          <Route path="/purchase" element={<PurchaseInvoice />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/customer-management" element={<CustomerManagement />} />
          <Route path="/vendor-management" element={<VendorManagement />} />
          <Route path="/CST-remaining-payment" element={<CustomerPayment />} />
          <Route path="/VDR-remaining-payment" element={<VendorPayment />} />
        </Route>

      </Routes>
  );
}

export default App;
