import React from 'react'

const Geolocalizacion = ({ onClose, onConfirm }) => {
  const handleConfirm = () => {
    onConfirm({ lat: 0, lng: 0 })
    onClose()
  }

  return (
    <div className="geolocalizacion-modal">
      <div className="geolocalizacion-content">
        <h2>Geolocalización</h2>
        <p>Función de ubicación en desarrollo.</p>
        <button type="button" onClick={handleConfirm}>Confirmar ubicación</button>
        <button type="button" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}

export default Geolocalizacion
