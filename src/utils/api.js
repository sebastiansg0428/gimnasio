const API_BASE = 'http://localhost:3001'

// Función auxiliar para normalizar datos de entrenadores del backend al frontend
function normalizarEntrenador(entrenador) {
    if (!entrenador || typeof entrenador !== 'object') return entrenador
    
    // Extraer tarifa_hora de cualquier campo posible que el backend pueda enviar
    let tarifaHora = 0
    if (entrenador.tarifa_hora !== undefined && entrenador.tarifa_hora !== null) {
        tarifaHora = parseFloat(entrenador.tarifa_hora)
    } else if (entrenador.tarifa_rutina !== undefined && entrenador.tarifa_rutina !== null) {
        tarifaHora = parseFloat(entrenador.tarifa_rutina)
    } else if (entrenador.tarifaHora !== undefined && entrenador.tarifaHora !== null) {
        tarifaHora = parseFloat(entrenador.tarifaHora)
    }
    
    const normalizado = {
        ...entrenador,
        // Mapear campos del backend a nombres del frontend
        especialidad: entrenador.especialidad_principal || entrenador.especialidad || '',
        experiencia_anos: entrenador.experiencia_anios !== undefined ? entrenador.experiencia_anios : (entrenador.experiencia_anos || 0),
        // Mantener campos originales también por compatibilidad
        apellido: entrenador.apellido || '',
        telefono: entrenador.telefono || '',
        genero: entrenador.genero || 'M',
        fecha_nacimiento: entrenador.fecha_nacimiento || '',
        tarifa_hora: tarifaHora,
        certificaciones: entrenador.certificaciones || '',
        biografia: entrenador.biografia || ''
    }
    
    console.log('🔄 NORMALIZACIÓN ENTRENADOR:', {
        '📥 ORIGINAL del backend': entrenador,
        '📤 NORMALIZADO para frontend': normalizado,
        '💰 Campos de tarifa encontrados': {
            tarifa_hora: entrenador.tarifa_hora,
            tarifa_rutina: entrenador.tarifa_rutina,
            tarifaHora: entrenador.tarifaHora,
            '✅ Valor final': normalizado.tarifa_hora
        },
        '📝 Biografía': {
            original: entrenador.biografia,
            normalizada: normalizado.biografia
        }
    })
    
    return normalizado
}

async function handleResponse(res) {
    const contentType = res.headers.get('content-type') || ''
    let body = null
    if (contentType.includes('application/json')) {
        body = await res.json()
    } else {
        body = await res.text()
    }
    if (!res.ok) {
        const msg = body?.message || (body && typeof body === 'string' ? body : res.statusText)
        throw new Error(msg || 'Error en la petición')
    }
    return body
}

// ============== PRODUCTOS ==============

export async function getProductos() {
    const res = await fetch(`${API_BASE}/productos`)
    return handleResponse(res)
}

export async function getProducto(id) {
    const res = await fetch(`${API_BASE}/productos/${id}`)
    return handleResponse(res)
}

