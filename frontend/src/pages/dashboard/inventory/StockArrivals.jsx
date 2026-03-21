import React, { useState, useEffect } from 'react'
import { apiCall } from '../../../utils/auth.js'

const StockArrivals = () => {
  const [arrivals, setArrivals] = useState([])
  const [fabrics, setFabrics] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    fabric_id: '',
    supplier_id: '',
    quantity: '',
    supply_unit_price: '',
    arrival_date: new Date().toISOString().split('T')[0]
  })
  
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' })
  const [supplierFilter, setSupplierFilter] = useState('all')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [arrivalsRes, fabricsRes, suppliersRes] = await Promise.all([
        apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/stock-arrivals`),
        apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics`),
        apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/suppliers`)
      ])

      const [arrivalsData, fabricsData, suppliersData] = await Promise.all([
        arrivalsRes.json(),
        fabricsRes.json(),
        suppliersRes.json()
      ])

      if (arrivalsRes.ok) setArrivals(arrivalsData.arrivals || [])
      if (fabricsRes.ok) setFabrics(fabricsData.fabrics || [])
      if (suppliersRes.ok) setSuppliers(suppliersData.suppliers || [])

    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalValue = formData.quantity && formData.supply_unit_price ? 
    parseFloat(formData.quantity) * parseFloat(formData.supply_unit_price) : 0

  const filteredArrivals = arrivals.filter(arrival => {
    const matchesSupplier = supplierFilter === 'all' || (arrival.supplier_name && arrival.supplier_name.includes(supplierFilter))
    const matchesDate = (!dateFilter.from || arrival.arrival_date >= dateFilter.from) &&
                       (!dateFilter.to || arrival.arrival_date <= dateFilter.to)
    return matchesSupplier && matchesDate
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fabric_id || !formData.supplier_id || !formData.quantity || !formData.supply_unit_price) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/stock-arrivals`, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          supply_unit_price: parseFloat(formData.supply_unit_price),
          total_value: totalValue
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert("Stock arrival recorded successfully!")
        setShowAddForm(false)
        setFormData({
          fabric_id: '',
          supplier_id: '',
          quantity: '',
          supply_unit_price: '',
          arrival_date: new Date().toISOString().split('T')[0]
        })
        fetchInitialData() // Refresh list
      } else {
        alert(data.error || "Failed to record arrival")
      }
    } catch (err) {
      console.error('Error recording arrival:', err)
      alert("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading stock arrivals...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Stock Arrivals</h2>
      <div className="bg-white rounded-xl shadow p-4">
        {/* Controls */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-4">
            <input 
              type="date" 
              placeholder="From Date" 
              className="border p-2 rounded"
              value={dateFilter.from}
              onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
            />
            <input 
              type="date" 
              placeholder="To Date" 
              className="border p-2 rounded"
              value={dateFilter.to}
              onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
            />
            <select 
              className="border p-2 rounded"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.supplier_id} value={supplier.name}>{supplier.name}</option>
              ))}
            </select>
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowAddForm(true)}
          >
            Record New Arrival
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600">Total Arrivals</p>
            <p className="text-2xl font-bold text-blue-700">{arrivals.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-700">
              {arrivals.filter(a => a.status === 'completed').length}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600">Recent (7 days)</p>
            <p className="text-2xl font-bold text-yellow-700">
              {arrivals.filter(a => {
                const arrivalDate = new Date(a.arrival_date)
                const today = new Date()
                return (today - arrivalDate) / (1000 * 60 * 60 * 24) <= 7
              }).length}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600">Total Value</p>
            <p className="text-2xl font-bold text-purple-700">
              Rs. {arrivals.reduce((sum, a) => sum + parseFloat(a.total_value || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Arrivals List */}
        <div className="space-y-4">
          {filteredArrivals.map((arrival) => (
            <div key={arrival.arrival_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600">#ARV-{arrival.arrival_id.toString().padStart(3, '0')}</h3>
                  <p className="text-gray-600">{arrival.supplier_name}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded text-sm bg-green-100 text-green-700">
                    Completed
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Arrival Date</p>
                  <p className="font-medium">{new Date(arrival.arrival_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fabric</p>
                  <p className="font-medium">{arrival.fabric_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-medium">{arrival.quantity} meters</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Value</p>
                  <p className="font-medium">Rs. {Number(arrival.total_value || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Item Details */}
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Fabric Name</th>
                      <th className="p-2 text-left">Material Type</th>
                      <th className="p-2 text-center">Quantity</th>
                      <th className="p-2 text-center">Unit Price</th>
                      <th className="p-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2 text-blue-600">{arrival.fabric_name}</td>
                      <td className="p-2">{arrival.material_type}</td>
                      <td className="p-2 text-center">{arrival.quantity}m</td>
                      <td className="p-2 text-center">Rs. {Number(arrival.supply_unit_price || 0).toFixed(2)}</td>
                      <td className="p-2 text-center">Rs. {Number(arrival.total_value || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button className="text-blue-600 hover:underline">View Details</button>
                <button className="text-green-600 hover:underline">Update Stock</button>
              </div>
            </div>
          ))}
        </div>

        {filteredArrivals.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No stock arrivals found matching your criteria.
          </div>
        )}

        {/* Add Arrival Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-4/5 max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Record Stock Arrival</h3>
              <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fabric</label>
                    <select 
                      className="w-full border p-2 rounded"
                      value={formData.fabric_id}
                      onChange={(e) => setFormData({ ...formData, fabric_id: e.target.value })}
                      required
                    >
                      <option value="">Select Fabric</option>
                      {fabrics.map(fabric => (
                        <option key={fabric.fabric_id} value={fabric.fabric_id}>
                          {fabric.name} ({fabric.material_type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Supplier</label>
                    <select 
                      className="w-full border p-2 rounded"
                      value={formData.supplier_id}
                      onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity (meters)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full border p-2 rounded"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit Price (Rs.)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full border p-2 rounded"
                      value={formData.supply_unit_price}
                      onChange={(e) => setFormData({ ...formData, supply_unit_price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Arrival Date</label>
                    <input 
                      type="date" 
                      className="w-full border p-2 rounded"
                      value={formData.arrival_date}
                      onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                      required
                    />
                  </div>
                  {totalValue > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <label className="block text-sm font-medium mb-1">Total Value</label>
                      <div className="text-xl font-bold text-green-600">
                        Rs. {totalValue.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className={`px-4 py-2 rounded text-white ${submitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {submitting ? 'Recording...' : 'Record Arrival'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockArrivals
