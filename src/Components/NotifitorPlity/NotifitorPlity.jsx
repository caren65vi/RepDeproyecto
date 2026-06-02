import { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import {
  disableBrowserNotifications,
  enableBrowserNotifications,
  getBrowserNotificationPermission,
  getNotificationConsent,
  notificationPreferenceEvent,
  setNotificationConsent,
} from '../IncidentNotifier/notificationPreferences'
import './NotifitorPlity.css'

const NotifitorPlity = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [consent, setConsent] = useState(getNotificationConsent)
  const [permission, setPermission] = useState(getBrowserNotificationPermission)

  useEffect(() => {
    const updatePreference = (event) => {
      setConsent(event.detail || getNotificationConsent())
      setPermission(getBrowserNotificationPermission())
    }
    window.addEventListener(notificationPreferenceEvent, updatePreference)
    return () => window.removeEventListener(notificationPreferenceEvent, updatePreference)
  }, [])

  const activateNotifications = async () => {
    await enableBrowserNotifications()
    setPermission(getBrowserNotificationPermission())
  }

  const deactivateNotifications = () => {
    disableBrowserNotifications()
    setPermission(getBrowserNotificationPermission())
  }

  const checkBrowserPermission = () => {
    const currentPermission = getBrowserNotificationPermission()
    setPermission(currentPermission)
    if (currentPermission === 'granted') setNotificationConsent('accepted')
  }

  const isActive = consent === 'accepted' && permission === 'granted'

  return (
    <>
      <section className="notifitorBar">
        <div>
          <strong>Notificaciones de incidencias</strong>
          <span>{isActive ? 'Activas en este navegador' : 'Desactivadas en este navegador'}</span>
        </div>
        <button type="button" onClick={() => setIsOpen(true)}>
          {isActive ? 'Configurar' : 'Activar notificacion'}
        </button>
      </section>

      {isOpen && (
        <div className="notifitorOverlay" role="presentation" onClick={() => setIsOpen(false)}>
          <section
            className="notifitorModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifitorTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="notifitorClose"
              aria-label="Cerrar politica de notificaciones"
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon />
            </button>

            <span className={`notifitorStatus${isActive ? ' notifitorStatusActive' : ''}`}>
              {isActive ? 'Notificaciones activas' : 'Notificaciones desactivadas'}
            </span>
            <h2 id="notifitorTitle">Politica de aceptacion</h2>
            <p>
              Al aceptar, autorizas a ResuelveUA a mostrar una alerta cuando se registre una incidencia nueva en
              la base de datos. Las alertas funcionan mientras la aplicacion este abierta en este navegador.
            </p>
            <p>
              Puedes retirar tu aceptacion en cualquier momento. La preferencia solo se guarda en este navegador
              y no se almacenan fotografias ni datos adicionales para enviar la alerta.
            </p>

            {permission === 'denied' && (
              <div className="notifitorPermissionHelp">
                <p>
                  El navegador tiene el permiso bloqueado y no permite solicitarlo nuevamente desde la aplicacion.
                </p>
                <ol>
                  <li>Presiona el icono de configuracion o candado junto a la direccion de esta pagina.</li>
                  <li>Busca el permiso de notificaciones y selecciona Permitir.</li>
                  <li>Regresa aqui y presiona Comprobar permiso.</li>
                </ol>
              </div>
            )}

            <div className="notifitorActions">
              {!isActive && permission !== 'denied' && (
                <button type="button" onClick={activateNotifications}>Aceptar y activar</button>
              )}
              {permission === 'denied' && (
                <button type="button" onClick={checkBrowserPermission}>Comprobar permiso</button>
              )}
              {consent !== 'declined' && (
                <button type="button" className="notifitorSecondary" onClick={deactivateNotifications}>
                  Desactivar
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default NotifitorPlity
