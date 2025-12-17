// ClientesTab.jsx
import React, { useState, useEffect } from 'react'
import api from '../utils/api'
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
    const [filtroMembresia, setFiltroMembresia] = useState('todas')
    const toast = useToast()

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
        toast({
            title: `Acción: ${accion}`,
            description: `Para cliente: ${cliente.nombre}`,
            status: 'info',
            duration: 2000,
        })
    }

    const limpiarBusqueda = () => {
        setInputValue('')
        setBusqueda('')
    }

    return (
        <Box>
            <HStack mb={6} spacing={4} align="center">
                <Button 
                    leftIcon={<FiUserPlus />}
                    colorScheme="green"
                    className="gym-button-hover"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
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
                    <option value="todas">Todas las membresías</option>
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
                                        </MenuList>
                                    </Menu>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    )
}
