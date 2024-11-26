import React, { useState } from 'react';
import axios from 'axios';
import '../styles/CustomerPayment.css';

const apiURL = import.meta.env.VITE_API_URL;

function CustomerPayment({ customerId, onPaymentSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${apiURL}/customers/${customerId}/pay`, {
        amount: parseFloat(amount), // Ensure amount is sent as a number
      });
      setLoading(false);
      onPaymentSuccess(response.data);
    } catch (err) {
      console.error('Payment error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <h2>Make Payment</h2>
      <input
        className="input"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button
        style={{
          width: '8%',
          marginLeft: 5,
          border: 'none',
          borderRadius: 8,
          padding: 10,
          backgroundColor: 'aliceblue',
        }}
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default CustomerPayment;
