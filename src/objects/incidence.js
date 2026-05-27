/**
 * Incidence object factory and validation utilities
 *
 * Campos (español):
 * - id: string (generado)
 * - tipo: 'baño' | 'infraestructura' | 'seguridad' (string)
 * - foto: string (URL o base64) - obligatorio
 * - fecha: ISO string (generada automáticamente)
 * - descripcion: string (obligatorio)
 * - ubicacionTextual: string (opcional)
 * - latitud: number (opcional)
 * - longitud: number (opcional)
 * - estado: string (ej: 'abierto' | 'en_proceso' | 'cerrado')
 * - idUsuario: string (llave foránea, obligatorio)
 * - createdAt: ISO string
 * - updatedAt: ISO string | null
 */

function generateId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {
    // fallthrough
  }
  return `inc_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

const ALLOWED_TYPES = ['baño', 'infraestructura', 'seguridad'];
const ALLOWED_STATES = ['abierto', 'en_proceso', 'cerrado'];

/**
 * Valida un objeto incidence parcial.
 * Retorna { valid: boolean, errors: string[] }
 */
function validateIncidence(payload = {}) {
  const errors = [];

  if (!payload.tipo) errors.push('El campo "tipo" es obligatorio.');
  else if (!ALLOWED_TYPES.includes(payload.tipo)) errors.push(`Tipo no válido. Valores soportados: ${ALLOWED_TYPES.join(', ')}`);

  if (!payload.foto) errors.push('La fotografía es obligatoria.');

  if (!payload.descripcion) errors.push('La descripción es obligatoria.');

  if (!payload.idUsuario) errors.push('El campo "idUsuario" (llave foránea) es obligatorio.');

  if (payload.latitud != null && typeof payload.latitud !== 'number') errors.push('La latitud debe ser un número.');
  if (payload.longitud != null && typeof payload.longitud !== 'number') errors.push('La longitud debe ser un número.');

  if (payload.estado && !ALLOWED_STATES.includes(payload.estado)) errors.push(`Estado no válido. Valores: ${ALLOWED_STATES.join(', ')}`);

  return { valid: errors.length === 0, errors };
}


function createIncidence(data = {}) {
  const base = {
    id: data.id || generateId(),
    tipo: data.tipo || null,
    foto: data.foto || null,
    fecha: data.fecha || new Date().toISOString(),
    descripcion: data.descripcion || null,
    ubicacionTextual: data.ubicacionTextual || null,
    latitud: data.latitud != null ? Number(data.latitud) : null,
    longitud: data.longitud != null ? Number(data.longitud) : null,
    estado: data.estado || 'abierto',
    idUsuario: data.idUsuario || null,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || null,
  };

  const { valid, errors } = validateIncidence(base);
  if (!valid) {
    const err = new Error('Validación de incidencia fallida: ' + errors.join(' | '));
    err.details = errors;
    throw err;
  }

  return base;
}

module.exports = {
  createIncidence,
  validateIncidence,
  ALLOWED_TYPES,
  ALLOWED_STATES,
};


