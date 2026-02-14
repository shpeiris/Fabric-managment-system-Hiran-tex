import React from 'react'
import { Outlet } from 'react-router-dom'
import InventorySidebar from '../components/Sidebar'

const InventoryLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      <InventorySidebar />
      <main style={{ flex: 1, background: '#ffffff', padding: '30px', overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default InventoryLayout
