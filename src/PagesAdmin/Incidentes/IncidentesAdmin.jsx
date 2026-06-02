import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import SearchIcon from '@mui/icons-material/Search'
import BoltIcon from '@mui/icons-material/Bolt'
import OpacityIcon from '@mui/icons-material/Opacity'
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService'
import SecurityIcon from '@mui/icons-material/Security'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import { db } from '../../FireBase/config'
import DetalleIncidenteAdmin from '../../Components/DetalleIncidenteAdmin/DetalleIncidenteAdmin'
import './IncidentesAdmin.css'

const TIPO_META = {
  electrico:       { label: 'Eléctrico',      icon: <BoltIcon />,               cls: 'inadm__tipo--electrico' },
  infraestructura: { label: 'Infraestructura', icon: <HomeRepairServiceIcon />,  cls: 'inadm__tipo--infraestructura' },
  plomeria:        { label: 'Plomería',        icon: <OpacityIcon />,            cls: 'inadm__tipo--plomeria' },
  seguridad:       { label: 'Seguridad',       icon: <SecurityIcon />,           cls: 'inadm__tipo--seguridad' },
  otro:            { label: 'Otro',            icon: <HelpOutlineIcon />,        cls: 'inadm__tipo--otro' },
}

const STATE_ALIAS = { abierto: 'reportado', en_proceso: 'analisis', cerrado: 'resuelto' }
const normalizeState = (s) => STATE_ALIAS[s] || s || 'reportado'

const ESTADO_META = {
  reportado: { label: 'Reportado',   cls: 'inadm__badge--reportado' },
  analisis:  { label: 'En análisis', cls: 'inadm__badge--analisis' },
  resuelto:  { label: 'Resuelto',    cls: 'inadm__badge--resuelto' },
}

const ESTADO_ORDER = ['reportado', 'analisis', 'resuelto']

const FILTROS_ESTADO = [
  { key: 'todos',     label: 'Todos' },
  { key: 'reportado', label: 'Reportado' },
  { key: 'analisis',  label: 'En análisis' },
  { key: 'resuelto',  label: 'Resuelto' },
]

const fmt = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  } catch { return iso }
}

