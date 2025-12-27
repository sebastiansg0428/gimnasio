import {
    Box,
    HStack,
    VStack,
    Button,
    Input,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    Tag,
    IconButton,
    useToast,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Textarea,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Avatar,
    Badge,
    NumberInput,
    NumberInputField,
    Tooltip,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from '@chakra-ui/react'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiUsers, FiCalendar, FiClock, FiStar, FiMoreVertical, FiAward } from 'react-icons/fi'
import { useState, useRef, useEffect } from 'react'
import { 
    getEntrenadores,
    getEntrenador,
    createEntrenador, 
    updateEntrenador, 
    deleteEntrenador,
    getClientesEntrenador,
    getHorariosEntrenador,
    getEstadisticasEntrenadores,
} from '../utils/api'
import HorariosModal from './EntrenadoresComponents/HorariosModal'
import ClientesModal from './EntrenadoresComponents/ClientesModal'
import SesionesModal from './EntrenadoresComponents/SesionesModal'
import ValoracionesModal from './EntrenadoresComponents/ValoracionesModal'

export default function EntrenadoresTab() {
    const [entrenadores, setEntrenadores] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [filtroEspecialidad, setFiltroEspecialidad] = useState('todos')
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [selected, setSelected] = useState(null)
    const [entrenadorSeleccionado, setEntrenadorSeleccionado] = useState(null)
    
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isHorariosOpen, onOpen: onHorariosOpen, onClose: onHorariosClose } = useDisclosure()
    const { isOpen: isClientesOpen, onOpen: onClientesOpen, onClose: onClientesClose } = useDisclosure()
    const { isOpen: isSesionesOpen, onOpen: onSesionesOpen, onClose: onSesionesClose } = useDisclosure()
    const { isOpen: isValoracionesOpen, onOpen: onValoracionesOpen, onClose: onValoracionesClose } = useDisclosure()
    
    const toast = useToast()
    const nombreRef = useRef(null)

    useEffect(() => {
        if (isOpen && nombreRef.current) nombreRef.current.focus()
    }, [isOpen])

    useEffect(() => {
        cargarEntrenadores()
        cargarEstadisticas()
    }, [])

    async function cargarEntrenadores() {
        setLoading(true)
        try {
            const data = await getEntrenadores({ incluir_todos: true })
            console.log('📊 Entrenadores cargados desde servidor:', data)
            console.log('📊 Cantidad:', Array.isArray(data) ? data.length : 0)
            
            // Ordenar por ID descendente (más nuevos primero)
            const entrenadoresOrdenados = Array.isArray(data) 
                ? data.sort((a, b) => (b.id || 0) - (a.id || 0))
                : []
            
            console.log('📊 Entrenadores ordenados:', entrenadoresOrdenados)
            setEntrenadores(entrenadoresOrdenados)
        } catch (err) {
            console.error('❌ Error cargando entrenadores', err)
            toast({ title: 'No se pudieron cargar los entrenadores', status: 'error', duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

    async function cargarEstadisticas() {
        try {
            const data = await getEstadisticasEntrenadores()
            console.log('📈 Estadísticas cargadas:', data)
            setEstadisticas(data)
        } catch (err) {
            console.error('Error cargando estadísticas', err)
        }
    }

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

    const entrenadoresFiltrados = entrenadores.filter(e => {
        const nombre = (e.nombre || '').toLowerCase()
        const email = (e.email || '').toLowerCase()
        const especialidad = (e.especialidad || '').toLowerCase()
        const estado = (e.estado || '').toLowerCase()
        
        const matchBusqueda = nombre.includes(busqueda.toLowerCase()) || email.includes(busqueda.toLowerCase())
        const matchEspecialidad = filtroEspecialidad === 'todos' || especialidad === filtroEspecialidad.toLowerCase()
        const matchEstado = filtroEstado === 'todos' || estado === filtroEstado.toLowerCase()
        
        // Debug
        if (!matchEstado) {
            console.log(`🔍 Entrenador ${nombre} filtrado por estado: ${estado}, filtro: ${filtroEstado}`)
        }
        
        return matchBusqueda && matchEspecialidad && matchEstado
    })

    console.log('📋 Total entrenadores:', entrenadores.length)
    console.log('📋 Entrenadores filtrados:', entrenadoresFiltrados.length)
    console.log('📋 Filtro estado actual:', filtroEstado)

    function handleNuevo() {
        setSelected({ 
            id: null, 
            nombre: '', 
            apellido: '',
            email: '', 
            telefono: '',
            genero: 'M',
            fecha_nacimiento: '',
            especialidad: 'fuerza', 
            experiencia_anos: 0,  // Permitir empezar desde 0
            tarifa_hora: 0,
            estado: 'activo', 
            certificaciones: '',
            biografia: ''
        })
        onOpen()
    }

    function handleEditar(e) {
        setSelected({
            id: e.id,
            nombre: e.nombre || '',
            apellido: e.apellido || '',
            email: e.email || '',
            telefono: e.telefono || '',
            genero: e.genero || 'M',
            fecha_nacimiento: e.fecha_nacimiento || '',
            especialidad: e.especialidad || 'fuerza',
            experiencia_anos: e.experiencia_anos !== undefined ? e.experiencia_anos : 0,
            tarifa_hora: e.tarifa_hora || 0,
            estado: e.estado || 'activo',
            certificaciones: e.certificaciones || '',
            biografia: e.biografia || e.bio || ''
        })
        onOpen()
    }

    async function handleEliminar(id) {
        if (!window.confirm('¿Eliminar este entrenador? Esto también eliminará sus horarios y asignaciones.')) return
        
        try {
            await deleteEntrenador(id)
            setEntrenadores(prev => prev.filter(x => x.id !== id))
            toast({ title: 'Entrenador eliminado', status: 'info', duration: 2000 })
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al eliminar entrenador', status: 'error', duration: 3000 })
        }
    }

    async function handleSave() {
        if (!selected.nombre.trim() || !selected.email.trim()) {
            toast({ title: 'Nombre y email son requeridos', status: 'warning', duration: 2000 })
            return
        }
        
        setLoading(true)
        try {
            const payload = {
                nombre: selected.nombre,
                apellido: selected.apellido || null,
                email: selected.email,
                telefono: selected.telefono || '',
                genero: selected.genero || 'M',
                fecha_nacimiento: selected.fecha_nacimiento || null,
                especialidad_principal: selected.especialidad,  // Backend usa especialidad_principal
                experiencia_anios: selected.experiencia_anos !== undefined ? selected.experiencia_anos : 0,
                tarifa_hora: selected.tarifa_hora || 0,
                estado: selected.estado,
                certificaciones: selected.certificaciones || '',
                biografia: selected.biografia || ''
            }
            
            console.log('💾 Guardando entrenador con payload:', payload)
            
            if (selected.id == null) {
                // Crear nuevo entrenador
                const nuevoEntrenador = await createEntrenador(payload)
                console.log('✅ Nuevo entrenador creado:', nuevoEntrenador)
                toast({ title: 'Entrenador creado exitosamente', status: 'success', duration: 2000 })
            } else {
                // Actualizar entrenador existente
                const entrenadorActualizado = await updateEntrenador(selected.id, payload)
                console.log('✅ Entrenador actualizado:', entrenadorActualizado)
                toast({ title: 'Entrenador actualizado exitosamente', status: 'success', duration: 2000 })
            }
            
            onClose()
            
            // Recargar TODA la lista desde el servidor para garantizar sincronización
            await cargarEntrenadores()
            await cargarEstadisticas()
        } catch (err) {
            console.error('Error al guardar entrenador:', err)
            toast({ title: 'Error al guardar entrenador', status: 'error', duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

    const getEstadoColor = (estado) => {
        const e = (estado || '').toLowerCase()
        if (e === 'activo') return 'green'
        if (e === 'inactivo') return 'red'
        return 'gray'
    }

    // Funciones para abrir modales
    function abrirHorarios(entrenador) {
        setEntrenadorSeleccionado(entrenador)
        onHorariosOpen()
    }

    function abrirClientes(entrenador) {
        setEntrenadorSeleccionado(entrenador)
        onClientesOpen()
    }

    function abrirSesiones(entrenador) {
        setEntrenadorSeleccionado(entrenador)
        onSesionesOpen()
    }

    function abrirValoraciones(entrenador) {
        setEntrenadorSeleccionado(entrenador)
        onValoracionesOpen()
    }

    return (
        <Box>
            {/* Estadísticas */}
            {estadisticas && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                    <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="green.400">
                        <Stat>
                            <StatLabel color="gray.600">Total Entrenadores</StatLabel>
                            <StatNumber color="green.600">{estadisticas.total || 0}</StatNumber>
                            <StatHelpText>{estadisticas.activos || 0} activos</StatHelpText>
                        </Stat>
                    </Box>
                    <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="blue.400">
                        <Stat>
                            <StatLabel color="gray.600">Clientes Asignados</StatLabel>
                            <StatNumber color="blue.600">{estadisticas.total_clientes || 0}</StatNumber>
                            <StatHelpText>En total</StatHelpText>
                        </Stat>
                    </Box>
                    <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="purple.400">
                        <Stat>
                            <StatLabel color="gray.600">Sesiones Programadas</StatLabel>
                            <StatNumber color="purple.600">{estadisticas.sesiones_programadas || 0}</StatNumber>
                            <StatHelpText>Próximas</StatHelpText>
                        </Stat>
                    </Box>
                    <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="yellow.400">
                        <Stat>
                            <StatLabel color="gray.600">Valoración Promedio</StatLabel>
                            <StatNumber color="yellow.600">
                                <HStack>
                                    <Text>{estadisticas.promedio_valoracion ? parseFloat(estadisticas.promedio_valoracion).toFixed(1) : '0.0'}</Text>
                                    <FiStar fill="gold" color="gold" />
                                </HStack>
                            </StatNumber>
                            <StatHelpText>{estadisticas.total_valoraciones || 0} valoraciones</StatHelpText>
                        </Stat>
                    </Box>
                </SimpleGrid>
            )}

            <HStack mb={6} spacing={4} flexWrap="wrap">
                <Button leftIcon={<FiPlus />} colorScheme="green" onClick={handleNuevo} minW="fit-content" px={4}>
                    Nuevo Entrenador
                </Button>
                <InputGroup maxW="320px" position="relative">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="#24A148" />
                    </InputLeftElement>
                    <Input
                        placeholder="Buscar entrenadores..."
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
                    value={filtroEspecialidad}
                    onChange={(e) => setFiltroEspecialidad(e.target.value)}
                    maxW="200px"
                    bg="white"
                    color="gray.800"
                >
                    <option value="todos">Todas las especialidades</option>
                    <option value="fuerza">Fuerza</option>
                    <option value="cardio">Cardio</option>
                    <option value="crossfit">CrossFit</option>
                    <option value="hipertrofia">Hipertrofia</option>
                    <option value="perdida de peso">Pérdida de peso</option>
                    <option value="funcional">Funcional</option>
                </Select>
                <Select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    maxW="180px"
                    bg="white"
                    color="gray.800"
                >
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                </Select>
            </HStack>

            <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
                <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th color="gray.700">Entrenador</Th>
                            <Th color="gray.700">Contacto</Th>
                            <Th color="gray.700">Especialidad</Th>
                            <Th color="gray.700">Experiencia</Th>
                            <Th color="gray.700">Tarifa/Hora</Th>
                            <Th color="gray.700">Estado</Th>
                            <Th color="gray.700">Acciones</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={7} textAlign="center" color="gray.600">Cargando...</Td>
                            </Tr>
                        ) : entrenadoresFiltrados.length === 0 ? (
                            <Tr>
                                <Td colSpan={7} textAlign="center" color="gray.600">
                                    {busqueda || filtroEspecialidad !== 'todos' || filtroEstado !== 'todos'
                                        ? 'No se encontraron entrenadores con los filtros aplicados'
                                        : 'No hay entrenadores registrados'}
                                </Td>
                            </Tr>
                        ) : (
                            entrenadoresFiltrados.map(e => (
                                <Tr key={e.id} _hover={{ bg: "gray.50" }}>
                                    <Td>
                                        <Tooltip 
                                            label={
                                                e.biografia && e.biografia.trim() !== '' 
                                                    ? e.biografia 
                                                    : 'No hay biografía disponible para este entrenador'
                                            } 
                                            placement="right"
                                            hasArrow
                                            bg="gray.800"
                                            color="white"
                                            fontSize="sm"
                                            p={3}
                                            borderRadius="md"
                                            maxW="300px"
                                        >
                                            <HStack spacing={3} cursor="pointer">
                                                <Avatar 
                                                    size="sm" 
                                                    bg="green.400" 
                                                    name={`${e.nombre || 'Sin nombre'} ${e.apellido || ''}`} 
                                                />
                                                <Box>
                                                    <HStack spacing={1}>
                                                        <Text fontWeight="medium" color="gray.800">
                                                            {e.nombre || 'Sin nombre'} {e.apellido || ''}
                                                        </Text>
                                                        {e.biografia && e.biografia.trim() !== '' && (
                                                            <Badge colorScheme="purple" fontSize="xx-small">ℹ️</Badge>
                                                        )}
                                                    </HStack>
                                                    <HStack spacing={1}>
                                                        <Badge 
                                                            size="sm" 
                                                            colorScheme={e.genero === 'M' ? 'blue' : 'pink'}
                                                        >
                                                            {e.genero === 'M' ? '♂' : '♀'}
                                                        </Badge>
                                                        {e.fecha_nacimiento && (
                                                            <Text fontSize="xs" color="gray.400">
                                                                {new Date(e.fecha_nacimiento).toLocaleDateString('es-ES')}
                                                            </Text>
                                                        )}
                                                    </HStack>
                                                </Box>
                                            </HStack>
                                        </Tooltip>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" color="gray.700">{e.email || 'Sin email'}</Text>
                                        <Text fontSize="xs" color="gray.500">{e.telefono || 'Sin teléfono'}</Text>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme="blue" textTransform="capitalize">
                                            {e.especialidad || 'No especificada'}
                                        </Badge>
                                        {e.certificaciones && (
                                            <Tooltip label={e.certificaciones} placement="top" hasArrow>
                                                <Badge ml={1} colorScheme="purple" cursor="help">
                                                    Cert.
                                                </Badge>
                                            </Tooltip>
                                        )}
                                    </Td>
                                    <Td color="gray.700">
                                        <Text>{e.experiencia_anos !== undefined ? e.experiencia_anos : 0} años</Text>
                                    </Td>
                                    <Td color="gray.700">
                                        <Text fontWeight="medium" color="green.600">
                                            {new Intl.NumberFormat('es-CO', {
                                                style: 'currency',
                                                currency: 'COP',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            }).format(parseFloat(e.tarifa_hora) || 0)}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Tag size="sm" colorScheme={getEstadoColor(e.estado)} textTransform="capitalize">
                                            {e.estado || 'activo'}
                                        </Tag>
                                    </Td>
                                    <Td>
                                        <HStack spacing={1}>
                                            <Tooltip label="Editar entrenador" hasArrow placement="top">
                                                <IconButton
                                                    aria-label="Editar"
                                                    icon={<FiEdit />}
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="blue"
                                                    onClick={() => handleEditar(e)}
                                                />
                                            </Tooltip>
                                            <Tooltip label="Eliminar entrenador" hasArrow placement="top">
                                                <IconButton
                                                    aria-label="Eliminar"
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    onClick={() => handleEliminar(e.id)}
                                                />
                                            </Tooltip>
                                            <Menu>
                                                <Tooltip label="Más opciones" hasArrow placement="top">
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<FiMoreVertical />}
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="green"
                                                    />
                                                </Tooltip>
                                                <MenuList>
                                                    <MenuItem icon={<FiClock />} onClick={() => abrirHorarios(e)}>
                                                        ⏰ Gestionar Horarios
                                                    </MenuItem>
                                                    <MenuItem icon={<FiUsers />} onClick={() => abrirClientes(e)}>
                                                        👥 Ver Clientes
                                                    </MenuItem>
                                                    <MenuItem icon={<FiCalendar />} onClick={() => abrirSesiones(e)}>
                                                        📅 Sesiones
                                                    </MenuItem>
                                                    <MenuItem icon={<FiStar />} onClick={() => abrirValoraciones(e)}>
                                                        ⭐ Valoraciones
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* Modal para crear/editar entrenador */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent bg="white" color="gray.800">
                    <ModalHeader>{selected?.id ? 'Editar Entrenador' : 'Nuevo Entrenador'}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <HStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Nombre</FormLabel>
                                    <Input 
                                        ref={nombreRef} 
                                        value={selected?.nombre || ''} 
                                        onChange={(e) => setSelected(s => ({ ...s, nombre: e.target.value }))} 
                                        placeholder="Nombre"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Apellido</FormLabel>
                                    <Input 
                                        value={selected?.apellido || ''} 
                                        onChange={(e) => setSelected(s => ({ ...s, apellido: e.target.value }))} 
                                        placeholder="Apellido"
                                    />
                                </FormControl>
                            </HStack>
                            
                            <FormControl isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input 
                                    type="email" 
                                    value={selected?.email || ''} 
                                    onChange={(e) => setSelected(s => ({ ...s, email: e.target.value }))} 
                                    placeholder="correo@ejemplo.com"
                                />
                            </FormControl>
                            
                            <FormControl>
                                <FormLabel>Teléfono</FormLabel>
                                <Input 
                                    value={selected?.telefono || ''} 
                                    onChange={(e) => setSelected(s => ({ ...s, telefono: e.target.value }))} 
                                    placeholder="555-1234"
                                />
                            </FormControl>

                            <HStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Género</FormLabel>
                                    <Select 
                                        value={selected?.genero || 'M'} 
                                        onChange={(e) => setSelected(s => ({ ...s, genero: e.target.value }))}
                                    >
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Fecha de Nacimiento</FormLabel>
                                    <Input 
                                        type="date" 
                                        value={selected?.fecha_nacimiento || ''} 
                                        onChange={(e) => setSelected(s => ({ ...s, fecha_nacimiento: e.target.value }))} 
                                    />
                                </FormControl>
                            </HStack>

                            <HStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Especialidad</FormLabel>
                                    <Select 
                                        value={selected?.especialidad || 'fuerza'} 
                                        onChange={(e) => setSelected(s => ({ ...s, especialidad: e.target.value }))}
                                    >
                                        <option value="fuerza">Fuerza</option>
                                        <option value="cardio">Cardio</option>
                                        <option value="crossfit">CrossFit</option>
                                        <option value="hipertrofia">Hipertrofia</option>
                                        <option value="perdida de peso">Pérdida de peso</option>
                                        <option value="funcional">Funcional</option>
                                        <option value="yoga">Yoga</option>
                                        <option value="pilates">Pilates</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Años de experiencia</FormLabel>
                                    <NumberInput 
                                        min={0} 
                                        max={50} 
                                        value={selected?.experiencia_anos !== undefined ? selected.experiencia_anos : 0}
                                        onChange={(val) => setSelected(s => ({ ...s, experiencia_anos: parseInt(val) || 0 }))}
                                    >
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Tarifa por Hora (COP)</FormLabel>
                                    <NumberInput 
                                        min={0} 
                                        max={1000000}
                                        step={1000}
                                        value={selected?.tarifa_hora !== undefined ? selected.tarifa_hora : 0}
                                        onChange={(val) => setSelected(s => ({ ...s, tarifa_hora: parseInt(val) || 0 }))}
                                    >
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                            </HStack>

                            <FormControl isRequired>
                                <FormLabel>Estado</FormLabel>
                                <Select 
                                    value={selected?.estado || 'activo'} 
                                    onChange={(e) => setSelected(s => ({ ...s, estado: e.target.value }))}
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Certificaciones</FormLabel>
                                <Textarea
                                    value={selected?.certificaciones || ''} 
                                    onChange={(e) => setSelected(s => ({ ...s, certificaciones: e.target.value }))} 
                                    placeholder="NSCA, ACSM, ACE, etc."
                                    rows={2}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Biografía</FormLabel>
                                <Textarea
                                    value={selected?.biografia || ''} 
                                    onChange={(e) => setSelected(s => ({ ...s, biografia: e.target.value }))} 
                                    placeholder="Breve descripción del entrenador..."
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={handleSave}>
                            {selected?.id ? 'Actualizar' : 'Crear'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modales auxiliares */}
            <HorariosModal
                isOpen={isHorariosOpen}
                onClose={onHorariosClose}
                entrenador={entrenadorSeleccionado}
            />
            <ClientesModal
                isOpen={isClientesOpen}
                onClose={onClientesClose}
                entrenador={entrenadorSeleccionado}
            />
            <SesionesModal
                isOpen={isSesionesOpen}
                onClose={onSesionesClose}
                entrenador={entrenadorSeleccionado}
            />
            <ValoracionesModal
                isOpen={isValoracionesOpen}
                onClose={onValoracionesClose}
                entrenador={entrenadorSeleccionado}
            />
        </Box>
    )
}