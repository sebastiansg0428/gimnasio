// Configuración de la aplicación
export const API_URL = 'http://localhost:3001'

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

// Verificar conexión con el backend
export async function checkBackendConnection() {
    try {
        const token = getAuthToken()
        const headers = { 'Content-Type': 'application/json' }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        
        const response = await fetch(`${API_URL}/usuarios`, { headers })
        if (response.ok) {
            console.log('✅ Conexión exitosa con el backend')
            return true
        } else {
            console.warn('⚠️ El backend respondió con error:', response.status)
            return false
        }
    } catch (error) {
        console.error('❌ No se pudo conectar con el backend:', error.message)
        console.error('Asegúrate de que el servidor esté corriendo en', API_URL)
        return false
    }
}
