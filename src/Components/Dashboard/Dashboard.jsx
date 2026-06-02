import './Dashboard.css'
import NavDash from '../../PagesUsers/NavDash/NavDash.jsx'
import QuickAction from '../../PagesUsers/QuickAction/QuickAction.jsx'
import Consejos from '../../PagesUsers/Consejos/Consejos.jsx'
import DashboardAdmin from '../../PagesAdmin/DashboardAdmin/DashboardAdmin.jsx'

const Dashboard = ({ role = 'usuario' }) => {
  if (role === 'admin') {
    return <DashboardAdmin />
  }

  return (
    <div className="dashboard">
      <NavDash />
      <div className="dashboardBody">
        <main className="dashboardMain">
          <QuickAction />
        </main>
        <aside className="dashboardSidebar">
          <Consejos />
        </aside>
      </div>
    </div>
  )
}

export default Dashboard
