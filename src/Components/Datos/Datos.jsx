import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../FireBase/config'
import './Datos.css'

const STATE_ALIAS = {
  abierto: 'reportado',
  en_proceso: 'analisis',
  cerrado: 'resuelto',
}

const normalizeState = (state) => STATE_ALIAS[state] || state

const Datos = () => {
  const [counts, setCounts] = useState({ total: 0, reportado: 0, analisis: 0, resuelto: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'incidente'),
      (snapshot) => {
        const totals = { total: snapshot.size, reportado: 0, analisis: 0, resuelto: 0 }
        snapshot.docs.forEach((doc) => {
          const estado = normalizeState(doc.data().estado)
          if (estado === 'reportado') totals.reportado += 1
          if (estado === 'analisis')  totals.analisis += 1
          if (estado === 'resuelto')  totals.resuelto += 1
        })
        setCounts(totals)
        setError('')
      },
      (err) => {
        console.error('[Datos] Firestore error:', err)
        setError('No fue posible cargar los datos.')
      },
    )
    return unsubscribe
  }, [])

  return (
    <section className="datosSummary" aria-label="Resumen de incidencias">
      <header className="datosSummaryHeader">
        <span>Estadísticas</span>
        <h2>Resumen de incidencias</h2>
      </header>

      {error && <p className="datosError" role="alert">{error}</p>}

      <div className="datosCards">
        <article className="datosCard datosCard--primary">
          <strong>{counts.total}</strong>
          <p>Total reportados</p>
        </article>
        <article className="datosCard datosCard--reportado">
          <strong>{counts.reportado}</strong>
          <p>Reportado</p>
        </article>
        <article className="datosCard datosCard--analisis">
          <strong>{counts.analisis}</strong>
          <p>En análisis</p>
        </article>
        <article className="datosCard datosCard--resuelto">
          <strong>{counts.resuelto}</strong>
          <p>Resueltos</p>
        </article>
      </div>
    </section>
  )
}

export default Datos
