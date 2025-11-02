// ClientesTab.jsx
import React, { useState, useEffect } from 'react'
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
        membresia: 'Premium',
        estado: 'Activo',
        ultimaVisita: '2025-10-29',
        rutinasAsignadas: 3,
    },
    {
        id: 2,
        nombre: 'Carlos Mendoza',
        correo: 'carlos.m@email.com',
        membresia: 'Básica',
        estado: 'Activo',
        ultimaVisita: '2025-10-28',
        rutinasAsignadas: 1,
    },
    {
        id: 3,
        nombre: 'Laura Pérez',
        correo: 'laura.p@email.com',
        membresia: 'Premium',
        estado: 'Inactivo',
        ultimaVisita: '2025-10-15',
        rutinasAsignadas: 0,
    },
]

export default function ClientesTab() {
    const STORAGE_KEY = 'rg_clients'

    const [clientes, setClientes] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            return raw ? JSON.parse(raw) : clientesIniciales
        } catch (e) {
            return clientesIniciales
        }
    })

    // Estado real que aplica el filtro
    const [busqueda, setBusqueda] = useState('')
    // Estado intermedio del input para debounce
    const [inputValue, setInputValue] = useState('')
    const [filtroMembresia, setFiltroMembresia] = useState('todos')
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

    // Filtrar clientes basado en búsqueda y filtro de membresía
    const clientesFiltrados = clientes.filter((cliente) => {
        const q = busqueda.trim().toLowerCase()
        const coincideBusqueda =
            q === '' ||
            cliente.nombre.toLowerCase().includes(q) ||
            cliente.correo.toLowerCase().includes(q)
        const coincideMembresia =
            filtroMembresia === 'todos' ||
            cliente.membresia.toLowerCase() === filtroMembresia.toLowerCase()
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
                <Button leftIcon={<FiUserPlus />}
                    colorScheme="green"
                    _hover={{ borderColor: "green.400" }}>
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
                        color="black"
                        _placeholder={{ color: "gray.400" }}
                        _focus={{
                            borderColor: '#24A148',
                            boxShadow: '0 0 8px rgba(36,161,72,0.25)',
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
                    color="black"
                    borderColor="gray.300"
                    icon={<FiUser />}
                    _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px green" }}
                    _hover={{ borderColor: "green.400" }}
                >
                    <option value="todos">Todas las membresías</option>
                    <option value="premium">Premium</option>
                    <option value="básica">Básica</option>
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
                                    <Text fontWeight="medium">{cliente.nombre}</Text>
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
                                <Td>{cliente.ultimaVisita}</Td>
                                <Td>
                                    <Badge colorScheme={cliente.rutinasAsignadas > 0 ? 'blue' : 'gray'}>
                                        {cliente.rutinasAsignadas} rutinas
                                    </Badge>
                                </Td>
                                <Td>
                                    <Menu>
                                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                                        <MenuList>
                                            <MenuItem onClick={() => handleAccion('ver', cliente)}>Ver detalles</MenuItem>
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
