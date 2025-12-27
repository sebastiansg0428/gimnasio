import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Select,
    IconButton,
    useToast,
    Text,
    Box,
    Avatar,
    Badge,
    Divider,
} from '@chakra-ui/react'
import { FiPlus, FiTrash2, FiUsers } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import {
    getClientesEntrenador,
    asignarClienteEntrenador,
    quitarClienteEntrenador,
    getUsuarios,
} from '../../utils/api'

export default function ClientesModal({ isOpen, onClose, entrenador }) {
    const [clientes, setClientes] = useState([])
    const [todosUsuarios, setTodosUsuarios] = useState([])
    const [loading, setLoading] = useState(false)
    const [clienteSeleccionado, setClienteSeleccionado] = useState('')
    const toast = useToast()

    useEffect(() => {
        if (isOpen && entrenador?.id) {
            cargarDatos()
        }
    }, [isOpen, entrenador])

    async function cargarDatos() {
        if (!entrenador?.id) return
        setLoading(true)
        try {
            const [clientesData, usuariosData] = await Promise.all([
                getClientesEntrenador(entrenador.id),
                getUsuarios(),
            ])
            setClientes(Array.isArray(clientesData) ? clientesData : [])
            setTodosUsuarios(Array.isArray(usuariosData) ? usuariosData : [])
        } catch (err) {
            console.error('Error cargando datos:', err)
            toast({
                title: 'Error al cargar datos',
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleAsignarCliente() {
        if (!clienteSeleccionado || !entrenador?.id) return
        setLoading(true)
        try {
            await asignarClienteEntrenador(entrenador.id, clienteSeleccionado)
            toast({
                title: 'Cliente asignado exitosamente',
                status: 'success',
                duration: 2000,
            })
            cargarDatos()
            setClienteSeleccionado('')
        } catch (err) {
            console.error('Error:', err)
            toast({
                title: 'Error al asignar cliente',
                description: err.message,
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleQuitarCliente(usuarioId) {
        if (!window.confirm('¿Quitar este cliente del entrenador?')) return
        setLoading(true)
        try {
            await quitarClienteEntrenador(entrenador.id, usuarioId)
            toast({
                title: 'Cliente removido',
                status: 'info',
                duration: 2000,
            })
            setClientes((prev) => prev.filter((c) => c.id !== usuarioId))
        } catch (err) {
            console.error('Error:', err)
            toast({
                title: 'Error al quitar cliente',
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    // Filtrar usuarios que ya no están asignados
    const usuariosDisponibles = todosUsuarios.filter(
        (usuario) => !clientes.some((cliente) => cliente.id === usuario.id)
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack>
                        <FiUsers />
                        <Text>
                            Clientes de {entrenador?.nombre} {entrenador?.apellido}
                        </Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Formulario para asignar nuevo cliente */}
                        <Box bg="green.50" p={4} borderRadius="md">
                            <Text fontWeight="bold" mb={3} color="green.700">
                                Asignar Nuevo Cliente
                            </Text>
                            <HStack spacing={3}>
                                <Select
                                    placeholder="Seleccionar cliente..."
                                    value={clienteSeleccionado}
                                    onChange={(e) =>
                                        setClienteSeleccionado(e.target.value)
                                    }
                                    flex={1}
                                >
                                    {usuariosDisponibles.map((usuario) => (
                                        <option key={usuario.id} value={usuario.id}>
                                            {usuario.nombre} {usuario.apellido} -{' '}
                                            {usuario.email}
                                        </option>
                                    ))}
                                </Select>
                                <IconButton
                                    aria-label="Asignar"
                                    icon={<FiPlus />}
                                    colorScheme="green"
                                    onClick={handleAsignarCliente}
                                    isLoading={loading}
                                    isDisabled={!clienteSeleccionado}
                                />
                            </HStack>
                        </Box>

                        <Divider />

                        {/* Lista de clientes asignados */}
                        <Box>
                            <HStack justify="space-between" mb={3}>
                                <Text fontWeight="bold" color="gray.700">
                                    Clientes Asignados
                                </Text>
                                <Badge colorScheme="green" fontSize="md" px={2}>
                                    {clientes.length}
                                </Badge>
                            </HStack>
                            {loading && clientes.length === 0 ? (
                                <Text color="gray.500" fontSize="sm">
                                    Cargando...
                                </Text>
                            ) : clientes.length === 0 ? (
                                <Text color="gray.500" fontSize="sm">
                                    No hay clientes asignados
                                </Text>
                            ) : (
                                <VStack spacing={2} align="stretch">
                                    {clientes.map((cliente) => (
                                        <HStack
                                            key={cliente.id}
                                            p={3}
                                            bg="gray.50"
                                            borderRadius="md"
                                            justify="space-between"
                                        >
                                            <HStack spacing={3}>
                                                <Avatar
                                                    size="sm"
                                                    name={`${cliente.nombre} ${cliente.apellido}`}
                                                    bg="blue.400"
                                                />
                                                <Box>
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="medium"
                                                    >
                                                        {cliente.nombre}{' '}
                                                        {cliente.apellido}
                                                    </Text>
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.500"
                                                    >
                                                        {cliente.email}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                            <HStack>
                                                <Badge
                                                    colorScheme={
                                                        cliente.estado === 'activo'
                                                            ? 'green'
                                                            : 'red'
                                                    }
                                                >
                                                    {cliente.estado || 'activo'}
                                                </Badge>
                                                <IconButton
                                                    aria-label="Quitar"
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleQuitarCliente(cliente.id)
                                                    }
                                                />
                                            </HStack>
                                        </HStack>
                                    ))}
                                </VStack>
                            )}
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Cerrar</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
