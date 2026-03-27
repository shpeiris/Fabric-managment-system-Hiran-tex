import React, { useState } from 'react'

const InventoryTransactions = () => {
  const [transactions, setTransactions] = useState([
    {
      id: 'TXN001',
      date: '2026-01-21',
      type: 'stock-in',
      fabricId: 'FAB001',
      fabricName: 'Cotton Blue',
      quantity: 200,
      unitPrice: 250,
      totalValue: 50000,
      reference: 'ARR001',
      supplier: 'Eastern Silk Gallery',
      status: 'completed',
      notes: 'Regular stock replenishment'
    },
    {
      id: 'TXN002',
      date: '2026-01-21',
      type: 'stock-out',
      fabricId: 'FAB002',
      fabricName: 'Silk Satin',
      quantity: 50,
      unitPrice: 1200,
      totalValue: 60000,
      reference: 'ORD001',
      customer: 'Fashion House Ltd',
      status: 'completed',
      notes: 'Customer order fulfillment'
    },
    {
      id: 'TXN003',
      date: '2026-01-20',
      type: 'adjustment',
      fabricId: 'FAB003',
      fabricName: 'Polyester White',
      quantity: -5,
      unitPrice: 650,
      totalValue: -3250,
      reference: 'ADJ001',
      reason: 'Damage during handling',
      status: 'completed',
      notes: 'Fabric damaged during warehouse handling'
    },
    {
      id: 'TXN004',
      date: '2026-01-20',
      type: 'transfer',
      fabricId: 'FAB004',
      fabricName: 'Floral Print',
      quantity: 25,
      unitPrice: 950,
      totalValue: 23750,
      reference: 'TRF001',
      fromLocation: 'Warehouse A',
      toLocation: 'Warehouse B',
      status: 'pending',
      notes: 'Transfer between warehouses'
    }
  ])
  
  const [transactionType, setTransactionType] = useState('all')
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    type: 'stock-in',
    fabricId: '',
    fabricName: '',
    quantity: '',
    unitPrice: '',
    reference: '',
    notes: ''
  })

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = transactionType === 'all' || transaction.type === transactionType
    const matchesSearch = transaction.fabricName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.fabricId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = (!dateFilter.from || transaction.date >= dateFilter.from) &&
                       (!dateFilter.to || transaction.date <= dateFilter.to)
    return matchesType && matchesSearch && matchesDate
  })

  const getTypeColor = (type) => {
    switch (type) {
      case 'stock-in': return 'bg-green-100 text-green-700'
      case 'stock-out': return 'bg-red-100 text-red-700'
      case 'adjustment': return 'bg-yellow-100 text-yellow-700'
      case 'transfer': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'stock-in': return '↑'
      case 'stock-out': return '↓'
      case 'adjustment': return '~'
      case 'transfer': return '⇄'
      default: return '•'
    }
  }

  const todaysTransactions = transactions.filter(t => t.date === '2026-01-21')
  const todaysStockIn = todaysTransactions.filter(t => t.type === 'stock-in').reduce((sum, t) => sum + t.quantity, 0)
  const todaysStockOut = todaysTransactions.filter(t => t.type === 'stock-out').reduce((sum, t) => sum + t.quantity, 0)

  const handleAddTransaction = (e) => {
    e.preventDefault()
    const transaction = {
      id: `TXN${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...newTransaction,
      totalValue: newTransaction.quantity * newTransaction.unitPrice,
      status: 'completed'
    }
    setTransactions([transaction, ...transactions])
    setShowAddModal(false)
    setNewTransaction({
      type: 'stock-in',
      fabricId: '',
      fabricName: '',
      quantity: '',
      unitPrice: '',
      reference: '',
      notes: ''
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Inventory Transactions</h2>
      <div className="bg-white rounded-xl shadow p-4">
        {/* Controls */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-4">
            <select 
              className="border p-2 rounded"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="stock-in">Stock In</option>
              <option value="stock-out">Stock Out</option>
              <option value="adjustment">Adjustments</option>
              <option value="transfer">Transfers</option>
            </select>
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
            <input 
              type="text" 
              placeholder="Search by fabric or reference..." 
              className="border p-2 rounded w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Export
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setShowAddModal(true)}
            >
              Add Transaction
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600">Today's Transactions</p>
            <p className="text-2xl font-bold text-blue-700">{todaysTransactions.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">Stock In (Today)</p>
            <p className="text-2xl font-bold text-green-700">{todaysStockIn}m</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">Stock Out (Today)</p>
            <p className="text-2xl font-bold text-red-700">{todaysStockOut}m</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600">Total Value (Today)</p>
            <p className="text-2xl font-bold text-purple-700">
              Rs. {todaysTransactions.reduce((sum, t) => sum + Math.abs(t.totalValue), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Transaction ID</th>
                <th className="p-3 text-center">Type</th>
                <th className="p-3 text-left">Fabric</th>
                <th className="p-3 text-center">Quantity</th>
                <th className="p-3 text-center">Value</th>
                <th className="p-3 text-left">Reference</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{transaction.date}</td>
                  <td className="p-3 text-blue-600 font-medium">{transaction.id}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(transaction.type)}`}>
                      {getTypeIcon(transaction.type)} {transaction.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{transaction.fabricName}</p>
                      <p className="text-gray-500 text-xs">{transaction.fabricId}</p>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={transaction.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}m
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={transaction.totalValue < 0 ? 'text-red-600' : 'text-green-600'}>
                      Rs. {transaction.totalValue.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{transaction.reference}</p>
                      {transaction.supplier && (
                        <p className="text-gray-500 text-xs">Supplier: {transaction.supplier}</p>
                      )}
                      {transaction.customer && (
                        <p className="text-gray-500 text-xs">Customer: {transaction.customer}</p>
                      )}
                      {transaction.fromLocation && (
                        <p className="text-gray-500 text-xs">{transaction.fromLocation} → {transaction.toLocation}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button className="text-blue-600 text-xs hover:underline">View</button>
                      <button className="text-blue-600 text-xs hover:underline">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No transactions found matching your criteria.
          </div>
        )}

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Transaction Type</label>
                  <select 
                    className="w-full border p-2 rounded"
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                  >
                    <option value="stock-in">Stock In</option>
                    <option value="stock-out">Stock Out</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fabric ID</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    placeholder="FAB001"
                    value={newTransaction.fabricId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, fabricId: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fabric Name</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    placeholder="Cotton Blue"
                    value={newTransaction.fabricName}
                    onChange={(e) => setNewTransaction({ ...newTransaction, fabricName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity (meters)</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded" 
                    placeholder="100"
                    value={newTransaction.quantity}
                    onChange={(e) => setNewTransaction({ ...newTransaction, quantity: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price (Rs.)</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded" 
                    placeholder="250"
                    value={newTransaction.unitPrice}
                    onChange={(e) => setNewTransaction({ ...newTransaction, unitPrice: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reference</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    placeholder="ORD001 or ARR001"
                    value={newTransaction.reference}
                    onChange={(e) => setNewTransaction({ ...newTransaction, reference: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea 
                    className="w-full border p-2 rounded" 
                    placeholder="Optional notes..."
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                    rows="2"
                  />
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
                    Add Transaction
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

export default InventoryTransactions
              <th>Reference</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan="8">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryTransactions
