// Configuración de la aplicación
export const API_URL = 'http://localhost:3001'

// Verificar conexión con el backend
export async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_URL}/usuarios`)
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
