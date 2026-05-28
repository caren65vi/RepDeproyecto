import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { onAuthChange } from '../../FireBase/auth'
import { db } from '../../FireBase/config'
import { doc, getDoc } from 'firebase/firestore'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import BarChartIcon from '@mui/icons-material/BarChart'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import logo from '../../assets/LogoPrincipal.png'
import './NavUser.css'

const PRINCIPAL = [
  { to: '/dashboard',           label: 'Dashboard',        icon: <DashboardIcon />,           end: true },
  { to: '/dashboard/reportar',  label: 'Reportar',         icon: <AddCircleOutlineIcon /> },
]

const MIS_REPORTES = [
  { to: '/dashboard/mis-incidentes',  label: 'Mis incidentes',  icon: <FormatListBulletedIcon /> },
  { to: '/dashboard/estadisticas',    label: 'Estadísticas',    icon: <BarChartIcon /> },
  { to: '/dashboard/notificaciones',  label: 'Notificaciones',  icon: <NotificationsNoneIcon /> },
]

const NavUser = () => {
  const [user, setUser] = useState(null)
  const [userName, setUserName] = useState('Usuario')

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)

      if (!firebaseUser) {
        setUserName('Usuario')
        return
      }

      try {
        const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
        const nombre = snap.exists() ? snap.data()?.nombre : null
        setUserName(typeof nombre === 'string' && nombre.trim() ? nombre.trim() : 'Usuario')
      } catch {
        setUserName('Usuario')
      }
    })

    return () => unsub()
  }, [])

  return (
    <nav className="navUser">
      <div className="navUserLogo">
        <img src={logo} alt="Logo" className="navUserLogoImg" />
      </div>

      <div className="navUserBody">
        <NavSection title="PRINCIPAL" items={PRINCIPAL} />
        <NavSection title="MIS REPORTES" items={MIS_REPORTES} />
      </div>

      <div className="navUserUser">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="navUserAvatar" />
        ) : (
          <AccountCircleIcon className="navUserAvatarIcon" />
        )}
        <div className="navUserUserInfo">
          <span className="navUserUserName">
            {userName}
          </span>
          {user && (
            <span className="navUserUserEmail">{user.email}</span>
          )}
        </div>
      </div>
    </nav>
  )
}

const NavSection = ({ title, items }) => (
  <div className="navUserSection">
    <span className="navUserSectionTitle">{title}</span>
    <ul className="navUserList">
      {items.map(({ to, label, icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
              `navUserLink${isActive ? ' navUserLinkActive' : ''}`
            }
          >
            <span className="navUserIcon">{icon}</span>
            <span className="navUserLabel">{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </div>
)

export default NavUser
