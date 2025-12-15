// Auth utilities using backend API + localStorage session

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

export async function registerUser({ name, email, password }) {
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    })
    const body = await handleResponse(res)
    // Store session using returned user (backend should return user or token)
    localStorage.setItem('rg_session', JSON.stringify({ user: body }))
    return body
}

export async function loginUser({ email, password }) {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    const body = await handleResponse(res)
    localStorage.setItem('rg_session', JSON.stringify({ user: body }))
    return body
}

export function logout() {
    localStorage.removeItem('rg_session')
}

export function getCurrentUser() {
    try {
        const sess = JSON.parse(localStorage.getItem('rg_session') || 'null')
        if (!sess) return null
        return sess.user || null
    } catch (e) {
        return null
    }
}

export function updateUser(updatedData) {
    try {
        const sess = JSON.parse(localStorage.getItem('rg_session') || 'null')
        if (!sess) return null
        const user = { ...(sess.user || {}), ...updatedData }
        localStorage.setItem('rg_session', JSON.stringify({ user }))
        return user
    } catch (e) {
        return null
    }
}
