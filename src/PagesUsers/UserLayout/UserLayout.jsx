import React from 'react'
import { Outlet } from 'react-router-dom'
import NavUser from '../Navuser/NavUser'
import './UserLayout.css'

const UserLayout = () => {
  return (
    <div className="user-layout">
      <NavUser />
      <main className="user-layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout
