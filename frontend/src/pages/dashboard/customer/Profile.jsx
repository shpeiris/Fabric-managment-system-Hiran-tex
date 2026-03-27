import React, { useState } from 'react'

const Profile = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  })

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="profile">
      <h1>My Profile</h1>
      <div className="profile-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input 
                type="text" 
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input 
                type="text" 
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={profileData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input 
              type="tel" 
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
        </div>
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-group">
            <label>Address</label>
            <textarea 
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input 
                type="text" 
                value={profileData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input 
                type="text" 
                value={profileData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </div>
          </div>
        </div>
        <button className="save-profile">Save Changes</button>
      </div>
    </div>
  )
}

export default Profile
