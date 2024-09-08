import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Stock.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const apiURL = import.meta.env.VITE_API_URL;


function Stock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [editFormData, setEditFormData] = useState({
    productID: '',
    name: '',
    description: '',
    price: 0,
    quantity: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiURL}/products`);
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      productID: product.productID,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    });
    setShowEditPopup(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedProduct = await axios.put(`${apiURL}/products/${selectedProduct._id}`, editFormData);
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product._id === selectedProduct._id ? updatedProduct.data : product))
      );
      setShowEditPopup(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err);
    }
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeletePopup(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      await axios.delete(`${apiURL}/products/${selectedProduct._id}`);
      setProducts((prevProducts) => prevProducts.filter(product => product._id !== selectedProduct._id));
      setShowDeletePopup(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setSelectedProduct(null);
  };

  const handleCancelEdit = () => {
    setShowEditPopup(false);
    setSelectedProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  if (loading) return <div className='loading'>Loading...</div>;
  if (error) return <div className='loading'>Error: {error.message}</div>;

  if (!Array.isArray(products) || products.length === 0) {
    return <p className='loading'>No products found.</p>;
  }

  return (
    <div className="stock-container">
      <h1>Stock</h1>
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.productID}</td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price}</td>
              <td>{product.quantity}</td>
              <div style={{width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '15px', marginLeft: '5px', marginRight: '10px'}}>
                <FaEdit size={18} style={{ cursor: 'pointer', color: '#007bff'}} onClick={() => handleEditProduct(product)} />
                <FaTrashAlt size={18} style={{ cursor: 'pointer', color: 'red', }} onClick={() => handleDeleteProduct(product)} />
              </div>
            </tr>
          ))}
        </tbody>
      </table>

      {showEditPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3 style={{ textAlign: 'center' }}>Edit Product</h3>
            <form className='editForm'>
              <label>Product ID:</label>
              <input
                type="text"
                name="productID"
                value={editFormData.productID}
                onChange={handleChange}
                style={{ float: 'right' }}
              />
              <br />
              <label>Product Name:</label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleChange}
                style={{ float: 'right' }}
              />
              <br />
              <label>Description:</label>
              <input
                type="text"
                name="description"
                value={editFormData.description}
                onChange={handleChange}
                style={{ float: 'right' }}
              />
              <br />
              <label>Price:</label>
              <input
                type="number"
                name="price"
                value={editFormData.price}
                onChange={handleChange}
                style={{ float: 'right' }}
              />
              <br />
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={editFormData.quantity}
                onChange={handleChange}
                style={{ float: 'right' }}
              />
              <div className="popup-buttons">
                <button type="button" onClick={handleSaveEdit}>Save</button>
                <button type="button" onClick={handleCancelEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="popup">
          <div className="popup-content">
            <h1 style={{ color: 'red', fontSize: '35px' }}>!!Alert</h1>
            <h3>Are you sure you want to delete this product?</h3>
            <div className="popup-buttons">
              <button onClick={confirmDeleteProduct}>Yes</button>
              <button onClick={cancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stock;
