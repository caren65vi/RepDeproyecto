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
        <nav className='browser-home'>
            <div className='icono'>
                <img src={icono} alt='Logo principal de la pagina' />
            </div>
            <div className='titulo'>
                <h3>Reporta el chisme</h3>
                <p>Universidad de la Amazonia</p>
            </div>
            <div className='botones'>
                <Button onClick={handleLogin} startIcon={<LoginIcon fontSize="small" />}>
                    Iniciar sesión
                </Button>
                <Button className="btn--outline" onClick={handleRegister} startIcon={<PersonAddIcon fontSize="small" />}>
                    Registrarse
                </Button>
            </div>
        </nav>
    )
}

export default BrowserHome
