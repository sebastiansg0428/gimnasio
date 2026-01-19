// Sistema de eventos para comunicación entre componentes
class EventEmitter {
    constructor() {
        this.events = {}
    }

    // Suscribirse a un evento
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push(callback)
        
        // Retornar función para desuscribirse
        return () => this.off(event, callback)
    }

    // Desuscribirse de un evento
    off(event, callback) {
        if (!this.events[event]) return
        this.events[event] = this.events[event].filter(cb => cb !== callback)
    }

    // Emitir un evento
    emit(event, data) {
        console.log(`📢 Evento emitido: ${event}`, data)
        if (!this.events[event]) return
        this.events[event].forEach(callback => {
            try {
                callback(data)
            } catch (error) {
                console.error(`Error en listener del evento ${event}:`, error)
            }
        })
    }

    // Limpiar todos los eventos
    clear() {
        this.events = {}
    }
}

// Instancia global del EventEmitter
const eventBus = new EventEmitter()

// Eventos predefinidos del sistema
export const EVENTS = {
    // Pagos y ventas
    PAGO_CREATED: 'pago:created',
    PAGO_UPDATED: 'pago:updated',
    VENTA_CREATED: 'venta:created',
    COMPRA_REALIZADA: 'compra:realizada',
    
    // Usuarios
    USUARIO_CREATED: 'usuario:created',
    USUARIO_UPDATED: 'usuario:updated',
    USUARIO_DELETED: 'usuario:deleted',
    VISITA_REGISTRADA: 'visita:registrada',
    
    // Productos
    PRODUCTO_CREATED: 'producto:created',
    PRODUCTO_UPDATED: 'producto:updated',
    PRODUCTO_VENDIDO: 'producto:vendido',
    
    // Rutinas
    RUTINA_CREATED: 'rutina:created',
    RUTINA_ASIGNADA: 'rutina:asignada',
    
    // Dashboard
    DASHBOARD_REFRESH: 'dashboard:refresh',
    INGRESOS_UPDATED: 'ingresos:updated',
    
    // Generales
    DATA_UPDATED: 'data:updated',
    NOTIFICATION: 'notification'
}

// Helpers para eventos comunes
export const emitRefreshDashboard = () => {
    eventBus.emit(EVENTS.DASHBOARD_REFRESH)
    eventBus.emit(EVENTS.INGRESOS_UPDATED)
}

export const emitCompraRealizada = (compraData) => {
    eventBus.emit(EVENTS.COMPRA_REALIZADA, compraData)
    eventBus.emit(EVENTS.VENTA_CREATED, compraData)
    emitRefreshDashboard()
}

export const emitPagoCreated = (pagoData) => {
    eventBus.emit(EVENTS.PAGO_CREATED, pagoData)
    emitRefreshDashboard()
}

export const emitUsuarioCreated = (usuarioData) => {
    eventBus.emit(EVENTS.USUARIO_CREATED, usuarioData)
    eventBus.emit(EVENTS.DASHBOARD_REFRESH)
}

export const emitProductoVendido = (productoData) => {
    eventBus.emit(EVENTS.PRODUCTO_VENDIDO, productoData)
    emitRefreshDashboard()
}

export const emitNotification = (type, message, data = {}) => {
    eventBus.emit(EVENTS.NOTIFICATION, { type, message, data })
}

export default eventBus
