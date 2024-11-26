import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SalesInvoice.css';

const apiURL = import.meta.env.VITE_API_URL;


function SalesInvoice() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isInvoiceInProgress, setIsInvoiceInProgress] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [khatta, setKhatta] = useState(0);
  const [remainingInvoiceBalance, setRemainingInvoiceBalance] = useState(0);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [loading, setLoading] = useState(false); // State to handle loading
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    productId: '',
    quantity: 0,
    paidAmount: 0,
    paid: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customersResult = await axios.get(`${apiURL}/customers`);
        const productsResult = await axios.get(`${apiURL}/products`);
        setCustomers(Array.isArray(customersResult.data) ? customersResult.data : []);
        setProducts(Array.isArray(productsResult.data) ? productsResult.data : []);
        setFilteredCustomers(customersResult.data);
        setFilteredProducts(productsResult.data);
      } catch (error) {
        alert('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.customerId) {
      const fetchCustomerDetails = async () => {
        try {
          const customer = await axios.get(`${apiURL}/customers/${formData.customerId}`);
          setCurrentBalance(customer.data.accountBalance);
          setKhatta(customer.data.khatta || 0);
        } catch (error) {
          alert('Error fetching customer details:', error);
        }
      };
      fetchCustomerDetails();
    }
  }, [formData.customerId]);

  useEffect(() => {
    const totalAmount = calculateTotalAmount();
    const remainingInvoice = totalAmount - parseFloat(formData.paidAmount || 0);
    setRemainingInvoiceBalance(remainingInvoice > 0 ? remainingInvoice : 0);
  }, [selectedProducts, formData.paidAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'customerId' && isInvoiceInProgress) {
      alert('You must complete or reset the current invoice before switching customers.');
      return;
    }

    if (name === 'customerId') {
      const customer = customers.find(c => c._id === value);
      setFormData({
        ...formData,
        [name]: value,
        customerName: customer ? customer.name : '',
      });

      if (value !== '') {
        setIsInvoiceInProgress(true);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCustomerChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, customerName: value });

    if (value === '') {
      setFilteredCustomers([]);
      return;
    }

    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleProductChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, productName: value });

    if (value === '') {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleCustomerSelect = (customer) => {
    setFormData({ ...formData, customerId: customer._id, customerName: customer.name });
    setShowCustomerSuggestions(false);
  };

  const handleProductSelect = (product) => {
    setFormData({ ...formData, productId: product._id, productName: product.name });
    setShowProductSuggestions(false);
  };

  const handleAddProduct = () => {
    const product = products.find((p) => p._id === formData.productId);
    if (product) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: formData.quantity }]);
    }
  };

  const calculateTotalAmount = () => {
    return selectedProducts.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const totalAmount = calculateTotalAmount();

    const payload = {
      customerId: formData.customerId,
      customerName: formData.customerName,
      products: selectedProducts.map((p) => ({
        productId: p._id,
        productName: p.name,
        quantity: p.quantity,
      })),
      type: 'sales',
      totalAmount,
      paidAmount: formData.paidAmount,
      paid: formData.paid,
    };

    try {
      await axios.post(`${apiURL}/invoices`, payload);
      setShowPopup(true);
      setLoading(false);

    } catch (error) {
      alert('Error creating invoice:', error);
      alert('Error creating invoice');
      setLoading(false);
    }
  };

  const handlePopupResponse = (response) => {
    if (response) {
      resetForm();
    } else {
      window.location.href = '/';
    }
    setShowPopup(false);
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      productId: '',
      quantity: 0,
      paidAmount: 0,
      paid: false,
    });
    setSelectedProducts([]);
    setIsInvoiceInProgress(false);
    setCurrentBalance(0);
    setKhatta(0);
    setRemainingInvoiceBalance(0);
  };

  return (
    <div className="sales-invoice-container">
      <h1>Sales Invoice</h1>
      <div className="customer-info">
        <p>Current Balance: {currentBalance}</p>
        {/* <p>Khatta Balance: {khatta}</p> */}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label htmlFor="customerId">Customer:</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={(e) => {
              setFormData({ ...formData, customerName: e.target.value });
              handleCustomerChange(e);
            }}
            onFocus={() => setShowCustomerSuggestions(true)}
            placeholder="Search Customer"
          />
          {showCustomerSuggestions && filteredCustomers.length > 0 && (
            <ul className="suggestions-list" style={{ cursor: 'pointer' }}>
              {filteredCustomers.map((customer) => (
                <li key={customer._id} onClick={() => handleCustomerSelect(customer)}>
                  {customer.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-section">
          <label htmlFor="productId">Product:</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={(e) => {
              setFormData({ ...formData, productName: e.target.value });
              handleProductChange(e);
            }}
            onFocus={() => setShowProductSuggestions(true)}
            placeholder="Search Product"
          />
          {showProductSuggestions && filteredProducts.length > 0 && (
            <ul className="suggestions-list" style={{ cursor: 'pointer', }}>
              {filteredProducts.map((product) => (
                <li key={product._id} onClick={() => handleProductSelect(product)}>
                  ID: {product.productID}, Name: {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-section">
          <label htmlFor="quantity">Quantity:</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} id="quantity" />
        </div>
        <button className='add-btn' type="button" onClick={handleAddProduct}>Add Product</button>
        <div className="selected-products">
          <h2>Selected Products</h2>
          <table className="selected-products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((product, index) => (
                <tr key={index}>
                  <td>{product.productID}</td>
                  <td>{product.name}</td>
                  <td>{product.quantity}</td>
                  <td>{product.price}</td>
                  <td>{product.price * product.quantity}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
        <div className="totals">
          <h2>Total Amount: {calculateTotalAmount()}</h2>
          <div className="paid-section">
            <label htmlFor="paidAmount">Paid Amount:</label>
            <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleChange} id="paidAmount" />
          </div>
          <h2>Remaining Invoice Balance: {remainingInvoiceBalance}</h2>
          <div className="paid-checkbox">
            <label htmlFor="paid">Paid:</label>
            <input type="checkbox" name="paid" checked={formData.paid} onChange={() => setFormData({ ...formData, paid: !formData.paid })} id="paid" />
          </div>
        </div>
        <div className="buttons">
          <button type="submit" className="add-customer-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Create Sales Invoice'}
          </button>
          <button type="button" onClick={resetForm}>Reset</button>
        </div>

      </form>

      {showPopup && (
        <div className="popup">
          <div className='popup-content'>
            <h1 style={{ color: 'green', fontSize: '35px' }}>✔ SUCCESS</h1>
            <p>Invoice submitted successfully. Do you want to create another invoice?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => handlePopupResponse(true)}>Yes</button>
              <button onClick={() => handlePopupResponse(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesInvoice;
