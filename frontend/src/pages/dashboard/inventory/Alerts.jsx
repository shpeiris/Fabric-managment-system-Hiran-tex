import React, { useState } from 'react'

const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      fabricId: 'FAB001',
      fabricName: 'Cotton Blue',
      type: 'low-stock',
      currentStock: 10,
      reorderLevel: 200,
      supplier: 'Textile Co.',
      priority: 'high',
      date: '2026-01-20',
      restockDate: '2026-02-15'
    },
    {
      id: 2,
      fabricId: 'FAB002',
      fabricName: 'Silk Red',
      type: 'low-stock',
      currentStock: 15,
      reorderLevel: 200,
      supplier: 'Luxury Fabrics Inc.',
      priority: 'high',
      date: '2026-01-19',
      restockDate: '2026-02-10'
    },
    {
      id: 3,
      fabricId: 'FAB003',
      fabricName: 'Polyester White',
      type: 'approaching-low',
      currentStock: 25,
      reorderLevel: 200,
      supplier: 'Woolens Ltd.',
      priority: 'medium',
      date: '2026-01-18',
      restockDate: '2026-02-20'
    },
    {
      id: 4,
      fabricId: 'FAB005',
      fabricName: 'Floral Linen',
      type: 'out-of-stock',
      currentStock: 0,
      reorderLevel: 150,
      supplier: 'Natural Fabrics Co.',
      priority: 'urgent',
      date: '2026-01-17',
      restockDate: '2026-02-05'
    }
  ])
  
  const [alertType, setAlertType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = alertType === 'all' || alert.type === alertType
    const matchesSearch = alert.fabricName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.fabricId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getAlertTypeText = (type) => {
    switch (type) {
      case 'low-stock': return 'Low Stock'
      case 'out-of-stock': return 'Out of Stock'
      case 'approaching-low': return 'Approaching Low'
      case 'overstock': return 'Overstock'
      default: return type
    }
  }

  const markAsResolved = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId))
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Stock Alerts</h2>
      <div className="bg-white rounded-xl shadow p-4">
        {/* Alert Controls */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-4">
            <input 
              className="border p-2 rounded w-80" 
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="border p-2 rounded"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
            >
              <option value="all">All Alerts</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="approaching-low">Approaching Low</option>
              <option value="overstock">Overstock</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setAlerts([])}
            >
              Mark All as Read
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowSettings(!showSettings)}
            >
              Alert Settings
            </button>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">Urgent Alerts</p>
            <p className="text-2xl font-bold text-red-700">
              {alerts.filter(a => a.priority === 'urgent').length}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-600">High Priority</p>
            <p className="text-2xl font-bold text-orange-700">
              {alerts.filter(a => a.priority === 'high').length}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600">Medium Priority</p>
            <p className="text-2xl font-bold text-yellow-700">
              {alerts.filter(a => a.priority === 'medium').length}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600">Total Alerts</p>
            <p className="text-2xl font-bold text-blue-700">{alerts.length}</p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`border rounded-lg p-4 ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg">{alert.fabricName} – {getAlertTypeText(alert.type)}</h4>
                    <span className="text-xs bg-white px-2 py-1 rounded">
                      {alert.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><span className="font-medium">Fabric ID:</span> {alert.fabricId}</p>
                    <p><span className="font-medium">Supplier:</span> {alert.supplier}</p>
                    <p><span className="font-medium">Current Stock:</span> {alert.currentStock}m</p>
                    <p><span className="font-medium">Reorder Level:</span> {alert.reorderLevel}m</p>
                    <p><span className="font-medium">Alert Date:</span> {alert.date}</p>
                    <p><span className="font-medium">Status:</span> {getAlertTypeText(alert.type)}</p>
                    {(alert.type === 'low-stock' || alert.type === 'out-of-stock') && alert.restockDate && (
                      <p><span className="font-medium">Expected Restock:</span> 
                        <span className="text-blue-600 font-semibold">{new Date(alert.restockDate).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                    Place Order
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                    Update Stock
                  </button>
                  <button 
                    className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                    onClick={() => markAsResolved(alert.id)}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500">No alerts to display.</p>
          </div>
        )}

        {/* Alert Settings Panel */}
        {showSettings && (
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-4">Alert Settings</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Threshold (meters)
                  </label>
                  <input 
                    type="number" 
                    defaultValue="50" 
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Critical Stock Level (meters)
                  </label>
                  <input 
                    type="number" 
                    defaultValue="10" 
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overstock Threshold (% above reorder level)
                  </label>
                  <input 
                    type="number" 
                    defaultValue="300" 
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input type="checkbox" id="email-notifications" defaultChecked className="mr-2" />
                  <label htmlFor="email-notifications" className="text-sm">Email Notifications</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="daily-summary" defaultChecked className="mr-2" />
                  <label htmlFor="daily-summary" className="text-sm">Daily Alert Summary</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="urgent-sms" className="mr-2" />
                  <label htmlFor="urgent-sms" className="text-sm">SMS for Urgent Alerts</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Check Frequency
                  </label>
                  <select className="w-full border p-2 rounded">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryAlerts
