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
import { FiMoreVertical, FiSearch, FiUser, FiUserPlus, FiX, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi'

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
        genero: '',
        membresia: 'DIARIA',
        estado: 'activo'
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
            genero: cliente.genero || '',
            membresia: cliente.membresia || 'DIARIA',
            estado: cliente.estado || 'activo'
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
            await usuariosAPI.updateUsuario(selectedClienteForEdit.id, editData)
            
            // Recargar todos los usuarios desde el backend para asegurar sincronización
            const usuarios = await usuariosAPI.getUsuarios()
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
            
            toast({ 
                title: 'Usuario actualizado', 
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

    const handleAccion = (accion, cliente) => {
        if (accion === 'rutina') return openAssignModal(cliente)
        if (accion === 'ver') return openDetailsModal(cliente)
        if (accion === 'editar') return openEditModal(cliente)
        
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
            
            // Si se debe registrar el pago
            if (newUser.registrar_pago && usuarioCreado?.usuario?.id) {
                const fechaInicio = new Date()
                
                const pagoData = {
                    usuario_id: usuarioCreado.usuario.id,
                    tipo_pago: 'membresia',
                    monto: parseFloat(newUser.precio_membresia),
                    metodo_pago: newUser.metodo_pago,
                    estado: 'completado',
                    descripcion: `Membresía ${newUser.membresia}`,
                    fecha_pago: fechaInicio.toISOString().split('T')[0]
                }
                
                try {
                    await pagosAPI.createPago(pagoData)
                    console.log('Pago registrado exitosamente')
                } catch (errPago) {
                    console.error('Error al registrar pago:', errPago)
                    toast({ 
                        title: '⚠️ Cliente creado pero sin pago', 
                        description: 'El pago no pudo ser registrado',
                        status: 'warning', 
                        duration: 3000 
                    })
                }
            }
            
            toast({ 
                title: '✅ Cliente creado', 
                description: `${payload.nombre} ${payload.apellido}${newUser.registrar_pago ? ' - Pago registrado' : ''}`,
                status: 'success', 
                duration: 3000 
            })
            
            closeModal()
            
            // Recargar usuarios desde el backend
            await refrescarDatos()
            
        } catch (err) {
            console.error('Error completo:', err)
            toast({ 
                title: 'Error al crear cliente', 
                description: err.message || 'Verifica los datos e intenta nuevamente',
                status: 'error', 
                duration: 3000 
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
                                                        
                                                        {pagosMap[cliente.id] ? (
                                                            <>
                                                                <Divider />
                                                                <HStack justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">Fecha de Pago:</Text>
                                                                    <Text fontSize="sm" fontWeight="medium">
                                                                        {formatearFecha(pagosMap[cliente.id].fecha_pago)}
                                                                    </Text>
                                                                </HStack>
                                                                <HStack justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">Monto Pagado:</Text>
                                                                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                                                                        ${Number(pagosMap[cliente.id].monto).toLocaleString('es-CO')}
                                                                    </Text>
                                                                </HStack>
                                                                <HStack justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">Estado Pago:</Text>
                                                                    <Badge colorScheme={pagosMap[cliente.id].estado === 'completado' ? 'green' : 'orange'}>
                                                                        {pagosMap[cliente.id].estado}
                                                                    </Badge>
                                                                </HStack>
                                                                {pagosMap[cliente.id].descripcion && (
                                                                    <>
                                                                        <Divider />
                                                                        <Text fontSize="xs" color="gray.500">
                                                                            {pagosMap[cliente.id].descripcion}
                                                                        </Text>
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Divider />
                                                                <HStack justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">Precio:</Text>
                                                                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                                                                        ${Number(cliente.precio_membresia || 0).toLocaleString('es-CO')}
                                                                    </Text>
                                                                </HStack>
                                                                <HStack justify="space-between">
                                                                    <Text fontSize="sm" color="gray.600">Vencimiento:</Text>
                                                                    <Text fontSize="sm" fontWeight="medium">
                                                                        {formatearFecha(cliente.fecha_vencimiento)}
                                                                    </Text>
                                                                </HStack>
                                                                <Divider />
                                                                <Text fontSize="xs" color="orange.500" fontStyle="italic">
                                                                    Sin registro de pago
                                                                </Text>
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
        <Modal isOpen={isEditOpen} onClose={closeEditModal} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Editar Cliente</ModalHeader>
                <ModalBody>
                    <FormControl mb={3}>
                        <FormLabel>Nombre</FormLabel>
                        <Input 
                            value={editData.nombre} 
                            onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))} 
                        />
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Apellido</FormLabel>
                        <Input 
                            value={editData.apellido} 
                            onChange={(e) => setEditData(prev => ({ ...prev, apellido: e.target.value }))} 
                        />
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Email</FormLabel>
                        <Input 
                            type="email"
                            value={editData.email} 
                            onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))} 
                        />
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Teléfono</FormLabel>
                        <Input 
                            value={editData.telefono} 
                            onChange={(e) => setEditData(prev => ({ ...prev, telefono: e.target.value }))} 
                        />
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Género</FormLabel>
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
                    <FormControl mb={3}>
                        <FormLabel>Membresía</FormLabel>
                        <Select 
                            value={editData.membresia} 
                            onChange={(e) => setEditData(prev => ({ ...prev, membresia: e.target.value }))}
                        >
                            <option value="DIARIA">Diaria</option>
                            <option value="SEMANAL">Semanal</option>
                            <option value="QUINCENAL">Quincenal</option>
                            <option value="ANUAL">Anual</option>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Estado</FormLabel>
                        <Select 
                            value={editData.estado} 
                            onChange={(e) => setEditData(prev => ({ ...prev, estado: e.target.value }))}
                        >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </Select>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={closeEditModal}>Cancelar</Button>
                    <Button colorScheme="green" onClick={handleEditUsuario}>Guardar Cambios</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}


    // Modals fuera del componente return are added inline above; below we append assign/details modals by patching file end
