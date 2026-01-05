// ClientesTab.jsx
import React, { useState, useEffect } from 'react'
import { usuariosAPI, authAPI, pagosAPI } from '../services/api'
import { getRutinas, getRutinasUsuario, assignRutinaToUsuario } from '../utils/api'
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Input,
    HStack,
    VStack,
    Select,
    Text,
    Badge,
    IconButton,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Tooltip,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    Divider,
    Checkbox,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from '@chakra-ui/react'
import { FiMoreVertical, FiSearch, FiUser, FiUserPlus, FiX, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock, FiDollarSign } from 'react-icons/fi'

// Función helper para formatear fechas
const formatearFecha = (fecha) => {
    if (!fecha || fecha === 'NULL' || fecha === null || fecha === 'undefined') {
        return '-'
    }
    
    // Si la fecha ya viene formateada desde el backend (DD/MM/YYYY o con hora)
    if (typeof fecha === 'string' && (fecha.includes('/') || fecha.match(/^\d{2}\/\d{2}\/\d{4}/))) {
        // Extraer solo la fecha sin la hora si existe
        return fecha.split(' ')[0]
    }
    
    // Si viene en formato ISO (YYYY-MM-DD o con hora)
    try {
        const fechaParseada = new Date(fecha.includes('T') ? fecha : fecha + 'T00:00:00')
        if (isNaN(fechaParseada.getTime())) return fecha // Devolver tal cual si no se puede parsear
        
        return fechaParseada.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    } catch (error) {
        return fecha // Devolver tal cual en caso de error
    }
}

// Función helper para formatear género
const formatearGenero = (genero) => {
    if (!genero) return '-'
    const generoUpper = genero.toUpperCase()
    if (generoUpper === 'M' || generoUpper === 'MASCULINO') return 'Masculino'
    if (generoUpper === 'F' || generoUpper === 'FEMENINO') return 'Femenino'
    return 'Otro'
}

// Función helper para obtener color del badge de género
const getGeneroColor = (genero) => {
    if (!genero) return 'gray'
    const generoUpper = genero.toUpperCase()
    if (generoUpper === 'M' || generoUpper === 'MASCULINO') return 'blue'
    if (generoUpper === 'F' || generoUpper === 'FEMENINO') return 'pink'
    return 'gray'
}

// Función helper para calcular días hasta vencimiento
const calcularDiasVencimiento = (fechaVencimiento) => {
    if (!fechaVencimiento || fechaVencimiento === '-') return null
    try {
        // Parsear fecha en formato DD/MM/YYYY
        let fecha
        if (fechaVencimiento.includes('/')) {
            const [dia, mes, año] = fechaVencimiento.split('/')
            fecha = new Date(año, mes - 1, dia)
        } else {
            fecha = new Date(fechaVencimiento)
        }
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const diferencia = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24))
        return diferencia
    } catch {
        return null
    }
}

// Función helper para obtener estado de membresía
const getEstadoMembresia = (fechaVencimiento) => {
    const dias = calcularDiasVencimiento(fechaVencimiento)
    if (dias === null) return { estado: 'sin-fecha', color: 'gray', texto: 'Sin fecha' }
    if (dias < 0) return { estado: 'vencida', color: 'red', texto: 'Vencida' }
    if (dias <= 7) return { estado: 'por-vencer', color: 'orange', texto: `Vence en ${dias}d` }
    if (dias <= 15) return { estado: 'proximo', color: 'yellow', texto: `${dias} días` }
    return { estado: 'activa', color: 'green', texto: `${dias} días` }
}

// Lista inicial vacía: mostrar solo usuarios provenientes del backend

