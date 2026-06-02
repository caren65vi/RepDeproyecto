import { useNavigate } from 'react-router-dom'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import icono from '../../assets/LogoPrincipal.png'
import Button from '../Button/Button.jsx'
import './NotFound.css'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="notFoundPage">
      <div className="notFoundCard">
        <div className="notFoundBrand">
          <img src={icono} alt="Logo ResuelveUA" />
          <span>ResuelveUA</span>
        </div>

        <ErrorOutlineIcon className="notFoundIcon" />

        <h1 className="notFoundCode">404</h1>
        <h2 className="notFoundTitle">Página no encontrada</h2>
        <p className="notFoundDesc">
          La página que buscas no existe o fue movida.
        </p>

        <Button
          className="notFoundBtn"
          startIcon={<HomeOutlinedIcon />}
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

export default NotFound