export async function createProducto(data) {
    const res = await fetch(`${API_BASE}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function updateProducto(id, data) {
    const res = await fetch(`${API_BASE}/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function deleteProducto(id) {
    const res = await fetch(`${API_BASE}/productos/${id}`, { method: 'DELETE' })
    return handleResponse(res)
}

export async function venderProducto(id, cantidad) {
    const res = await fetch(`${API_BASE}/productos/${id}/vender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad }),
    })
    return handleResponse(res)
}

export async function getEstadisticasProductos() {
    const res = await fetch(`${API_BASE}/productos/estadisticas`)
    return handleResponse(res)
}

export async function getVentas() {
    const res = await fetch(`${API_BASE}/ventas`)
    return handleResponse(res)
}

export async function getGananciaProducto(id) {
    const res = await fetch(`${API_BASE}/productos/${id}/ganancia`)
    return handleResponse(res)
}

// ============== USUARIOS ==============

export async function getUsuarios() {
    const res = await fetch(`${API_BASE}/usuarios`)
    return handleResponse(res)
}

export async function getUsuario(id) {
    const res = await fetch(`${API_BASE}/usuarios/${id}`)
    return handleResponse(res)
}

export async function createUsuario(data) {
    const res = await fetch(`${API_BASE}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function updateUsuario(id, data) {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function deleteUsuario(id) {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' })
    return handleResponse(res)
}

export async function cambiarEstadoUsuario(id, estado) {
    const res = await fetch(`${API_BASE}/usuarios/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
    })
    return handleResponse(res)
}

export async function registrarVisita(id) {
    const res = await fetch(`${API_BASE}/usuarios/${id}/visita`, {
        method: 'POST',
    })
    return handleResponse(res)
}

export async function getEstadisticasUsuarios() {
    const res = await fetch(`${API_BASE}/usuarios/estadisticas`)
    return handleResponse(res)
}

// ============== EJERCICIOS ==============

export async function getEjercicios(filtros = {}) {
    const params = new URLSearchParams()
    if (filtros.grupo_muscular) params.append('grupo_muscular', filtros.grupo_muscular)
    if (filtros.tipo) params.append('tipo', filtros.tipo)
    if (filtros.nivel) params.append('nivel', filtros.nivel)
    
    const queryString = params.toString()
    const url = queryString ? `${API_BASE}/ejercicios?${queryString}` : `${API_BASE}/ejercicios`
    const res = await fetch(url)
    return handleResponse(res)
}

export async function getEjercicio(id) {
    const res = await fetch(`${API_BASE}/ejercicios/${id}`)
    return handleResponse(res)
}

export async function createEjercicio(data) {
    const res = await fetch(`${API_BASE}/ejercicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function updateEjercicio(id, data) {
    const res = await fetch(`${API_BASE}/ejercicios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function deleteEjercicio(id) {
    const res = await fetch(`${API_BASE}/ejercicios/${id}`, { method: 'DELETE' })
    return handleResponse(res)
}

// ============== RUTINAS ==============

export async function getRutinas(filtros = {}) {
    const params = new URLSearchParams()
    if (filtros.objetivo) params.append('objetivo', filtros.objetivo)
    if (filtros.nivel) params.append('nivel', filtros.nivel)
    if (filtros.tipo) params.append('tipo', filtros.tipo)
    
    const queryString = params.toString()
    const url = queryString ? `${API_BASE}/rutinas?${queryString}` : `${API_BASE}/rutinas`
    const res = await fetch(url)
    return handleResponse(res)
}

export async function getRutina(id) {
    const res = await fetch(`${API_BASE}/rutinas/${id}`)
    return handleResponse(res)
}

export async function createRutina(data) {
    const res = await fetch(`${API_BASE}/rutinas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function updateRutina(id, data) {
    const res = await fetch(`${API_BASE}/rutinas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function deleteRutina(id) {
    const res = await fetch(`${API_BASE}/rutinas/${id}`, { method: 'DELETE' })
    return handleResponse(res)
}

export async function addEjercicioToRutina(rutinaId, data) {
    const res = await fetch(`${API_BASE}/rutinas/${rutinaId}/ejercicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function updateEjercicioInRutina(rutinaId, ejercicioId, data) {
    const res = await fetch(`${API_BASE}/rutinas/${rutinaId}/ejercicios/${ejercicioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function deleteEjercicioFromRutina(rutinaId, ejercicioId) {
    const res = await fetch(`${API_BASE}/rutinas/${rutinaId}/ejercicios/${ejercicioId}`, { 
        method: 'DELETE' 
    })
    return handleResponse(res)
}

export async function getEstadisticasRutinas() {
    const res = await fetch(`${API_BASE}/rutinas/estadisticas`)
    return handleResponse(res)
}

// ============== ASIGNACIÓN DE RUTINAS A USUARIOS ==============

export async function getRutinasUsuario(usuarioId) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/rutinas`)
    return handleResponse(res)
}

export async function assignRutinaToUsuario(usuarioId, rutinaId, data = {}) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/rutinas/${rutinaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function updateAsignacionRutina(usuarioId, asignacionId, data) {
    const res = await fetch(`${API_BASE}/usuarios/${usuarioId}/rutinas/${asignacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

// ============== ENTRENADORES ==============

export async function getEntrenadores(filtros = {}) {
    // NO enviar ningún parámetro al backend para obtener TODOS los entrenadores
    // El filtrado se hace solo en el frontend
    const url = `${API_BASE}/entrenadores`
    console.log('🔗 URL llamada:', url)
    const res = await fetch(url)
    const data = await handleResponse(res)
    console.log('📦 Respuesta del backend:', data)
    console.log('📦 Total recibido:', Array.isArray(data) ? data.length : 0)
    return Array.isArray(data) ? data.map(normalizarEntrenador) : data
}

export async function getEntrenador(id) {
    const res = await fetch(`${API_BASE}/entrenadores/${id}`)
    const data = await handleResponse(res)
    return normalizarEntrenador(data)
}

export async function createEntrenador(data) {
    console.log('📤 Enviando nuevo entrenador al backend:', data)
    const res = await fetch(`${API_BASE}/entrenadores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    const result = await handleResponse(res)
    console.log('📥 Respuesta del backend al crear entrenador:', result)
    const normalizado = normalizarEntrenador(result)
    console.log('✅ Entrenador creado y normalizado:', normalizado)
    return normalizado
}

export async function updateEntrenador(id, data) {
    const res = await fetch(`${API_BASE}/entrenadores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    const result = await handleResponse(res)
    return normalizarEntrenador(result)
}

export async function deleteEntrenador(id) {
    const res = await fetch(`${API_BASE}/entrenadores/${id}`, { method: 'DELETE' })
    return handleResponse(res)
}

// Horarios de entrenadores
export async function getHorariosEntrenador(entrenadorId) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/horarios`)
    return handleResponse(res)
}

export async function createHorarioEntrenador(entrenadorId, data) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/horarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function deleteHorarioEntrenador(entrenadorId, horarioId) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/horarios/${horarioId}`, {
        method: 'DELETE'
    })
    return handleResponse(res)
}

// Clientes de entrenadores
export async function getClientesEntrenador(entrenadorId) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/clientes`)
    return handleResponse(res)
}

export async function asignarClienteEntrenador(entrenadorId, usuarioId, data = {}) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/clientes/${usuarioId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function quitarClienteEntrenador(entrenadorId, usuarioId) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/clientes/${usuarioId}`, {
        method: 'DELETE'
    })
    return handleResponse(res)
}

// Sesiones de entrenadores
export async function getSesionesEntrenador(entrenadorId) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/sesiones`)
    return handleResponse(res)
}

export async function createSesionEntrenador(entrenadorId, data) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/sesiones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

export async function updateSesion(sesionId, data) {
    const res = await fetch(`${API_BASE}/sesiones/${sesionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

// Valoraciones de entrenadores
export async function getValoracionesEntrenador(entrenadorId) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/valoraciones`)
    return handleResponse(res)
}

export async function createValoracionEntrenador(entrenadorId, data) {
    const res = await fetch(`${API_BASE}/entrenadores/${entrenadorId}/valoraciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return handleResponse(res)
}

// Estadísticas de entrenadores
export async function getEstadisticasEntrenadores() {
    const res = await fetch(`${API_BASE}/entrenadores/estadisticas`)
    return handleResponse(res)
}

export default {
    getProductos,
    getProducto,
    createProducto,
    updateProducto,
    deleteProducto,
    getGananciaProducto,
    getUsuarios,
    getEjercicios,
    getRutinas,
    getEntrenadores,
}
