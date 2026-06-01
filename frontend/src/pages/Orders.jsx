import React, { useState, useEffect } from 'react';
import { ordersApi, customersApi, productsApi } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState([{ product_id: '', quantity: 1 }]);

  // Modal / Order Details State
  const [detailedOrder, setDetailedOrder] = useState(null);

  // Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        ordersApi.list(),
        customersApi.list(),
        productsApi.list()
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load orders, customers, or products listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItemRow = () => {
    setSelectedItems([...selectedItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    const list = [...selectedItems];
    list.splice(index, 1);
    setSelectedItems(list);
  };

  const handleItemChange = (index, field, value) => {
    const list = [...selectedItems];
    if (field === 'product_id') {
      list[index].product_id = value;
    } else if (field === 'quantity') {
      list[index].quantity = parseInt(value, 10) || '';
    }
    setSelectedItems(list);
  };

  const validateForm = () => {
    const errors = {};
    if (!customerId) errors.customerId = 'Customer selection is required';

    const itemErrors = [];
    selectedItems.forEach((item, idx) => {
      const singleError = {};
      if (!item.product_id) {
        singleError.product_id = 'Product is required';
      } else {
        // Stock check
        const prod = products.find(p => p.id === parseInt(item.product_id, 10));
        if (prod && prod.quantity_in_stock < item.quantity) {
          singleError.quantity = `Max available: ${prod.quantity_in_stock}`;
        }
      }

      if (!item.quantity || item.quantity <= 0) {
        singleError.quantity = 'Quantity must be greater than zero';
      }

      if (Object.keys(singleError).length > 0) {
        itemErrors[idx] = singleError;
      }
    });

    if (itemErrors.length > 0) {
      errors.items = itemErrors;
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
      customer_id: parseInt(customerId, 10),
      items: selectedItems.map(item => ({
        product_id: parseInt(item.product_id, 10),
        quantity: item.quantity
      }))
    };

    try {
      const res = await ordersApi.create(payload);
      setSuccessMsg(`Order placed successfully! Total: $${res.data.total_amount.toFixed(2)}`);
      resetForm();
      fetchData(); // Refresh to update stocks and orders list
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to place order.';
      setErrorMsg(msg);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm(`Are you sure you want to delete order #${id}?`)) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      await ordersApi.delete(id);
      setSuccessMsg(`Order #${id} deleted successfully.`);
      fetchData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to delete order.';
      setErrorMsg(msg);
    }
  };

  const handleViewDetails = async (id) => {
    setErrorMsg('');
    try {
      const res = await ordersApi.get(id);
      setDetailedOrder(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load order details.');
    }
  };

  const resetForm = () => {
    setCustomerId('');
    setSelectedItems([{ product_id: '', quantity: 1 }]);
    setFormErrors({});
  };

  return (
    <div>
      <h1>Order Management</h1>

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
          <h2>Create Order</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="customerSelect">Customer</label>
              <select
                id="customerSelect"
                className={`form-select ${formErrors.customerId ? 'error' : ''}`}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
              {formErrors.customerId && <div className="form-error">{formErrors.customerId}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Order Items</label>
              
              <div className="order-items-builder">
                {selectedItems.map((item, index) => {
                  const itemError = formErrors.items?.[index] || {};
                  return (
                    <div key={index} className="order-builder-row">
                      <div>
                        <select
                          className={`form-select ${itemError.product_id ? 'error' : ''}`}
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.product_name} (${p.price.toFixed(2)} - Stock: {p.quantity_in_stock})
                            </option>
                          ))}
                        </select>
                        {itemError.product_id && <div className="form-error">{itemError.product_id}</div>}
                      </div>

                      <div>
                        <input
                          className={`form-input ${itemError.quantity ? 'error' : ''}`}
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                        {itemError.quantity && <div className="form-error">{itemError.quantity}</div>}
                      </div>

                      <div>
                        {selectedItems.length > 1 && (
                          <button 
                            type="button" 
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => handleRemoveItemRow(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleAddItemRow}
                  style={{ marginTop: '8px' }}
                >
                  + Add Item
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit">
              Place Order
            </button>
          </form>
        </div>

        {/* List Panel */}
        <div className="panel">
          <h2>Order History</h2>
          {loading && orders.length === 0 ? (
            <div>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="empty-placeholder">No orders placed yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Date Placed</th>
                    <th>Total Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong></td>
                      <td>{order.customer?.full_name}</td>
                      <td>{new Date(order.created_at).toLocaleString()}</td>
                      <td><strong>${order.total_amount.toFixed(2)}</strong></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewDetails(order.id)}
                          >
                            View Details
                          </button>
                          <button 
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => handleDeleteClick(order.id)}
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

      {/* Order Details Modal Overlay */}
      {detailedOrder && (
        <div className="modal-overlay" onClick={() => setDetailedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setDetailedOrder(null)}>&times;</button>
            <h2 style={{ marginBottom: '8px', borderBottom: 'none' }}>Order Details #{detailedOrder.id}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Placed on {new Date(detailedOrder.created_at).toLocaleString()}
            </div>

            <div className="customer-info-box">
              <h3 className="customer-info-title">Customer Info</h3>
              <p className="customer-info-row"><strong>Name:</strong> {detailedOrder.customer?.full_name}</p>
              <p className="customer-info-row"><strong>Email:</strong> {detailedOrder.customer?.email}</p>
              <p className="customer-info-row"><strong>Phone:</strong> {detailedOrder.customer?.phone_number}</p>
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Purchased Items</h3>
            <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
              <table className="data-table" style={{ border: '1px solid var(--border-color)' }}>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product?.product_name}</td>
                      <td><code>{item.product?.sku}</code></td>
                      <td>${item.product?.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td><strong>${(item.quantity * item.product?.price).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDetailedOrder(null)}>Close</button>
              <div style={{ fontSize: '1.2rem' }}>
                Total: <strong style={{ color: 'var(--color-primary)' }}>${detailedOrder.total_amount.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
