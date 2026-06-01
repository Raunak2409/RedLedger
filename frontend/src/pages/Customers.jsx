import React, { useState, useEffect } from 'react';
import { customersApi } from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customersApi.list();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load customers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      errors.email = 'Email is required';
    } else {
      // Basic email regex matching
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (phoneNumber.trim().length < 5) {
      errors.phoneNumber = 'Phone number must be at least 5 digits';
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
      full_name: fullName.trim(),
      email: email.trim(),
      phone_number: phoneNumber.trim(),
    };

    try {
      await customersApi.create(payload);
      setSuccessMsg(`Customer '${payload.full_name}' added successfully!`);
      resetForm();
      fetchCustomers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'An error occurred while saving the customer.';
      setErrorMsg(msg);
    }
  };

  const handleDeleteClick = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      await customersApi.delete(id);
      setSuccessMsg(`Customer "${name}" deleted successfully.`);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to delete customer.';
      setErrorMsg(msg);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setFormErrors({});
  };

  return (
    <div>
      <h1>Customer Management</h1>

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
          <h2>Add New Customer</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                className={`form-input ${formErrors.fullName ? 'error' : ''}`}
                type="text"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {formErrors.fullName && <div className="form-error">{formErrors.fullName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                className={`form-input ${formErrors.phoneNumber ? 'error' : ''}`}
                type="text"
                placeholder="e.g. +1 555-0199"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {formErrors.phoneNumber && <div className="form-error">{formErrors.phoneNumber}</div>}
            </div>

            <button className="btn btn-primary" type="submit">
              Add Customer
            </button>
          </form>
        </div>

        {/* List Panel */}
        <div className="panel">
          <h2>Customer List</h2>
          {loading && customers.length === 0 ? (
            <div>Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="empty-placeholder">No customers found. Add a customer to get started.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td><strong>{customer.full_name}</strong></td>
                      <td><code>{customer.email}</code></td>
                      <td>{customer.phone_number}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-danger-outline btn-sm" 
                          onClick={() => handleDeleteClick(customer.id, customer.full_name)}
                        >
                          Delete
                        </button>
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