export default function ClientesTab() {
    const STORAGE_KEY = 'rg_clients'

    const [clientes, setClientes] = useState([])
    const [pagosMap, setPagosMap] = useState({}) // Mapa de pagos por usuario_id

    // Estado real que aplica el filtro
    const [busqueda, setBusqueda] = useState('')
    // Estado intermedio del input para debounce
    const [inputValue, setInputValue] = useState('')
    const [filtroMembresia, setFiltroMembresia] = useState('todos')
    const toast = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isPagoOpen, setIsPagoOpen] = useState(false)
    const [selectedClienteForPago, setSelectedClienteForPago] = useState(null)
    const [nuevoPago, setNuevoPago] = useState({
        tipo_pago: 'membresia',
        monto: '',
        metodo_pago: 'efectivo',
        concepto: ''
    })
    const [newUser, setNewUser] = useState({ 
        nombre: '', 
        apellido: '',
        email: '', 
        password: '', 
        telefono: '',
        fecha_nacimiento: '',
        genero: '',
        membresia: 'DIARIA',
        precio_membresia: '',
        metodo_pago: 'efectivo',
        registrar_pago: true
    })

    const openModal = () => setIsOpen(true)
    const closeModal = () => {
        setIsOpen(false)
        setNewUser({ 
            nombre: '', 
            apellido: '',
            email: '', 
            password: '', 
            telefono: '',
            fecha_nacimiento: '',
            genero: '',
            membresia: 'DIARIA',
            precio_membresia: '',
            metodo_pago: 'efectivo',
            registrar_pago: true
        })
    }
    const [isAssignOpen, setIsAssignOpen] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [rutinasDisponibles, setRutinasDisponibles] = useState([])
    const [selectedClienteForAssign, setSelectedClienteForAssign] = useState(null)
    const [selectedClienteForEdit, setSelectedClienteForEdit] = useState(null)
    const [editData, setEditData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        genero: '',
        membresia: 'DIARIA',
        precio_membresia: '',
        estado: 'activo',
        renovar_membresia: false
    })
    const [selectedRutinaId, setSelectedRutinaId] = useState(null)
    const [assignedRutinas, setAssignedRutinas] = useState([])

    const openAssignModal = async (cliente) => {
        setSelectedClienteForAssign(cliente)
        setSelectedRutinaId(null)
        try {
            const data = await getRutinas()
            setRutinasDisponibles(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error cargando rutinas', err)
            setRutinasDisponibles([])
        }
        setIsAssignOpen(true)
    }

    const closeAssignModal = () => {
        setIsAssignOpen(false)
        setSelectedClienteForAssign(null)
    }

    const openDetailsModal = async (cliente) => {
        try {
            const data = await getRutinasUsuario(cliente.id)
            setAssignedRutinas(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error cargando rutinas asignadas', err)
            setAssignedRutinas([])
        }
        setIsDetailsOpen(true)
    }

    const closeDetailsModal = () => setIsDetailsOpen(false)

    const openEditModal = (cliente) => {
        setSelectedClienteForEdit(cliente)
        setEditData({
            nombre: cliente.nombre || '',
            apellido: cliente.apellido || '',
            email: cliente.email || '',
            telefono: cliente.telefono || '',
            fecha_nacimiento: cliente.fecha_nacimiento || '',
            genero: cliente.genero || '',
            membresia: cliente.membresia || 'DIARIA',
            precio_membresia: cliente.precio_membresia || '',
            estado: cliente.estado || 'activo',
            renovar_membresia: false
        })
        setIsEditOpen(true)
    }

    const closeEditModal = () => {
        setIsEditOpen(false)
        setSelectedClienteForEdit(null)
    }

    const handleEditUsuario = async () => {
        if (!selectedClienteForEdit) return
        
        try {
            console.log('🔄 EDITANDO USUARIO:', {
                id: selectedClienteForEdit.id,
                datosActuales: selectedClienteForEdit,
                datosNuevos: editData
            })
            
            // Si cambió el estado, usar el endpoint específico
            if (editData.estado !== selectedClienteForEdit.estado) {
                console.log('🔄 CAMBIANDO ESTADO de', selectedClienteForEdit.estado, 'a', editData.estado)
                await usuariosAPI.cambiarEstado(selectedClienteForEdit.id, editData.estado)
                console.log('✅ ESTADO ACTUALIZADO')
            }
            
            // Actualizar el resto de datos del usuario (sin el estado, ya se actualizó arriba)
            const { estado, ...datosRestantes } = editData
            const resultado = await usuariosAPI.updateUsuario(selectedClienteForEdit.id, datosRestantes)
            console.log('✅ USUARIO ACTUALIZADO:', resultado)
            
            // Si se marcó renovar membresía, registrar nuevo pago
            if (editData.renovar_membresia && editData.precio_membresia) {
                const pagoData = {
                    usuario_id: selectedClienteForEdit.id,
                    tipo_pago: 'membresia',
                    monto: parseFloat(editData.precio_membresia),
                    metodo_pago: 'efectivo',
                    estado: 'completado',
                    concepto: `Renovación membresía ${editData.membresia}`,
                    fecha_pago: new Date().toISOString().split('T')[0]
                }
                
                try {
                    await pagosAPI.createPago(pagoData)
                    toast({ 
                        title: '✅ Membresía renovada', 
                        description: 'Pago registrado exitosamente',
                        status: 'success', 
                        duration: 2000 
                    })
                } catch (errPago) {
                    console.error('Error al registrar pago:', errPago)
                    toast({ 
                        title: '⚠️ Usuario actualizado', 
                        description: 'Pero no se pudo registrar el pago',
                        status: 'warning', 
                        duration: 3000 
                    })
                }
            }
            
            // Recargar todos los datos
            console.log('🔄 RECARGANDO DATOS...')
            await refrescarDatos()
            console.log('✅ DATOS RECARGADOS')
            
            toast({ 
                title: '✅ Usuario actualizado', 
                status: 'success', 
                duration: 2000 
            })
            closeEditModal()
        } catch (err) {
            console.error('Error al actualizar usuario:', err)
            toast({ 
                title: 'Error al actualizar usuario', 
                description: err.message,
                status: 'error', 
                duration: 3000 
            })
        }
    }

    // Funciones para modal de pago
    const openPagoModal = (cliente) => {
        setSelectedClienteForPago(cliente)
        setNuevoPago({
            tipo_pago: 'membresia',
            monto: cliente.precio_membresia || '',
            metodo_pago: 'efectivo',
            concepto: `Pago de ${cliente.membresia || 'membresía'} - ${cliente.nombre} ${cliente.apellido}`
        })
        setIsPagoOpen(true)
    }

    const closePagoModal = () => {
        setIsPagoOpen(false)
        setSelectedClienteForPago(null)
        setNuevoPago({
            tipo_pago: 'membresia',
            monto: '',
            metodo_pago: 'efectivo',
            concepto: ''
        })
    }

    const handleRegistrarPago = async () => {
        if (!selectedClienteForPago) return
        
        if (!nuevoPago.monto || parseFloat(nuevoPago.monto) <= 0) {
            toast({
                title: 'El monto es requerido',
                status: 'warning',
                duration: 2000
            })
            return
        }

        try {
            console.log('💳 REGISTRANDO PAGO PARA CLIENTE:', selectedClienteForPago.id)
            
            const pagoData = {
                usuario_id: selectedClienteForPago.id,
                tipo_pago: nuevoPago.tipo_pago,
                monto: parseFloat(nuevoPago.monto),
                metodo_pago: nuevoPago.metodo_pago,
                estado: 'completado',
                concepto: nuevoPago.concepto || `Pago de ${nuevoPago.tipo_pago}`,
                fecha_pago: new Date().toISOString().split('T')[0]
            }
            
            console.log('📤 DATOS QUE SE ENVÍAN AL BACKEND:', JSON.stringify(pagoData, null, 2))
            const pagoCreado = await pagosAPI.createPago(pagoData)
            console.log('✅ RESPUESTA COMPLETA DEL BACKEND:', JSON.stringify(pagoCreado, null, 2))
            console.log('🔍 ESTADO RECIBIDO:', pagoCreado?.estado || pagoCreado?.pago?.estado)
            
            if (pagoCreado?.estado === 'pendiente' || pagoCreado?.pago?.estado === 'pendiente') {
                console.warn('⚠️ EL BACKEND DEVUELVE ESTADO PENDIENTE - Revisar código del backend')
            }

            const estadoRecibido = pagoCreado?.estado || pagoCreado?.pago?.estado || 'desconocido'
            toast({
                title: '✅ Pago registrado',
                description: `${nuevoPago.tipo_pago === 'producto' ? 'Producto' : 'Membresía'} - $${parseFloat(nuevoPago.monto).toLocaleString('es-CO')} | Estado: ${estadoRecibido.toUpperCase()}`,
                status: estadoRecibido === 'completado' ? 'success' : 'warning',
                duration: 5000,
                isClosable: true
            })

            closePagoModal()
            await refrescarDatos()
            
            // Disparar evento para actualizar otras pestañas
            window.dispatchEvent(new CustomEvent('clienteCreado'))

        } catch (error) {
            console.error('❌ ERROR AL REGISTRAR PAGO:', error)
            toast({
                title: 'Error al registrar pago',
                description: error.message || 'Intenta nuevamente',
                status: 'error',
                duration: 4000,
                isClosable: true
            })
        }
    }

    // Persistir clientes en localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes))
        } catch (e) {
            // ignore storage errors
            // console.error(e)
        }
    }, [clientes])

    // Debounce: cuando inputValue cambia, espera 350ms y aplica a `busqueda`
    useEffect(() => {
        const t = setTimeout(() => {
            setBusqueda(inputValue)
        }, 350)
        return () => clearTimeout(t)
    }, [inputValue])

    // Obtener usuarios desde backend y reflejar en tabla de clientes
    useEffect(() => {
        let mounted = true

        async function fetchUsuarios() {
            try {
                const usuarios = await usuariosAPI.getUsuarios()
                
                // Cargar todos los pagos de membresía
                const pagos = await pagosAPI.getPagos({ tipo_pago: 'membresia' })
                
                // Crear mapa de último pago por usuario
                const pagosporUsuario = {}
                if (Array.isArray(pagos)) {
                    pagos.forEach(pago => {
                        const userId = pago.usuario_id
                        if (!pagosporUsuario[userId] || new Date(pago.fecha_pago) > new Date(pagosporUsuario[userId].fecha_pago)) {
                            pagosporUsuario[userId] = pago
                        }
                    })
                }
                
                if (mounted) setPagosMap(pagosporUsuario)
                
                // Mapear usuarios a formato correcto según la base de datos
                const clientesDeUsuarios = (usuarios || []).map((user) => ({
                    id: user.id,
                    nombre: user.nombre || '',
                    apellido: user.apellido || '',
                    email: user.email || '',
                    telefono: user.telefono || '',
                    fecha_nacimiento: user.fecha_nacimiento || null,
                    genero: user.genero || '',
                    membresia: (user.membresia || 'DIARIA').toUpperCase(),
                    estado: user.estado || 'activo',
                    fecha_vencimiento: user.fecha_vencimiento || null,
                    fecha_inicio_membresia: user.fecha_inicio_membresia || null,
                    precio_membresia: user.precio_membresia || 0,
                    ultima_visita: user.ultima_visita || null,
                    total_visitas: user.total_visitas || 0,
                    created_at: user.created_at || null,
                    updated_at: user.updated_at || null,
                }))

                if (mounted) setClientes(clientesDeUsuarios)
            } catch (e) {
                console.error('Error cargando usuarios:', e)
                if (mounted) setClientes([])
            }
        }

        fetchUsuarios()
        const interval = setInterval(fetchUsuarios, 5000)
        return () => { mounted = false; clearInterval(interval) }
    }, [])

    // Filtrar clientes basado en búsqueda y filtro de membresía
    const clientesFiltrados = clientes.filter((cliente) => {
        const q = busqueda.trim().toLowerCase()
        const coincideBusqueda =
            q === '' ||
            (cliente.nombre && cliente.nombre.toLowerCase().includes(q)) ||
            (cliente.apellido && cliente.apellido.toLowerCase().includes(q)) ||
            (cliente.email && cliente.email.toLowerCase().includes(q)) ||
            (cliente.telefono && cliente.telefono.includes(q))
        const coincideMembresia =
            filtroMembresia === 'todos' ||
            (cliente.membresia && cliente.membresia.toLowerCase() === filtroMembresia.toLowerCase())
        return coincideBusqueda && coincideMembresia
    })
    
    console.log('🔍 FILTRO DE CLIENTES:', {
        totalClientes: clientes.length,
        clientesFiltrados: clientesFiltrados.length,
        estadosEnLista: clientes.map(c => ({ id: c.id, nombre: c.nombre, estado: c.estado })),
        filtroMembresia,
        busqueda
    })


    const handleAccion = (accion, cliente) => {
        if (accion === 'rutina') return openAssignModal(cliente)
        if (accion === 'ver') return openDetailsModal(cliente)
        if (accion === 'editar') return openEditModal(cliente)
        if (accion === 'pago') return openPagoModal(cliente)
        
        if (accion === 'visita') {
            usuariosAPI.registrarVisita(cliente.id)
                .then(() => {
                    setClientes(prev => prev.map(c => 
                        c.id === cliente.id ? { 
                            ...c, 
                            total_visitas: (c.total_visitas || 0) + 1,
                            ultima_visita: new Date().toLocaleDateString('es-ES')
                        } : c
                    ))
                    toast({ 
                        title: '✅ Visita registrada', 
                        description: `Cliente: ${cliente.nombre} ${cliente.apellido}`,
                        status: 'success', 
                        duration: 2000 
                    })
                })
                .catch(err => {
                    console.error(err)
                    toast({ title: 'Error al registrar visita', status: 'error', duration: 3000 })
                })
            return
        }
        
        if (accion === 'activar') {
            usuariosAPI.cambiarEstado(cliente.id, 'activo')
                .then(() => {
                    setClientes(prev => prev.map(c => 
                        c.id === cliente.id ? { ...c, estado: 'activo' } : c
                    ))
                    toast({ title: 'Usuario activado', status: 'success', duration: 2000 })
                })
                .catch(err => {
                    console.error(err)
                    toast({ title: 'Error al activar usuario', status: 'error', duration: 3000 })
                })
            return
        }
        
        if (accion === 'desactivar') {
            usuariosAPI.cambiarEstado(cliente.id, 'inactivo')
                .then(() => {
                    setClientes(prev => prev.map(c => 
                        c.id === cliente.id ? { ...c, estado: 'inactivo' } : c
                    ))
                    toast({ title: 'Usuario desactivado', status: 'info', duration: 2000 })
                })
                .catch(err => {
                    console.error(err)
                    toast({ title: 'Error al desactivar usuario', status: 'error', duration: 3000 })
                })
            return
        }
        
        toast({
            title: `Acción: ${accion}`,
            description: `Para cliente: ${cliente.nombre}`,
            status: 'info',
            duration: 2000,
        })
    }

    async function handleCrearUsuario() {
        // Validaciones
        if (!newUser.nombre || !newUser.nombre.trim()) {
            toast({ title: 'El nombre es obligatorio', status: 'warning', duration: 2000 })
            return
        }
        if (!newUser.email || !newUser.email.trim()) {
            toast({ title: 'El email es obligatorio', status: 'warning', duration: 2000 })
            return
        }
        if (!newUser.password || newUser.password.length < 6) {
            toast({ title: 'La contraseña debe tener al menos 6 caracteres', status: 'warning', duration: 2000 })
            return
        }
        if (newUser.registrar_pago && (!newUser.precio_membresia || newUser.precio_membresia <= 0)) {
            toast({ title: 'El precio de la membresía es obligatorio', status: 'warning', duration: 2000 })
            return
        }
        
        try {
            console.log('🔄 INICIANDO CREACIÓN DE CLIENTE...')
            
            // El backend ahora calcula automáticamente la fecha_vencimiento según el tipo de membresía
            const payload = { 
                nombre: newUser.nombre.trim(),
                apellido: newUser.apellido?.trim() || '',
                email: newUser.email.trim(),
                password: newUser.password,
                telefono: newUser.telefono?.trim() || null,
                fecha_nacimiento: newUser.fecha_nacimiento || null,
                genero: newUser.genero || null,
                membresia: newUser.membresia || 'DIARIA',
                precio_membresia: newUser.registrar_pago ? parseFloat(newUser.precio_membresia) : null
            }
            
            console.log('📦 Payload enviado al backend:', payload)
            console.log('✨ El backend calculará automáticamente fecha_vencimiento según membresía:', newUser.membresia)
            
            const usuarioCreado = await authAPI.register(payload)
            console.log('✅ CLIENTE CREADO:', usuarioCreado)
            
            // Si se debe registrar el pago
            if (newUser.registrar_pago && usuarioCreado?.usuario?.id) {
                console.log('💳 REGISTRANDO PAGO DE MEMBRESÍA...')
                
                const fechaInicio = new Date()
                const pagoData = {
                    usuario_id: usuarioCreado.usuario.id,
                    tipo_pago: 'membresia',
                    monto: parseFloat(newUser.precio_membresia),
                    metodo_pago: newUser.metodo_pago || 'efectivo',
                    estado: 'completado',
                    concepto: `Membresía ${newUser.membresia} - ${payload.nombre} ${payload.apellido}`,
                    fecha_pago: fechaInicio.toISOString().split('T')[0]
                }
                
                try {
                    const pagoCreado = await pagosAPI.createPago(pagoData)
                    console.log('✅ PAGO REGISTRADO:', pagoCreado)
                    
                    toast({ 
                        title: '✅ Cliente y Pago Registrados', 
                        description: `${payload.nombre} ${payload.apellido} - Membresía ${newUser.membresia} ($${parseFloat(newUser.precio_membresia).toLocaleString('es-CO')})`,
                        status: 'success', 
                        duration: 4000,
                        isClosable: true
                    })
                } catch (errPago) {
                    console.error('❌ ERROR AL REGISTRAR PAGO:', errPago)
                    toast({ 
                        title: '⚠️ Cliente creado pero sin pago', 
                        description: `El cliente fue creado pero el pago no se registró: ${errPago.message}`,
                        status: 'warning', 
                        duration: 4000,
                        isClosable: true
                    })
                }
            } else {
                toast({ 
                    title: '✅ Cliente creado', 
                    description: `${payload.nombre} ${payload.apellido} registrado exitosamente`,
                    status: 'success', 
                    duration: 3000 
                })
            }
            
            closeModal()
            
            // Recargar usuarios desde el backend
            console.log('🔄 RECARGANDO DATOS DEL SISTEMA...')
            await refrescarDatos()
            console.log('✅ DATOS ACTUALIZADOS')
            
            // Disparar evento personalizado para actualizar otras pestañas
            window.dispatchEvent(new CustomEvent('clienteCreado', { 
                detail: { 
                    cliente: usuarioCreado.usuario,
                    pagado: newUser.registrar_pago
                } 
            }))
            
        } catch (err) {
            console.error('❌ ERROR COMPLETO:', err)
            toast({ 
                title: 'Error al crear cliente', 
                description: err.message || 'Verifica los datos e intenta nuevamente',
                status: 'error', 
                duration: 4000,
                isClosable: true
            })
        }
    }

    async function handleEliminarUsuario(cliente) {
        try {
            await usuariosAPI.deleteUsuario(cliente.id)
            setClientes(prev => prev.filter(c => c.id !== cliente.id))
            toast({ title: 'Usuario eliminado', status: 'info', duration: 2000 })
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al eliminar usuario', status: 'error', duration: 3000 })
        }
    }

    async function handleAssignRutina() {
        if (!selectedClienteForAssign || !selectedRutinaId) {
            toast({ title: 'Selecciona una rutina', status: 'warning', duration: 2000 })
            return
        }
        try {
            // La función assignRutinaToUsuario espera (usuarioId, rutinaId, data)
            await assignRutinaToUsuario(selectedClienteForAssign.id, selectedRutinaId, {})
            // actualizar contador localmente
            setClientes(prev => prev.map(c => c.id === selectedClienteForAssign.id ? ({ ...c, rutinasAsignadas: (c.rutinasAsignadas||0) + 1 }) : c))
            toast({ title: 'Rutina asignada', status: 'success', duration: 2000 })
            closeAssignModal()
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al asignar rutina', description: err.message, status: 'error', duration: 3000 })
        }
    }

    const limpiarBusqueda = () => {
        setInputValue('')
        setBusqueda('')
    }

    const refrescarDatos = async () => {
        try {
            console.log('📡 OBTENIENDO USUARIOS DEL BACKEND...')
            const usuarios = await usuariosAPI.getUsuarios()
            console.log('✅ USUARIOS OBTENIDOS:', usuarios.length, 'usuarios')
            console.log('📊 ESTADOS:', usuarios.map(u => ({ id: u.id, nombre: u.nombre, estado: u.estado })))
            
            // Cargar todos los pagos de membresía
            const pagos = await pagosAPI.getPagos({ tipo_pago: 'membresia' })
            console.log('💳 PAGOS CARGADOS:', pagos.length)
            console.log('📊 DETALLE PAGOS:', pagos.map(p => ({ id: p.id, usuario_id: p.usuario_id, estado: p.estado, monto: p.monto })))
            
            // Crear mapa de último pago por usuario (excluir solo cancelados/fallidos)
            const pagosporUsuario = {}
            if (Array.isArray(pagos)) {
                pagos.forEach(pago => {
                    const userId = pago.usuario_id
                    const estado = (pago.estado || '').toLowerCase()
                    // Incluir todos los estados excepto cancelado y fallido
                    if (estado !== 'cancelado' && estado !== 'fallido') {
                        if (!pagosporUsuario[userId] || new Date(pago.fecha_pago) > new Date(pagosporUsuario[userId].fecha_pago)) {
                            pagosporUsuario[userId] = pago
                        }
                    }
                })
            }
            console.log('🗺️ MAPA DE PAGOS:', Object.keys(pagosporUsuario).length, 'usuarios con pagos válidos')
            
            setPagosMap(pagosporUsuario)
            
            const clientesDeUsuarios = (usuarios || []).map((user) => ({
                id: user.id,
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                email: user.email || '',
                telefono: user.telefono || '',
                fecha_nacimiento: user.fecha_nacimiento || null,
                genero: user.genero || '',
                membresia: (user.membresia || 'DIARIA').toUpperCase(),
                estado: user.estado || 'activo',
                fecha_vencimiento: user.fecha_vencimiento || null,
                precio_membresia: user.precio_membresia || 0,
                ultima_visita: user.ultima_visita || null,
                total_visitas: user.total_visitas || 0,
                created_at: user.created_at || null,
                updated_at: user.updated_at || null,
            }))
            setClientes(clientesDeUsuarios)
            console.log('✅ CLIENTES ACTUALIZADOS EN EL ESTADO')
            toast({ title: 'Datos actualizados', status: 'success', duration: 1500 })
        } catch (err) {
            console.error('Error refrescando datos:', err)
            toast({ title: 'Error al actualizar', status: 'error', duration: 2000 })
        }
    }

    return (
        <>
        <Box>
            {/* Estadísticas rápidas */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
                <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
                    <Stat>
                        <StatLabel color="gray.600">Total Clientes</StatLabel>
                        <StatNumber color="green.600">{clientes.length}</StatNumber>
                        <StatHelpText>
                            Activos: {clientes.filter(c => c.estado === 'activo').length}
                        </StatHelpText>
                    </Stat>
                </Box>
                <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
                    <Stat>
                        <StatLabel color="gray.600">Membresías por Vencer</StatLabel>
                        <StatNumber color="orange.600">
                            {clientes.filter(c => {
                                const dias = calcularDiasVencimiento(c.fecha_vencimiento)
                                return dias !== null && dias >= 0 && dias <= 7
                            }).length}
                        </StatNumber>
                        <StatHelpText>Próximos 7 días</StatHelpText>
                    </Stat>
                </Box>
                <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
                    <Stat>
                        <StatLabel color="gray.600">Membresías Vencidas</StatLabel>
                        <StatNumber color="red.600">
                            {clientes.filter(c => {
                                const dias = calcularDiasVencimiento(c.fecha_vencimiento)
                                return dias !== null && dias < 0
                            }).length}
                        </StatNumber>
                        <StatHelpText>Requieren renovación</StatHelpText>
                    </Stat>
                </Box>
                <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
                    <Stat>
                        <StatLabel color="gray.600">Visitas Hoy</StatLabel>
                        <StatNumber color="blue.600">
                            {clientes.filter(c => {
                                const hoy = new Date().toLocaleDateString('es-ES')
                                return c.ultima_visita && c.ultima_visita.includes(hoy.split('/')[0])
                            }).length}
                        </StatNumber>
                        <StatHelpText>Registradas</StatHelpText>
                    </Stat>
                </Box>
            </SimpleGrid>

            <HStack mb={6} spacing={4} align="center" flexWrap="wrap">
                <Button 
                    leftIcon={<FiUserPlus />}
                    colorScheme="green"
                    className="gym-button-hover"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    onClick={openModal}
                >
                    Nuevo Cliente
                </Button>

                <Button 
                    leftIcon={<FiRefreshCw />}
                    colorScheme="blue"
                    variant="outline"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                    onClick={refrescarDatos}
                >
                    Actualizar
                </Button>

                {/* InputGroup con InputLeftElement e InputRightElement */}
                <InputGroup maxW="320px" position="relative">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="#24A148" />
                    </InputLeftElement>

                    <Input
                        placeholder="Buscar clientes..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        bg="white"
                        color="gray.800"
                        borderColor="gray.300"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{
                            borderColor: 'green.400',
                            boxShadow: '0 0 0 1px #48bb78',
                        }}
                    />

                    {inputValue && (
                        <InputRightElement>
                            <IconButton
                                aria-label="Limpiar búsqueda"
                                icon={<FiX />}
                                size="sm"
                                variant="ghost"
                                onClick={limpiarBusqueda}
                            />
                        </InputRightElement>
                    )}
                </InputGroup>

                <Select
                    value={filtroMembresia}
                    onChange={(e) => setFiltroMembresia(e.target.value)}
                    maxW="200px"
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                    icon={<FiUser />}
                    _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #48bb78" }}
                    _hover={{ borderColor: "green.400" }}
                >
                    <option value="todos">Todas las membresías</option>
                    <option value="DIARIA">Diaria</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="QUINCENAL">Quincenal</option>
                    <option value="ANUAL">Anual</option>
                </Select>
            </HStack>

            <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>ID</Th>
                            <Th>Nombre</Th>
                            <Th>Email</Th>
                            <Th>Teléfono</Th>
                            <Th>Género</Th>
                            <Th>Membresía</Th>
                            <Th>Estado</Th>
                            <Th>Última Visita</Th>
                            <Th>Total Visitas</Th>
                            <Th>Acciones</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {clientesFiltrados.length === 0 ? (
                            <Tr>
                                <Td colSpan={10} textAlign="center" color="gray.500">
                                    No hay clientes que coincidan con la búsqueda
                                </Td>
                            </Tr>
                        ) : (
                            clientesFiltrados.map((cliente) => (
                                <Tr key={cliente.id} _hover={{ bg: "gray.50" }}>
                                    <Td>{cliente.id}</Td>
                                    <Td>
                                        <Text fontWeight="medium" color="gray.800">
                                            {cliente.nombre} {cliente.apellido}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" color="gray.600">{cliente.email}</Text>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" color="gray.600">{cliente.telefono || '-'}</Text>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={getGeneroColor(cliente.genero)}>
                                            {formatearGenero(cliente.genero)}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Popover placement="right">
                                            <PopoverTrigger>
                                                <Button size="sm" variant="ghost" p={0} h="auto">
                                                    <Badge 
                                                        colorScheme={
                                                            cliente.membresia === 'ANUAL' ? 'purple' : 
                                                            cliente.membresia === 'QUINCENAL' ? 'blue' : 
                                                            cliente.membresia === 'SEMANAL' ? 'green' :
                                                            'orange'
                                                        }
                                                        fontSize="sm"
                                                    >
                                                        {cliente.membresia?.toUpperCase()}
                                                    </Badge>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent width="300px">
                                                <PopoverArrow />
                                                <PopoverCloseButton />
                                                <PopoverHeader fontWeight="bold" borderBottomWidth="1px">
                                                    Información de Membresía
                                                </PopoverHeader>
                                                <PopoverBody>
                                                    <VStack align="stretch" spacing={2}>
                                                        <HStack justify="space-between">
                                                            <Text fontSize="sm" color="gray.600">Tipo:</Text>
                                                            <Badge colorScheme={
                                                                cliente.membresia === 'ANUAL' ? 'purple' : 
                                                                cliente.membresia === 'QUINCENAL' ? 'blue' : 
                                                                cliente.membresia === 'SEMANAL' ? 'green' :
                                                                'orange'
                                                            }>
                                                                {cliente.membresia}
                                                            </Badge>
                                                        </HStack>
                                                        
                                                        <Divider />
                                                        
                                                        <HStack justify="space-between">
                                                            <Text fontSize="sm" color="gray.600">Precio:</Text>
                                                            <Text fontSize="sm" fontWeight="bold" color="green.600">
                                                                ${Number(pagosMap[cliente.id]?.monto || cliente.precio_membresia || 0).toLocaleString('es-CO')}
                                                            </Text>
                                                        </HStack>
                                                        
                                                        <HStack justify="space-between">
                                                            <Text fontSize="sm" color="gray.600">Fecha de Pago:</Text>
                                                            <Text fontSize="sm" fontWeight="medium" color={pagosMap[cliente.id]?.fecha_pago ? "gray.700" : "gray.500"}>
                                                                {pagosMap[cliente.id]?.fecha_pago 
                                                                    ? formatearFecha(pagosMap[cliente.id].fecha_pago) 
                                                                    : formatearFecha(cliente.fecha_inicio_membresia) || formatearFecha(cliente.created_at) || 'Sin registro'}
                                                            </Text>
                                                        </HStack>
                                                        
                                                        <HStack justify="space-between">
                                                            <Text fontSize="sm" color="gray.600">Fecha de Vencimiento:</Text>
                                                            <Text fontSize="sm" fontWeight="medium">
                                                                {formatearFecha(cliente.fecha_vencimiento)}
                                                            </Text>
                                                        </HStack>
                                                        
                                                        {pagosMap[cliente.id] && pagosMap[cliente.id].monto && (
                                                            <>
                                                                <Divider />
                                                                <HStack justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">Estado Pago:</Text>
                                                                    <Badge colorScheme={
                                                                        (pagosMap[cliente.id]?.estado === 'completado' || pagosMap[cliente.id]?.estado === 'pagado') ? 'green' : 
                                                                        pagosMap[cliente.id]?.estado === 'pendiente' ? 'yellow' :
                                                                        (pagosMap[cliente.id]?.estado === 'cancelado' || pagosMap[cliente.id]?.estado === 'fallido') ? 'red' : 
                                                                        'orange'
                                                                    }>
                                                                        {(pagosMap[cliente.id]?.estado || 'PENDIENTE').toUpperCase()}
                                                                    </Badge>
                                                                </HStack>
                                                                {pagosMap[cliente.id]?.descripcion && (
                                                                    <Text fontSize="xs" color="gray.500">
                                                                        {pagosMap[cliente.id].descripcion}
                                                                    </Text>
                                                                )}
                                                            </>
                                                        )}
                                                    </VStack>
                                                </PopoverBody>
                                            </PopoverContent>
                                        </Popover>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={cliente.estado === 'activo' ? 'green' : 'red'}>
                                            {cliente.estado}
                                        </Badge>
                                    </Td>
                                <Td>
                                    <Text fontSize="sm" color="gray.600">
                                        {formatearFecha(cliente.ultima_visita)}
                                    </Text>
                                </Td>
                                <Td>
                                    <Badge colorScheme={cliente.total_visitas > 20 ? 'green' : cliente.total_visitas > 10 ? 'blue' : 'gray'}>
                                        {cliente.total_visitas} visitas
                                    </Badge>
                                </Td>
                                <Td>
                                    <Menu>
                                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                                        <MenuList color="gray.600">
                                            <MenuItem 
                                                icon={<FiCheckCircle />}
                                                onClick={() => handleAccion('visita', cliente)}
                                            >
                                                Registrar Visita
                                            </MenuItem>
                                            <MenuItem onClick={() => handleAccion('ver', cliente)}>Ver detalles</MenuItem>
                                            <MenuItem onClick={() => handleAccion('editar', cliente)}>Editar</MenuItem>
                                            <MenuItem onClick={() => handleAccion('rutina', cliente)}>Asignar rutina</MenuItem>
                                            <MenuItem 
                                                icon={<FiDollarSign />}
                                                onClick={() => handleAccion('pago', cliente)}
                                                color="green.600"
                                            >
                                                Registrar Pago
                                            </MenuItem>
                                            {cliente.estado === 'activo' ? (
                                                <MenuItem onClick={() => handleAccion('desactivar', cliente)}>Desactivar</MenuItem>
                                            ) : (
                                                <MenuItem onClick={() => handleAccion('activar', cliente)} color="green.500">Activar</MenuItem>
                                            )}
                                            <MenuItem onClick={() => handleEliminarUsuario(cliente)} color="red.500">Eliminar</MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Td>
                            </Tr>
                        ))
                        )}
                    </Tbody>
                </Table>
            </Box>
        </Box>
        
        {/* Modal Crear Usuario */}
        <Modal isOpen={isOpen} onClose={closeModal} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Nuevo Cliente</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <SimpleGrid columns={2} spacing={3}>
                        <FormControl isRequired>
                            <FormLabel>Nombre</FormLabel>
                            <Input 
                                placeholder="Ej: Juan"
                                value={newUser.nombre} 
                                onChange={(e) => setNewUser(s => ({ ...s, nombre: e.target.value }))} 
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Apellido</FormLabel>
                            <Input 
                                placeholder="Ej: Pérez"
                                value={newUser.apellido} 
                                onChange={(e) => setNewUser(s => ({ ...s, apellido: e.target.value }))} 
                            />
                        </FormControl>
                    </SimpleGrid>
                    
                    <FormControl mt={3} isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input 
                            type="email"
                            placeholder="ejemplo@email.com"
                            value={newUser.email} 
                            onChange={(e) => setNewUser(s => ({ ...s, email: e.target.value }))} 
                        />
                    </FormControl>
                    
                    <FormControl mt={3} isRequired>
                        <FormLabel>Contraseña</FormLabel>
                        <Input 
                            type="password" 
                            placeholder="Mínimo 6 caracteres"
                            value={newUser.password} 
                            onChange={(e) => setNewUser(s => ({ ...s, password: e.target.value }))} 
                        />
                    </FormControl>
                    
                    <SimpleGrid columns={2} spacing={3} mt={3}>
                        <FormControl>
                            <FormLabel>Teléfono</FormLabel>
                            <Input 
                                placeholder="555-0001"
                                value={newUser.telefono} 
                                onChange={(e) => setNewUser(s => ({ ...s, telefono: e.target.value }))} 
                            />
                        </FormControl>
                        
                        <FormControl>
                            <FormLabel>Género</FormLabel>
                            <Select 
                                value={newUser.genero} 
                                onChange={(e) => setNewUser(s => ({ ...s, genero: e.target.value }))}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="Otro">Otro</option>
                            </Select>
                        </FormControl>
                    </SimpleGrid>
                    
                    <SimpleGrid columns={2} spacing={3} mt={3}>
                        <FormControl>
                            <FormLabel>Fecha de Nacimiento</FormLabel>
                            <Input 
                                type="date"
                                value={newUser.fecha_nacimiento} 
                                onChange={(e) => setNewUser(s => ({ ...s, fecha_nacimiento: e.target.value }))} 
                            />
                        </FormControl>
                        
                        <FormControl>
                            <FormLabel>Membresía</FormLabel>
                            <Select 
                                value={newUser.membresia} 
                                onChange={(e) => setNewUser(s => ({ ...s, membresia: e.target.value }))}
                            >
                                <option value="DIARIA">Diaria</option>
                                <option value="SEMANAL">Semanal</option>
                                <option value="QUINCENAL">Quincenal</option>
                                <option value="ANUAL">Anual</option>
                            </Select>
                        </FormControl>
                    </SimpleGrid>
                    
                    {/* Sección de Pago */}
                    <Box mt={4} p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                        <Checkbox 
                            isChecked={newUser.registrar_pago}
                            onChange={(e) => setNewUser(s => ({ ...s, registrar_pago: e.target.checked }))}
                            colorScheme="green"
                            mb={3}
                        >
                            <Text fontWeight="bold">Registrar pago de membresía</Text>
                        </Checkbox>
                        
                        {newUser.registrar_pago && (
                            <VStack spacing={3} align="stretch">
                                <SimpleGrid columns={2} spacing={3}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">Precio Membresía</FormLabel>
                                        <NumberInput 
                                            min={0}
                                            value={newUser.precio_membresia}
                                            onChange={(valueString) => setNewUser(s => ({ ...s, precio_membresia: valueString }))}
                                            format={(val) => val ? `$${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                                            parse={(val) => val.replace(/^\$/, '').replace(/\./g, '')}
                                        >
                                            <NumberInputField placeholder="60000" />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>
                                </SimpleGrid>
                                
                                <FormControl>
                                    <FormLabel fontSize="sm">Método de Pago</FormLabel>
                                    <Select 
                                        size="sm"
                                        value={newUser.metodo_pago} 
                                        onChange={(e) => setNewUser(s => ({ ...s, metodo_pago: e.target.value }))}
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="tarjeta">Tarjeta</option>
                                        <option value="transferencia">Transferencia</option>
                                        <option value="nequi">Nequi</option>
                                        <option value="daviplata">Daviplata</option>
                                    </Select>
                                </FormControl>
                                
                                {newUser.precio_membresia > 0 && (
                                    <Box p={2} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
                                        <Text fontSize="sm" color="gray.600">
                                            💰 Total a pagar: <Text as="span" fontWeight="bold" color="green.700" fontSize="md">
                                                ${parseInt(newUser.precio_membresia || 0).toLocaleString('es-CO')}
                                            </Text>
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            Válido por {newUser.duracion_dias} días
                                        </Text>
                                    </Box>
                                )}
                            </VStack>
                        )}
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={closeModal}>Cancelar</Button>
                    <Button colorScheme="green" onClick={handleCrearUsuario}>
                        {newUser.registrar_pago ? 'Crear Cliente y Registrar Pago' : 'Crear Cliente'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/* Modal Asignar Rutina */}
        <Modal isOpen={isAssignOpen} onClose={closeAssignModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Asignar rutina a {selectedClienteForAssign?.nombre}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl mb={3}>
                        <FormLabel>Rutina</FormLabel>
                        <Select placeholder="Selecciona rutina" value={selectedRutinaId || ''} onChange={(e) => setSelectedRutinaId(e.target.value)}>
                            {rutinasDisponibles.map(r => (
                                <option key={r.id || r._id} value={r.id ?? r._id}>{r.nombre ?? r.name}</option>
                            ))}
                        </Select>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={closeAssignModal}>Cancelar</Button>
                    <Button colorScheme="green" onClick={handleAssignRutina}>Asignar</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

        {/* Modal Detalles: rutinas asignadas */}
        <Modal isOpen={isDetailsOpen} onClose={closeDetailsModal} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Rutinas asignadas</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {assignedRutinas.length === 0 ? (
                        <Text>No hay rutinas asignadas.</Text>
                    ) : (
                        <Box>
                            <Table variant="simple">
                                <Thead>
                                    <Tr><Th>Nombre</Th><Th>Objetivo</Th><Th>Duración (sem)</Th></Tr>
                                </Thead>
                                <Tbody>
                                    {assignedRutinas.map(rt => (
                                        <Tr key={rt.id || rt._id}>
                                            <Td>{rt.nombre ?? rt.name}</Td>
                                            <Td>{rt.objetivo ?? '-'}</Td>
                                            <Td>{rt.duracion_semanas ?? rt.duracionSemanas ?? '-'}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={closeDetailsModal}>Cerrar</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

        {/* Modal Editar Usuario */}
        <Modal isOpen={isEditOpen} onClose={closeEditModal} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack>
                        <FiUser />
                        <Text>Editar Cliente: {selectedClienteForEdit?.nombre} {selectedClienteForEdit?.apellido}</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Información Personal */}
                        <Box>
                            <Text fontWeight="bold" mb={3} color="green.600">Información Personal</Text>
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Nombre</FormLabel>
                                    <Input 
                                        value={editData.nombre} 
                                        onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))} 
                                        placeholder="Nombre"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="sm">Apellido</FormLabel>
                                    <Input 
                                        value={editData.apellido} 
                                        onChange={(e) => setEditData(prev => ({ ...prev, apellido: e.target.value }))} 
                                        placeholder="Apellido"
                                    />
                                </FormControl>
                            </SimpleGrid>
                            
                            <SimpleGrid columns={2} spacing={3} mt={3}>
                                <FormControl>
                                    <FormLabel fontSize="sm">Teléfono</FormLabel>
                                    <Input 
                                        value={editData.telefono} 
                                        onChange={(e) => setEditData(prev => ({ ...prev, telefono: e.target.value }))} 
                                        placeholder="3001234567"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="sm">Fecha de Nacimiento</FormLabel>
                                    <Input 
                                        type="date"
                                        value={editData.fecha_nacimiento} 
                                        onChange={(e) => setEditData(prev => ({ ...prev, fecha_nacimiento: e.target.value }))} 
                                    />
                                </FormControl>
                            </SimpleGrid>
                            
                            <SimpleGrid columns={2} spacing={3} mt={3}>
                                <FormControl>
                                    <FormLabel fontSize="sm">Email</FormLabel>
                                    <Input 
                                        type="email"
                                        value={editData.email} 
                                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))} 
                                        placeholder="email@ejemplo.com"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="sm">Género</FormLabel>
                                    <Select 
                                        value={editData.genero} 
                                        onChange={(e) => setEditData(prev => ({ ...prev, genero: e.target.value }))}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>
                        </Box>
                        
                        <Divider />
                        
                        {/* Membresía y Estado */}
                        <Box>
                            <Text fontWeight="bold" mb={3} color="green.600">Membresía y Estado</Text>
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel fontSize="sm">Membresía</FormLabel>
                                    <Select 
                                        value={editData.membresia} 
                                        onChange={(e) => setEditData(prev => ({ ...prev, membresia: e.target.value }))}
                                    >
                                        <option value="DIARIA">Diaria (1 día)</option>
                                        <option value="SEMANAL">Semanal (7 días)</option>
                                        <option value="QUINCENAL">Quincenal (15 días)</option>
                                        <option value="MENSUAL">Mensual (30 días)</option>
                                        <option value="ANUAL">Anual (365 días)</option>
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="sm">Estado</FormLabel>
                                    <Select 
                                        value={editData.estado} 
                                        onChange={(e) => setEditData(prev => ({ ...prev, estado: e.target.value }))}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>
                            
                            {/* Información actual de membresía */}
                            {selectedClienteForEdit && (
                                <Box mt={3} p={3} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                                    <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>📊 Información actual:</Text>
                                    <SimpleGrid columns={2} spacing={2}>
                                        <Text fontSize="xs" color="gray.600">
                                            Vencimiento: <Text as="span" fontWeight="bold">{formatearFecha(selectedClienteForEdit.fecha_vencimiento)}</Text>
                                        </Text>
                                        <Text fontSize="xs" color="gray.600">
                                            Precio: <Text as="span" fontWeight="bold">${Number(selectedClienteForEdit.precio_membresia || 0).toLocaleString('es-CO')}</Text>
                                        </Text>
                                    </SimpleGrid>
                                </Box>
                            )}
                        </Box>
                        
                        <Divider />
                        
                        {/* Renovar Membresía */}
                        <Box>
                            <Checkbox 
                                isChecked={editData.renovar_membresia}
                                onChange={(e) => setEditData(prev => ({ ...prev, renovar_membresia: e.target.checked }))}
                                colorScheme="green"
                            >
                                <Text fontWeight="bold" color="green.600">🔄 Renovar membresía</Text>
                            </Checkbox>
                            
                            {editData.renovar_membresia && (
                                <Box mt={3} p={4} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
                                    <FormControl>
                                        <FormLabel fontSize="sm">Precio de Renovación</FormLabel>
                                        <NumberInput 
                                            min={0}
                                            value={editData.precio_membresia}
                                            onChange={(valueString) => setEditData(prev => ({ ...prev, precio_membresia: valueString }))}
                                            format={(val) => val ? `$${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                                            parse={(val) => val.replace(/^\$/, '').replace(/\./g, '')}
                                        >
                                            <NumberInputField placeholder="60000" />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>
                                    <Text fontSize="xs" color="gray.600" mt={2}>
                                        ℹ️ La fecha de vencimiento se calculará automáticamente según el tipo de membresía seleccionado
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={closeEditModal}>Cancelar</Button>
                    <Button 
                        colorScheme="green" 
                        onClick={handleEditUsuario}
                        leftIcon={editData.renovar_membresia ? <FiRefreshCw /> : undefined}
                    >
                        {editData.renovar_membresia ? 'Guardar y Renovar' : 'Guardar Cambios'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

        {/* Modal Registrar Pago */}
        <Modal isOpen={isPagoOpen} onClose={closePagoModal} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>💳 Registrar Pago</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {selectedClienteForPago && (
                        <VStack spacing={4} align="stretch">
                            <Box p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                                <HStack spacing={3}>
                                    <FiUser size={24} color="#3182CE" />
                                    <Box>
                                        <Text fontWeight="bold" color="blue.800">
                                            {selectedClienteForPago.nombre} {selectedClienteForPago.apellido}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            {selectedClienteForPago.email} • {selectedClienteForPago.telefono}
                                        </Text>
                                        <Badge colorScheme="blue" mt={1}>
                                            Membresía: {selectedClienteForPago.membresia || 'Sin membresía'}
                                        </Badge>
                                    </Box>
                                </HStack>
                            </Box>

                            <SimpleGrid columns={2} spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Tipo de Pago</FormLabel>
                                    <Select
                                        value={nuevoPago.tipo_pago}
                                        onChange={(e) => setNuevoPago(prev => ({ ...prev, tipo_pago: e.target.value }))}
                                    >
                                        <option value="membresia">Membresía</option>
                                        <option value="producto">Producto</option>
                                        <option value="sesion">Sesión de Entrenamiento</option>
                                        <option value="otro">Otro</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Monto ($)</FormLabel>
                                    <NumberInput
                                        value={nuevoPago.monto}
                                        onChange={(value) => setNuevoPago(prev => ({ ...prev, monto: value }))}
                                        min={0}
                                    >
                                        <NumberInputField placeholder="0" />
                                    </NumberInput>
                                </FormControl>
                            </SimpleGrid>

                            <FormControl>
                                <FormLabel fontSize="sm">Método de Pago</FormLabel>
                                <Select
                                    value={nuevoPago.metodo_pago}
                                    onChange={(e) => setNuevoPago(prev => ({ ...prev, metodo_pago: e.target.value }))}
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="otro">Otro</option>
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Concepto</FormLabel>
                                <Input
                                    value={nuevoPago.concepto}
                                    onChange={(e) => setNuevoPago(prev => ({ ...prev, concepto: e.target.value }))}
                                    placeholder="Ej: Pago de membresía mensual"
                                />
                            </FormControl>

                            <Box p={3} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
                                <HStack justify="space-between">
                                    <Text fontWeight="bold" color="green.800">Total a Registrar:</Text>
                                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                        ${parseFloat(nuevoPago.monto || 0).toLocaleString('es-CO')}
                                    </Text>
                                </HStack>
                            </Box>
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={closePagoModal}>
                        Cancelar
                    </Button>
                    <Button colorScheme="green" onClick={handleRegistrarPago} leftIcon={<FiDollarSign />}>
                        Registrar Pago
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}


    // Modals fuera del componente return are added inline above; below we append assign/details modals by patching file end
