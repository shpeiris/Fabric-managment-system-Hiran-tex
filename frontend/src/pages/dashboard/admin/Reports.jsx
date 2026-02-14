import React, { useState } from 'react'

const Reports = () => {
  const [reportType, setReportType] = useState('sales')

  return (
    <div className="reports">
      <h1>Reports & Analytics</h1>
      <div className="report-controls">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="sales">Sales Report</option>
          <option value="inventory">Inventory Report</option>
          <option value="customer">Customer Report</option>
          <option value="supplier">Supplier Report</option>
          <option value="financial">Financial Report</option>
        </select>
        <input type="date" placeholder="Start Date" />
        <input type="date" placeholder="End Date" />
        <button>Generate Report</button>
      </div>
      <div className="report-content">
        <div className="chart-container">
          <p>Chart will be displayed here</p>
        </div>
        <div className="report-data">
          <p>Report data will be displayed here</p>
        </div>
      </div>
    </div>
  )
}

export default Reports