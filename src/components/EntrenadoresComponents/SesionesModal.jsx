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
    FormControl,
    FormLabel,
    Select,
    Input,
    Textarea,
    IconButton,
    useToast,
    Text,
    Box,
    Badge,
    Divider,
    Avatar,
} from '@chakra-ui/react'
import { FiPlus, FiEdit, FiCalendar, FiCheckCircle } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import {
    getSesionesEntrenador,
    createSesionEntrenador,
    updateSesion,
    getClientesEntrenador,
} from '../../utils/api'

export default function SesionesModal({ isOpen, onClose, entrenador }) {
    const [sesiones, setSesiones] = useState([])
    const [clientes, setClientes] = useState([])
    const [loading, setLoading] = useState(false)
    const [nuevaSesion, setNuevaSesion] = useState({
        usuario_id: '',
        fecha: '',
        hora: '',
        duracion_minutos: 60,
        tipo: 'personalizada',
        notas: '',
    })
    const [editandoSesion, setEditandoSesion] = useState(null)
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
            const [sesionesData, clientesData] = await Promise.all([
                getSesionesEntrenador(entrenador.id),
                getClientesEntrenador(entrenador.id),
            ])
            setSesiones(Array.isArray(sesionesData) ? sesionesData : [])
            setClientes(Array.isArray(clientesData) ? clientesData : [])
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

    async function handleCrearSesion() {
        if (!entrenador?.id || !nuevaSesion.usuario_id || !nuevaSesion.fecha) {
            toast({
                title: 'Completa todos los campos requeridos',
                status: 'warning',
                duration: 2000,
            })
            return
        }

        setLoading(true)
        try {
            await createSesionEntrenador(entrenador.id, nuevaSesion)
            toast({
                title: 'Sesión creada exitosamente',
                status: 'success',
                duration: 2000,
            })
            cargarDatos()
            setNuevaSesion({
                usuario_id: '',
                fecha: '',
                hora: '',
                duracion_minutos: 60,
                tipo: 'personalizada',
                notas: '',
            })
        } catch (err) {
            console.error('Error:', err)
            toast({
                title: 'Error al crear sesión',
                description: err.message,
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleActualizarEstado(sesionId, nuevoEstado) {
        setLoading(true)
        try {
            await updateSesion(sesionId, { estado: nuevoEstado })
            toast({
                title: 'Estado actualizado',
                status: 'success',
                duration: 2000,
            })
            cargarDatos()
        } catch (err) {
            console.error('Error:', err)
            toast({
                title: 'Error al actualizar estado',
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    const getEstadoColor = (estado) => {
        const colores = {
            programada: 'blue',
            completada: 'green',
            cancelada: 'red',
            en_progreso: 'orange',
        }
        return colores[estado] || 'gray'
    }

    const getTipoColor = (tipo) => {
        const colores = {
            personalizada: 'purple',
            grupal: 'cyan',
            evaluacion: 'orange',
        }
        return colores[tipo] || 'gray'
    }

    // Ordenar sesiones por fecha (más recientes primero)
    const sesionesOrdenadas = [...sesiones].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent maxH="90vh">
                <ModalHeader>
                    <HStack>
                        <FiCalendar />
                        <Text>
                            Sesiones de {entrenador?.nombre} {entrenador?.apellido}
                        </Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Formulario para crear nueva sesión */}
                        <Box bg="green.50" p={4} borderRadius="md">
                            <Text fontWeight="bold" mb={3} color="green.700">
                                Programar Nueva Sesión
                            </Text>
                            <VStack spacing={3}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Cliente</FormLabel>
                                    <Select
                                        placeholder="Seleccionar cliente..."
                                        value={nuevaSesion.usuario_id}
                                        onChange={(e) =>
                                            setNuevaSesion((prev) => ({
                                                ...prev,
                                                usuario_id: e.target.value,
                                            }))
                                        }
                                        size="sm"
                                    >
                                        {clientes.map((cliente) => (
                                            <option key={cliente.id} value={cliente.id}>
                                                {cliente.nombre} {cliente.apellido}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <HStack spacing={2} w="full">
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">Fecha</FormLabel>
                                        <Input
                                            type="date"
                                            value={nuevaSesion.fecha}
                                            onChange={(e) =>
                                                setNuevaSesion((prev) => ({
                                                    ...prev,
                                                    fecha: e.target.value,
                                                }))
                                            }
                                            size="sm"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm">Hora</FormLabel>
                                        <Input
                                            type="time"
                                            value={nuevaSesion.hora}
                                            onChange={(e) =>
                                                setNuevaSesion((prev) => ({
                                                    ...prev,
                                                    hora: e.target.value,
                                                }))
                                            }
                                            size="sm"
                                        />
                                    </FormControl>
                                </HStack>

                                <HStack spacing={2} w="full">
                                    <FormControl>
                                        <FormLabel fontSize="sm">Duración (min)</FormLabel>
                                        <Select
                                            value={nuevaSesion.duracion_minutos}
                                            onChange={(e) =>
                                                setNuevaSesion((prev) => ({
                                                    ...prev,
                                                    duracion_minutos: parseInt(
                                                        e.target.value
                                                    ),
                                                }))
                                            }
                                            size="sm"
                                        >
                                            <option value="30">30 min</option>
                                            <option value="45">45 min</option>
                                            <option value="60">60 min</option>
                                            <option value="90">90 min</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontSize="sm">Tipo</FormLabel>
                                        <Select
                                            value={nuevaSesion.tipo}
                                            onChange={(e) =>
                                                setNuevaSesion((prev) => ({
                                                    ...prev,
                                                    tipo: e.target.value,
                                                }))
                                            }
                                            size="sm"
                                        >
                                            <option value="personalizada">
                                                Personalizada
                                            </option>
                                            <option value="grupal">Grupal</option>
                                            <option value="evaluacion">
                                                Evaluación
                                            </option>
                                        </Select>
                                    </FormControl>
                                </HStack>

                                <FormControl>
                                    <FormLabel fontSize="sm">Notas</FormLabel>
                                    <Textarea
                                        value={nuevaSesion.notas}
                                        onChange={(e) =>
                                            setNuevaSesion((prev) => ({
                                                ...prev,
                                                notas: e.target.value,
                                            }))
                                        }
                                        placeholder="Objetivos, ejercicios a trabajar..."
                                        size="sm"
                                        rows={2}
                                    />
                                </FormControl>

                                <Button
                                    leftIcon={<FiPlus />}
                                    colorScheme="green"
                                    onClick={handleCrearSesion}
                                    isLoading={loading}
                                    w="full"
                                    size="sm"
                                >
                                    Programar Sesión
                                </Button>
                            </VStack>
                        </Box>

                        <Divider />

                        {/* Lista de sesiones */}
                        <Box>
                            <HStack justify="space-between" mb={3}>
                                <Text fontWeight="bold" color="gray.700">
                                    Sesiones Programadas
                                </Text>
                                <Badge colorScheme="blue" fontSize="md" px={2}>
                                    {sesiones.length}
                                </Badge>
                            </HStack>
                            {loading && sesiones.length === 0 ? (
                                <Text color="gray.500" fontSize="sm">
                                    Cargando...
                                </Text>
                            ) : sesiones.length === 0 ? (
                                <Text color="gray.500" fontSize="sm">
                                    No hay sesiones programadas
                                </Text>
                            ) : (
                                <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
                                    {sesionesOrdenadas.map((sesion) => {
                                        const cliente = clientes.find(
                                            (c) => c.id === sesion.usuario_id
                                        )
                                        return (
                                            <Box
                                                key={sesion.id}
                                                p={3}
                                                bg="gray.50"
                                                borderRadius="md"
                                                borderLeft="4px solid"
                                                borderLeftColor={`${getEstadoColor(
                                                    sesion.estado
                                                )}.400`}
                                            >
                                                <HStack justify="space-between" mb={2}>
                                                    <HStack spacing={2}>
                                                        <Avatar
                                                            size="xs"
                                                            name={
                                                                cliente
                                                                    ? `${cliente.nombre} ${cliente.apellido}`
                                                                    : 'Cliente'
                                                            }
                                                            bg="blue.400"
                                                        />
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="medium"
                                                        >
                                                            {cliente
                                                                ? `${cliente.nombre} ${cliente.apellido}`
                                                                : 'Cliente desconocido'}
                                                        </Text>
                                                    </HStack>
                                                    <HStack>
                                                        <Badge
                                                            colorScheme={getTipoColor(
                                                                sesion.tipo
                                                            )}
                                                            fontSize="xs"
                                                        >
                                                            {sesion.tipo}
                                                        </Badge>
                                                        <Badge
                                                            colorScheme={getEstadoColor(
                                                                sesion.estado
                                                            )}
                                                            fontSize="xs"
                                                        >
                                                            {sesion.estado}
                                                        </Badge>
                                                    </HStack>
                                                </HStack>

                                                <HStack
                                                    fontSize="xs"
                                                    color="gray.600"
                                                    spacing={3}
                                                    mb={2}
                                                >
                                                    <Text>
                                                        📅{' '}
                                                        {new Date(
                                                            sesion.fecha
                                                        ).toLocaleDateString('es-ES')}
                                                    </Text>
                                                    {sesion.hora && (
                                                        <Text>🕐 {sesion.hora}</Text>
                                                    )}
                                                    <Text>
                                                        ⏱️ {sesion.duracion_minutos} min
                                                    </Text>
                                                </HStack>

                                                {sesion.notas && (
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.500"
                                                        mb={2}
                                                    >
                                                        {sesion.notas}
                                                    </Text>
                                                )}

                                                {sesion.estado === 'programada' && (
                                                    <HStack spacing={2}>
                                                        <Button
                                                            size="xs"
                                                            colorScheme="green"
                                                            leftIcon={<FiCheckCircle />}
                                                            onClick={() =>
                                                                handleActualizarEstado(
                                                                    sesion.id,
                                                                    'completada'
                                                                )
                                                            }
                                                        >
                                                            Completar
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            colorScheme="red"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleActualizarEstado(
                                                                    sesion.id,
                                                                    'cancelada'
                                                                )
                                                            }
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </HStack>
                                                )}
                                            </Box>
                                        )
                                    })}
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
