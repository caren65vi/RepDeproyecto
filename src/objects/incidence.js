import { doc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '../FireBase/config'

function generateId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {
    // Use the timestamp fallback when randomUUID is unavailable.
  }
  return `inc_${Date.now()}_${Math.floor(Math.random() * 10000)}`
}

export const allowedTypes = ['electrico', 'infraestructura', 'plomeria', 'seguridad', 'otro']
export const allowedStates = ['abierto', 'en_proceso', 'cerrado']

export function validateIncidence(payload = {}) {
  const errors = []

  if (!payload.tipo) errors.push('El tipo de incidente es obligatorio.')
  else if (!allowedTypes.includes(payload.tipo)) errors.push('El tipo de incidente no es valido.')

  if (!payload.foto) errors.push('La fotografia es obligatoria.')
  if (!payload.descripcion) errors.push('La descripcion es obligatoria.')
  if (!payload.idUsuario) errors.push('Debes iniciar sesion para enviar un reporte.')

  if (payload.latitud != null && typeof payload.latitud !== 'number') errors.push('La latitud debe ser un numero.')
  if (payload.longitud != null && typeof payload.longitud !== 'number') errors.push('La longitud debe ser un numero.')
  if (payload.estado && !allowedStates.includes(payload.estado)) errors.push('El estado no es valido.')

  return { valid: errors.length === 0, errors }
}

export class Incidence {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.tipo = data.tipo || null
    this.foto = data.foto || null
    this.fecha = data.fecha || new Date().toISOString()
    this.descripcion = data.descripcion || null
    this.ubicacionTextual = data.ubicacionTextual || null
    this.latitud = data.latitud != null ? Number(data.latitud) : null
    this.longitud = data.longitud != null ? Number(data.longitud) : null
    this.estado = data.estado || 'abierto'
    this.idUsuario = data.idUsuario || null
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || null
  }

  mostrar() {
    return {
      id: this.id,
      tipo: this.tipo,
      foto: this.foto,
      fecha: this.fecha,
      descripcion: this.descripcion,
      ubicacionTextual: this.ubicacionTextual,
      latitud: this.latitud,
      longitud: this.longitud,
      estado: this.estado,
      idUsuario: this.idUsuario,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  async guardar(photoFile) {
    if (!photoFile && !this.foto) throw new Error('La fotografia es obligatoria.')
    if (!this.idUsuario) throw new Error('Debes iniciar sesion para enviar un reporte.')

    if (photoFile) {
      const safeName = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const photoRef = ref(storage, `incidencias/${this.idUsuario}/${this.id}_${safeName}`)
      console.log('[Incidence] uploadBytes', { photoRefPath: photoRef.fullPath, safeName, fileName: photoFile.name })
      try {
        await uploadBytes(photoRef, photoFile)
        this.foto = await getDownloadURL(photoRef)
        console.log('[Incidence] foto subida, URL obtenida', this.foto)
      } catch (storageError) {
        console.error('[Storage] código:', storageError?.code)
        console.error('[Storage] mensaje:', storageError?.message)
        console.error('[Storage] error completo:', storageError)
        const code = storageError?.code ?? ''
        if (code === 'storage/unauthorized') throw new Error('Sin permiso para subir archivos. Ve a Firebase Console → Storage → Rules y permite escritura.')
        if (code === 'storage/canceled') throw new Error('La subida fue cancelada.')
        if (code === 'storage/unknown') throw new Error('Storage no está habilitado. Ve a Firebase Console → Storage y actívalo.')
        throw new Error(`Error Storage [${code || 'sin código'}]: ${storageError?.message ?? 'error desconocido'}`)
      }
    }

    const data = this.mostrar()
    console.log('[Incidence] datos a guardar en Firestore', data)
    const { valid, errors } = validateIncidence(data)
    if (!valid) {
      const error = new Error(errors.join(' '))
      error.details = errors
      throw error
    }

    try {
      await setDoc(doc(db, 'incidencias', this.id), data)
      console.log('[Incidence] documento guardado en Firestore', this.id)
    } catch (firestoreError) {
      console.error('[Incidence] Error al guardar en Firestore:', firestoreError)
      const code = firestoreError?.code ?? ''
      if (code === 'permission-denied') throw new Error('Sin permiso para guardar el reporte. Revisa las reglas de Firestore.')
      throw new Error(`Error al guardar el reporte (${code || firestoreError.message}).`)
    }

    return data
  }
}

export function createIncidence(data = {}) {
  return new Incidence(data)
}
