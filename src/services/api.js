const API_BASE_URL = 'http://localhost:3001'

// Obtener token de autenticación
function getAuthToken() {
    try {
        const session = localStorage.getItem('rg_session')
        if (!session) return null
        const parsed = JSON.parse(session)
        return parsed?.token || parsed?.user?.token || null
    } catch (error) {
        return null
    }
}

// Función helper para hacer requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const token = getAuthToken()
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    }

    try {
        console.log(`🔵 API Request: ${options.method || 'GET'} ${url}`)
        const response = await fetch(url, config)
        console.log(`✅ API Response: ${response.status} ${response.statusText}`)
        
        const contentType = response.headers.get('content-type') || ''
        let data = null
        
        if (contentType.includes('application/json')) {
            data = await response.json()
        } else {
            data = await response.text()
        }
        
        if (!response.ok) {
            const msg = data?.message || (typeof data === 'string' ? data : 'Error en la petición')
            console.error(`❌ API Error: ${response.status} - ${msg}`)
            throw new Error(msg)
        }
        
        console.log(`📦 API Data:`, data)
        return data
    } catch (error) {
        // Detectar error de CORS
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            console.error('🚫 ERROR DE CORS: El backend no permite peticiones desde el frontend')
            console.error('Soluciones:')
            console.error('1. Verifica que el backend esté corriendo en http://localhost:3001')
            console.error('2. Asegúrate de que el backend tenga CORS configurado correctamente')
            console.error('3. Revisa la consola del navegador para más detalles')
            throw new Error('Error de conexión con el backend. Verifica que esté corriendo y tenga CORS habilitado.')
        }
        console.error('❌ API Error:', error)
        throw error
    }
}

// USUARIOS
export const usuariosAPI = {
    getUsuarios: (filtros = {}) => {
        // Construir query string con filtros: ?estado=activo&membresia=MENSUAL&vencidas=true
        const params = new URLSearchParams()
        if (filtros.estado) params.append('estado', filtros.estado)
        if (filtros.membresia) params.append('membresia', filtros.membresia)
        if (filtros.vencidas) params.append('vencidas', filtros.vencidas)
        if (filtros.nombre) params.append('nombre', filtros.nombre)
        if (filtros.apellido) params.append('apellido', filtros.apellido)
        if (filtros.email) params.append('email', filtros.email)
        
        const queryString = params.toString()
        return apiRequest(queryString ? `/usuarios?${queryString}` : '/usuarios')
    },
    getUsuario: (id) => apiRequest(`/usuarios/${id}`),
    createCliente: (data) => apiRequest('/admin/clientes', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
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
        // Solo agregar parámetros si realmente hay filtros
        const keys = Object.keys(filtros)
        if (keys.length > 0) {
            const params = new URLSearchParams(filtros)
            return apiRequest(`/productos?${params}`)
        }
        return apiRequest('/productos')
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

// PAGOS
export const pagosAPI = {
    getPagos: (filtros = {}) => {
        const params = new URLSearchParams(filtros)
        return apiRequest(`/pagos?${params}`)
    },
    getPago: (id) => apiRequest(`/pagos/${id}`),
    createPago: (data) => apiRequest('/pagos', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updatePago: (id, data) => apiRequest(`/pagos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deletePago: (id) => apiRequest(`/pagos/${id}`, { method: 'DELETE' }),
    renovarMembresia: (data) => apiRequest('/pagos/renovar-membresia', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getEstadisticas: () => apiRequest('/pagos/estadisticas'),
    getEstadisticasMembresias: () => apiRequest('/pagos/estadisticas/membresias'),
    getEstadisticasProductos: () => apiRequest('/pagos/estadisticas/productos'),
    getEstadisticasSesiones: () => apiRequest('/pagos/estadisticas/sesiones')
}

// SESIONES
export const sesionesAPI = {
    getSesiones: (filtros = {}) => {
        const params = new URLSearchParams(filtros)
        const query = params.toString()
        return apiRequest(query ? `/sesiones?${query}` : '/sesiones')
    },
    getSesion: (id) => apiRequest(`/sesiones/${id}`),
    createSesion: (data) => apiRequest('/sesiones', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateSesion: (id, data) => apiRequest(`/sesiones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteSesion: (id) => apiRequest(`/sesiones/${id}`, { method: 'DELETE' })
}

// DASHBOARD
export const dashboardAPI = {
    getDashboard: () => apiRequest('/dashboard')
}

// REPORTES
export const reportesAPI = {
    getIngresosMensuales: () => apiRequest('/reportes/ingresos-mensuales'),
    getUsuariosNuevos: () => apiRequest('/reportes/usuarios-nuevos-mensuales'),
    getProductosMasVendidos: () => apiRequest('/reportes/productos-mas-vendidos'),
    getRutinasPopulares: () => apiRequest('/reportes/rutinas-populares'),
    getMembresiasPorVencer: () => apiRequest('/reportes/usuarios-con-membresia-por-vencer'),
    getUsuariosInactivos: () => apiRequest('/reportes/usuarios-inactivos'),
    getVentasPorUsuario: () => apiRequest('/reportes/ventas-por-usuario'),
    getVentasPorProducto: () => apiRequest('/reportes/ventas-por-producto')
}

// FACTURAS
export const facturasAPI = {
    getFacturas: (filtros = {}) => {
        const params = new URLSearchParams(filtros)
        const query = params.toString()
        return apiRequest(query ? `/facturas?${query}` : '/facturas')
    },
    getFactura: (id) => apiRequest(`/facturas/${id}`),
    createFactura: (data) => apiRequest('/facturas', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateFactura: (id, data) => apiRequest(`/facturas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteFactura: (id) => apiRequest(`/facturas/${id}`, { method: 'DELETE' })
}

// RBAC
export const rbacAPI = {
    getRoles: () => apiRequest('/rbac/roles'),
    getPermisos: () => apiRequest('/rbac/permisos'),
    getRolPermisos: (rolNombre) => apiRequest(`/rbac/roles/${rolNombre}/permisos`),
    getUsuarioRoles: (id) => apiRequest(`/rbac/usuarios/${id}/roles`),
    asignarRol: (id, rolNombre) => apiRequest(`/rbac/usuarios/${id}/roles`, {
        method: 'POST',
        body: JSON.stringify({ rol: rolNombre })
    }),
    revocarRol: (id, rolNombre) => apiRequest(`/rbac/usuarios/${id}/roles/${rolNombre}`, {
        method: 'DELETE'
    }),
    createRol: (data) => apiRequest('/rbac/roles', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    createPermiso: (data) => apiRequest('/rbac/permisos', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getEstadisticas: () => apiRequest('/rbac/estadisticas'),
    getMe: () => apiRequest('/me')
}