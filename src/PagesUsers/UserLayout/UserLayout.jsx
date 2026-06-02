import { Outlet } from 'react-router-dom'
import NavUser from '../Navuser/NavUser'
import IncidentNotifier from '../../Components/IncidentNotifier/IncidentNotifier'
import './UserLayout.css'

const UserLayout = () => {
  return (
    <div className="userLayout">
      <NavUser />
      <main className="userLayoutContent">
        <Outlet />
      </main>
      <IncidentNotifier />
    </div>
  )
}

export default UserLayout
