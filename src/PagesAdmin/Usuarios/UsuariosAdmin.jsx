import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { auth, db } from '../../FireBase/config'
import SearchIcon from '@mui/icons-material/Search'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import TarjetaUsuario from '../../Components/TarjetaUsuario/TarjetaUsuario'
import './UsuariosAdmin.css'

const ROL_META = {
  admin:   { label: 'Administrador', cls: 'usadm__rol--admin',   icon: <ShieldOutlinedIcon fontSize="small" /> },
  usuario: { label: 'Usuario',       cls: 'usadm__rol--usuario', icon: <PersonOutlinedIcon fontSize="small" /> },
}

const FILTROS_ROL = [
  { key: 'todos',   label: 'Todos' },
  { key: 'usuario', label: 'Usuarios' },
  { key: 'admin',   label: 'Administradores' },
]

const fmt = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

const UsuariosAdmin = () => {
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [filtroRol, setFiltroRol]       = useState('todos')
  const [orden, setOrden]               = useState('reciente')
  const [selected, setSelected]         = useState(null)

  const currentAdminUid = auth.currentUser?.uid

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('creadoEn', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
        setLoading(false)
        setError('')
      },
      (err) => {
        console.error('[UsuariosAdmin]', err)
        setError('No se pudieron cargar los usuarios.')
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const filtered = useMemo(() => {
    let list = [...users]
    if (filtroRol !== 'todos') list = list.filter(u => u.rol === filtroRol)
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(u =>
        u.nombre?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.uid?.toLowerCase().includes(s)
      )
    }
    list.sort((a, b) => {
      const da = a.creadoEn ?? '', db2 = b.creadoEn ?? ''
      return orden === 'reciente' ? db2.localeCompare(da) : da.localeCompare(db2)
    })
    return list
  }, [users, filtroRol, search, orden])

  const counts = useMemo(() => ({
    todos:   users.length,
    usuario: users.filter(u => u.rol === 'usuario').length,
    admin:   users.filter(u => u.rol === 'admin').length,
  }), [users])

  const handleUpdate = (updated) => {
    setUsers(prev => prev.map(u => u.uid === updated.uid ? { ...u, ...updated } : u))
    if (selected?.uid === updated.uid) setSelected(prev => ({ ...prev, ...updated }))
  }

  return (
    <div className="usadm">

      {/* ── Encabezado ── */}
      <header className="usadm__header">
        <div className="usadm__header-text">
          <span className="usadm__eyebrow">Panel administrativo</span>
          <h1 className="usadm__title">Gestión de Usuarios</h1>
          <p className="usadm__subtitle">Administra cuentas, roles y permisos del sistema.</p>
        </div>
        <div className="usadm__header-stats">
          <div className="usadm__stat">
            <span className="usadm__stat-num">{counts.todos}</span>
            <span className="usadm__stat-label">Total</span>
          </div>
          <div className="usadm__stat usadm__stat--usuario">
            <span className="usadm__stat-num">{counts.usuario}</span>
            <span className="usadm__stat-label">Usuarios</span>
          </div>
          <div className="usadm__stat usadm__stat--admin">
            <span className="usadm__stat-num">{counts.admin}</span>
            <span className="usadm__stat-label">Admins</span>
          </div>
        </div>
      </header>

      {/* ── Controles ── */}
      <div className="usadm__controls">
        <div className="usadm__search">
          <SearchIcon className="usadm__search-icon" fontSize="small" />
          <input
            className="usadm__search-input"
            placeholder="Buscar por nombre, correo o UID…"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="usadm__filters">
          <div className="usadm__filter-group">
            <span className="usadm__filter-label">Rol:</span>
            <div className="usadm__filter-pills">
              {FILTROS_ROL.map(({ key, label }) => (
                <button
                  key={key}
                  className={`usadm__pill${filtroRol === key ? ' usadm__pill--active' : ''}`}
                  onClick={() => setFiltroRol(key)}
                >
                  {label}
                  <span className="usadm__pill-count">{counts[key] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
          <select
            className="usadm__select"
            value={orden}
            onChange={e => setOrden(e.target.value)}
          >
            <option value="reciente">Más reciente</option>
            <option value="antiguo">Más antiguo</option>
          </select>
        </div>
      </div>

      {error && <p className="usadm__error" role="alert">{error}</p>}

      {/* ── Tabla ── */}
      <div className="usadm__table-wrap">
        <div className="usadm__table-header">
          <div className="usadm__table-title">
            <GroupOutlinedIcon fontSize="small" />
            <span>Listado de usuarios</span>
          </div>
          <span className="usadm__table-count">
            {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="usadm__grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="usadm__card usadm__card--skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="usadm__empty">
            <GroupOutlinedIcon sx={{ fontSize: 44 }} />
            <p>No hay usuarios con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="usadm__grid">
            {filtered.map(usuario => {
              const rolMeta   = ROL_META[usuario.rol] ?? ROL_META.usuario
              const esSesion  = currentAdminUid === usuario.uid

              return (
                <button
                  key={usuario.uid}
                  className={`usadm__card${selected?.uid === usuario.uid ? ' usadm__card--selected' : ''}${esSesion ? ' usadm__card--me' : ''}`}
                  onClick={() => setSelected(selected?.uid === usuario.uid ? null : usuario)}
                >
                  {/* Avatar */}
                  <div className="usadm__card-avatar">
                    {usuario.photoURL
                      ? <img src={usuario.photoURL} alt="avatar" className="usadm__avatar-img" />
                      : <AccountCircleIcon className="usadm__avatar-icon" />
                    }
                    {esSesion && <span className="usadm__me-badge">Tú</span>}
                  </div>

                  {/* Info */}
                  <div className="usadm__card-info">
                    <strong className="usadm__card-nombre">
                      {usuario.nombre || '(Sin nombre)'}
                    </strong>
                    <span className="usadm__card-email">{usuario.email || '—'}</span>
                    <span className={`usadm__card-rol ${rolMeta.cls}`}>
                      {rolMeta.icon}
                      {rolMeta.label}
                    </span>
                  </div>

                  {/* Fecha */}
                  <div className="usadm__card-fecha">
                    <CalendarTodayOutlinedIcon fontSize="small" />
                    <span>{fmt(usuario.creadoEn)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de usuario */}
      {selected && (
        <TarjetaUsuario
          usuario={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          currentAdminUid={currentAdminUid}
        />
      )}
    </div>
  )
}

export default UsuariosAdmin
