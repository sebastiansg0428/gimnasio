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
    Textarea,
    useToast,
    Text,
    Box,
    Badge,
    Divider,
    Avatar,
    Progress,
} from '@chakra-ui/react'
import { FiStar, FiAward } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import {
    getValoracionesEntrenador,
    createValoracionEntrenador,
    getClientesEntrenador,
} from '../../utils/api'

export default function ValoracionesModal({ isOpen, onClose, entrenador }) {
    const [valoraciones, setValoraciones] = useState([])
    const [clientes, setClientes] = useState([])
    const [loading, setLoading] = useState(false)
    const [nuevaValoracion, setNuevaValoracion] = useState({
        usuario_id: '',
        puntuacion: 5,
        comentario: '',
    })
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
            const [valoracionesData, clientesData] = await Promise.all([
                getValoracionesEntrenador(entrenador.id),
                getClientesEntrenador(entrenador.id),
            ])
            setValoraciones(Array.isArray(valoracionesData) ? valoracionesData : [])
            setClientes(Array.isArray(clientesData) ? clientesData : [])
        } catch (err) {
            console.error('Error cargando datos:', err)
            toast({
                title: 'Error al cargar valoraciones',
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleCrearValoracion() {
        if (!entrenador?.id || !nuevaValoracion.usuario_id) {
            toast({
                title: 'Selecciona un cliente',
                status: 'warning',
                duration: 2000,
            })
            return
        }

        setLoading(true)
        
        // Usar setTimeout para evitar manipulación síncrona del DOM
        setTimeout(async () => {
            try {
                await createValoracionEntrenador(entrenador.id, nuevaValoracion)
                toast({
                    title: 'Valoración agregada exitosamente',
                    status: 'success',
                    duration: 2000,
                })
                await cargarDatos()
                setNuevaValoracion({
                    usuario_id: '',
                    puntuacion: 5,
                    comentario: '',
                })
            } catch (err) {
                console.error('Error:', err)
                toast({
                    title: 'Error al agregar valoración',
                    description: err.message,
                    status: 'error',
                    duration: 3000,
                })
            } finally {
                setLoading(false)
            }
        }, 0)
    }

    // Calcular promedio de puntuaciones
    const promedioValoracion =
        valoraciones.length > 0
            ? (
                  valoraciones.reduce((sum, v) => sum + v.puntuacion, 0) /
                  valoraciones.length
              ).toFixed(1)
            : 0

    // Contar valoraciones por estrella
    const conteoEstrellas = [5, 4, 3, 2, 1].map((estrella) => ({
        estrella,
        count: valoraciones.filter((v) => v.puntuacion === estrella).length,
    }))

    const renderEstrellas = (puntuacion) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FiStar
                key={i}
                fill={i < puntuacion ? 'gold' : 'none'}
                color={i < puntuacion ? 'gold' : 'gray'}
                size={16}
            />
        ))
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent maxH="90vh">
                <ModalHeader>
                    <HStack>
                        <FiAward />
                        <Text>
                            Valoraciones de {entrenador?.nombre} {entrenador?.apellido}
                        </Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Resumen de valoraciones */}
                        <Box bg="yellow.50" p={4} borderRadius="md" textAlign="center">
                            <HStack justify="center" mb={2}>
                                <Text fontSize="4xl" fontWeight="bold" color="yellow.600">
                                    {promedioValoracion}
                                </Text>
                                <VStack align="start" spacing={0}>
                                    <HStack>{renderEstrellas(Math.round(promedioValoracion))}</HStack>
                                    <Text fontSize="xs" color="gray.600">
                                        {valoraciones.length} valoracion
                                        {valoraciones.length !== 1 ? 'es' : ''}
                                    </Text>
                                </VStack>
                            </HStack>

                            {/* Distribución de estrellas */}
                            <VStack spacing={1} mt={3}>
                                {conteoEstrellas.map(({ estrella, count }) => (
                                    <HStack key={estrella} w="full" fontSize="sm">
                                        <Text w="20px">{estrella}</Text>
                                        <FiStar size={12} fill="gold" color="gold" />
                                        <Progress
                                            value={
                                                valoraciones.length > 0
                                                    ? (count / valoraciones.length) * 100
                                                    : 0
                                            }
                                            size="sm"
                                            flex={1}
                                            colorScheme="yellow"
                                        />
                                        <Text w="30px" textAlign="right" color="gray.600">
                                            {count}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>

                        <Divider />

                        {/* Formulario para nueva valoración */}
                        <Box bg="green.50" p={4} borderRadius="md">
                            <Text fontWeight="bold" mb={3} color="green.700">
                                Agregar Nueva Valoración
                            </Text>
                            <VStack spacing={3}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Cliente</FormLabel>
                                    <Select
                                        placeholder="Seleccionar cliente..."
                                        value={nuevaValoracion.usuario_id}
                                        onChange={(e) =>
                                            setNuevaValoracion((prev) => ({
                                                ...prev,
                                                usuario_id: e.target.value,
                                            }))
                                        }
                                        size="sm"
                                    >
                                        {clientes.map((cliente) => (
                                            <option key={cliente.usuario_id} value={cliente.usuario_id}>
                                                {cliente.nombre}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Puntuación</FormLabel>
                                    <HStack spacing={2} justify="center" p={2}>
                                        {[1, 2, 3, 4, 5].map((estrella) => (
                                            <Box
                                                key={estrella}
                                                as="button"
                                                onClick={() =>
                                                    setNuevaValoracion((prev) => ({
                                                        ...prev,
                                                        puntuacion: estrella,
                                                    }))
                                                }
                                                cursor="pointer"
                                                transition="all 0.2s"
                                                _hover={{ transform: 'scale(1.2)' }}
                                            >
                                                <FiStar
                                                    size={32}
                                                    fill={
                                                        estrella <=
                                                        nuevaValoracion.puntuacion
                                                            ? 'gold'
                                                            : 'none'
                                                    }
                                                    color={
                                                        estrella <=
                                                        nuevaValoracion.puntuacion
                                                            ? 'gold'
                                                            : 'gray'
                                                    }
                                                />
                                            </Box>
                                        ))}
                                    </HStack>
                                    <Text textAlign="center" fontSize="sm" color="gray.600">
                                        {nuevaValoracion.puntuacion} estrella
                                        {nuevaValoracion.puntuacion !== 1 ? 's' : ''}
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm">Comentario</FormLabel>
                                    <Textarea
                                        value={nuevaValoracion.comentario}
                                        onChange={(e) =>
                                            setNuevaValoracion((prev) => ({
                                                ...prev,
                                                comentario: e.target.value,
                                            }))
                                        }
                                        placeholder="Comparte tu experiencia con este entrenador..."
                                        size="sm"
                                        rows={3}
                                    />
                                </FormControl>

                                <Button
                                    colorScheme="green"
                                    onClick={handleCrearValoracion}
                                    isLoading={loading}
                                    isDisabled={loading}
                                    w="full"
                                    size="sm"
                                >
                                    ⭐ Agregar Valoración
                                </Button>
                            </VStack>
                        </Box>

                        <Divider />

                        {/* Lista de valoraciones */}
                        <Box>
                            <Text fontWeight="bold" color="gray.700" mb={3}>
                                Comentarios de Clientes
                            </Text>
                            {loading && valoraciones.length === 0 ? (
                                <Text color="gray.500" fontSize="sm">
                                    Cargando...
                                </Text>
                            ) : valoraciones.length === 0 ? (
                                <Text color="gray.500" fontSize="sm">
                                    No hay valoraciones aún
                                </Text>
                            ) : (
                                <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
                                    {valoraciones.map((valoracion, index) => {
                                        const cliente = clientes.find(
                                            (c) => c.usuario_id === valoracion.usuario_id
                                        )
                                        const valoracionId = valoracion.id || `val-${index}`
                                        
                                        return (
                                            <Box
                                                key={valoracionId}
                                                p={3}
                                                bg="gray.50"
                                                borderRadius="md"
                                            >
                                                <HStack justify="space-between" mb={2}>
                                                    <HStack>
                                                        <Avatar
                                                            size="sm"
                                                            name={cliente?.nombre || 'Cliente'}
                                                            bg="blue.400"
                                                        />
                                                        <VStack align="start" spacing={0}>
                                                            <Text
                                                                fontSize="sm"
                                                                fontWeight="medium"
                                                            >
                                                                {cliente?.nombre || 'Cliente'}
                                                            </Text>
                                                            <HStack>
                                                                {renderEstrellas(
                                                                    valoracion.puntuacion
                                                                )}
                                                            </HStack>
                                                        </VStack>
                                                    </HStack>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {valoracion.fecha
                                                            ? new Date(
                                                                  valoracion.fecha
                                                              ).toLocaleDateString('es-ES')
                                                            : ''}
                                                    </Text>
                                                </HStack>
                                                {valoracion.comentario && (
                                                    <Text fontSize="sm" color="gray.700">
                                                        "{valoracion.comentario}"
                                                    </Text>
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
