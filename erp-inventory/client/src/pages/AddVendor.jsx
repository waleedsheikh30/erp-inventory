import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddCustomer.css';

const apiURL = import.meta.env.VITE_API_URL;


function AddVendor() {
  const [formData, setFormData] = useState({
    name: '', accountBalance: 0, mobileNo: 1234567, company: '', cashType: ''
  });
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false); // State to handle loading


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiURL}/vendors`, formData);
      setShowPopup(true)
      setLoading(false); // Stop loading when the popup is shown
      setFormData({
        name: '', accountBalance: 0, mobileNo: 1234567, company: '', cashType: ''
      });
    } catch (error) {
      alert('Failed to add vendor');
      setLoading(false); // Stop loading when the popup is shown
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
    setFormData({
      name: '', accountBalance: 0, mobileNo: '', company: '', cashType: ''
    });
  };


  return (
    <div className="add-customer-container">
      <h1>Add Vendor</h1>
      <form onSubmit={handleSubmit} className="add-customer-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            id="name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="accountBalance">Account Balance:</label>
          <input
            type="number"
            name="accountBalance"
            value={formData.accountBalance}
            onChange={handleChange}
            id="accountBalance"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Mobile No:</label>
          <input type="number" id="mobileNo" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Company:</label>
          <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Cash Type:</label>
          <input type="text" id="cashType" name="cashType" value={formData.cashType} onChange={handleChange} required
          />
        </div>

        <button type="submit" className="add-customer-btn" disabled={loading}>
          {loading ? (
            <div className="spinner"></div> // Show loading spinner if loading
          ) : (
            'Add Vendor'
          )}
        </button>
        {showPopup && (
          <div className="popup">
            <h1 style={{ color: 'green', fontSize: '35px' }}>✔ SUCCESS</h1>
            <p>Vendor Added Successfully. Do you want to add another vendor?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => handlePopupResponse(true)}>Yes</button>
              <button onClick={() => handlePopupResponse(false)}>No</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AddVendor;
