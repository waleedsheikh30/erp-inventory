import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddCustomer.css';


const apiURL = import.meta.env.VITE_API_URL;


function AddCustomer() {
  const [customer, setCustomer] = useState({ name: '', accountBalance: 0, mobileNo: 1234567, company: '', cashType: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false); // State to handle loading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading when the form is submitted
    try {
      await axios.post(`${apiURL}/customers`, customer); // Ensure the base URL matches your server
      setShowPopup(true);
      setLoading(false); // Stop loading when the popup is shown
      setCustomer({ name: '', accountBalance: 0, mobileNo: '', company: '', cashType: '' });
    } catch (error) {
      alert('There was an error adding the customer:', error);
      setLoading(false); // Stop loading in case of an error
    }
  };

  const handlePopupResponse = (response) => {
    if (response) {
      resetForm();
    } else {
      window.location.href = '/'; // Redirect to invoices page
    }
    setShowPopup(false);
  };

  const resetForm = () => {
    setCustomer({
      name: '', accountBalance: 0, mobileNo: '', company: '', cashType: ''
    });
  };

  return (
    <div className="add-customer-container">
      <h1>Add Customer</h1>
      <form onSubmit={handleSubmit} className="add-customer-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={customer.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="accountBalance">Account Balance:</label>
          <input type="number" id="accountBalance" name="accountBalance" value={customer.accountBalance} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="name">Mobile No:</label>
          <input type="number" id="mobileNo" name="mobileNo" value={customer.mobileNo} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="name">Company:</label>
          <input type="text" id="company" name="company" value={customer.company} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="name">Cash Type:</label>
          <input type="text" id="cashType" name="cashType" value={customer.cashType} onChange={handleChange} required />
        </div>

        <button type="submit" className="add-customer-btn" disabled={loading}>
          {loading ? (
            <div className="spinner"></div> // Show loading spinner if loading
          ) : (
            'Add Customer'
          )}
        </button>

        {showPopup && (
          <div className="popup">
            <div className='popup-content'>
              <h1 style={{ color: 'green', fontSize: '35px' }}>✔ SUCCESS</h1>
              <p>Customer Added Successfully. Do you want to add another customer?</p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => handlePopupResponse(true)}>Yes</button>
                <button onClick={() => handlePopupResponse(false)}>No</button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AddCustomer;
