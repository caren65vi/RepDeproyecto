import './Consejos.css'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'

const consejos = [
  {
    icon: <CameraAltOutlinedIcon fontSize="small" />,
    text: 'Toma una foto clara del incidente para que sea más fácil identificarlo.',
    color: 'teal',
  },
  {
    icon: <LocationOnOutlinedIcon fontSize="small" />,
    text: 'Activa el GPS para que podamos ubicar el problema exactamente.',
    color: 'green',
  },
  {
    icon: <DescriptionOutlinedIcon fontSize="small" />,
    text: 'Describe el incidente con el mayor detalle posible.',
    color: 'blue',
  },
  {
    icon: <NotificationsNoneIcon fontSize="small" />,
    text: 'Recibirás notificaciones cuando el estado de tu reporte cambie.',
    color: 'orange',
  },
]

const Consejos = () => {
  return (
    <aside className="consejos">
      <div className="consejos__header">
        <span className="consejos__titulo">Consejos</span>
      </div>
      <ul className="consejos__lista">
        {consejos.map(({ icon, text, color }, i) => (
          <li key={i} className="consejos__item">
            <span className={`consejos__icon consejos__icon--${color}`}>{icon}</span>
            <p className="consejos__text">{text}</p>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Consejos
