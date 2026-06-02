import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../FireBase/config'
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'

const typeLabels = {
  electrico:       'Eléctrico',
  infraestructura: 'Infraestructura',
  plomeria:        'Plomería',
  seguridad:       'Seguridad',
  otro:            'Otro',
}

const STATE_ALIAS = {
  abierto: 'reportado',
  en_proceso: 'analisis',
  cerrado: 'resuelto',
}

const normalizeState = (state) => STATE_ALIAS[state] || state

const stateLabels = {
  reportado: 'Reportado',
  analisis: 'En análisis',
  resuelto: 'Resuelto',
}

const stateCls = {
  reportado: 'latestIncidentStateAbierto',
  analisis: 'latestIncidentStateProceso',
  resuelto: 'latestIncidentStateCerrado',
}

const placeholders = Array.from({ length: 3 }, (_, i) => ({ id: `ph-${i}`, placeholder: true }))

const LatestIncidents = () => {
  const [incidents, setIncidents] = useState([])
  const [revision,  setRevision]  = useState(0)
  const [error,     setError]     = useState('')

  useEffect(() => {
    return onSnapshot(
      collection(db, 'incidente'),
      (snapshot) => {
        const docs = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
          .slice(0, 3)
        setIncidents(docs)
        setRevision(r => r + 1)
        setError('')
      },
      (err) => {
        console.error('[LatestIncidents]', err)
        setError('No fue posible cargar las incidencias recientes.')
      },
    )
  }, [])

  const visibleCards = [...incidents, ...placeholders].slice(0, 3)

  return (
    <section className="additionalInfo" aria-label="Ultimas incidencias reportadas">
      <header className="latestIncidentsHeading">
        <span>Actualizaciones en vivo</span>
        <h2>Ultimas incidencias</h2>
      </header>

      {error && <p className="latestIncidentsError" role="alert">{error}</p>}

      <div className="latestIncidentsList">
        {visibleCards.map((incident, index) =>
          incident.placeholder ? (
            <article className="latestIncidentCard latestIncidentPlaceholder" key={incident.id}>
              <span>Esperando nuevas incidencias...</span>
            </article>
          ) : (
            <article
              className="latestIncidentCard latestIncidentCardAnimated"
              key={`${incident.id}-${revision}`}
              style={{ '--incident-position': index }}
            >
              {incident.foto
                ? (
                  <img
                    src={incident.foto}
                    alt={typeLabels[incident.tipo] ?? incident.tipo}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                )
                : (
                  <div className="latestIncidentNoPhoto">
                    <ImageNotSupportedOutlinedIcon />
                  </div>
                )
              }
              <div className="latestIncidentContent">
                <div className="latestIncidentMeta">
                  <strong>{typeLabels[incident.tipo] ?? incident.tipo ?? 'Sin tipo'}</strong>
                  <span className={`latestIncidentState ${stateCls[normalizeState(incident.estado)] ?? ''}`}>
                    {stateLabels[normalizeState(incident.estado)] ?? incident.estado ?? 'Sin estado'}
                  </span>
                </div>
                <p>{incident.descripcion ?? 'Sin descripción.'}</p>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  )
}

export default LatestIncidents
