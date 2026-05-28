import React from 'react'
import './BrowserHome.css'
import icono from '../../assets/LogoPrincipal.png'
import Button from '../Button/Button'
import { useNavigate } from 'react-router-dom'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const BrowserHome = () => {
    const navigate = useNavigate()

    const handleLogin = () => {
        navigate('/login')
    }

    const handleRegister = () => {
        navigate('/register')
    }

    return (
        <nav className='browserHome'>
            <div className='browserHomeIcon'>
                <img src={icono} alt='Logo principal de la pagina' />
            </div>
            <div className='browserHomeTitle'>
                <h3>Reporta el chisme</h3>
                <p>Universidad de la Amazonia</p>
            </div>
            <div className='browserHomeButtons'>
                <Button onClick={handleLogin} startIcon={<LoginIcon fontSize="small" />}>
                    <span className="btnText">Iniciar sesión</span>
                </Button>
                <Button className="btnOutline" onClick={handleRegister} startIcon={<PersonAddIcon fontSize="small" />}>
                    <span className="btnText">Registrarse</span>
                </Button>
            </div>
        </nav>
    )
}

export default BrowserHome
