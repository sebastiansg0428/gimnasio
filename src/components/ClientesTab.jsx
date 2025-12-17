// ClientesTab.jsx
import React, { useState, useEffect } from 'react'
import api, { createUsuario, deleteUsuario, getRutinasUsuario, assignRutinaToUsuario, getRutinas } from '../utils/api'
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
import { FiMoreVertical, FiSearch, FiUser, FiUserPlus, FiX } from 'react-icons/fi'

// Datos de ejemplo de clientes
const clientesIniciales = [
    {
        id: 1,
        nombre: 'Ana María Rodríguez',
        correo: 'ana.rodriguez@email.com',
        membresia: 'Diaria/ Pase del dia',
        estado: 'Activo',
        ultimaVisita: '2025-10-29',
        rutinasAsignadas: 3,
    },
    {
        id: 2,
        nombre: 'Carlos Mendoza',
        correo: 'carlos.m@email.com',
        membresia: 'Mensual',
        estado: 'Activo',
        ultimaVisita: '2025-10-28',
        rutinasAsignadas: 1,
    },
    {
        id: 3,
        nombre: 'Laura Pérez',
        correo: 'laura.p@email.com',
        membresia: 'Diaria/ Pase del dia',
        estado: 'Inactivo',
        ultimaVisita: '2025-10-15',
        rutinasAsignadas: 0,
    },
    {
        id: 4,
        nombre: 'Jacob Sanchez',
        correo: 'jacob@email.com',
        membresia: 'Anual',
        estado: 'Activo',
        ultimaVisita: '2025-10-02',
        rutinasAsignadas: 4,
    },
]

export default function ClientesTab() {
    const STORAGE_KEY = 'rg_clients'

    const [clientes, setClientes] = useState(clientesIniciales)

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
    const [rutinasDisponibles, setRutinasDisponibles] = useState([])
    const [selectedClienteForAssign, setSelectedClienteForAssign] = useState(null)
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
                const usuarios = await api.getUsuarios()
                // Mapear usuarios a formato de cliente
                const clientesDeUsuarios = (usuarios || []).map((user, index) => ({
                    id: user.id || user._id || index + 1000,
                    nombre: user.name || user.nombre || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    correo: user.email || user.correo || '',
                    membresia: user.membresia || 'Mensual',
                    estado: user.estado || 'Activo',
                    ultimaVisita: user.ultimaVisita || new Date().toISOString().split('T')[0],
                    rutinasAsignadas: user.rutinasAsignadas ?? Math.floor(Math.random() * 5),
                }))

                const todosLosClientes = [...clientesIniciales]
                clientesDeUsuarios.forEach(clienteUsuario => {
                    if (!todosLosClientes.some(c => c.correo === clienteUsuario.correo)) {
                        todosLosClientes.push(clienteUsuario)
                    }
                })

                if (mounted) setClientes(todosLosClientes)
            } catch (e) {
                // Fallback: leer de localStorage si backend no disponible
                try {
                    const usuariosLocal = JSON.parse(localStorage.getItem('rg_users') || '[]')
                    const clientesDeUsuarios = usuariosLocal.map((user, index) => ({
                        id: user.id || index + 1000,
                        nombre: user.name,
                        correo: user.email,
                        membresia: 'Mensual',
                        estado: 'Activo',
                        ultimaVisita: new Date().toISOString().split('T')[0],
                        rutinasAsignadas: Math.floor(Math.random() * 5)
                    }))
                    const todosLosClientes = [...clientesIniciales]
                    clientesDeUsuarios.forEach(clienteUsuario => {
                        if (!todosLosClientes.some(c => c.correo === clienteUsuario.correo)) {
                            todosLosClientes.push(clienteUsuario)
                        }
                    })
                    if (mounted) setClientes(todosLosClientes)
                } catch (err) {
                    console.error('Error cargando usuarios fallback:', err)
                }
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
            cliente.nombre.toLowerCase().includes(q) ||
            cliente.correo.toLowerCase().includes(q)
        const coincideMembresia =
            filtroMembresia === 'todos' ||
            cliente.membresia.toLowerCase().includes(filtroMembresia.toLowerCase())
        return coincideBusqueda && coincideMembresia
    })

    const handleAccion = (accion, cliente) => {
        if (accion === 'rutina') return openAssignModal(cliente)
        if (accion === 'ver') return openDetailsModal(cliente)
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
            const payload = { name: newUser.nombre, email: newUser.email, password: newUser.password }
            const created = await createUsuario(payload)
            const id = created?.id || created?._id || Date.now()
            const cliente = {
                id,
                nombre: created.name || newUser.nombre,
                correo: created.email || newUser.email,
                membresia: newUser.membresia,
                estado: 'Activo',
                ultimaVisita: new Date().toISOString().split('T')[0],
                rutinasAsignadas: 0,
            }
            setClientes(prev => [cliente, ...prev])
            toast({ title: 'Usuario creado', status: 'success', duration: 2000 })
            setNewUser({ nombre: '', email: '', password: '', membresia: 'Mensual' })
            closeModal()
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al crear usuario', status: 'error', duration: 3000 })
        }
    }

    async function handleEliminarUsuario(cliente) {
        try {
            await deleteUsuario(cliente.id)
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
            await assignRutinaToUsuario(selectedClienteForAssign.id, { rutinaId: selectedRutinaId })
            // actualizar contador localmente
            setClientes(prev => prev.map(c => c.id === selectedClienteForAssign.id ? ({ ...c, rutinasAsignadas: (c.rutinasAsignadas||0) + 1 }) : c))
            toast({ title: 'Rutina asignada', status: 'success', duration: 2000 })
            closeAssignModal()
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al asignar rutina', status: 'error', duration: 3000 })
        }
    }

    const limpiarBusqueda = () => {
        setInputValue('')
        setBusqueda('')
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
                    <option value="diaria/ pase del dia">Diaria/ Pase del dia</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestal</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                </Select>
            </HStack>

            <Box overflowX="auto">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Nombre</Th>
                            <Th>Membresía</Th>
                            <Th>Estado</Th>
                            <Th>Última Visita</Th>
                            <Th>Rutinas</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {clientesFiltrados.map((cliente) => (
                            <Tr key={cliente.id}>
                                <Td>
                                    <Text color="gray.600" fontWeight="medium">{cliente.nombre}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {cliente.correo}
                                    </Text>
                                </Td>
                                <Td>
                                    <Badge colorScheme={cliente.membresia === 'Premium' ? 'purple' : 'gray'}>
                                        {cliente.membresia}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge colorScheme={cliente.estado === 'Activo' ? 'green' : 'red'}>
                                        {cliente.estado}
                                    </Badge>
                                </Td>
                                <Td color="gray.600">{cliente.ultimaVisita}</Td>
                                <Td>
                                    <Badge colorScheme={cliente.rutinasAsignadas > 0 ? 'blue' : 'gray'}>
                                        {cliente.rutinasAsignadas} rutinas
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
                        ))}
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
        </>
    )
}


    // Modals fuera del componente return are added inline above; below we append assign/details modals by patching file end
