import React, { useState } from 'react'

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <div className="sales-invoices">
      <h1>Invoice Management</h1>
      <div className="invoice-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <h3>Total Invoices</h3>
            <p>--</p>
          </div>
          <div className="overview-card">
            <h3>Paid Invoices</h3>
            <p>--</p>
          </div>
          <div className="overview-card">
            <h3>Pending Payments</h3>
            <p>$--</p>
          </div>
          <div className="overview-card">
            <h3>Overdue</h3>
            <p>--</p>
          </div>
        </div>
      </div>
      <div className="invoice-controls">
        <button>Create Invoice</button>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Invoices</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <input type="text" placeholder="Search invoices..." />
        <button>Export</button>
      </div>
      <div className="invoice-list">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan="7">No invoices found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalesInvoices