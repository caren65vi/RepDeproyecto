import { useEffect, useMemo, useRef, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../FireBase/config'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import BoltIcon from '@mui/icons-material/Bolt'
import OpacityIcon from '@mui/icons-material/Opacity'
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService'
import SecurityIcon from '@mui/icons-material/Security'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import logoPng from '../../assets/LogoPrincipal.png'
import './ImprimirAdmin.css'

const STATE_ALIAS = { abierto: 'reportado', en_proceso: 'analisis', cerrado: 'resuelto' }
const normalizeState = (s) => STATE_ALIAS[s] || s || 'reportado'

const TIPO_META = {
  electrico:       { label: 'Eléctrico',      icon: <BoltIcon />,              color: '#EDB02E' },
  infraestructura: { label: 'Infraestructura', icon: <HomeRepairServiceIcon />, color: '#005A7E' },
  plomeria:        { label: 'Plomería',        icon: <OpacityIcon />,           color: '#169586' },
  seguridad:       { label: 'Seguridad',       icon: <SecurityIcon />,          color: '#E81312' },
  otro:            { label: 'Otro',            icon: <HelpOutlineIcon />,       color: '#8fa08e' },
}

const ESTADO_META = {
  reportado: { label: 'Reportado',   color: '#b8881f' },
  analisis:  { label: 'En análisis', color: '#005A7E' },
  resuelto:  { label: 'Resuelto',    color: '#0B750E' },
}

const fmt = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  } catch { return iso }
}

const fmtShort = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  } catch { return iso }
}

const ENTIDADES = [
  { key: 'incidentes', label: 'Reporte de Incidentes', icon: <FormatListBulletedIcon /> },
  { key: 'usuarios',   label: 'Listado de Usuarios',   icon: <GroupOutlinedIcon /> },
]

const ImprimirAdmin = () => {
  const [incidentes, setIncidentes] = useState([])
  const [usuarios, setUsuarios]     = useState([])
  const [loading, setLoading]       = useState(true)

  const [entidad, setEntidad]         = useState('incidentes')
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 10)
  })
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().slice(0, 10))
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroTipo, setFiltroTipo]     = useState('todos')
  const printRef = useRef(null)

  useEffect(() => {
    let done1 = false, done2 = false
    const check = () => { if (done1 && done2) setLoading(false) }

    const q1 = query(collection(db, 'incidente'), orderBy('createdAt', 'desc'))
    const unsub1 = onSnapshot(q1, snap => {
      setIncidentes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      done1 = true; check()
    })

    const q2 = query(collection(db, 'usuarios'), orderBy('creadoEn', 'desc'))
    const unsub2 = onSnapshot(q2, snap => {
      setUsuarios(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
      done2 = true; check()
    })

    return () => { unsub1(); unsub2() }
  }, [])

  const incidentesFiltrados = useMemo(() => {
    const start = new Date(fechaInicio)
    const end   = new Date(fechaFin); end.setHours(23, 59, 59)
    return incidentes.filter(i => {
      const d = new Date(i.createdAt ?? i.fecha)
      if (d < start || d > end) return false
      if (filtroEstado !== 'todos' && normalizeState(i.estado) !== filtroEstado) return false
      if (filtroTipo   !== 'todos' && i.tipo !== filtroTipo) return false
      return true
    })
  }, [incidentes, fechaInicio, fechaFin, filtroEstado, filtroTipo])

  const usuariosFiltrados = useMemo(() => {
    const start = new Date(fechaInicio)
    const end   = new Date(fechaFin); end.setHours(23, 59, 59)
    return usuarios.filter(u => {
      const d = new Date(u.creadoEn)
      return d >= start && d <= end
    })
  }, [usuarios, fechaInicio, fechaFin])

  const datos = entidad === 'incidentes' ? incidentesFiltrados : usuariosFiltrados
  const genDate = fmt(new Date().toISOString())
  const rangoLabel = `${fmtShort(fechaInicio)} — ${fmtShort(fechaFin)}`

  const handlePrint = () => {
    const titulo   = entidad === 'incidentes' ? 'Reporte de Incidentes' : 'Listado de Usuarios'
    const logoUrl  = new URL(logoPng, window.location.href).href
    const hoy      = new Date()
    const fechaDoc = hoy.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    const ref      = `REP-${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}${String(hoy.getDate()).padStart(2,'0')}`

    const filas = entidad === 'incidentes'
      ? incidentesFiltrados.map((inc, idx) => {
          const tipo  = TIPO_META[inc.tipo]
          const eNorm = normalizeState(inc.estado)
          const eMeta = ESTADO_META[eNorm]
          return `<tr class="${idx % 2 === 1 ? 'par' : ''}">
            <td class="celda-num">${idx + 1}</td>
            <td class="celda-tipo" style="color:${tipo?.color ?? '#333'}">${tipo?.label ?? inc.tipo ?? '—'}</td>
            <td>${inc.descripcion?.slice(0, 90) ?? '—'}</td>
            <td>${inc.ubicacionTextual ?? '—'}</td>
            <td class="celda-fecha">${fmtShort(inc.createdAt ?? inc.fecha)}</td>
            <td><span class="badge" style="border-color:${eMeta?.color ?? '#999'};color:${eMeta?.color ?? '#999'}">${eMeta?.label ?? eNorm}</span></td>
          </tr>`
        }).join('')
      : usuariosFiltrados.map((u, idx) => {
          const rc = u.rol === 'admin' ? '#005A7E' : '#169586'
          return `<tr class="${idx % 2 === 1 ? 'par' : ''}">
            <td class="celda-num">${idx + 1}</td>
            <td><strong>${u.nombre || '(Sin nombre)'}</strong></td>
            <td>${u.email || '—'}</td>
            <td><span class="badge" style="border-color:${rc};color:${rc}">${u.rol === 'admin' ? 'Administrador' : 'Usuario'}</span></td>
            <td class="celda-fecha">${fmtShort(u.creadoEn)}</td>
          </tr>`
        }).join('')

    const cabeceras = entidad === 'incidentes'
      ? '<th>#</th><th>Tipo</th><th>Descripción</th><th>Ubicación</th><th>Fecha</th><th>Estado</th>'
      : '<th>#</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Registrado</th>'

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>${titulo} — Universidad de la Amazonia</title>
  <style>
    @page { size: letter; margin: 0; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      color: #111;
      background: white;
    }

    /* ── Página ── */
    .pagina {
      width: 21.6cm;
      min-height: 27.9cm;
      margin: 0 auto;
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    /* ── Cabecera institucional ── */
    .cabecera {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 18px 2.5cm 12px;
      border-bottom: 2.5px solid #0B750E;
    }

    .cabecera-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cabecera-logo img {
      height: 65px;
      width: auto;
      object-fit: contain;
    }

    .cabecera-vigilada {
      font-size: 7.5pt;
      color: #555;
      margin-top: 4px;
      font-style: italic;
    }

    .cabecera-derecha {
      text-align: right;
      font-size: 9pt;
      color: #333;
      line-height: 1.6;
    }

    .cabecera-derecha strong {
      font-size: 10pt;
      color: #111;
      display: block;
      margin-bottom: 2px;
    }

    .nit {
      text-align: right;
      font-size: 8.5pt;
      color: #555;
      padding: 5px 2.5cm 0;
    }

    /* ── Cuerpo del documento ── */
    .cuerpo {
      flex: 1;
      padding: 18px 2.5cm 0;
    }

    .ref {
      font-size: 9.5pt;
      color: #555;
      margin-bottom: 6px;
      font-family: Arial, sans-serif;
    }

    .fecha-lugar {
      font-size: 10.5pt;
      margin-bottom: 20px;
      color: #222;
    }

    .asunto-bloque {
      margin-bottom: 18px;
    }

    .asunto-bloque .asunto-titulo {
      font-weight: bold;
      font-size: 10.5pt;
    }

    .asunto-bloque .asunto-texto {
      font-size: 10.5pt;
    }

    .intro-texto {
      font-size: 10.5pt;
      line-height: 1.7;
      margin-bottom: 16px;
      text-align: justify;
    }

    /* ── Tabla ── */
    .tabla-titulo {
      font-size: 10pt;
      font-weight: bold;
      color: #0B750E;
      border-bottom: 1.5px solid #0B750E;
      padding-bottom: 4px;
      margin-bottom: 10px;
      font-family: Arial, sans-serif;
      letter-spacing: 0.03em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      font-family: Arial, sans-serif;
    }

    thead { background: #f4f4f4; }

    th {
      background: #e8f5e9;
      border: 1px solid #bbb;
      color: #1a5c1e;
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 0.05em;
      padding: 7px 10px;
      text-align: left;
    }

    td {
      border: 1px solid #ddd;
      padding: 7px 10px;
      vertical-align: top;
      color: #222;
    }

    tr.par td { background: #fafafa; }

    .celda-num   { text-align: center; color: #888; width: 28px; }
    .celda-tipo  { font-weight: 700; white-space: nowrap; }
    .celda-fecha { white-space: nowrap; color: #555; font-size: 9pt; }

    .badge {
      border: 1.5px solid;
      border-radius: 20px;
      font-size: 8.5pt;
      font-weight: 700;
      padding: 2px 9px;
      white-space: nowrap;
    }

    /* ── Cierre del documento ── */
    .cierre {
      padding: 22px 2.5cm 0;
      font-size: 10.5pt;
    }

    .cierre p { margin-bottom: 8px; }

    .firma {
      margin-top: 32px;
      font-size: 10pt;
    }

    .firma .nombre { font-weight: bold; }
    .firma .cargo  { font-size: 9.5pt; color: #333; }

    .elaborado {
      font-size: 9pt;
      color: #555;
      margin-top: 24px;
    }

    /* ── Pie de página institucional ── */
    .pie {
      margin-top: auto;
      display: flex;
      align-items: stretch;
      height: 52px;
    }

    .pie-bloque {
      flex: 1;
      background: #4a4a4a;
    }

    .pie-bloque:first-child { background: #2a2a2a; flex: 0.6; }
    .pie-bloque:last-child  { background: #1a1a1a; flex: 0.6; }

    .pie-centro {
      flex: 3;
      background: #333;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
      color: white;
      font-size: 7.5pt;
      font-family: Arial, sans-serif;
      line-height: 1.5;
      text-align: center;
    }

    .pie-acento {
      width: 6px;
      background: #0B750E;
    }

    .pie-acento-rojo {
      width: 6px;
      background: #E81312;
    }

    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .pie-bloque, .pie-bloque:first-child, .pie-bloque:last-child,
      .pie-centro, .pie-acento, .pie-acento-rojo {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      thead { background: #e8f5e9 !important; }
      th    { background: #e8f5e9 !important; }
      tr.par td { background: #fafafa !important; }
    }
  </style>
</head>
<body>
<div class="pagina">

  <!-- ══ Cabecera institucional ══ -->
  <header class="cabecera">
    <div class="cabecera-logo">
      <img src="${logoUrl}" alt="Universidad de la Amazonia" />
      <div>
        <div class="cabecera-vigilada">Vigilada Ministerio de Educación Nacional</div>
      </div>
    </div>
    <div class="cabecera-derecha">
      <strong>Sistema de Gestión de Incidentes</strong>
      Bloque administrativo — Campus Porvenir<br/>
      reportaudla@uniamazonia.edu.co
    </div>
  </header>

  <div class="nit">NIT: 891.190.548-1</div>

  <!-- ══ Cuerpo ══ -->
  <div class="cuerpo">

    <div class="ref">${ref}</div>
    <div class="fecha-lugar">Florencia Caquetá, ${fechaDoc}</div>

    <div class="asunto-bloque">
      <span class="asunto-titulo">Asunto: </span>
      <span class="asunto-texto">${titulo} — Periodo ${rangoLabel}</span>
    </div>

    <p class="intro-texto">
      A continuación se presenta el ${titulo.toLowerCase()} generado por el sistema
      ReportaUdla de la Universidad de la Amazonia, correspondiente al periodo comprendido
      entre ${rangoLabel}. El presente documento contiene
      <strong>${datos.length} registro${datos.length !== 1 ? 's' : ''}</strong> y es de uso
      exclusivo interno de la institución.
    </p>

    <div class="tabla-titulo">${titulo.toUpperCase()} — ${rangoLabel}</div>

    ${datos.length === 0
      ? '<p style="color:#888;padding:20px 0;text-align:center;font-family:Arial">No hay registros para los filtros seleccionados.</p>'
      : `<table><thead><tr>${cabeceras}</tr></thead><tbody>${filas}</tbody></table>`
    }

  </div>

  <!-- ══ Cierre ══ -->
  <div class="cierre">
    <div class="firma">
      <div class="nombre">Administrador del Sistema</div>
      <div class="cargo">ReportaUdla — Universidad de la Amazonia</div>
      <div class="cargo">Florencia, Caquetá</div>
    </div>
    <div class="elaborado">Elaborado por: Sistema ReportaUdla — ${genDate}</div>
  </div>

  <!-- ══ Pie institucional ══ -->
  <footer class="pie">
    <div class="pie-bloque"></div>
    <div class="pie-acento"></div>
    <div class="pie-bloque"></div>
    <div class="pie-acento-rojo"></div>
    <div class="pie-centro">
      <span>Calle 17 diagonal 17 con carrera 3F Barrio El Porvenir &nbsp;·&nbsp; atencionciudadano@uniamazonia.edu.co</span>
      <span>www.uniamazonia.edu.co &nbsp;·&nbsp; Florencia Caquetá</span>
    </div>
    <div class="pie-acento"></div>
    <div class="pie-bloque"></div>
    <div class="pie-acento-rojo"></div>
    <div class="pie-bloque"></div>
  </footer>

</div>
<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`

    const ventana = window.open('', '_blank', 'width=960,height=780')
    if (!ventana) {
      alert('Permite las ventanas emergentes para imprimir el reporte.')
      return
    }
    ventana.document.write(html)
    ventana.document.close()
  }

  return (
    <div className="impadm">

      {/* ── Encabezado ── */}
      <header className="impadm__header">
        <div>
          <span className="impadm__eyebrow">Panel administrativo</span>
          <h1 className="impadm__title">Imprimir Reportes</h1>
          <p className="impadm__subtitle">Genera e imprime reportes con identidad institucional UDLA.</p>
        </div>
      </header>

      {/* ── Configuración ── */}
      <div className="impadm__config">
        <div className="impadm__config-section">
          <span className="impadm__config-label">
            <PictureAsPdfOutlinedIcon fontSize="small" /> Tipo de reporte
          </span>
          <div className="impadm__entidad-btns">
            {ENTIDADES.map(({ key, label, icon }) => (
              <button
                key={key}
                className={`impadm__entidad-btn${entidad === key ? ' impadm__entidad-btn--active' : ''}`}
                onClick={() => setEntidad(key)}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="impadm__config-section">
          <span className="impadm__config-label">
            <CalendarTodayOutlinedIcon fontSize="small" /> Rango de fechas
          </span>
          <div className="impadm__date-row">
            <label className="impadm__date-group">
              <span>Desde</span>
              <input
                type="date"
                className="impadm__date-input"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
              />
            </label>
            <label className="impadm__date-group">
              <span>Hasta</span>
              <input
                type="date"
                className="impadm__date-input"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
              />
            </label>
          </div>
        </div>

        {entidad === 'incidentes' && (
          <div className="impadm__config-section">
            <span className="impadm__config-label">
              <FilterListIcon fontSize="small" /> Filtros adicionales
            </span>
            <div className="impadm__extra-filters">
              <label className="impadm__filter-label">
                <span>Estado</span>
                <select
                  className="impadm__select"
                  value={filtroEstado}
                  onChange={e => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="reportado">Reportado</option>
                  <option value="analisis">En análisis</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </label>
              <label className="impadm__filter-label">
                <span>Tipo</span>
                <select
                  className="impadm__select"
                  value={filtroTipo}
                  onChange={e => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos los tipos</option>
                  {Object.entries(TIPO_META).map(([k, m]) => (
                    <option key={k} value={k}>{m.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        <div className="impadm__config-summary">
          <span>
            <strong>{datos.length}</strong>{' '}
            {entidad === 'incidentes' ? 'incidente' : 'usuario'}{datos.length !== 1 ? 's' : ''} listos para imprimir
          </span>
          <button
            className="impadm__print-btn"
            onClick={handlePrint}
            disabled={datos.length === 0 || loading}
          >
            <PrintOutlinedIcon fontSize="small" />
            Imprimir / Exportar PDF
          </button>
        </div>
      </div>

      {/* ══ ÁREA IMPRIMIBLE ══ */}
      <div className="impadm__printable" ref={printRef}>

        {/* Cabecera institucional */}
        <div className="impadm__print-header">
          <div className="impadm__print-brand">
            <div className="impadm__print-logo-text">UDLA</div>
            <div className="impadm__print-brand-info">
              <strong>Universidad de la Amazonia</strong>
              <span>Sistema de Gestión de Incidentes — ReportaUdla</span>
            </div>
          </div>
          <div className="impadm__print-stripe" />
          <div className="impadm__print-meta">
            <p><strong>{entidad === 'incidentes' ? 'Reporte de Incidentes' : 'Listado de Usuarios'}</strong></p>
            <p>Periodo: {rangoLabel}</p>
            <p>Total registros: {datos.length}</p>
            <p>Generado: {genDate}</p>
          </div>
        </div>

        {/* Vista previa — incidentes */}
        {entidad === 'incidentes' && (
          <div className="impadm__preview">
            <div className="impadm__preview-header">
              <strong>Vista previa del reporte</strong>
              <span>{incidentesFiltrados.length} incidentes · {rangoLabel}</span>
            </div>

            {loading ? (
              <p className="impadm__loading">Cargando datos…</p>
            ) : incidentesFiltrados.length === 0 ? (
              <p className="impadm__no-data">No hay incidentes en el periodo y filtros seleccionados.</p>
            ) : (
              <div className="impadm__table-wrap">
                <table className="impadm__table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Ubicación</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentesFiltrados.map((inc, idx) => {
                      const tipo  = TIPO_META[inc.tipo]
                      const eNorm = normalizeState(inc.estado)
                      const eMeta = ESTADO_META[eNorm]
                      return (
                        <tr key={inc.id}>
                          <td className="impadm__td-num">{idx + 1}</td>
                          <td>
                            <span className="impadm__tipo-cell" style={{ color: tipo?.color }}>
                              {tipo?.label ?? inc.tipo}
                            </span>
                          </td>
                          <td className="impadm__td-desc">{inc.descripcion?.slice(0, 70) ?? '—'}</td>
                          <td>{inc.ubicacionTextual ?? '—'}</td>
                          <td className="impadm__td-fecha">{fmtShort(inc.createdAt ?? inc.fecha)}</td>
                          <td>
                            <span
                              className="impadm__estado-badge"
                              style={{ color: eMeta?.color, borderColor: eMeta?.color }}
                            >
                              {eMeta?.label ?? eNorm}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Vista previa — usuarios */}
        {entidad === 'usuarios' && (
          <div className="impadm__preview">
            <div className="impadm__preview-header">
              <strong>Vista previa del reporte</strong>
              <span>{usuariosFiltrados.length} usuarios registrados · {rangoLabel}</span>
            </div>

            {loading ? (
              <p className="impadm__loading">Cargando datos…</p>
            ) : usuariosFiltrados.length === 0 ? (
              <p className="impadm__no-data">No hay usuarios registrados en el periodo seleccionado.</p>
            ) : (
              <div className="impadm__table-wrap">
                <table className="impadm__table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Registrado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((u, idx) => (
                      <tr key={u.uid}>
                        <td className="impadm__td-num">{idx + 1}</td>
                        <td><strong>{u.nombre || '(Sin nombre)'}</strong></td>
                        <td>{u.email || '—'}</td>
                        <td>
                          <span className={`impadm__rol-badge impadm__rol-badge--${u.rol}`}>
                            {u.rol === 'admin' ? 'Administrador' : 'Usuario'}
                          </span>
                        </td>
                        <td className="impadm__td-fecha">{fmtShort(u.creadoEn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer institucional */}
        <div className="impadm__print-footer">
          <span>Universidad de la Amazonia — ReportaUdla</span>
          <span>Documento generado el {genDate}</span>
          <span>Confidencial — Uso interno</span>
        </div>
      </div>

    </div>
  )
}

export default ImprimirAdmin
