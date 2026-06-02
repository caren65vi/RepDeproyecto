import { useNavigate } from 'react-router-dom'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import icono from '../../assets/LogoPrincipal.png'
import Button from '../Button/Button.jsx'
import './BrowserHome.css'

const BrowserHome = () => {
  const navigate = useNavigate()

  return (
    <nav className="browserHome">
      <div className="browserHomeBrand">
        <div className="browserHomeIcon">
          <img src={icono} alt="Logo principal de la pagina" />
        </div>
        <div className="browserHomeTitle">
          <h3>ResuelveUA</h3>
          <small>Universidad de la Amazonia</small>
        </div>
      </div>

      <div className="browserHomeQuicklinks">
        <a href="#inicio">Inicio</a>
        <a href="#funcionalidades">Funcionalidades</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#cta">Unete</a>
      </div>

      <div className="browserHomeButtons">
        <Button onClick={() => navigate('/login')} startIcon={<LoginIcon fontSize="small" />}>
          <span className="btnText">Iniciar sesion</span>
        </Button>
        <Button className="btnOutline" onClick={() => navigate('/register')} startIcon={<PersonAddIcon fontSize="small" />}>
          <span className="btnText">Registrarse</span>
        </Button>
      </div>
    </nav>
  )
}

export default BrowserHome
