import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import Button from '../../Components/Button/Button'
import Dashboard from '../Dashboard/Dashboard'
import { auth } from '../../FireBase/config'
import { createIncidence } from '../../objects/incidence'
import './Reportar.css'

const incidentTypes = [
  { value: 'electrico', label: 'Electrico' },
  { value: 'infraestructura', label: 'Infraestructura' },
  { value: 'plomeria', label: 'Plomeria' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'otro', label: 'Otro' },
]

const Reportar = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    tipo: 'electrico',
    descripcion: '',
    ubicacionTextual: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [coordinates, setCoordinates] = useState({ latitud: null, longitud: null })
  const [locationStatus, setLocationStatus] = useState(
    navigator.geolocation ? 'Buscando ubicacion...' : 'Geolocalizacion no disponible',
  )
  const [photoName, setPhotoName] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ latitud: coords.latitude, longitud: coords.longitude })
        setLocationStatus('GPS activo')
      },
      () => setLocationStatus('GPS no disponible'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  const closeReport = () => navigate('/dashboard')

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handlePhoto = ({ target: { files } }) => {
    const file = files?.[0]
    if (!file) return

    setPhotoFile(file)
    setPhotoName(file.name)
    setError('')
  }

  const saveReport = async () => {
    setError('')
    setIsSaving(true)

    try {
      const userId = auth.currentUser?.uid
      console.log('[Reportar] saveReport', { userId, formData, photoFile, coordinates })

      if (!userId) throw new Error('Debes iniciar sesion para enviar un reporte.')
      if (!photoFile) throw new Error('La fotografia es obligatoria.')

      const incidence = createIncidence({
        ...formData,
        ...coordinates,
        idUsuario: userId,
      })
      await incidence.guardar(photoFile)
      navigate('/dashboard')
    } catch (submitError) {
      console.error('[Reportar] Error al guardar reporte:', submitError)
      setError(submitError.message || 'No fue posible enviar el reporte.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await saveReport()
  }

  return (
    <div className="reportar">
      <div className="reportarDashboard" aria-hidden="true">
        <Dashboard />
      </div>
      <div className="reportarBackdrop" onClick={closeReport} />

      <section className="reportarModal" role="dialog" aria-modal="true" aria-labelledby="reportarTitle">
        <header className="reportarHeader">
          <h1 id="reportarTitle" className="reportarTitle">Nuevo reporte de incidente</h1>
          <button className="reportarClose" type="button" onClick={closeReport} aria-label="Cerrar formulario">
            <CloseIcon />
          </button>
        </header>

        <form className="reportarForm" onSubmit={handleSubmit}>
          <label className="reportarField">
            <span>Tipo de incidente</span>
            <select name="tipo" value={formData.tipo} onChange={handleChange}>
              {incidentTypes.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>

          <label className="reportarField">
            <span>Descripcion detallada</span>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe el incidente con detalle..."
              rows="4"
              required
            />
          </label>

          <label className="reportarField">
            <span>Ubicacion</span>
            <input
              name="ubicacionTextual"
              value={formData.ubicacionTextual}
              onChange={handleChange}
              placeholder="Ej: Bloque B, Aula 203"
            />
          </label>

          <div className="reportarField">
            <span>Fotografia <b>*</b></span>
            <label className={`reportarPhoto${photoName ? ' reportarPhotoSelected' : ''}`}>
              <PhotoCameraOutlinedIcon />
              <strong>{photoName || 'Tomar foto o seleccionar desde galeria'}</strong>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} required />
            </label>
          </div>

          <div className="reportarLocation">
            <LocationOnOutlinedIcon />
            <span>Geolocalizacion automatica</span>
            <strong>{locationStatus}</strong>
          </div>

          {error && <p className="reportarError" role="alert">{error}</p>}

          <footer className="reportarActions">
            <Button className="btnOutline reportarCancel" type="button" onClick={closeReport}>Cancelar</Button>
            <Button className="reportarSave" type="submit" disabled={isSaving}>
              {isSaving ? 'Enviando...' : 'Guardar reporte'}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default Reportar
