import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VendorPayment from './VendorPayment';
import '../styles/VendorManagement.css';
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

function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [newName, setNewName] = useState('');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMsgPopup, setShowMsgPopup] = useState(false);


  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const result = await axios.get(`${apiURL}/vendors`);
        setVendors(result.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handlePaymentSuccess = (updatedVendor) => {
    setVendors((prevVendors) =>
      prevVendors.map((vendor) => (vendor._id === updatedVendor._id ? updatedVendor : vendor))
    );
    setSelectedVendor(null);
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setNewName(vendor.name);
    setShowEditPopup(true); // Show the edit popup
    setIsEditing(true); // Set editing to true

  };

  const handleSaveEdit = async () => {
    if (newName) {
      try {
        const updatedVendor = await axios.put(`${apiURL}/vendors/${selectedVendor._id}/name`, {
          name: newName
        });
        setVendors((prevVendors) =>
          prevVendors.map((vendor) => (vendor._id === selectedVendor._id ? updatedVendor.data : vendor))
        );
        setShowEditPopup(false); // Hide the edit popup
        setSelectedVendor(null);
        setIsEditing(false); // Reset editing state
      } catch (err) {
        setError(err);
      }
    }
  };

  const handleCancelEdit = () => {
    setShowEditPopup(false);
    setSelectedVendor(null);
    setIsEditing(false); // Reset editing state
  };


  const handleDeleteVendor = async () => {
    try {
      await axios.delete(`${apiURL}/vendors/${vendorToDelete._id}`);
      setVendors((prevVendors) => prevVendors.filter(vendor => vendor._id !== vendorToDelete._id));
      setShowPopup(false);
      setVendorToDelete(null);

    } catch (err) {
      setError(err);
    }
  };

  const confirmDelete = (customer) => {
    setVendorToDelete(customer);
    setShowPopup(true);
  };

  const cancelDelete = () => {
    setVendorToDelete(null);
    setShowPopup(false);
  };

  if (loading) return <div className='loading'>Loading...</div>;
  if (error) return <div className='loading'>Error: {error.message}</div>;

  return (
    <div className='main {popupMessage ? "blurred" : ""}'>
      <h1>Vendor Management</h1>
      <table style={tableStyles}>
        <thead>
          <tr>
            <th style={tableHeaderStyles}>Vendor_ID</th>
            <th style={tableHeaderStyles}>Vendor_NAME</th>
            <th style={tableHeaderStyles}>TOTAL PAYABLE</th>
            <th style={tableHeaderStyles}>TOTAL PAID</th>
            <th style={tableHeaderStyles}>REMAINING</th>
            <th style={tableHeaderStyles}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor._id}>
              <td style={tableDataStyles}>{vendor._id.replace(/[^0-9]/g, '').slice(-3)}</td>
              <td style={tableDataStyles}>{vendor.name}</td>
              <td style={tableDataStyles}>{vendor.totalPayable}</td>
              <td style={tableDataStyles}>{vendor.totalPaid}</td>
              <td style={tableDataStyles}>{vendor.remaining}</td>
              <td style={tableDataStyles}>{vendor.status}</td>
              <td style={{ border: "none" }}>
                <FaEdit style={iconStyles} onClick={() => handleEditVendor(vendor)} />
                <FaTrashAlt style={{ ...iconStyles, color: 'red' }} onClick={() => confirmDelete(vendor)} />
                <button className='btn1' style={{ width: '40%' }} onClick={() => {
                  if (vendor.remaining === 0) {
                    setShowMsgPopup('Remaining amount is zero. No further payment can be made.');
                  } else {
                    setSelectedVendor(vendor);
                  }
                }}>Pay</button>
              </td>
            </tr>

          ))}
        </tbody>
      </table>

      {!isEditing && selectedVendor && (
        <VendorPayment vendorId={selectedVendor._id} onPaymentSuccess={handlePaymentSuccess} />
      )}

      {showPopup && (
        <div className="popup">
          <div className='popup-content'>
            <h1 style={{ color: 'red', fontSize: '35px' }}>!!Alert</h1>
            <p style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Are you sure you want to delete this vendor?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleDeleteVendor}>Yes</button>
              <button onClick={cancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}

      {showEditPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 style={{ color: "black" }}>Edit Vendor Name</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              style={{ marginTop: "20px", border: "1px solid" }}
            />
            <div className="popup-buttons">
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showMsgPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 style={{ textAlign: "center", color: "red", fontSize: "30px" }}>Payment Not Allowed!!!</h3>
            <p>{showMsgPopup}</p>
            <button onClick={() => setShowMsgPopup(null)} style={{ marginLeft: "0px" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorManagement;
