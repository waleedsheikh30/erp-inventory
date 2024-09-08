import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomerPayment from './CustomerPayment';
import '../styles/CustomerManagement.css'
import { FaEdit, FaTrashAlt } from 'react-icons/fa';


const apiURL = import.meta.env.VITE_API_URL;


const tableStyles = {
  borderCollapse: 'collapse',
  width: '100%',
};

const tableHeaderStyles = {
  backgroundColor: '#f2f2f2',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '10px',
  textAlign: 'left',
};

const tableDataStyles = {
  padding: '8px',
  textAlign: 'left',
  border: '1px solid #ddd',
  color: 'aliceblue',
};

const iconStyles = {
  cursor: 'pointer',
  margin: '0 10px',
  color: '#007bff',
};


function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [newName, setNewName] = useState('');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const result = await axios.get(`${apiURL}/customers`);
        setCustomers(result.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handlePaymentSuccess = (updatedCustomer) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) => (customer._id === updatedCustomer._id ? updatedCustomer : customer))
    );
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = async () => {
    try {
      await axios.delete(`${apiURL}/customers/${customerToDelete._id}`);
      setCustomers((prevCustomers) => prevCustomers.filter(customer => customer._id !== customerToDelete._id));
      setShowPopup(false);
      setCustomerToDelete(null);

    } catch (err) {
      setError(err);
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setNewName(customer.name);
    setShowEditPopup(true); 
    setIsEditing(true); 

  };

  const handleSaveEdit = async () => {
    if (newName) {
      try {
        const updatedCustomer = await axios.put(`${apiURL}/customers/${selectedCustomer._id}/name`, {
          name: newName
        });
        setCustomers((prevCustomers) =>
          prevCustomers.map((customer) => (customer._id === selectedCustomer._id ? updatedCustomer.data : customer))
        );
        setShowEditPopup(false); 
        setSelectedCustomer(null);
        setIsEditing(false); 
      } catch (err) {
        setError(err);
      }
    }
  };

  const handleCancelEdit = () => {
    setShowEditPopup(false);
    setSelectedCustomer(null);
    setIsEditing(false);
  };


  const confirmDelete = (customer) => {
    setCustomerToDelete(customer);
    setShowPopup(true);
  };

  const cancelDelete = () => {
    setCustomerToDelete(null);
    setShowPopup(false);
  };

  if (loading) return <div className='loading'>Loading...</div>;
  if (error) return <div className='loading'>Error: {error.message}</div>;

  return (
    <div className='main'>
      <h1>Customer Management</h1>
      <table style={tableStyles}>
        <thead>
          <tr>
            <th style={tableHeaderStyles}>Customer_id</th>
            <th style={tableHeaderStyles}>Customer_name</th>
            <th style={tableHeaderStyles}>TOTAL PAYABLE</th>
            <th style={tableHeaderStyles}>TOTAL PAID</th>
            <th style={tableHeaderStyles}>REMAINING</th>
            <th style={tableHeaderStyles}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer._id}>
              <td style={tableDataStyles}>{customer._id.replace(/[^0-9]/g, '').slice(-3)}</td>
              <td style={tableDataStyles}>{customer.name}</td>
              <td style={tableDataStyles}>{customer.totalPayable}</td>
              <td style={tableDataStyles}>{customer.totalPaid}</td>
              <td style={tableDataStyles}>{customer.remaining}</td>
              <td style={tableDataStyles}>{customer.status}</td>
              <FaEdit style={iconStyles} onClick={() => handleEditCustomer(customer)} />
              <FaTrashAlt style={{ ...iconStyles, color: 'red' }} onClick={() => confirmDelete(customer)} />
              <button className='btn1' style={{ width: '40%' }} onClick={() => setSelectedCustomer(customer)}>Pay</button>
            </tr>
          ))}
        </tbody>
      </table>

      {!isEditing && selectedCustomer && (
        <CustomerPayment customerId={selectedCustomer._id} onPaymentSuccess={handlePaymentSuccess} />
      )}


      {showPopup && (
        <div className="popup">
          <h1 style={{ color: 'red', fontSize: '35px' }}>!!Alert</h1>
          <p style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Are you sure you want to delete this customer?</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={handleDeleteCustomer}>Yes</button>
            <button onClick={cancelDelete}>No</button>
          </div>
        </div>
      )}

      {showEditPopup && (
        <div className="popup">
          <div className="editPopup-content">
            <h3>Edit Customer Name</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
            />
            <div className="popup-buttons">
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerManagement;
