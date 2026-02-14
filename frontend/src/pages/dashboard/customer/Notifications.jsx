import React, { useState } from 'react'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')

  return (
    <div className="notifications">
      <h1>Notifications</h1>
      <div className="notifications-filter">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Notifications</option>
          <option value="orders">Order Updates</option>
          <option value="promotions">Promotions</option>
          <option value="system">System Alerts</option>
        </select>
        <button>Mark All as Read</button>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications to display.</p>
          </div>
        ) : (
          <div className="notification-items">
            {/* Notification items will be rendered here */}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications