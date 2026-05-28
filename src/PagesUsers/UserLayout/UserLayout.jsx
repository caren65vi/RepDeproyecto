import React from 'react'
import { Outlet } from 'react-router-dom'
import NavUser from '../Navuser/NavUser'
import './UserLayout.css'

const UserLayout = () => {
  return (
    <div className="userLayout">
      <NavUser />
      <main className="userLayoutContent">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout
