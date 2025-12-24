const API_BASE_URL = 'http://localhost:3001'

// Función helper para hacer requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    try {
        const response = await fetch(url, config)
        const contentType = response.headers.get('content-type') || ''
        let data = null
        
        if (contentType.includes('application/json')) {
            data = await response.json()
        } else {
            data = await response.text()
        }
        
        if (!response.ok) {
            const msg = data?.message || (typeof data === 'string' ? data : 'Error en la petición')
            throw new Error(msg)
        }
        
        return data
    } catch (error) {
        console.error('API Error:', error)
        throw error
    }
}

// USUARIOS
export const usuariosAPI = {
    getUsuarios: () => apiRequest('/usuarios'),
    getUsuario: (id) => apiRequest(`/usuarios/${id}`),
    updateUsuario: (id, data) => apiRequest(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    cambiarEstado: (id, estado) => apiRequest(`/usuarios/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado })
    }),
    deleteUsuario: (id) => apiRequest(`/usuarios/${id}`, { method: 'DELETE' }),
    registrarVisita: (id) => apiRequest(`/usuarios/${id}/visita`, { method: 'POST' }),
    getEstadisticas: () => apiRequest('/usuarios/estadisticas')
}

// PRODUCTOS
export const productosAPI = {
    getProductos: (filtros = {}) => {
        const params = new URLSearchParams(filtros)
        return apiRequest(`/productos?${params}`)
    },
    getProducto: (id) => apiRequest(`/productos/${id}`),
    createProducto: (data) => apiRequest('/productos', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateProducto: (id, data) => apiRequest(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteProducto: (id) => apiRequest(`/productos/${id}`, { method: 'DELETE' }),
    venderProducto: (id, cantidad) => apiRequest(`/productos/${id}/vender`, {
        method: 'POST',
        body: JSON.stringify({ cantidad })
    }),
    getEstadisticas: () => apiRequest('/productos/estadisticas'),
    getVentas: () => apiRequest('/ventas')
}

// AUTH
export const authAPI = {
    login: (email, password) => apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),
    register: (userData) => apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    })
}