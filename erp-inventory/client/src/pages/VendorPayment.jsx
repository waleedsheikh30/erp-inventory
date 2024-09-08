import React, { useState } from 'react';
import axios from 'axios';
import '../styles/VendorPayment.css'

const apiURL = import.meta.env.VITE_API_URL;


function VendorPayment({ vendorId, onPaymentSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${apiURL}/vendors/${vendorId}/pay`, { amount: parseFloat(amount) });
      setLoading(false);
      onPaymentSuccess(response.data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className='main'>
      <h2>Make Payment</h2>
      <input
        className='input'
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button style={{ width: '8%', marginLeft: 5, border: 'none', borderRadius: 8, padding: 10, backgroundColor: 'aliceblue' }} onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default VendorPayment;
