import {
    Box,
    Heading,
    VStack,
    HStack,
    Input,
    Select,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    Textarea,
    Tag,
    Text,
    useToast,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Badge,
    Divider,
    Grid,
    GridItem,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Flex,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    List,
    ListItem,
    ListIcon,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Tooltip,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from '@chakra-ui/react'
import { 
    FiPlus, 
    FiEdit, 
    FiTrash2, 
    FiSearch, 
    FiX, 
    FiEye, 
    FiUsers, 
    FiActivity,
    FiBarChart2,
    FiCheckCircle,
    FiTarget,
    FiClock,
    FiCalendar,
    FiChevronDown,
    FiMoreVertical
} from 'react-icons/fi'
import { useState, useRef, useEffect } from 'react'
import { 
    getRutinas, 
    createRutina, 
    updateRutina, 
    deleteRutina,
    getRutina,
    getEjercicios,
    addEjercicioToRutina,
    updateEjercicioInRutina,
    deleteEjercicioFromRutina,
    getUsuarios,
    assignRutinaToUsuario,
    getRutinasUsuario,
    getEstadisticasRutinas
} from '../utils/api'

const initialRutinas = [
    { id: 1, nombre: 'Full Body Básico', duracionMin: 45, nivel: 'Principiante', descripcion: 'Rutina enfocada en fuerza global.' },
    { id: 2, nombre: 'HIIT Cardio', duracionMin: 30, nivel: 'Intermedio', descripcion: 'Intervalos de alta intensidad para cardio.' },
    { id: 3, nombre: 'Fuerza Piernas', duracionMin: 50, nivel: 'Avanzado', descripcion: 'Enfocada en cuádriceps, glúteos y femorales.' },
    { id: 5, nombre: 'Crossfit', duracionMin: 60, nivel: 'Avanzado', descripcion: 'Enfocada en cardio, fuerza y resistencia.' },
    { id: 6, nombre: 'Full Body / Upper-Lower (4 días)', duracionMin: 60, nivel: 'Avanzado', descripcion: 'Enfocada en cardio, fuerza y resistencia.' },
    { id: 7, nombre: 'Rutina para Hipertrofia (5 días / Bosu dividido)', duracionMin: 60, nivel: 'Intermedio', descripcion: 'Ideal para ganar masa muscular estética.' },
]

export default function RutinasTab() {
    const [rutinas, setRutinas] = useState([])
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [filtroNivel, setFiltroNivel] = useState('todos')
    const [filtroObjetivo, setFiltroObjetivo] = useState('todos')
    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [selected, setSelected] = useState(null)
    const [rutinaDetalle, setRutinaDetalle] = useState(null)
    const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)
    const [selectedEjercicio, setSelectedEjercicio] = useState(null)
    const [selectedUsuario, setSelectedUsuario] = useState(null)
    
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isDetalleOpen, onOpen: onDetalleOpen, onClose: onDetalleClose } = useDisclosure()
    const { isOpen: isEjercicioOpen, onOpen: onEjercicioOpen, onClose: onEjercicioClose } = useDisclosure()
    const { isOpen: isAsignarOpen, onOpen: onAsignarOpen, onClose: onAsignarClose } = useDisclosure()
    
    const toast = useToast()
    const nombreRef = useRef(null)

    const normalizeRutina = (r = {}) => ({
        ...r,
        id: r.id ?? r._id ?? r.insertId ?? r.id_rutina ?? null,
        nombre: r.nombre ?? r.name ?? '',
        descripcion: r.descripcion ?? r.description ?? r.desc ?? '',
        objetivo: r.objetivo ?? '',
        nivel: r.nivel ?? '',
        duracion_estimada: r.duracion_estimada ?? r.duracion_semanas ?? r.duracionMin ?? 60,
        frecuencia_semanal: r.frecuencia_semanal ?? r.frecuencia_por_semana ?? r.frecuencia ?? 3,
        usuario_id: r.usuario_id ?? null,
        tipo: r.tipo ?? 'publica',
        imagen_url: r.imagen_url ?? '',
        popularidad: r.popularidad ?? 0,
        estado: r.estado ?? 'activo',
    })

    useEffect(() => {
        if (isOpen && nombreRef.current) nombreRef.current.focus()
    }, [isOpen])

    useEffect(() => {
        let mounted = true
        async function load() {
            setLoading(true)
            try {
                const [dataRutinas, dataEjercicios, dataUsuarios, dataEstadisticas] = await Promise.all([
                    getRutinas(),
                    getEjercicios(),
                    getUsuarios(),
                    getEstadisticasRutinas().catch(() => null)
                ])
                
                const normalize = (r) => ({
                    ...r,
                    objetivo: r.objetivo ?? r.objetivo_presupuestado ?? '',
                    duracion_semanas: r.duracion_semanas ?? r.duracionSemanas ?? r.duracion_min ?? r.duracionMin ?? null,
                    frecuencia_por_semana: r.frecuencia_por_semana ?? r.frecuencia ?? null,
                    nivel: (r.nivel ?? '').toString(),
                })
                
                if (mounted) {
                    setRutinas(Array.isArray(dataRutinas) ? dataRutinas.map(normalize) : [])
                    setEjerciciosDisponibles(Array.isArray(dataEjercicios) ? dataEjercicios : [])
                    setUsuarios(Array.isArray(dataUsuarios) ? dataUsuarios : [])
                    setEstadisticas(dataEstadisticas)
                    
                    // DEBUG: Verificar usuarios cargados
                    console.log('👥 USUARIOS CARGADOS:', dataUsuarios)
                    console.log('👥 Total usuarios:', dataUsuarios?.length || 0)
                    console.log('👥 Primer usuario (estructura):', dataUsuarios?.[0])
                    console.log('👥 Usuarios activos:', dataUsuarios?.filter(u => u.estado === 'activo')?.length || 0)
                }
            } catch (err) {
                console.error('Error cargando datos', err)
                toast({ title: 'Error al cargar datos', status: 'error', duration: 3000 })
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    useEffect(() => {
        const t = setTimeout(() => {
            setBusqueda(inputValue)
        }, 350)
        return () => clearTimeout(t)
    }, [inputValue])

    const limpiarBusqueda = () => {
        setInputValue('')
        setBusqueda('')
    }

    const rutinasFiltradas = rutinas.filter(r => {
        const nombre = (r.nombre || '').toString().toLowerCase()
        const descripcion = (r.descripcion || '').toString().toLowerCase()
        const nivelVal = (r.nivel || '').toString().toLowerCase()
        const objetivoVal = (r.objetivo || '').toString().toLowerCase()
        const tipoVal = (r.tipo || '').toString().toLowerCase()
        
        const matchBusqueda = nombre.includes(busqueda.toLowerCase()) || descripcion.includes(busqueda.toLowerCase())
        const matchNivel = filtroNivel === 'todos' || nivelVal === filtroNivel.toLowerCase()
        const matchObjetivo = filtroObjetivo === 'todos' || objetivoVal === filtroObjetivo.toLowerCase()
        const matchTipo = filtroTipo === 'todos' || tipoVal === filtroTipo.toLowerCase()
        
        return matchBusqueda && matchNivel && matchObjetivo && matchTipo
    })

    function handleNuevo() {
        setSelected({ 
            id: null, 
            nombre: '', 
            nivel: 'intermedio', 
            descripcion: '', 
            objetivo: 'tonificacion', 
            duracion_estimada: 60, 
            frecuencia_semanal: 3,
            tipo: 'publica',
            imagen_url: '',
            estado: 'activo'
        })
        onOpen()
    }

    function handleEditar(r) {
        const normalized = {
            ...r,
            objetivo: r.objetivo ?? '',
            duracion_semanas: r.duracion_semanas ?? r.duracionSemanas ?? r.duracionMin ?? null,
            frecuencia_por_semana: r.frecuencia_por_semana ?? r.frecuencia ?? null,
            nivel: r.nivel ?? 'principiante',
        }
        setSelected(normalized)
        onOpen()
    }

    function handleEliminar(id) {
        async function eliminar() {
            try {
                await deleteRutina(id)
                setRutinas(prev => prev.filter(x => x.id !== id))
                toast({ title: 'Rutina eliminada', status: 'info', duration: 2000 })
            } catch (err) {
                console.error(err)
                toast({ title: 'Error al eliminar rutina', status: 'error', duration: 3000 })
            }
        }
        eliminar()
    }

    function handleSave() {
        if (!selected.nombre.trim()) {
            toast({ title: 'Nombre requerido', status: 'warning', duration: 2000 })
            return
        }
        async function guardar() {
            try {
                        if (selected.id == null) {
                            const payload = {
                                nombre: selected.nombre,
                                descripcion: selected.descripcion,
                                nivel: selected.nivel,
                                objetivo: selected.objetivo,
                                duracion_estimada: selected.duracion_estimada,
                                frecuencia_semanal: selected.frecuencia_semanal,
                                tipo: selected.tipo || 'publica',
                                imagen_url: selected.imagen_url || '',
                                estado: selected.estado || 'activo'
                            }
                            const created = await createRutina(payload)
                            const newItem = normalizeRutina(
                                (created && typeof created === 'object' && (created.id || created._id || created.insertId))
                                    ? { ...selected, ...created }
                                    : { ...selected, id: (created && created.id) || (created && created.insertId) || Date.now() }
                            )
                            setRutinas(prev => [newItem, ...prev])
                            toast({ title: 'Rutina creada', status: 'success', duration: 2000 })
                        } else {
                            const payload = {
                                nombre: selected.nombre,
                                descripcion: selected.descripcion,
                                nivel: selected.nivel,
                                objetivo: selected.objetivo,
                                duracion_estimada: selected.duracion_estimada,
                                frecuencia_semanal: selected.frecuencia_semanal,
                                tipo: selected.tipo || 'publica',
                                imagen_url: selected.imagen_url || '',
                                estado: selected.estado || 'activo'
                            }
                            const updated = await updateRutina(selected.id, payload)
                            
                            // Conservar todos los datos de selected y actualizar con la respuesta del backend
                            const updatedItem = normalizeRutina({
                                ...selected,
                                ...(updated || {}),
                                id: selected.id // Asegurar que mantenemos el ID original
                            })
                            
                            setRutinas(prev => prev.map(r => (r.id === selected.id ? updatedItem : r)))
                            toast({ title: 'Rutina actualizada', status: 'success', duration: 2000 })
                        }
                onClose()
            } catch (err) {
                console.error(err)
                toast({ title: 'Error al guardar rutina', status: 'error', duration: 3000 })
            }
        }
        guardar()
    }

    async function handleVerDetalle(rutina) {
        try {
            const detalle = await getRutina(rutina.id)
            setRutinaDetalle(detalle)
            onDetalleOpen()
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al cargar detalle', status: 'error', duration: 3000 })
        }
    }

    function handleAgregarEjercicio(rutina) {
        setRutinaDetalle(rutina)
        setSelectedEjercicio({
            ejercicio_id: '',
            orden: 1,
            series: 3,
            repeticiones: 10,
            descanso_segundos: 60,
            notas: ''
        })
        onEjercicioOpen()
    }

    function handleEditarEjercicio(rutina, ejercicio) {
        setRutinaDetalle(rutina)
        setSelectedEjercicio(ejercicio)
        onEjercicioOpen()
    }

    async function handleSaveEjercicio() {
        if (!selectedEjercicio.ejercicio_id) {
            toast({ title: 'Selecciona un ejercicio', status: 'warning', duration: 2000 })
            return
        }

        try {
            if (selectedEjercicio.id) {
                // Actualizar ejercicio existente
                await updateEjercicioInRutina(rutinaDetalle.id, selectedEjercicio.ejercicio_id, {
                    orden: selectedEjercicio.orden,
                    series: selectedEjercicio.series,
                    repeticiones: selectedEjercicio.repeticiones,
                    descanso_segundos: selectedEjercicio.descanso_segundos,
                    notas: selectedEjercicio.notas
                })
                toast({ title: 'Ejercicio actualizado', status: 'success', duration: 2000 })
            } else {
                // Agregar nuevo ejercicio
                await addEjercicioToRutina(rutinaDetalle.id, selectedEjercicio)
                toast({ title: 'Ejercicio agregado', status: 'success', duration: 2000 })
            }
            
            // Recargar detalle
            const detalle = await getRutina(rutinaDetalle.id)
            setRutinaDetalle(detalle)
            onEjercicioClose()
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al guardar ejercicio', status: 'error', duration: 3000 })
        }
    }

    async function handleEliminarEjercicio(rutinaId, ejercicioId) {
        try {
            await deleteEjercicioFromRutina(rutinaId, ejercicioId)
            const detalle = await getRutina(rutinaId)
            setRutinaDetalle(detalle)
            toast({ title: 'Ejercicio eliminado', status: 'info', duration: 2000 })
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al eliminar ejercicio', status: 'error', duration: 3000 })
        }
    }

    function handleAsignarRutina(rutina) {
        setRutinaDetalle(rutina)
        setSelectedUsuario({
            usuario_id: '',
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: '',
            objetivo_personalizado: '',
            notas: ''
        })
        onAsignarOpen()
    }

    async function handleSaveAsignacion() {
        if (!selectedUsuario.usuario_id) {
            toast({ title: 'Selecciona un usuario', status: 'warning', duration: 2000 })
            return
        }

        try {
            await assignRutinaToUsuario(selectedUsuario.usuario_id, rutinaDetalle.id, {
                fecha_inicio: selectedUsuario.fecha_inicio,
                fecha_fin: selectedUsuario.fecha_fin || null,
                objetivo_personalizado: selectedUsuario.objetivo_personalizado,
                notas: selectedUsuario.notas
            })
            toast({ title: 'Rutina asignada exitosamente', status: 'success', duration: 2000 })
            onAsignarClose()
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al asignar rutina', status: 'error', duration: 3000 })
        }
    }

    return (
        <Box>
            <Tabs colorScheme="green" variant="enclosed">
                <TabList mb={4}>
                    <Tab _selected={{ bg: 'green.500', color: 'white' }}>
                        <HStack>
                            <FiTarget />
                            <Text>Rutinas</Text>
                        </HStack>
                    </Tab>
                    <Tab _selected={{ bg: 'green.500', color: 'white' }}>
                        <HStack>
                            <FiBarChart2 />
                            <Text>Estadísticas</Text>
                        </HStack>
                    </Tab>
                </TabList>

                <TabPanels>
                    {/* PANEL DE RUTINAS */}
                    <TabPanel p={0}>
                        <VStack align="stretch" spacing={6}>
                            {/* Estadísticas Rápidas */}
                            {estadisticas && (
                                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                                    <GridItem>
                                        <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
                                            <StatLabel color="gray.600">Total Rutinas</StatLabel>
                                            <StatNumber color="green.600">{estadisticas.total_rutinas || rutinas.length}</StatNumber>
                                            <StatHelpText>
                                                <FiActivity style={{ display: 'inline', marginRight: '4px' }} />
                                                Activas
                                            </StatHelpText>
                                        </Stat>
                                    </GridItem>
                                    <GridItem>
                                        <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
                                            <StatLabel color="gray.600">Más Popular</StatLabel>
                                            <StatNumber fontSize="lg" color="purple.600">
                                                {estadisticas.rutina_mas_popular?.nombre || 'N/A'}
                                            </StatNumber>
                                            <StatHelpText>{estadisticas.rutina_mas_popular?.total_asignaciones || 0} asignaciones</StatHelpText>
                                        </Stat>
                                    </GridItem>
                                    <GridItem>
                                        <Stat bg="white" p={4} borderRadius="lg" boxShadow="sm">
                                            <StatLabel color="gray.600">Rutinas Públicas</StatLabel>
                                            <StatNumber color="blue.600">
                                                {rutinas.filter(r => r.tipo === 'publica').length}
                                            </StatNumber>
                                            <StatHelpText>Disponibles para todos</StatHelpText>
                                        </Stat>
                                    </GridItem>
                                </Grid>
                            )}

                            {/* Filtros y Búsqueda */}
                            <HStack spacing={4} flexWrap="wrap">
                                <Button 
                                    leftIcon={<FiPlus />} 
                                    colorScheme="green" 
                                    onClick={handleNuevo}
                                    size="md"
                                >
                                    Nueva Rutina
                                </Button>
                                
                                <InputGroup maxW="320px">
                                    <InputLeftElement pointerEvents="none">
                                        <FiSearch color="#24A148" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Buscar rutinas..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px #48bb78' }}
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
                                    value={filtroNivel}
                                    onChange={(e) => setFiltroNivel(e.target.value)}
                                    maxW="180px"
                                    bg="white"
                                    borderColor="gray.300"
                                >
                                    <option value="todos">Todos los niveles</option>
                                    <option value="principiante">Principiante</option>
                                    <option value="intermedio">Intermedio</option>
                                    <option value="avanzado">Avanzado</option>
                                </Select>

                                <Select
                                    value={filtroObjetivo}
                                    onChange={(e) => setFiltroObjetivo(e.target.value)}
                                    maxW="180px"
                                    bg="white"
                                    borderColor="gray.300"
                                >
                                    <option value="todos">Todos los objetivos</option>
                                    <option value="tonificacion">Tonificación</option>
                                    <option value="hipertrofia">Hipertrofia</option>
                                    <option value="fuerza">Fuerza</option>
                                    <option value="perdida_peso">Pérdida de Peso</option>
                                    <option value="cardio">Cardio</option>
                                </Select>

                                <Select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    maxW="150px"
                                    bg="white"
                                    borderColor="gray.300"
                                >
                                    <option value="todos">Todos los tipos</option>
                                    <option value="publica">Pública</option>
                                    <option value="privada">Privada</option>
                                </Select>
                            </HStack>

                            {/* Tabla de Rutinas */}
                            {loading ? (
                                <Flex justify="center" align="center" h="200px">
                                    <Spinner size="xl" color="green.500" />
                                </Flex>
                            ) : rutinasFiltradas.length === 0 ? (
                                <Alert status="info" borderRadius="lg">
                                    <AlertIcon />
                                    <AlertTitle>No hay rutinas</AlertTitle>
                                    <AlertDescription>
                                        {busqueda || filtroNivel !== 'todos' || filtroObjetivo !== 'todos' 
                                            ? 'No se encontraron rutinas con los filtros aplicados'
                                            : 'Comienza creando tu primera rutina'}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
                                    <Table variant="simple">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th color="gray.700">Nombre</Th>
                                                <Th color="gray.700">Nivel</Th>
                                                <Th color="gray.700">Objetivo</Th>
                                                <Th color="gray.700">Duración</Th>
                                                <Th color="gray.700">Frecuencia</Th>
                                                <Th color="gray.700">Tipo</Th>
                                                <Th color="gray.700">Estado</Th>
                                                <Th color="gray.700">Descripción</Th>
                                                <Th></Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {rutinasFiltradas.map(r => (
                                                <Tr key={r.id} _hover={{ bg: "gray.50" }}>
                                                    <Td>
                                                        <Text fontWeight="medium" color="gray.800">{r.nombre}</Text>
                                                    </Td>
                                                    <Td>
                                                        <Tag colorScheme={
                                                            (r.nivel || '').toLowerCase() === 'avanzado' ? 'red' : 
                                                            (r.nivel || '').toLowerCase() === 'intermedio' ? 'yellow' : 'green'
                                                        }>
                                                            {r.nivel}
                                                        </Tag>
                                                    </Td>
                                                    <Td>
                                                        <Tag colorScheme="purple" size="sm">
                                                            {r.objetivo || '-'}
                                                        </Tag>
                                                    </Td>
                                                    <Td color="gray.700">
                                                        <HStack>
                                                            <FiClock />
                                                            <Text>{r.duracion_estimada || '-'} min</Text>
                                                        </HStack>
                                                    </Td>
                                                    <Td color="gray.700">
                                                        <HStack>
                                                            <FiCalendar />
                                                            <Text>{r.frecuencia_semanal || '-'} días/sem</Text>
                                                        </HStack>
                                                    </Td>
                                                    <Td>
                                                        <Tag colorScheme={r.tipo === 'publica' ? 'blue' : 'purple'}>
                                                            {r.tipo}
                                                        </Tag>
                                                    </Td>
                                                    <Td>
                                                        <Tag colorScheme={r.estado === 'activo' ? 'green' : 'gray'}>
                                                            {r.estado}
                                                        </Tag>
                                                    </Td>
                                                    <Td>
                                                        <Text noOfLines={2} maxW="30ch" color="gray.600" fontSize="sm">
                                                            {r.descripcion || 'Sin descripción'}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Menu>
                                                            <MenuButton
                                                                as={IconButton}
                                                                icon={<FiMoreVertical />}
                                                                variant="ghost"
                                                                size="sm"
                                                            />
                                                            <MenuList>
                                                                <MenuItem icon={<FiEye />} onClick={() => handleVerDetalle(r)}>
                                                                    Ver Detalle
                                                                </MenuItem>
                                                                <MenuItem icon={<FiEdit />} onClick={() => handleEditar(r)}>
                                                                    Editar
                                                                </MenuItem>
                                                                <MenuItem icon={<FiUsers />} onClick={() => handleAsignarRutina(r)}>
                                                                    Asignar a Usuario
                                                                </MenuItem>
                                                                <Divider />
                                                                <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => handleEliminar(r.id)}>
                                                                    Eliminar
                                                                </MenuItem>
                                                            </MenuList>
                                                        </Menu>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </VStack>
                    </TabPanel>

                    {/* PANEL DE ESTADÍSTICAS */}
                    <TabPanel>
                        {estadisticas ? (
                            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
                                <GridItem colSpan={1}>
                                    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
                                        <Heading size="md" mb={4} color="green.600">
                                            <FiActivity style={{ display: 'inline', marginRight: '8px' }} />
                                            Resumen General
                                        </Heading>
                                        <VStack align="stretch" spacing={3}>
                                            <Flex justify="space-between">
                                                <Text color="gray.600">Total de Rutinas:</Text>
                                                <Badge colorScheme="green" fontSize="md">{estadisticas.total_rutinas || 0}</Badge>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text color="gray.600">Rutinas Activas:</Text>
                                                <Badge colorScheme="blue" fontSize="md">{estadisticas.rutinas_activas || 0}</Badge>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text color="gray.600">Total Asignaciones:</Text>
                                                <Badge colorScheme="purple" fontSize="md">{estadisticas.total_asignaciones || 0}</Badge>
                                            </Flex>
                                        </VStack>
                                    </Box>
                                </GridItem>

                                <GridItem colSpan={1}>
                                    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
                                        <Heading size="md" mb={4} color="purple.600">
                                            <FiTarget style={{ display: 'inline', marginRight: '8px' }} />
                                            Top 5 Rutinas Populares
                                        </Heading>
                                        <List spacing={3}>
                                            {(estadisticas.top_rutinas || []).slice(0, 5).map((rutina, idx) => (
                                                <ListItem key={idx}>
                                                    <Flex justify="space-between" align="center">
                                                        <HStack>
                                                            <Badge colorScheme="green">{idx + 1}</Badge>
                                                            <Text fontWeight="medium">{rutina.nombre}</Text>
                                                        </HStack>
                                                        <Badge colorScheme="blue">{rutina.total_asignaciones || 0} asignaciones</Badge>
                                                    </Flex>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                </GridItem>

                                <GridItem colSpan={1}>
                                    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
                                        <Heading size="md" mb={4} color="orange.600">
                                            Distribución por Nivel
                                        </Heading>
                                        <VStack align="stretch" spacing={3}>
                                            {['principiante', 'intermedio', 'avanzado'].map(nivel => {
                                                const count = rutinas.filter(r => 
                                                    (r.nivel || '').toLowerCase() === nivel
                                                ).length
                                                return (
                                                    <Flex key={nivel} justify="space-between" align="center">
                                                        <Text textTransform="capitalize">{nivel}:</Text>
                                                        <Badge 
                                                            colorScheme={
                                                                nivel === 'avanzado' ? 'red' : 
                                                                nivel === 'intermedio' ? 'yellow' : 'green'
                                                            }
                                                            fontSize="md"
                                                        >
                                                            {count}
                                                        </Badge>
                                                    </Flex>
                                                )
                                            })}
                                        </VStack>
                                    </Box>
                                </GridItem>
                            </Grid>
                        ) : (
                            <Alert status="warning" borderRadius="lg">
                                <AlertIcon />
                                <AlertTitle>Estadísticas no disponibles</AlertTitle>
                                <AlertDescription>
                                    No se pudieron cargar las estadísticas en este momento.
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selected?.id ? 'Editar Rutina' : 'Nueva Rutina'}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Nombre</FormLabel>
                                <Input ref={nombreRef} value={selected?.nombre || ''} onChange={(e) => setSelected(s => ({ ...s, nombre: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Nivel</FormLabel>
                                <Select value={selected?.nivel || 'intermedio'} onChange={(e) => setSelected(s => ({ ...s, nivel: e.target.value }))}>
                                    <option value="principiante">Principiante</option>
                                    <option value="intermedio">Intermedio</option>
                                    <option value="avanzado">Avanzado</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Objetivo</FormLabel>
                                <Select value={selected?.objetivo || 'tonificacion'} onChange={(e) => setSelected(s => ({ ...s, objetivo: e.target.value }))}>
                                    <option value="tonificacion">Tonificación</option>
                                    <option value="hipertrofia">Hipertrofia</option>
                                    <option value="fuerza">Fuerza</option>
                                    <option value="perdida_peso">Pérdida de Peso</option>
                                    <option value="cardio">Cardio</option>
                                </Select>
                            </FormControl>
                            <HStack>
                                <FormControl>
                                    <FormLabel>Duración Estimada (min)</FormLabel>
                                    <NumberInput min={15} max={180} value={selected?.duracion_estimada ?? 60} onChange={(val) => setSelected(s => ({ ...s, duracion_estimada: Number(val) }))}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Frecuencia Semanal (días)</FormLabel>
                                    <NumberInput min={1} max={7} value={selected?.frecuencia_semanal ?? 3} onChange={(val) => setSelected(s => ({ ...s, frecuencia_semanal: Number(val) }))}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                            </HStack>
                            <FormControl>
                                <FormLabel>Tipo</FormLabel>
                                <Select value={selected?.tipo || 'publica'} onChange={(e) => setSelected(s => ({ ...s, tipo: e.target.value }))}>
                                    <option value="publica">Pública</option>
                                    <option value="privada">Privada</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Estado</FormLabel>
                                <Select value={selected?.estado || 'activo'} onChange={(e) => setSelected(s => ({ ...s, estado: e.target.value }))}>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Textarea 
                                    value={selected?.descripcion || ''} 
                                    onChange={(e) => setSelected(s => ({ ...s, descripcion: e.target.value }))} 
                                    placeholder="Describe los beneficios y características de esta rutina..."
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
                        <Button colorScheme="green" onClick={handleSave}>💾 Guardar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* MODAL DETALLE DE RUTINA CON EJERCICIOS */}
            <Modal isOpen={isDetalleOpen} onClose={onDetalleClose} size="4xl">
                <ModalOverlay />
                <ModalContent maxH="90vh">
                    <ModalHeader bg="green.500" color="white" borderTopRadius="md">
                        <HStack justify="space-between">
                            <HStack>
                                <FiTarget />
                                <Text>{rutinaDetalle?.nombre || 'Detalle de Rutina'}</Text>
                            </HStack>
                            <HStack>
                                <Tag colorScheme="blue">{rutinaDetalle?.nivel}</Tag>
                                <Tag colorScheme="purple">{rutinaDetalle?.objetivo}</Tag>
                            </HStack>
                        </HStack>
                    </ModalHeader>
                    <ModalBody overflowY="auto">
                        <VStack align="stretch" spacing={6}>
                            {/* Información General */}
                            <Box>
                                <Heading size="sm" mb={3} color="gray.700">Información General</Heading>
                                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                                    <Box p={3} bg="gray.50" borderRadius="md">
                                        <Text fontSize="sm" color="gray.600">Duración</Text>
                                        <Text fontWeight="bold" color="green.600">
                                            <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                                            {rutinaDetalle?.duracion_estimada || 0} min
                                        </Text>
                                    </Box>
                                    <Box p={3} bg="gray.50" borderRadius="md">
                                        <Text fontSize="sm" color="gray.600">Frecuencia</Text>
                                        <Text fontWeight="bold" color="blue.600">
                                            <FiCalendar style={{ display: 'inline', marginRight: '4px' }} />
                                            {rutinaDetalle?.frecuencia_semanal || 0} días/semana
                                        </Text>
                                    </Box>
                                    <Box p={3} bg="gray.50" borderRadius="md">
                                        <Text fontSize="sm" color="gray.600">Tipo</Text>
                                        <Tag colorScheme={rutinaDetalle?.tipo === 'publica' ? 'blue' : 'purple'}>
                                            {rutinaDetalle?.tipo}
                                        </Tag>
                                    </Box>
                                </Grid>
                                {rutinaDetalle?.descripcion && (
                                    <Box mt={3} p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
                                        <Text fontSize="sm" color="gray.700">{rutinaDetalle.descripcion}</Text>
                                    </Box>
                                )}
                            </Box>

                            <Divider />

                            {/* Lista de Ejercicios */}
                            <Box>
                                <HStack justify="space-between" mb={3}>
                                    <Heading size="sm" color="gray.700">
                                        <FiActivity style={{ display: 'inline', marginRight: '8px' }} />
                                        Ejercicios ({rutinaDetalle?.ejercicios?.length || 0})
                                    </Heading>
                                    <Button 
                                        size="sm" 
                                        leftIcon={<FiPlus />} 
                                        colorScheme="green"
                                        onClick={() => handleAgregarEjercicio(rutinaDetalle)}
                                    >
                                        Agregar Ejercicio
                                    </Button>
                                </HStack>

                                {rutinaDetalle?.ejercicios && rutinaDetalle.ejercicios.length > 0 ? (
                                    <Accordion allowMultiple>
                                        {rutinaDetalle.ejercicios
                                            .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                                            .map((ej, idx) => (
                                            <AccordionItem key={idx} border="1px solid" borderColor="gray.200" mb={2} borderRadius="md">
                                                <AccordionButton _expanded={{ bg: 'green.50' }}>
                                                    <Box flex="1" textAlign="left">
                                                        <HStack>
                                                            <Badge colorScheme="green">{ej.orden || idx + 1}</Badge>
                                                            <Text fontWeight="medium">{ej.nombre_ejercicio || ej.nombre || 'Ejercicio'}</Text>
                                                            <Tag size="sm" colorScheme="blue">
                                                                {ej.grupo_muscular}
                                                            </Tag>
                                                        </HStack>
                                                    </Box>
                                                    <HStack>
                                                        <IconButton
                                                            icon={<FiEdit />}
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleEditarEjercicio(rutinaDetalle, ej)
                                                            }}
                                                        />
                                                        <IconButton
                                                            icon={<FiTrash2 />}
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="red"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleEliminarEjercicio(rutinaDetalle.id, ej.ejercicio_id || ej.id)
                                                            }}
                                                        />
                                                        <AccordionIcon />
                                                    </HStack>
                                                </AccordionButton>
                                                <AccordionPanel pb={4} bg="gray.50">
                                                    <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                                                        <Box>
                                                            <Text fontSize="xs" color="gray.600">Series</Text>
                                                            <Text fontWeight="bold" color="green.600">{ej.series || '-'}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="xs" color="gray.600">Repeticiones</Text>
                                                            <Text fontWeight="bold" color="blue.600">{ej.repeticiones || '-'}</Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="xs" color="gray.600">Descanso</Text>
                                                            <Text fontWeight="bold" color="orange.600">
                                                                {ej.descanso_segundos ?? ej.descanso ?? 0}s
                                                            </Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="xs" color="gray.600">Nivel</Text>
                                                            <Tag size="sm" colorScheme="purple">{ej.nivel}</Tag>
                                                        </Box>
                                                    </Grid>
                                                    {ej.descripcion && (
                                                        <Box mt={3}>
                                                            <Text fontSize="xs" color="gray.600" mb={1}>Descripción:</Text>
                                                            <Text fontSize="sm">{ej.descripcion}</Text>
                                                        </Box>
                                                    )}
                                                    {ej.notas && (
                                                        <Box mt={2}>
                                                            <Text fontSize="xs" color="gray.600" mb={1}>Notas:</Text>
                                                            <Text fontSize="sm" fontStyle="italic" color="gray.600">{ej.notas}</Text>
                                                        </Box>
                                                    )}
                                                </AccordionPanel>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <Alert status="info" borderRadius="md">
                                        <AlertIcon />
                                        <AlertDescription>
                                            Esta rutina no tiene ejercicios aún. Agrega ejercicios para completarla.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onDetalleClose}>Cerrar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* MODAL AGREGAR/EDITAR EJERCICIO EN RUTINA */}
            <Modal isOpen={isEjercicioOpen} onClose={onEjercicioClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {selectedEjercicio?.id ? 'Editar Ejercicio' : 'Agregar Ejercicio a Rutina'}
                    </ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Ejercicio</FormLabel>
                                <Select
                                    value={selectedEjercicio?.ejercicio_id || ''}
                                    onChange={(e) => setSelectedEjercicio(s => ({ ...s, ejercicio_id: e.target.value }))}
                                    placeholder="Selecciona un ejercicio"
                                >
                                    {ejerciciosDisponibles.map(ej => (
                                        <option key={ej.id} value={ej.id}>
                                            {ej.nombre} - {ej.grupo_muscular} ({ej.nivel})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                <FormControl>
                                    <FormLabel>Orden</FormLabel>
                                    <NumberInput
                                        min={1}
                                        value={selectedEjercicio?.orden || 1}
                                        onChange={(val) => setSelectedEjercicio(s => ({ ...s, orden: Number(val) }))}
                                    >
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Series</FormLabel>
                                    <NumberInput
                                        min={1}
                                        max={10}
                                        value={selectedEjercicio?.series || 3}
                                        onChange={(val) => setSelectedEjercicio(s => ({ ...s, series: Number(val) }))}
                                    >
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Repeticiones</FormLabel>
                                    <NumberInput
                                        min={1}
                                        max={100}
                                        value={selectedEjercicio?.repeticiones || 10}
                                        onChange={(val) => setSelectedEjercicio(s => ({ ...s, repeticiones: Number(val) }))}
                                    >
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Descanso (segundos)</FormLabel>
                                    <NumberInput
                                        min={0}
                                        max={300}
                                        step={10}
                                        value={selectedEjercicio?.descanso_segundos || 60}
                                        onChange={(val) => setSelectedEjercicio(s => ({ ...s, descanso_segundos: Number(val) }))}
                                    >
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                            </Grid>

                            <FormControl>
                                <FormLabel>Notas (opcional)</FormLabel>
                                <Textarea
                                    value={selectedEjercicio?.notas || ''}
                                    onChange={(e) => setSelectedEjercicio(s => ({ ...s, notas: e.target.value }))}
                                    placeholder="Indicaciones especiales para este ejercicio..."
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEjercicioClose}>Cancelar</Button>
                        <Button colorScheme="green" onClick={handleSaveEjercicio}>
                            💾 Guardar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* MODAL ASIGNAR RUTINA A USUARIO - MEJORADO */}
            <Modal isOpen={isAsignarOpen} onClose={onAsignarClose} size="xl">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent>
                    <ModalHeader bg="blue.500" color="white" borderTopRadius="md">
                        <HStack spacing={3}>
                            <Box bg="white" p={2} borderRadius="md">
                                <FiUsers size={24} color="#3182CE" />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xl" fontWeight="bold">Asignar Rutina a Usuario</Text>
                                <Text fontSize="sm" fontWeight="normal" opacity={0.9}>
                                    Asigna esta rutina a uno de tus clientes
                                </Text>
                            </VStack>
                        </HStack>
                    </ModalHeader>
                    <ModalBody py={6}>
                        <VStack spacing={5} align="stretch">
                            <Alert status="info" borderRadius="md" variant="left-accent">
                                <AlertIcon />
                                <Box flex="1">
                                    <AlertTitle fontSize="md" mb={1}>📋 {rutinaDetalle?.nombre}</AlertTitle>
                                    <AlertDescription fontSize="sm">
                                        <HStack spacing={3} flexWrap="wrap">
                                            <Badge colorScheme="orange">{rutinaDetalle?.nivel}</Badge>
                                            <Badge colorScheme="purple">{rutinaDetalle?.objetivo}</Badge>
                                            {rutinaDetalle?.duracion_semanas && (
                                                <Badge colorScheme="blue">{rutinaDetalle.duracion_semanas} semanas</Badge>
                                            )}
                                            {rutinaDetalle?.frecuencia_por_semana && (
                                                <Badge colorScheme="green">{rutinaDetalle.frecuencia_por_semana}x/semana</Badge>
                                            )}
                                        </HStack>
                                    </AlertDescription>
                                </Box>
                            </Alert>

                            <Divider />

                            <FormControl isRequired>
                                <FormLabel fontWeight="bold" mb={3}>
                                    <HStack>
                                        <Text>👤 Seleccionar Cliente</Text>
                                        <Badge colorScheme="red" fontSize="xs">Requerido</Badge>
                                    </HStack>
                                </FormLabel>
                                <Select
                                    value={selectedUsuario?.usuario_id || ''}
                                    onChange={(e) => {
                                        console.log('Cliente seleccionado:', e.target.value)
                                        setSelectedUsuario(s => ({ ...s, usuario_id: e.target.value }))
                                    }}
                                    placeholder="Selecciona un cliente registrado"
                                    size="lg"
                                    bg="blue.50"
                                    borderColor="blue.200"
                                >
                                    {usuarios.length > 0 ? (
                                        usuarios
                                            .filter(u => u.estado === 'activo')
                                            .map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.nombre} {u.apellido} • {u.email} {u.telefono ? `• ${u.telefono}` : ''}
                                                </option>
                                            ))
                                    ) : (
                                        <option disabled>No hay usuarios disponibles</option>
                                    )}
                                </Select>
                                <Text fontSize="xs" color="gray.600" mt={2}>
                                    {usuarios.filter(u => u.estado === 'activo').length} usuarios activos disponibles
                                </Text>
                                {usuarios.length === 0 && (
                                    <Alert status="warning" mt={2} fontSize="sm">
                                        <AlertIcon />
                                        No se encontraron usuarios. Verifica que existan usuarios registrados.
                                    </Alert>
                                )}
                            </FormControl>

                            <Divider />

                            <Text fontWeight="bold" color="gray.700" fontSize="sm">
                                📅 Período de la Rutina
                            </Text>

                            <HStack spacing={4}>
                                <FormControl isRequired flex={1}>
                                    <FormLabel fontSize="sm" fontWeight="semibold">
                                        Fecha Inicio
                                    </FormLabel>
                                    <Input
                                        type="date"
                                        value={selectedUsuario?.fecha_inicio || ''}
                                        onChange={(e) => setSelectedUsuario(s => ({ ...s, fecha_inicio: e.target.value }))}
                                        size="lg"
                                        bg="gray.50"
                                    />
                                </FormControl>

                                <FormControl flex={1}>
                                    <FormLabel fontSize="sm" fontWeight="semibold">
                                        Fecha Fin <Badge colorScheme="gray" ml={1}>Opcional</Badge>
                                    </FormLabel>
                                    <Input
                                        type="date"
                                        value={selectedUsuario?.fecha_fin || ''}
                                        onChange={(e) => setSelectedUsuario(s => ({ ...s, fecha_fin: e.target.value }))}
                                        size="lg"
                                        bg="gray.50"
                                    />
                                </FormControl>
                            </HStack>

                            <Divider />

                            <Text fontWeight="bold" color="gray.700" fontSize="sm">
                                📝 Personalización (Opcional)
                            </Text>

                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold">
                                    🎯 Objetivo Personalizado
                                </FormLabel>
                                <Input
                                    value={selectedUsuario?.objetivo_personalizado || ''}
                                    onChange={(e) => setSelectedUsuario(s => ({ ...s, objetivo_personalizado: e.target.value }))}
                                    placeholder="Ej: Perder 5 kg, ganar masa muscular..."
                                    size="lg"
                                    bg="gray.50"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold">
                                    📋 Notas e Indicaciones
                                </FormLabel>
                                <Textarea
                                    value={selectedUsuario?.notas || ''}
                                    onChange={(e) => setSelectedUsuario(s => ({ ...s, notas: e.target.value }))}
                                    placeholder="Indicaciones especiales, modificaciones, restricciones médicas, etc..."
                                    rows={3}
                                    bg="gray.50"
                                    size="lg"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderBottomRadius="md">
                        <HStack spacing={3}>
                            <Button 
                                variant="ghost" 
                                onClick={onAsignarClose}
                                size="lg"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                colorScheme="blue" 
                                leftIcon={<FiCheckCircle />} 
                                onClick={handleSaveAsignacion}
                                size="lg"
                                px={8}
                                isDisabled={!selectedUsuario?.usuario_id || !selectedUsuario?.fecha_inicio}
                            >
                                Asignar Rutina
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
