import React, { useState } from 'react'

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Hiran Textile',
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    lowStockThreshold: 10
  })

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="settings">
      <h1>System Settings</h1>
      <div className="settings-form">
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="form-group">
            <label>Site Name</label>
            <input 
              type="text" 
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select 
              value={settings.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>
            </select>
          </div>
        </div>
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
              />
              Email Notifications
            </label>
          </div>
        </div>
        <button className="save-settings">Save Settings</button>
      </div>
    </div>
  )
}

export default Settings