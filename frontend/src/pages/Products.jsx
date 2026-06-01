import React, { useState, useEffect } from 'react';
import { productsApi } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [productId, setProductId] = useState(null); // Null for add, number for edit
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  
  // Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productsApi.list();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load products list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!productName.trim()) errors.productName = 'Product name is required';
    if (!sku.trim()) errors.sku = 'SKU is required';
    
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      errors.price = 'Price must be a valid number';
    } else if (parsedPrice <= 0) {
      errors.price = 'Price must be greater than zero';
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity)) {
      errors.quantity = 'Quantity is required';
    } else if (parsedQuantity < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateForm()) return;

    const payload = {
      product_name: productName.trim(),
      sku: sku.trim(),
      price: parseFloat(price),
      quantity_in_stock: parseInt(quantity, 10)
    };

    try {
      if (productId) {
        // Edit flow
        await productsApi.update(productId, payload);
        setSuccessMsg(`Product '${payload.product_name}' updated successfully!`);
      } else {
        // Add flow
        await productsApi.create(payload);
        setSuccessMsg(`Product '${payload.product_name}' added successfully!`);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'An error occurred while saving the product.';
      setErrorMsg(msg);
    }
  };

  const handleEditClick = (product) => {
    setProductId(product.id);
    setProductName(product.product_name);
    setSku(product.sku);
    setPrice(product.price.toString());
    setQuantity(product.quantity_in_stock.toString());
    
    // Clear alerts/errors
    setErrorMsg('');
    setSuccessMsg('');
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      await productsApi.delete(id);
      setSuccessMsg(`Product "${name}" deleted successfully.`);
      if (productId === id) resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to delete product.';
      setErrorMsg(msg);
    }
  };

  const resetForm = () => {
    setProductId(null);
    setProductName('');
    setSku('');
    setPrice('');
    setQuantity('');
    setFormErrors({});
  };

  return (
    <div>
      <h1>Product Management</h1>

      {successMsg && (
        <div className="alert alert-success">
          <span>{successMsg}</span>
          <button className="alert-close" onClick={() => setSuccessMsg('')}>&times;</button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger">
          <span>{errorMsg}</span>
          <button className="alert-close" onClick={() => setErrorMsg('')}>&times;</button>
        </div>
      )}

      <div className="split-layout">
        {/* Form Panel */}
        <div className="panel">
          <h2>{productId ? 'Update Product' : 'Add New Product'}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="productName">Product Name</label>
              <input
                id="productName"
                className={`form-input ${formErrors.productName ? 'error' : ''}`}
                type="text"
                placeholder="e.g. Wireless Mouse"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              {formErrors.productName && <div className="form-error">{formErrors.productName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sku">SKU (Stock Keeping Unit)</label>
              <input
                id="sku"
                className={`form-input ${formErrors.sku ? 'error' : ''}`}
                type="text"
                placeholder="e.g. MOUSE-WRLS-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
              {formErrors.sku && <div className="form-error">{formErrors.sku}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="price">Price ($)</label>
              <input
                id="price"
                className={`form-input ${formErrors.price ? 'error' : ''}`}
                type="number"
                step="0.01"
                placeholder="e.g. 29.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              {formErrors.price && <div className="form-error">{formErrors.price}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="quantity">Quantity in Stock</label>
              <input
                id="quantity"
                className={`form-input ${formErrors.quantity ? 'error' : ''}`}
                type="number"
                step="1"
                placeholder="e.g. 150"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              {formErrors.quantity && <div className="form-error">{formErrors.quantity}</div>}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" type="submit">
                {productId ? 'Update Product' : 'Add Product'}
              </button>
              {productId && (
                <button className="btn btn-secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div className="panel">
          <h2>Product List</h2>
          {loading && products.length === 0 ? (
            <div>Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty-placeholder">No products found. Add a product to get started.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td><strong>{product.product_name}</strong></td>
                      <td><code>{product.sku}</code></td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${product.quantity_in_stock < 10 ? (product.quantity_in_stock === 0 ? 'badge-danger' : 'badge-warning') : 'badge-success'}`}>
                          {product.quantity_in_stock} units
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleEditClick(product)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger-outline btn-sm" 
                            onClick={() => handleDeleteClick(product.id, product.product_name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
