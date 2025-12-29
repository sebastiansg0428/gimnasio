// ClientesTab.jsx
import React, { useState, useEffect } from 'react'
import { usuariosAPI, authAPI } from '../services/api'
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
} from '@chakra-ui/react'
import { FiMoreVertical, FiSearch, FiUser, FiUserPlus, FiX, FiRefreshCw } from 'react-icons/fi'

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

// Lista inicial vacía: mostrar solo usuarios provenientes del backend

export default function ClientesTab() {
    const STORAGE_KEY = 'rg_clients'

    const [clientes, setClientes] = useState([])

    // Estado real que aplica el filtro
    const [busqueda, setBusqueda] = useState('')
    // Estado intermedio del input para debounce
    const [inputValue, setInputValue] = useState('')
    const [filtroMembresia, setFiltroMembresia] = useState('todos')
    const toast = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [newUser, setNewUser] = useState({ nombre: '', email: '', password: '', membresia: 'Mensual' })

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
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
        membresia: 'basica',
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
            membresia: cliente.membresia || 'basica',
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
                membresia: user.membresia || 'basica',
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
                // Mapear usuarios a formato correcto según la base de datos
                const clientesDeUsuarios = (usuarios || []).map((user) => ({
                    id: user.id,
                    nombre: user.nombre || '',
                    apellido: user.apellido || '',
                    email: user.email || '',
                    telefono: user.telefono || '',
                    fecha_nacimiento: user.fecha_nacimiento || null,
                    genero: user.genero || '',
                    membresia: user.membresia || 'basica',
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
        if (!newUser.email || !newUser.password || !newUser.nombre) {
            toast({ title: 'Completa nombre, email y contraseña', status: 'warning', duration: 2000 })
            return
        }
        try {
            const payload = { 
                nombre: newUser.nombre, 
                email: newUser.email, 
                password: newUser.password,
                membresia: newUser.membresia
            }
            console.log('Enviando payload:', payload)
            const created = await authAPI.register(payload)
            console.log('Usuario creado:', created)
            toast({ title: 'Usuario creado exitosamente', status: 'success', duration: 2000 })
            setNewUser({ nombre: '', email: '', password: '', membresia: 'Mensual' })
            closeModal()
            // Recargar usuarios
            const usuarios = await usuariosAPI.getUsuarios()
            const clientesFormateados = usuarios.map(user => ({
                id: user.id,
                usuario: user.nombre || user.name || user.username || (user.email ? user.email.split('@')[0] : ''),
                nombre: user.nombre || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                correo: user.email || user.correo || '',
                membresia: user.membresia || 'Mensual',
                estado: user.estado || 'Activo',
                ultimaVisita: user.ultima_visita || new Date().toISOString().split('T')[0],
                rutinasAsignadas: user.rutinas_asignadas || 0
            }))
            setClientes(clientesFormateados)
        } catch (err) {
            console.error('Error completo:', err)
            toast({ 
                title: 'Error al crear usuario', 
                description: err.message || 'Error desconocido',
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
            const clientesDeUsuarios = (usuarios || []).map((user) => ({
                id: user.id,
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                email: user.email || '',
                telefono: user.telefono || '',
                fecha_nacimiento: user.fecha_nacimiento || null,
                genero: user.genero || '',
                membresia: user.membresia || 'basica',
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
            <HStack mb={6} spacing={4} align="center">
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
                    <option value="basica">Básica</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
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
                            <Th>Vencimiento</Th>
                            <Th>Última Visita</Th>
                            <Th>Total Visitas</Th>
                            <Th>Acciones</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {clientesFiltrados.length === 0 ? (
                            <Tr>
                                <Td colSpan={11} textAlign="center" color="gray.500">
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
                                        <Badge colorScheme={
                                            cliente.membresia === 'vip' ? 'purple' : 
                                            cliente.membresia === 'premium' ? 'blue' : 
                                            'green'
                                        }>
                                            {cliente.membresia}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={cliente.estado === 'activo' ? 'green' : 'red'}>
                                            {cliente.estado}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Text fontSize="sm" color="gray.600">
                                        {formatearFecha(cliente.fecha_vencimiento)}
                                    </Text>
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
                                            <MenuItem onClick={() => handleAccion('ver', cliente) }>Ver detalles</MenuItem>
                                            <MenuItem onClick={() => handleAccion('editar', cliente)}>Editar</MenuItem>
                                            <MenuItem onClick={() => handleAccion('rutina', cliente)}>Asignar rutina</MenuItem>
                                            <MenuItem onClick={() => handleAccion('desactivar', cliente)}>Desactivar</MenuItem>
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
        <Modal isOpen={isOpen} onClose={closeModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Nuevo Cliente</ModalHeader>
                <ModalBody>
                    <FormControl mb={3}>
                        <FormLabel>Nombre</FormLabel>
                        <Input value={newUser.nombre} onChange={(e) => setNewUser(s => ({ ...s, nombre: e.target.value }))} />
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Email</FormLabel>
                        <Input value={newUser.email} onChange={(e) => setNewUser(s => ({ ...s, email: e.target.value }))} />
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Contraseña</FormLabel>
                        <Input type="password" value={newUser.password} onChange={(e) => setNewUser(s => ({ ...s, password: e.target.value }))} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Membresía</FormLabel>
                        <Select value={newUser.membresia} onChange={(e) => setNewUser(s => ({ ...s, membresia: e.target.value }))}>
                            <option>Mensual</option>
                            <option>Diaria/ Pase del dia</option>
                            <option>Semanal</option>
                            <option>Anual</option>
                        </Select>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={closeModal}>Cancelar</Button>
                    <Button colorScheme="green" onClick={handleCrearUsuario}>Crear</Button>
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
                            <option value="basica">Básica</option>
                            <option value="premium">Premium</option>
                            <option value="vip">VIP</option>
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
