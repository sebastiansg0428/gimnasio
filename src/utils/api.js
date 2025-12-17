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
        const msg = body && body.message ? body.message : (body && typeof body === 'string' ? body : res.statusText)
        throw new Error(msg || 'Error en la petición')
    }
    return body
}

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

export async function getGananciaProducto(id) {
    const res = await fetch(`${API_BASE}/productos/${id}/ganancia`)
    return handleResponse(res)
}

export async function getUsuarios() {
    const res = await fetch(`${API_BASE}/usuarios`)
    return handleResponse(res)
}

// Rutinas
export async function getRutinas() {
    const res = await fetch(`${API_BASE}/rutinas`)
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

export default {
    getProductos,
    getProducto,
    createProducto,
    updateProducto,
    deleteProducto,
    getGananciaProducto,
    getUsuarios,
}
