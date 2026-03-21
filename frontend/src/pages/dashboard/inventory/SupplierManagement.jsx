import React, { useState } from 'react'

const InventorySupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([
    {
      id: 'SUP001',
      name: 'Eastern Silk Gallery',
      contactPerson: 'Rajesh Kumar',
      phone: '077 700 8000',
      email: 'contact@easternsilk.lk',
      address: 'No. 123, Galle Road, Colombo 03',
      location: 'Colombo',
      category: 'Silk & Premium Fabrics',
      lastDelivery: '2026-01-20',
      pendingOrders: 2,
      totalOrders: 45,
      rating: 4.8,
      status: 'active',
      creditLimit: 500000,
      currentBalance: 125000,
      leadTime: '5-7 days'
    },
    {
      id: 'SUP002',
      name: 'Five Star Textiles',
      contactPerson: 'Sunil Perera',
      phone: '011 244 1810',
      email: 'info@fivestar.lk',
      address: 'No. 456, Kandy Road, Colombo 10',
      location: 'Colombo',
      category: 'Cotton & Blends',
      lastDelivery: '2026-01-19',
      pendingOrders: 1,
      totalOrders: 67,
      rating: 4.6,
      status: 'active',
      creditLimit: 750000,
      currentBalance: 200000,
      leadTime: '3-5 days'
    },
    {
      id: 'SUP003',
      name: 'Fabric Gallery',
      contactPerson: 'Amara Silva',
      phone: '011 254 1144',
      email: 'sales@fabricgallery.lk',
      address: 'No. 789, Liberty Plaza, Colombo 07',
      location: 'Colombo',
      category: 'Mixed Fabrics',
      lastDelivery: '2026-01-15',
      pendingOrders: 0,
      totalOrders: 32,
      rating: 4.2,
      status: 'active',
      creditLimit: 400000,
      currentBalance: 85000,
      leadTime: '7-10 days'
    },
    {
      id: 'SUP004',
      name: 'Seylan Fabric Arcade Malwana',
      contactPerson: 'Nimal Fernando',
      phone: '077 777 5666',
      email: 'malwana@seylanfabric.lk',
      address: 'Main Street, Malwana',
      location: 'Malwana',
      category: 'Polyester & Synthetic',
      lastDelivery: '2026-01-10',
      pendingOrders: 3,
      totalOrders: 28,
      rating: 4.5,
      status: 'active',
      creditLimit: 300000,
      currentBalance: 150000,
      leadTime: '4-6 days'
    },
    {
      id: 'SUP005',
      name: 'Natural Fabrics Co.',
      contactPerson: 'Priya Jayasinghe',
      phone: '077 888 9999',
      email: 'contact@naturalfabrics.lk',
      address: 'No. 321, Negombo Road, Wattala',
      location: 'Wattala',
      category: 'Linen & Natural Fibers',
      lastDelivery: '2025-12-20',
      pendingOrders: 0,
      totalOrders: 15,
      rating: 4.0,
      status: 'inactive',
      creditLimit: 250000,
      currentBalance: 0,
      leadTime: '10-14 days'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const activeSuppliers = suppliers.filter(s => s.status === 'active').length
  const totalPendingOrders = suppliers.reduce((sum, s) => sum + s.pendingOrders, 0)
  const thisMonthDeliveries = suppliers.filter(s => s.lastDelivery >= '2026-01-01').length

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Supplier Management</h2>
      <div className="bg-white rounded-xl shadow p-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600">Total Suppliers</p>
            <p className="text-2xl font-bold text-blue-700">{suppliers.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">Active Suppliers</p>
            <p className="text-2xl font-bold text-green-700">{activeSuppliers}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600">Pending Orders</p>
            <p className="text-2xl font-bold text-yellow-700">{totalPendingOrders}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600">This Month Deliveries</p>
            <p className="text-2xl font-bold text-purple-700">{thisMonthDeliveries}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-4">
            <input 
              className="border p-2 rounded w-80" 
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="border p-2 rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select 
              className="border p-2 rounded"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Silk & Premium Fabrics">Silk & Premium</option>
              <option value="Cotton & Blends">Cotton & Blends</option>
              <option value="Polyester & Synthetic">Polyester & Synthetic</option>
              <option value="Linen & Natural Fibers">Linen & Natural</option>
            </select>
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowAddModal(true)}
          >
            Add New Supplier
          </button>
        </div>

        {/* Suppliers List */}
        <div className="space-y-4">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-blue-600">{supplier.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(supplier.status)}`}>
                      {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {supplier.category}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Contact Person</p>
                      <p className="font-medium">{supplier.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{supplier.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{supplier.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Delivery</p>
                      <p className="font-medium">{supplier.lastDelivery}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pending Orders</p>
                      <p className="font-medium">{supplier.pendingOrders} orders</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Orders</p>
                      <p className="font-medium">{supplier.totalOrders} orders</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rating</p>
                      <p className={`font-medium ${getRatingColor(supplier.rating)}`}>
                        ★ {supplier.rating}/5.0
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lead Time</p>
                      <p className="font-medium">{supplier.leadTime}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                    onClick={() => {
                      setSelectedSupplier(supplier)
                      setShowDetailsModal(true)
                    }}
                  >
                    View Details
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                    Place Order
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No suppliers found matching your criteria.
          </div>
        )}

        {/* Add Supplier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-4/5 max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Add New Supplier</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Supplier Name *</label>
                    <input className="w-full border p-2 rounded" placeholder="Enter supplier name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Supplier ID</label>
                    <input className="w-full border p-2 rounded" placeholder="Auto-generated" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Person *</label>
                    <input className="w-full border p-2 rounded" placeholder="Contact person name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input className="w-full border p-2 rounded" placeholder="077 123 4567" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input className="w-full border p-2 rounded" type="email" placeholder="supplier@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location *</label>
                    <input className="w-full border p-2 rounded" placeholder="City" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input className="w-full border p-2 rounded" placeholder="Full address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select className="w-full border p-2 rounded" required>
                      <option value="">Select Category</option>
                      <option value="Silk & Premium Fabrics">Silk & Premium Fabrics</option>
                      <option value="Cotton & Blends">Cotton & Blends</option>
                      <option value="Polyester & Synthetic">Polyester & Synthetic</option>
                      <option value="Linen & Natural Fibers">Linen & Natural Fibers</option>
                      <option value="Mixed Fabrics">Mixed Fabrics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lead Time</label>
                    <input className="w-full border p-2 rounded" placeholder="e.g., 5-7 days" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Credit Limit (Rs.)</label>
                    <input className="w-full border p-2 rounded" type="number" placeholder="500000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="w-full border p-2 rounded">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Add Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Supplier Details Modal */}
        {showDetailsModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-4/5 max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{selectedSupplier.name}</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowDetailsModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Supplier ID</p>
                      <p className="font-medium">{selectedSupplier.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium">{selectedSupplier.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedSupplier.status)}`}>
                        {selectedSupplier.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500">Rating</p>
                      <p className={`font-medium ${getRatingColor(selectedSupplier.rating)}`}>
                        ★ {selectedSupplier.rating}/5.0
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Contact Person</p>
                      <p className="font-medium">{selectedSupplier.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{selectedSupplier.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{selectedSupplier.email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Address</p>
                      <p className="font-medium">{selectedSupplier.address}</p>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">Business Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Orders</p>
                      <p className="font-medium">{selectedSupplier.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pending Orders</p>
                      <p className="font-medium">{selectedSupplier.pendingOrders}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Delivery</p>
                      <p className="font-medium">{selectedSupplier.lastDelivery}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lead Time</p>
                      <p className="font-medium">{selectedSupplier.leadTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Credit Limit</p>
                      <p className="font-medium">Rs. {selectedSupplier.creditLimit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Current Balance</p>
                      <p className="font-medium">Rs. {selectedSupplier.currentBalance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded">
                    Place Order
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded">
                    Edit Supplier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventorySupplierManagement
