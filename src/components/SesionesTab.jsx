import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    IconButton,
    useToast,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    VStack,
    HStack,
    Text,
    Heading,
    Card,
    CardHeader,
    CardBody,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel
} from '@chakra-ui/react'
import { FiPlus, FiEye, FiEdit3, FiTrash2, FiRefreshCw, FiCalendar, FiClock, FiUser, FiUsers } from 'react-icons/fi'
import { sesionesAPI, usuariosAPI } from '../services/api'

export default function SesionesTab() {
    const [sesiones, setSesiones] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [sesionSeleccionada, setSesionSeleccionada] = useState(null)
    const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
    const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
    const [filtroUsuario, setFiltroUsuario] = useState('')
    const toast = useToast()

    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()

    const [nuevaSesion, setNuevaSesion] = useState({
        usuario_id: '',
        entrenador_id: '',
        fecha: new Date().toISOString().split('T')[0],
        hora_inicio: '',
        hora_fin: '',
        tipo: 'personal',
        estado: 'programada',
        notas: '',
        observaciones: ''
    })

    const [sesionEditando, setSesionEditando] = useState(null)

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setLoading(true)
        try {
            const [sesionesData, usuariosData] = await Promise.all([
                sesionesAPI.getSesiones(),
                usuariosAPI.getUsuarios()
            ])
            setSesiones(sesionesData || [])
            setUsuarios(usuariosData || [])
        } catch (error) {
            console.error('Error cargando datos:', error)
            toast({
                title: 'Error al cargar datos',
                description: error.message,
                status: 'error',
                duration: 4000
            })
        } finally {
            setLoading(false)
        }
    }

    const aplicarFiltros = async () => {
        setLoading(true)
        try {
            const filtros = {}
            if (filtroFechaDesde) filtros.fecha_desde = filtroFechaDesde
            if (filtroFechaHasta) filtros.fecha_hasta = filtroFechaHasta
            if (filtroUsuario) filtros.usuario_id = filtroUsuario

            const data = await sesionesAPI.getSesiones(filtros)
            setSesiones(data || [])
            toast({
                title: '✅ Filtros aplicados',
                status: 'success',
                duration: 2000
            })
        } catch (error) {
            console.error('Error aplicando filtros:', error)
            toast({
                title: 'Error al aplicar filtros',
                description: error.message,
                status: 'error',
                duration: 4000
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCrearSesion = async () => {
        if (!nuevaSesion.usuario_id || !nuevaSesion.fecha || !nuevaSesion.hora_inicio) {
            toast({
                title: 'Completa los campos requeridos',
                status: 'warning',
                duration: 2000
            })
            return
        }

        try {
            await sesionesAPI.createSesion(nuevaSesion)
            toast({
                title: '✅ Sesión creada',
                status: 'success',
                duration: 2000
            })
            onCreateClose()
            cargarDatos()
            setNuevaSesion({
                usuario_id: '',
                entrenador_id: '',
                fecha: new Date().toISOString().split('T')[0],
                hora_inicio: '',
                hora_fin: '',
                tipo: 'personal',
                estado: 'programada',
                notas: '',
                observaciones: ''
            })
        } catch (error) {
            console.error('Error creando sesión:', error)
            toast({
                title: 'Error al crear sesión',
                description: error.message,
                status: 'error',
                duration: 4000
            })
        }
    }

    const handleEditarSesion = async () => {
        if (!sesionEditando) return

        try {
            await sesionesAPI.updateSesion(sesionEditando.id, sesionEditando)
            toast({
                title: '✅ Sesión actualizada',
                status: 'success',
                duration: 2000
            })
            onEditClose()
            cargarDatos()
        } catch (error) {
            console.error('Error actualizando sesión:', error)
            toast({
                title: 'Error al actualizar sesión',
                description: error.message,
                status: 'error',
                duration: 4000
            })
        }
    }

    const handleVerDetalles = async (id) => {
        try {
            const data = await sesionesAPI.getSesion(id)
            setSesionSeleccionada(data)
            onDetailOpen()
        } catch (error) {
            console.error('Error obteniendo detalles:', error)
            toast({
                title: 'Error al obtener detalles',
                description: error.message,
                status: 'error',
                duration: 4000
            })
        }
    }

    const handleEliminarSesion = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta sesión?')) return

        try {
            await sesionesAPI.deleteSesion(id)
            toast({
                title: '✅ Sesión eliminada',
                status: 'success',
                duration: 2000
            })
            cargarDatos()
        } catch (error) {
            console.error('Error eliminando sesión:', error)
            toast({
                title: 'Error al eliminar sesión',
                description: error.message,
                status: 'error',
                duration: 4000
            })
        }
    }

    const abrirModalEditar = (sesion) => {
        setSesionEditando({ ...sesion })
        onEditOpen()
    }

    const getEstadoBadge = (estado) => {
        const colores = {
            'programada': 'blue',
            'en_progreso': 'yellow',
            'completada': 'green',
            'cancelada': 'red',
            'pendiente': 'orange'
        }
        return <Badge colorScheme={colores[estado] || 'gray'}>{estado?.toUpperCase().replace('_', ' ')}</Badge>
    }

    const getTipoBadge = (tipo) => {
        const colores = {
            'personal': 'purple',
            'grupal': 'cyan',
            'evaluacion': 'orange',
            'seguimiento': 'teal'
        }
        return <Badge colorScheme={colores[tipo] || 'gray'}>{tipo?.toUpperCase()}</Badge>
    }

    // Calcular estadísticas
    const totalSesiones = sesiones.length
    const sesionesCompletadas = sesiones.filter(s => s.estado === 'completada').length
    const sesionesProgramadas = sesiones.filter(s => s.estado === 'programada').length
    const sesionesCanceladas = sesiones.filter(s => s.estado === 'cancelada').length

    if (loading) {
        return (
            <Center h="400px">
                <VStack spacing={4}>
                    <Spinner size="xl" color="green.500" thickness="4px" />
                    <Text color="gray.600">Cargando sesiones...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <Box>
            {/* Header */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="green.600">
                    📅 Gestión de Sesiones
                </Heading>
                <HStack>
                    <Button
                        leftIcon={<FiRefreshCw />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={cargarDatos}
                        isLoading={loading}
                    >
                        Actualizar
                    </Button>
                    <Button
                        leftIcon={<FiPlus />}
                        colorScheme="green"
                        onClick={onCreateOpen}
                    >
                        Nueva Sesión
                    </Button>
                </HStack>
            </HStack>

            {/* Estadísticas */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
                <Card borderTop="4px solid" borderColor="blue.500">
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Sesiones</StatLabel>
                            <StatNumber>{totalSesiones}</StatNumber>
                            <StatHelpText>
                                <FiCalendar style={{ display: 'inline', marginRight: '4px' }} />
                                Todas
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card borderTop="4px solid" borderColor="green.500">
                    <CardBody>
                        <Stat>
                            <StatLabel>Completadas</StatLabel>
                            <StatNumber color="green.600">{sesionesCompletadas}</StatNumber>
                            <StatHelpText>Finalizadas</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card borderTop="4px solid" borderColor="yellow.500">
                    <CardBody>
                        <Stat>
                            <StatLabel>Programadas</StatLabel>
                            <StatNumber color="yellow.600">{sesionesProgramadas}</StatNumber>
                            <StatHelpText>Pendientes</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card borderTop="4px solid" borderColor="red.500">
                    <CardBody>
                        <Stat>
                            <StatLabel>Canceladas</StatLabel>
                            <StatNumber color="red.600">{sesionesCanceladas}</StatNumber>
                            <StatHelpText>No realizadas</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filtros */}
            <Card mb={6}>
                <CardBody>
                    <HStack spacing={4} flexWrap="wrap">
                        <FormControl maxW="200px">
                            <FormLabel fontSize="sm">Usuario</FormLabel>
                            <Select
                                value={filtroUsuario}
                                onChange={(e) => setFiltroUsuario(e.target.value)}
                                size="sm"
                                placeholder="Todos"
                            >
                                {usuarios.map((usuario) => (
                                    <option key={usuario.id} value={usuario.id}>
                                        {usuario.nombre} {usuario.apellido}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl maxW="200px">
                            <FormLabel fontSize="sm">Desde</FormLabel>
                            <Input
                                type="date"
                                value={filtroFechaDesde}
                                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                                size="sm"
                            />
                        </FormControl>

                        <FormControl maxW="200px">
                            <FormLabel fontSize="sm">Hasta</FormLabel>
                            <Input
                                type="date"
                                value={filtroFechaHasta}
                                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                                size="sm"
                            />
                        </FormControl>

                        <Button
                            colorScheme="blue"
                            onClick={aplicarFiltros}
                            mt={7}
                            size="sm"
                        >
                            Aplicar Filtros
                        </Button>
                    </HStack>
                </CardBody>
            </Card>

            {/* Tabla de sesiones */}
            <Card>
                <CardBody>
                    {sesiones.length === 0 ? (
                        <Alert status="info">
                            <AlertIcon />
                            No hay sesiones registradas
                        </Alert>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Usuario</Th>
                                    <Th>Entrenador</Th>
                                    <Th>Fecha</Th>
                                    <Th>Hora Inicio</Th>
                                    <Th>Hora Fin</Th>
                                    <Th>Tipo</Th>
                                    <Th>Estado</Th>
                                    <Th>Acciones</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {sesiones.map((sesion) => (
                                    <Tr key={sesion.id}>
                                        <Td fontWeight="bold">#{sesion.id}</Td>
                                        <Td>{sesion.usuario_nombre || `Usuario ${sesion.usuario_id}`}</Td>
                                        <Td>{sesion.entrenador_nombre || sesion.entrenador_id || '-'}</Td>
                                        <Td>{sesion.fecha}</Td>
                                        <Td>{sesion.hora_inicio || '-'}</Td>
                                        <Td>{sesion.hora_fin || '-'}</Td>
                                        <Td>{getTipoBadge(sesion.tipo)}</Td>
                                        <Td>{getEstadoBadge(sesion.estado)}</Td>
                                        <Td>
                                            <HStack spacing={2}>
                                                <IconButton
                                                    icon={<FiEye />}
                                                    size="sm"
                                                    colorScheme="blue"
                                                    variant="ghost"
                                                    onClick={() => handleVerDetalles(sesion.id)}
                                                />
                                                <IconButton
                                                    icon={<FiEdit3 />}
                                                    size="sm"
                                                    colorScheme="orange"
                                                    variant="ghost"
                                                    onClick={() => abrirModalEditar(sesion)}
                                                />
                                                <IconButton
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleEliminarSesion(sesion.id)}
                                                />
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Modal: Crear Sesión */}
            <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>📅 Nueva Sesión</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Usuario</FormLabel>
                                <Select
                                    value={nuevaSesion.usuario_id}
                                    onChange={(e) => setNuevaSesion({ ...nuevaSesion, usuario_id: e.target.value })}
                                    placeholder="Selecciona un usuario"
                                >
                                    {usuarios.map((usuario) => (
                                        <option key={usuario.id} value={usuario.id}>
                                            {usuario.nombre} {usuario.apellido} - {usuario.email}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <SimpleGrid columns={2} spacing={4} w="100%">
                                <FormControl isRequired>
                                    <FormLabel>Fecha</FormLabel>
                                    <Input
                                        type="date"
                                        value={nuevaSesion.fecha}
                                        onChange={(e) => setNuevaSesion({ ...nuevaSesion, fecha: e.target.value })}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Hora Inicio</FormLabel>
                                    <Input
                                        type="time"
                                        value={nuevaSesion.hora_inicio}
                                        onChange={(e) => setNuevaSesion({ ...nuevaSesion, hora_inicio: e.target.value })}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Hora Fin</FormLabel>
                                    <Input
                                        type="time"
                                        value={nuevaSesion.hora_fin}
                                        onChange={(e) => setNuevaSesion({ ...nuevaSesion, hora_fin: e.target.value })}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select
                                        value={nuevaSesion.tipo}
                                        onChange={(e) => setNuevaSesion({ ...nuevaSesion, tipo: e.target.value })}
                                    >
                                        <option value="personal">Personal</option>
                                        <option value="grupal">Grupal</option>
                                        <option value="evaluacion">Evaluación</option>
                                        <option value="seguimiento">Seguimiento</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            <FormControl>
                                <FormLabel>Estado</FormLabel>
                                <Select
                                    value={nuevaSesion.estado}
                                    onChange={(e) => setNuevaSesion({ ...nuevaSesion, estado: e.target.value })}
                                >
                                    <option value="programada">Programada</option>
                                    <option value="en_progreso">En Progreso</option>
                                    <option value="completada">Completada</option>
                                    <option value="cancelada">Cancelada</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Notas</FormLabel>
                                <Textarea
                                    value={nuevaSesion.notas}
                                    onChange={(e) => setNuevaSesion({ ...nuevaSesion, notas: e.target.value })}
                                    placeholder="Objetivos, ejercicios planificados..."
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Observaciones</FormLabel>
                                <Textarea
                                    value={nuevaSesion.observaciones}
                                    onChange={(e) => setNuevaSesion({ ...nuevaSesion, observaciones: e.target.value })}
                                    placeholder="Resultados, comentarios..."
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCreateClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={handleCrearSesion}>
                            Crear Sesión
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal: Editar Sesión */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>✏️ Editar Sesión</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {sesionEditando && (
                            <VStack spacing={4}>
                                <SimpleGrid columns={2} spacing={4} w="100%">
                                    <FormControl>
                                        <FormLabel>Fecha</FormLabel>
                                        <Input
                                            type="date"
                                            value={sesionEditando.fecha}
                                            onChange={(e) => setSesionEditando({ ...sesionEditando, fecha: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Hora Inicio</FormLabel>
                                        <Input
                                            type="time"
                                            value={sesionEditando.hora_inicio || ''}
                                            onChange={(e) => setSesionEditando({ ...sesionEditando, hora_inicio: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Hora Fin</FormLabel>
                                        <Input
                                            type="time"
                                            value={sesionEditando.hora_fin || ''}
                                            onChange={(e) => setSesionEditando({ ...sesionEditando, hora_fin: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Estado</FormLabel>
                                        <Select
                                            value={sesionEditando.estado}
                                            onChange={(e) => setSesionEditando({ ...sesionEditando, estado: e.target.value })}
                                        >
                                            <option value="programada">Programada</option>
                                            <option value="en_progreso">En Progreso</option>
                                            <option value="completada">Completada</option>
                                            <option value="cancelada">Cancelada</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl>
                                    <FormLabel>Notas</FormLabel>
                                    <Textarea
                                        value={sesionEditando.notas || ''}
                                        onChange={(e) => setSesionEditando({ ...sesionEditando, notas: e.target.value })}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Observaciones</FormLabel>
                                    <Textarea
                                        value={sesionEditando.observaciones || ''}
                                        onChange={(e) => setSesionEditando({ ...sesionEditando, observaciones: e.target.value })}
                                    />
                                </FormControl>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme="blue" onClick={handleEditarSesion}>
                            Guardar Cambios
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal: Detalles de Sesión */}
            <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>📄 Detalles de Sesión</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {sesionSeleccionada && (
                            <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                    <Text fontWeight="bold" fontSize="lg">Sesión #{sesionSeleccionada.id}</Text>
                                    <HStack>
                                        {getTipoBadge(sesionSeleccionada.tipo)}
                                        {getEstadoBadge(sesionSeleccionada.estado)}
                                    </HStack>
                                </HStack>

                                <Box>
                                    <Text fontWeight="bold" mb={2}>Información General</Text>
                                    <Text>Usuario: {sesionSeleccionada.usuario_nombre || sesionSeleccionada.usuario_id}</Text>
                                    <Text>Entrenador: {sesionSeleccionada.entrenador_nombre || sesionSeleccionada.entrenador_id || 'No asignado'}</Text>
                                    <Text>Fecha: {sesionSeleccionada.fecha}</Text>
                                    <Text>Hora: {sesionSeleccionada.hora_inicio} - {sesionSeleccionada.hora_fin || 'Sin especificar'}</Text>
                                </Box>

                                {sesionSeleccionada.notas && (
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>Notas</Text>
                                        <Text whiteSpace="pre-wrap">{sesionSeleccionada.notas}</Text>
                                    </Box>
                                )}

                                {sesionSeleccionada.observaciones && (
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>Observaciones</Text>
                                        <Text whiteSpace="pre-wrap">{sesionSeleccionada.observaciones}</Text>
                                    </Box>
                                )}
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onDetailClose}>
                            Cerrar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
