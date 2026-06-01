import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getSummary();
      setSummary(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard summary. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="empty-placeholder">Loading dashboard summary...</div>;
  }

  return (
    <div>
      <h1>Dashboard Summary</h1>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {summary && (
        <>
          <div className="dashboard-grid">
            <div className="summary-card">
              <div className="summary-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div className="summary-details">
                <h3>Total Products</h3>
                <div className="summary-value">{summary.total_products}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div className="summary-details">
                <h3>Total Customers</h3>
                <div className="summary-value">{summary.total_customers}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </div>
              <div className="summary-details">
                <h3>Total Orders</h3>
                <div className="summary-value">{summary.total_orders}</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Low Stock Products (&lt; 10 units)</h2>
              <span className="badge badge-warning">{summary.low_stock_products.length} Items</span>
            </div>

            {summary.low_stock_products.length === 0 ? (
              <div className="empty-placeholder">
                ✓ All products are sufficiently stocked (10+ units in stock).
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.low_stock_products.map((product) => (
                      <tr key={product.id}>
                        <td><strong>{product.product_name}</strong></td>
                        <td><code>{product.sku}</code></td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>{product.quantity_in_stock}</td>
                        <td>
                          {product.quantity_in_stock === 0 ? (
                            <span className="badge badge-danger">Out of Stock</span>
                          ) : (
                            <span className="badge badge-warning">Low Stock</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
