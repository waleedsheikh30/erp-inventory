import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddProduct.css';


const apiURL = import.meta.env.VITE_API_URL;


function AddProduct() {
  const [product, setProduct] = useState({ productID: '', name: '', price: 0, quantity: 0, description: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false); // State to handle loading


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Start loading when the form is submitted

    try {
      await axios.post(`${apiURL}/products`, product);
      setShowPopup('Product added successfully!')
      setProduct({ productID: '', name: '', price: 0, quantity: 0, description: '' });
      setLoading(false); // Stop loading when the popup is shown

    } catch (error) {
      alert('There was an error adding the product:', error);
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
    setProduct({
      productID: '', name: '', price: 0, quantity: 0, description: ''
    });
  };

  return (
    <div className="add-product-container">
      <h1>Add Product</h1>
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label htmlFor="id">ProductID:</label>
          <input type="text" id="productID" name="productID" value={product.productID} onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={product.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price:</label>
          <input type="number" id="price" name="price" value={product.price} onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <input type="number" id="quantity" name="quantity" value={product.quantity} onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input type="text" id="description" name="description"
            value={product.description} onChange={handleChange}
          />
        </div>

        <button type="submit" className="add-customer-btn" disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Add Product'}
        </button>

        {showPopup && (
          <div className="popup">
            <div className='popup-content'>
              <h1 style={{ color: 'green', fontSize: '35px' }}>✔ SUCCESS</h1>
              <p>Product Added Successfully. Do you want to add another product?</p>
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

export default AddProduct;
