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
    Badge,
    IconButton,
    useToast,
    Text,
    Box,
    Divider,
} from '@chakra-ui/react'
import { FiPlus, FiTrash2, FiClock } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import {
    getHorariosEntrenador,
    createHorarioEntrenador,
    deleteHorarioEntrenador,
} from '../../utils/api'

export default function HorariosModal({ isOpen, onClose, entrenador }) {
    const [horarios, setHorarios] = useState([])
    const [loading, setLoading] = useState(false)
    const [nuevoHorario, setNuevoHorario] = useState({
        dia_semana: 'lunes',
        hora_inicio: '08:00',
        hora_fin: '09:00',
    })
    const toast = useToast()

    useEffect(() => {
        if (isOpen && entrenador?.id) {
            cargarHorarios()
        }
    }, [isOpen, entrenador])

    async function cargarHorarios() {
        if (!entrenador?.id) return
        setLoading(true)
        try {
            const data = await getHorariosEntrenador(entrenador.id)
            setHorarios(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error cargando horarios:', err)
            toast({
                title: 'Error al cargar horarios',
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleAgregarHorario() {
        if (!entrenador?.id) return
        setLoading(true)
        try {
            await createHorarioEntrenador(entrenador.id, nuevoHorario)
            toast({
                title: 'Horario agregado',
                status: 'success',
                duration: 2000,
            })
            cargarHorarios()
            setNuevoHorario({
                dia_semana: 'lunes',
                hora_inicio: '08:00',
                hora_fin: '09:00',
            })
        } catch (err) {
            console.error('Error:', err)
            toast({
                title: 'Error al agregar horario',
                description: err.message,
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleEliminarHorario(horarioId) {
        if (!window.confirm('¿Eliminar este horario?')) return
        setLoading(true)
        try {
            await deleteHorarioEntrenador(entrenador.id, horarioId)
            toast({
                title: 'Horario eliminado',
                status: 'info',
                duration: 2000,
            })
            setHorarios((prev) => prev.filter((h) => h.id !== horarioId))
        } catch (err) {
            console.error('Error:', err)
            toast({
                title: 'Error al eliminar horario',
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    const dias = [
        'lunes',
        'martes',
        'miercoles',
        'jueves',
        'viernes',
        'sabado',
        'domingo',
    ]

    const getDiaColor = (dia) => {
        const colores = {
            lunes: 'blue',
            martes: 'green',
            miercoles: 'purple',
            jueves: 'orange',
            viernes: 'pink',
            sabado: 'cyan',
            domingo: 'red',
        }
        return colores[dia] || 'gray'
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack>
                        <FiClock />
                        <Text>
                            Horarios de {entrenador?.nombre} {entrenador?.apellido}
                        </Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Formulario para agregar nuevo horario */}
                        <Box bg="green.50" p={4} borderRadius="md">
                            <Text fontWeight="bold" mb={3} color="green.700">
                                Agregar Nuevo Horario
                            </Text>
                            <HStack spacing={3}>
                                <FormControl>
                                    <FormLabel fontSize="sm">Día</FormLabel>
                                    <Select
                                        value={nuevoHorario.dia_semana}
                                        onChange={(e) =>
                                            setNuevoHorario((prev) => ({
                                                ...prev,
                                                dia_semana: e.target.value,
                                            }))
                                        }
                                        size="sm"
                                    >
                                        {dias.map((dia) => (
                                            <option key={dia} value={dia}>
                                                {dia.charAt(0).toUpperCase() +
                                                    dia.slice(1)}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="sm">Inicio</FormLabel>
                                    <Select
                                        value={nuevoHorario.hora_inicio}
                                        onChange={(e) =>
                                            setNuevoHorario((prev) => ({
                                                ...prev,
                                                hora_inicio: e.target.value,
                                            }))
                                        }
                                        size="sm"
                                    >
                                        {Array.from({ length: 15 }, (_, i) => {
                                            const hora = 6 + i
                                            return (
                                                <option
                                                    key={hora}
                                                    value={`${hora
                                                        .toString()
                                                        .padStart(2, '0')}:00`}
                                                >
                                                    {hora.toString().padStart(2, '0')}:00
                                                </option>
                                            )
                                        })}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontSize="sm">Fin</FormLabel>
                                    <Select
                                        value={nuevoHorario.hora_fin}
                                        onChange={(e) =>
                                            setNuevoHorario((prev) => ({
                                                ...prev,
                                                hora_fin: e.target.value,
                                            }))
                                        }
                                        size="sm"
                                    >
                                        {Array.from({ length: 15 }, (_, i) => {
                                            const hora = 6 + i
                                            return (
                                                <option
                                                    key={hora}
                                                    value={`${hora
                                                        .toString()
                                                        .padStart(2, '0')}:00`}
                                                >
                                                    {hora.toString().padStart(2, '0')}:00
                                                </option>
                                            )
                                        })}
                                    </Select>
                                </FormControl>
                                <IconButton
                                    aria-label="Agregar"
                                    icon={<FiPlus />}
                                    colorScheme="green"
                                    onClick={handleAgregarHorario}
                                    isLoading={loading}
                                    mt={6}
                                    size="sm"
                                />
                            </HStack>
                        </Box>

                        <Divider />

                        {/* Lista de horarios existentes */}
                        <Box>
                            <Text fontWeight="bold" mb={3} color="gray.700">
                                Horarios Disponibles
                            </Text>
                            {loading && horarios.length === 0 ? (
                                <Text color="gray.500" fontSize="sm">
                                    Cargando...
                                </Text>
                            ) : horarios.length === 0 ? (
                                <Text color="gray.500" fontSize="sm">
                                    No hay horarios configurados
                                </Text>
                            ) : (
                                <VStack spacing={2} align="stretch">
                                    {horarios.map((horario) => (
                                        <HStack
                                            key={horario.id}
                                            p={3}
                                            bg="gray.50"
                                            borderRadius="md"
                                            justify="space-between"
                                        >
                                            <HStack spacing={3}>
                                                <Badge
                                                    colorScheme={getDiaColor(
                                                        horario.dia_semana
                                                    )}
                                                    fontSize="sm"
                                                    px={2}
                                                    py={1}
                                                >
                                                    {horario.dia_semana
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        horario.dia_semana.slice(1)}
                                                </Badge>
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {horario.hora_inicio} -{' '}
                                                    {horario.hora_fin}
                                                </Text>
                                            </HStack>
                                            <IconButton
                                                aria-label="Eliminar"
                                                icon={<FiTrash2 />}
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() =>
                                                    handleEliminarHorario(horario.id)
                                                }
                                            />
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
