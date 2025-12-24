const API_BASE = 'http://localhost:3001'

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
}