const IncidentesAdmin = () => {
  const [all, setAll]                   = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroTipo, setFiltroTipo]     = useState('todos')
  const [orden, setOrden]               = useState('reciente')
  const [selected, setSelected]         = useState(null)
  const [updatingId, setUpdatingId]     = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'incidente'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAll(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
        setError('')
      },
      (err) => {
        console.error('[IncidentesAdmin]', err)
        setError('No se pudieron cargar los incidentes.')
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const filtered = useMemo(() => {
    let list = [...all]
    if (filtroEstado !== 'todos') list = list.filter(i => normalizeState(i.estado) === filtroEstado)
    if (filtroTipo   !== 'todos') list = list.filter(i => i.tipo === filtroTipo)
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(i =>
        i.descripcion?.toLowerCase().includes(s) ||
        i.ubicacionTextual?.toLowerCase().includes(s) ||
        TIPO_META[i.tipo]?.label?.toLowerCase().includes(s) ||
        i.idUsuario?.toLowerCase().includes(s)
      )
    }
    list.sort((a, b) => {
      const da = a.createdAt ?? '', db2 = b.createdAt ?? ''
      return orden === 'reciente' ? db2.localeCompare(da) : da.localeCompare(db2)
    })
    return list
  }, [all, filtroEstado, filtroTipo, search, orden])

  const counts = useMemo(() => ({
    todos:    all.length,
    reportado: all.filter(i => normalizeState(i.estado) === 'reportado').length,
    analisis:  all.filter(i => normalizeState(i.estado) === 'analisis').length,
    resuelto:  all.filter(i => normalizeState(i.estado) === 'resuelto').length,
  }), [all])

  const handleQuickEstado = async (e, incId, currentEstado) => {
    e.stopPropagation()
    const newEstado = e.target.value
    if (!newEstado || newEstado === normalizeState(currentEstado)) return
    setUpdatingId(incId)
    try {
      await updateDoc(doc(db, 'incidente', incId), {
        estado: newEstado,
        updatedAt: new Date().toISOString(),
      })
      if (selected?.id === incId) {
        setSelected(prev => ({ ...prev, estado: newEstado }))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUpdate = (updated) => {
    setAll(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i))
    if (selected?.id === updated.id) setSelected(prev => ({ ...prev, ...updated }))
  }

  return (
    <div className="inadm">

      {/* ── Encabezado ── */}
      <header className="inadm__header">
        <div className="inadm__header-text">
          <span className="inadm__eyebrow">Panel administrativo</span>
          <h1 className="inadm__title">Gestión de Incidentes</h1>
          <p className="inadm__subtitle">Revisa, filtra y actualiza el estado de todos los reportes.</p>
        </div>
        <div className="inadm__header-stats">
          <div className="inadm__stat">
            <span className="inadm__stat-num">{counts.todos}</span>
            <span className="inadm__stat-label">Total</span>
          </div>
          <div className="inadm__stat inadm__stat--reportado">
            <span className="inadm__stat-num">{counts.reportado}</span>
            <span className="inadm__stat-label">Reportados</span>
          </div>
          <div className="inadm__stat inadm__stat--analisis">
            <span className="inadm__stat-num">{counts.analisis}</span>
            <span className="inadm__stat-label">En análisis</span>
          </div>
          <div className="inadm__stat inadm__stat--resuelto">
            <span className="inadm__stat-num">{counts.resuelto}</span>
            <span className="inadm__stat-label">Resueltos</span>
          </div>
        </div>
      </header>

      {/* ── Controles ── */}
      <div className="inadm__controls">
        <div className="inadm__search">
          <SearchIcon className="inadm__search-icon" fontSize="small" />
          <input
            className="inadm__search-input"
            placeholder="Buscar por descripción, tipo, ubicación…"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="inadm__filters">
          <div className="inadm__filter-group">
            <span className="inadm__filter-label">Estado:</span>
            <div className="inadm__filter-pills">
              {FILTROS_ESTADO.map(({ key, label }) => (
                <button
                  key={key}
                  className={`inadm__pill${filtroEstado === key ? ' inadm__pill--active' : ''}`}
                  onClick={() => setFiltroEstado(key)}
                >
                  {label}
                  <span className="inadm__pill-count">{counts[key] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="inadm__selects">
            <select
              className="inadm__select"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              {Object.entries(TIPO_META).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              className="inadm__select"
              value={orden}
              onChange={e => setOrden(e.target.value)}
            >
              <option value="reciente">Más reciente</option>
              <option value="antiguo">Más antiguo</option>
            </select>
          </div>
        </div>
      </div>

      {error && <p className="inadm__error" role="alert">{error}</p>}

      {/* ── Tabla ── */}
      <div className="inadm__table-wrap">
        <div className="inadm__table-header">
          <div className="inadm__table-title">
            <FormatListBulletedIcon fontSize="small" />
            <span>Listado de incidentes</span>
          </div>
          <span className="inadm__table-count">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="inadm__list">
            {[1,2,3,4].map(i => (
              <div key={i} className="inadm__row inadm__row--skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="inadm__empty">
            <FormatListBulletedIcon sx={{ fontSize: 40 }} />
            <p>No hay incidentes con los filtros seleccionados.</p>
          </div>
        ) : (
          <>
            <div className="inadm__col-headers">
              <span>Incidente</span>
              <span>Tipo</span>
              <span>Ubicación</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            <div className="inadm__list">
              {filtered.map(inc => {
                const tipo           = TIPO_META[inc.tipo] ?? { label: inc.tipo, icon: <HelpOutlineIcon />, cls: 'inadm__tipo--otro' }
                const estadoNorm     = normalizeState(inc.estado)
                const isUpdating     = updatingId === inc.id
                const tieneGrupo     = Boolean(inc.grupoId)

                return (
                  <div
                    key={inc.id}
                    className={`inadm__row${selected?.id === inc.id ? ' inadm__row--selected' : ''}`}
                  >
                    {/* Incidente */}
                    <div className="inadm__cell-inc">
                      <span className={`inadm__tipo-icon ${tipo.cls}`}>{tipo.icon}</span>
                      <div className="inadm__cell-inc-info">
                        <strong>{tipo.label}</strong>
                        <span>{inc.descripcion?.slice(0, 40) ?? ''}…</span>
                        {tieneGrupo && (
                          <span className="inadm__grupo-tag">
                            <AccountTreeOutlinedIcon fontSize="inherit" />
                            Agrupado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tipo */}
                    <span className={`inadm__tipo-badge ${tipo.cls}`}>{tipo.label}</span>

                    {/* Ubicación */}
                    <span className="inadm__cell-ubic">
                      <LocationOnOutlinedIcon fontSize="inherit" />
                      {inc.ubicacionTextual || '—'}
                    </span>

                    {/* Fecha */}
                    <span className="inadm__cell-fecha">{fmt(inc.createdAt ?? inc.fecha)}</span>

                    {/* Estado — selector rápido */}
                    <select
                      className={`inadm__estado-select inadm__estado-select--${estadoNorm}${isUpdating ? ' inadm__estado-select--loading' : ''}`}
                      value={estadoNorm}
                      onChange={e => handleQuickEstado(e, inc.id, inc.estado)}
                      disabled={isUpdating}
                      title="Cambiar estado rápido"
                    >
                      {ESTADO_ORDER.map(key => (
                        <option key={key} value={key}>
                          {ESTADO_META[key].label}
                        </option>
                      ))}
                    </select>

                    {/* Acciones */}
                    <div className="inadm__actions">
                      <button
                        className="inadm__ver-btn"
                        onClick={() => setSelected(selected?.id === inc.id ? null : inc)}
                        title="Ver y gestionar detalle"
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                        <span>Ver</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de detalle admin */}
      {selected && (
        <DetalleIncidenteAdmin
          incident={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

export default IncidentesAdmin
