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
    ModalCloseButton,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Divider,
    Badge,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react'
import { FiPlus, FiSearch, FiEye, FiTrash2, FiDollarSign, FiTrendingUp, FiCreditCard, FiFileText, FiRefreshCw, FiCalendar, FiFilter, FiPaperclip, FiEdit3 } from 'react-icons/fi'
import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { pagosAPI } from '../services/api'

const COLORS = ['#48BB78', '#4299E1', '#9F7AEA', '#ED8936', '#F56565']

export default function PagosTab() {
    const [pagos, setPagos] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)
    const [estadisticasMembresias, setEstadisticasMembresias] = useState(null)
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [filtroMetodo, setFiltroMetodo] = useState('todos')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')
    const [nuevoPago, setNuevoPago] = useState({
        usuario_id: '',
        monto: '',
        tipo_pago: 'membresia',
        metodo_pago: 'efectivo',
        estado: 'completado',
        concepto: '',
        fecha_vencimiento: '',
        comprobante: '',
        notas: ''
    })
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isDetallesOpen, onOpen: onDetallesOpen, onClose: onDetallesClose } = useDisclosure()
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null)
    const toast = useToast()

    useEffect(() => {
        cargarDatos()
        
        // Escuchar evento de cliente creado con pago
        const handleClienteCreado = (event) => {
            console.log('🔔 EVENTO: Cliente creado con pago, recargando datos de pagos...')
            cargarDatos()
        }
        
        window.addEventListener('clienteCreado', handleClienteCreado)
        
        // Recargar datos cada 30 segundos
        const interval = setInterval(cargarDatos, 30000)
        
        return () => {
            window.removeEventListener('clienteCreado', handleClienteCreado)
            clearInterval(interval)
        }
    }, [])

    async function cargarDatos() {
        setLoading(true)
        try {
            console.log('📊 CARGANDO DATOS DE PAGOS...')
            
            // Cargar pagos
            const pagosData = await pagosAPI.getPagos().catch(err => {
                console.error('❌ Error cargando pagos:', err)
                return []
            })
            
            // Cargar estadísticas
            const estadisticasData = await pagosAPI.getEstadisticas().catch(err => {
                console.error('❌ Error cargando estadísticas:', err)
                return null
            })
            
            // Cargar estadísticas de membresías
            const estadisticasMembresiasData = await fetch('http://localhost:3001/pagos/estadisticas/membresias')
                .then(r => r.ok ? r.json() : null)
                .catch(err => {
                    console.error('❌ Error cargando estadísticas de membresías:', err)
                    return null
                })
            
            // Cargar usuarios
            const usuariosData = await fetch('http://localhost:3001/usuarios')
                .then(r => r.ok ? r.json() : [])
                .catch(err => {
                    console.error('❌ Error cargando usuarios:', err)
                    return []
                })

            console.log('✅ PAGOS CARGADOS:', pagosData.length)
            console.log('✅ USUARIOS CARGADOS:', usuariosData.length)
            console.log('✅ ESTADÍSTICAS:', estadisticasData)
            console.log('📋 MUESTRA DE PAGOS:', pagosData.slice(0, 3)) // Ver primeros 3 pagos
            
            setPagos(pagosData)
            setEstadisticas(estadisticasData)
            setEstadisticasMembresias(estadisticasMembresiasData)
            setUsuarios(usuariosData)
            
        } catch (error) {
            console.error('❌ ERROR CARGANDO DATOS:', error)
            toast({
                title: 'Error al cargar datos',
                description: error.message,
                status: 'error',
                duration: 3000
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleCrearPago() {
        if (!nuevoPago.usuario_id || !nuevoPago.monto) {
            toast({
                title: 'Completa los campos requeridos',
                status: 'warning',
                duration: 2000
            })
            return
        }

        try {
            console.log('💳 CREANDO PAGO:', nuevoPago)
            
            const pagoData = {
                ...nuevoPago,
                monto: parseFloat(nuevoPago.monto),
                concepto: nuevoPago.concepto || `Pago de ${nuevoPago.tipo_pago}`,
                fecha_pago: new Date().toISOString().split('T')[0]
            }
            
            await pagosAPI.createPago(pagoData)
            
            toast({
                title: '✅ Pago registrado exitosamente',
                status: 'success',
                duration: 3000,
                isClosable: true
            })
            
            await cargarDatos()
            onClose()
            
            setNuevoPago({
                usuario_id: '',
                monto: '',
                tipo_pago: 'membresia',
                metodo_pago: 'efectivo',
                estado: 'completado',
                concepto: '',
                fecha_vencimiento: '',
                comprobante: '',
                notas: ''
            })
            
            // Disparar evento para actualizar dashboard
            window.dispatchEvent(new CustomEvent('clienteCreado'))
            
        } catch (error) {
            console.error('❌ ERROR AL CREAR PAGO:', error)
            toast({
                title: 'Error al registrar pago',
                description: error.message,
                status: 'error',
                duration: 3000
            })
        }
    }

    async function handleRenovarMembresia(usuario) {
        if (!usuario) return
        
        try {
            console.log('🔄 RENOVANDO MEMBRESÍA PARA:', usuario.nombre)
            
            const response = await fetch('http://localhost:3001/pagos/renovar-membresia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    tipo_membresia: usuario.membresia || 'DIARIA',
                    monto: usuario.precio_membresia || 50000,
                    metodo_pago: 'efectivo'
                })
            })

            if (!response.ok) {
                throw new Error('Error al renovar membresía')
            }

            const resultado = await response.json()
            
            toast({
                title: '✅ Membresía renovada',
                description: `${usuario.nombre} ${usuario.apellido} - Nueva membresía activa`,
                status: 'success',
                duration: 4000,
                isClosable: true
            })
            
            await cargarDatos()
            window.dispatchEvent(new CustomEvent('clienteCreado'))
            
        } catch (error) {
            console.error('❌ ERROR AL RENOVAR:', error)
            toast({
                title: 'Error al renovar membresía',
                description: error.message,
                status: 'error',
                duration: 3000
            })
        }
    }

    function handleVerDetalles(pago) {
        setPagoSeleccionado(pago)
        onDetallesOpen()
    }

    async function handleEliminarPago(id) {
        if (!window.confirm('¿Estás seguro de cancelar este pago?')) return
        
        try {
            await pagosAPI.deletePago(id)
            toast({
                title: 'Pago cancelado',
                status: 'info',
                duration: 2000
            })
            await cargarDatos()
            window.dispatchEvent(new CustomEvent('clienteCreado'))
        } catch (error) {
            console.error('Error al cancelar pago:', error)
            toast({
                title: 'Error al cancelar pago',
                description: error.message,
                status: 'error',
                duration: 3000
            })
        }
    }

    const pagosFiltrados = useMemo(() => {
        return pagos.filter(p => {
            const usuario = usuarios.find(u => u.id === p.usuario_id)
            const nombreUsuario = usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase() : ''
            const concepto = (p.concepto || p.descripcion || '').toLowerCase()
            const busquedaLower = busqueda.toLowerCase()
            
            const matchBusqueda = nombreUsuario.includes(busquedaLower) || concepto.includes(busquedaLower)
            const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado
            const matchTipo = filtroTipo === 'todos' || p.tipo_pago === filtroTipo
            const matchMetodo = filtroMetodo === 'todos' || p.metodo_pago === filtroMetodo
            
            return matchBusqueda && matchEstado && matchTipo && matchMetodo
        })
    }, [pagos, usuarios, busqueda, filtroEstado, filtroTipo, filtroMetodo])

    const getEstadoColor = (estado) => {
        const colores = {
            completado: 'green',
            pagado: 'green',
            pendiente: 'yellow',
            cancelado: 'red',
            fallido: 'red'
        }
        return colores[estado] || 'gray'
    }

    const getTipoPagoColor = (tipo) => {
        const colores = {
            membresia: 'purple',
            producto: 'blue',
            sesion: 'orange',
            otro: 'gray'
        }
        return colores[tipo] || 'gray'
    }

    const formatearFecha = (fecha) => {
        if (!fecha || fecha === 'NULL' || fecha === 'null' || fecha === 'N/A') return null
        
        try {
            // Si es un timestamp numérico
            if (typeof fecha === 'number') {
                const date = new Date(fecha)
                const fechaStr = date.toISOString().split('T')[0]
                // Detectar fechas inválidas (antes de 1900)
                if (date.getFullYear() < 1900) return null
                return fechaStr
            }
            
            // Si es una fecha ISO (YYYY-MM-DDTHH:MM:SS)
            if (typeof fecha === 'string' && fecha.includes('T')) {
                const fechaStr = fecha.split('T')[0]
                // Detectar fechas inválidas
                const año = parseInt(fechaStr.split('-')[0])
                if (año < 1900) return null
                return fechaStr
            }
            
            // Si viene en formato DD/MM/YYYY HH:MM (formato del backend)
            if (typeof fecha === 'string' && fecha.includes('/')) {
                const partes = fecha.split(' ')[0].split('/') // Separar fecha y hora, tomar solo fecha
                if (partes.length === 3) {
                    const [dia, mes, año] = partes
                    // Detectar fechas inválidas
                    if (parseInt(año) < 1900) return null
                    return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
                }
            }
            
            // Si ya está en formato YYYY-MM-DD
            if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                // Detectar fechas inválidas (como 1899-11-30)
                const año = parseInt(fecha.split('-')[0])
                if (año < 1900) return null
                return fecha
            }
            
            return null
        } catch (error) {
            console.error('Error formateando fecha:', error)
            return null
        }
    }

    const formatearMonto = (monto) => {
        if (!monto && monto !== 0) return '$0'
        const valor = parseFloat(monto)
        if (isNaN(valor)) return '$0'
        return `$${valor.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
    }

    const formatearEstado = (estado) => {
        if (!estado || estado === 'NULL' || estado === 'null') return 'pendiente'
        return estado.toLowerCase()
    }

    if (loading) {
        return (
            <Box textAlign="center" py={20}>
                <Spinner size="xl" color="green.500" thickness="4px" />
                <Text mt={4} color="gray.600">Cargando pagos...</Text>
            </Box>
        )
    }

    return (
        <Box>
            {/* Tarjetas de Estadísticas */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
                <Card boxShadow="md" borderLeft="4px" borderLeftColor="green.400">
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600" fontSize="sm">Total Ingresos</StatLabel>
                            <StatNumber fontSize="3xl" color="green.600">
                                ${(estadisticas?.totalIngresos || 0).toLocaleString('es-CO')}
                            </StatNumber>
                            <StatHelpText>
                                <StatArrow type="increase" />
                                Todos los pagos completados
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="md" borderLeft="4px" borderLeftColor="blue.400">
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600" fontSize="sm">Total Pagos</StatLabel>
                            <StatNumber fontSize="3xl" color="blue.600">
                                {estadisticas?.totalPagos || pagos.length}
                            </StatNumber>
                            <StatHelpText>
                                <Badge colorScheme="green">{pagos.filter(p => p.estado === 'completado' || p.estado === 'pagado').length} completados</Badge>
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="md" borderLeft="4px" borderLeftColor="purple.400">
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600" fontSize="sm">Membresías Este Mes</StatLabel>
                            <StatNumber fontSize="3xl" color="purple.600">
                                {estadisticasMembresias?.totalMembresias || pagos.filter(p => p.tipo_pago === 'membresia').length}
                            </StatNumber>
                            <StatHelpText>
                                ${(estadisticasMembresias?.ingresoTotal || 0).toLocaleString('es-CO')}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="md" borderLeft="4px" borderLeftColor="orange.400">
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600" fontSize="sm">Pendientes</StatLabel>
                            <StatNumber fontSize="3xl" color="orange.600">
                                {pagos.filter(p => p.estado === 'pendiente').length}
                            </StatNumber>
                            <StatHelpText>
                                ${pagos.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + parseFloat(p.monto || 0), 0).toLocaleString('es-CO')}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Pestañas */}
            <Tabs variant="enclosed" colorScheme="green">
                <TabList>
                    <Tab><FiDollarSign /> <Text ml={2}>Pagos</Text></Tab>
                    <Tab><FiTrendingUp /> <Text ml={2}>Estadísticas</Text></Tab>
                    <Tab><FiRefreshCw /> <Text ml={2}>Renovar Membresías</Text></Tab>
                </TabList>

                <TabPanels>
                    {/* Pestaña: Pagos */}
                    <TabPanel>
                        <VStack spacing={4} align="stretch">
                            {/* Filtros y Búsqueda */}
                            <Card>
                                <CardBody>
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={3}>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none">
                                                <FiSearch color="gray" />
                                            </InputLeftElement>
                                            <Input
                                                placeholder="Buscar..."
                                                value={busqueda}
                                                onChange={(e) => setBusqueda(e.target.value)}
                                            />
                                        </InputGroup>

                                        <Select
                                            value={filtroEstado}
                                            onChange={(e) => setFiltroEstado(e.target.value)}
                                        >
                                            <option value="todos">Todos los estados</option>
                                            <option value="completado">Completado</option>
                                            <option value="pagado">Pagado</option>
                                            <option value="pendiente">Pendiente</option>
                                            <option value="cancelado">Cancelado</option>
                                        </Select>

                                        <Select
                                            value={filtroTipo}
                                            onChange={(e) => setFiltroTipo(e.target.value)}
                                        >
                                            <option value="todos">Todos los tipos</option>
                                            <option value="membresia">Membresía</option>
                                            <option value="producto">Producto</option>
                                            <option value="sesion">Sesión</option>
                                            <option value="otro">Otro</option>
                                        </Select>

                                        <Select
                                            value={filtroMetodo}
                                            onChange={(e) => setFiltroMetodo(e.target.value)}
                                        >
                                            <option value="todos">Todos los métodos</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="tarjeta">Tarjeta</option>
                                            <option value="transferencia">Transferencia</option>
                                        </Select>

                                        <Button
                                            leftIcon={<FiRefreshCw />}
                                            onClick={cargarDatos}
                                            variant="outline"
                                            colorScheme="blue"
                                        >
                                            Actualizar
                                        </Button>

                                        <Button
                                            leftIcon={<FiPlus />}
                                            colorScheme="green"
                                            onClick={onOpen}
                                        >
                                            Nuevo Pago
                                        </Button>
                                    </SimpleGrid>
                                </CardBody>
                            </Card>

                            {/* Tabla de Pagos */}
                            <Card>
                                <CardBody overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>ID</Th>
                                                <Th>Cliente</Th>
                                                <Th>Tipo</Th>
                                                <Th>Monto</Th>
                                                <Th>Método</Th>
                                                <Th>Estado</Th>
                                                <Th>Fecha Pago</Th>
                                                <Th>Concepto</Th>
                                                <Th>Acciones</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {pagosFiltrados.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={9} textAlign="center" py={10}>
                                                        <Text color="gray.500">No hay pagos registrados</Text>
                                                    </Td>
                                                </Tr>
                                            ) : (
                                                pagosFiltrados.map((pago) => {
                                                    const usuario = usuarios.find(u => u.id === pago.usuario_id)
                                                    
                                                    // Formatear datos
                                                    const fechaPagoFormateada = formatearFecha(pago.fecha_pago)
                                                    const fechaVencimientoFormateada = formatearFecha(pago.fecha_vencimiento)
                                                    const montoFormateado = formatearMonto(pago.monto)
                                                    const estadoFormateado = formatearEstado(pago.estado)
                                                    
                                                    return (
                                                        <Tr key={pago.id} _hover={{ bg: 'gray.50' }}>
                                                            <Td fontWeight="bold">#{pago.id}</Td>
                                                            <Td>
                                                                <Text fontWeight="medium">
                                                                    {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Cliente desconocido'}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.500">{usuario?.email}</Text>
                                                            </Td>
                                                            <Td>
                                                                <Badge colorScheme={getTipoPagoColor(pago.tipo_pago)}>
                                                                    {pago.tipo_pago || 'N/A'}
                                                                </Badge>
                                                            </Td>
                                                            <Td fontWeight="bold" color="green.600" fontSize="md">
                                                                {montoFormateado}
                                                            </Td>
                                                            <Td>
                                                                <HStack spacing={1}>
                                                                    <FiCreditCard size={14} />
                                                                    <Text fontSize="sm">{pago.metodo_pago || 'efectivo'}</Text>
                                                                </HStack>
                                                            </Td>
                                                            <Td>
                                                                <Badge colorScheme={getEstadoColor(estadoFormateado)}>
                                                                    {estadoFormateado}
                                                                </Badge>
                                                            </Td>
                                                            <Td>
                                                                {fechaPagoFormateada ? (
                                                                    <Text fontSize="sm" fontWeight="medium">{fechaPagoFormateada}</Text>
                                                                ) : (
                                                                    <Text fontSize="sm" color="gray.400">-</Text>
                                                                )}
                                                            </Td>
                                                            <Td maxW="200px">
                                                                <Text fontSize="sm" noOfLines={2}>
                                                                    {pago.concepto || pago.descripcion || '-'}
                                                                </Text>
                                                            </Td>
                                                            <Td>
                                                                <HStack spacing={2}>
                                                                    <IconButton
                                                                        icon={<FiEye />}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        colorScheme="blue"
                                                                        aria-label="Ver detalles"
                                                                        onClick={() => handleVerDetalles(pago)}
                                                                        title="Ver detalles del pago"
                                                                    />
                                                                    {pago.estado === 'pendiente' && (
                                                                        <IconButton
                                                                            icon={<FiTrash2 />}
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            colorScheme="red"
                                                                            aria-label="Cancelar pago"
                                                                            onClick={() => handleEliminarPago(pago.id)}
                                                                            title="Cancelar pago pendiente"
                                                                        />
                                                                    )}
                                                                </HStack>
                                                            </Td>
                                                        </Tr>
                                                    )
                                                })
                                            )}
                                        </Tbody>
                                    </Table>
                                </CardBody>
                            </Card>

                            <Text fontSize="sm" color="gray.500" textAlign="right">
                                Mostrando {pagosFiltrados.length} de {pagos.length} pagos
                            </Text>
                        </VStack>
                    </TabPanel>

                    {/* Pestaña: Estadísticas */}
                    <TabPanel>
                        <VStack spacing={6} align="stretch">
                            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                                {/* Gráfico por Método de Pago */}
                                <Card>
                                    <CardBody>
                                        <Heading size="md" mb={4}>Distribución por Método</Heading>
                                        <Box h="300px">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Efectivo', value: pagos.filter(p => p.metodo_pago === 'efectivo' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) },
                                                            { name: 'Tarjeta', value: pagos.filter(p => p.metodo_pago === 'tarjeta' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) },
                                                            { name: 'Transferencia', value: pagos.filter(p => p.metodo_pago === 'transferencia' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={(entry) => `$${entry.value.toLocaleString('es-CO')}`}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        <Cell fill="#48BB78" />
                                                        <Cell fill="#4299E1" />
                                                        <Cell fill="#ED8936" />
                                                    </Pie>
                                                    <RechartsTooltip formatter={(value) => `$${value.toLocaleString('es-CO')}`} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardBody>
                                </Card>

                                {/* Gráfico por Tipo de Pago */}
                                <Card>
                                    <CardBody>
                                        <Heading size="md" mb={4}>Distribución por Tipo</Heading>
                                        <Box h="300px">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={[
                                                        { tipo: 'Membresía', monto: pagos.filter(p => p.tipo_pago === 'membresia' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) },
                                                        { tipo: 'Producto', monto: pagos.filter(p => p.tipo_pago === 'producto' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) },
                                                        { tipo: 'Sesión', monto: pagos.filter(p => p.tipo_pago === 'sesion' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) },
                                                        { tipo: 'Otro', monto: pagos.filter(p => p.tipo_pago === 'otro' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) }
                                                    ]}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="tipo" />
                                                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                                    <RechartsTooltip formatter={(value) => `$${value.toLocaleString('es-CO')}`} />
                                                    <Bar dataKey="monto" fill="#805AD5" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>

                            {/* Estadísticas Detalladas */}
                            <Card>
                                <CardBody>
                                    <Heading size="md" mb={4}>Resumen Detallado</Heading>
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                        <Box p={4} bg="green.50" borderRadius="md">
                                            <Text fontSize="sm" color="gray.600" fontWeight="bold">Ingresos Totales</Text>
                                            <Text fontSize="2xl" color="green.600" fontWeight="bold">
                                                ${(estadisticas?.totalIngresos || 0).toLocaleString('es-CO')}
                                            </Text>
                                        </Box>
                                        <Box p={4} bg="blue.50" borderRadius="md">
                                            <Text fontSize="sm" color="gray.600" fontWeight="bold">Promedio por Pago</Text>
                                            <Text fontSize="2xl" color="blue.600" fontWeight="bold">
                                                ${(pagos.length > 0 ? (pagos.filter(p => p.estado === 'completado' || p.estado === 'pagado').reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) / pagos.filter(p => p.estado === 'completado' || p.estado === 'pagado').length) : 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                            </Text>
                                        </Box>
                                        <Box p={4} bg="purple.50" borderRadius="md">
                                            <Text fontSize="sm" color="gray.600" fontWeight="bold">Total Transacciones</Text>
                                            <Text fontSize="2xl" color="purple.600" fontWeight="bold">
                                                {estadisticas?.totalPagos || pagos.length}
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </CardBody>
                            </Card>

                            {/* Estadísticas de Membresías */}
                            {estadisticasMembresias && (
                                <Card>
                                    <CardBody>
                                        <Heading size="md" mb={4}>Estadísticas de Membresías</Heading>
                                        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                                            <Box textAlign="center" p={4} bg="purple.50" borderRadius="md">
                                                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                                                    {estadisticasMembresias.totalMembresias}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">Membresías Vendidas</Text>
                                            </Box>
                                            <Box textAlign="center" p={4} bg="green.50" borderRadius="md">
                                                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                                    {estadisticasMembresias.activas}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">Activas</Text>
                                            </Box>
                                            <Box textAlign="center" p={4} bg="orange.50" borderRadius="md">
                                                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                                                    {estadisticasMembresias.porVencer}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">Por Vencer (7 días)</Text>
                                            </Box>
                                            <Box textAlign="center" p={4} bg="red.50" borderRadius="md">
                                                <Text fontSize="3xl" fontWeight="bold" color="red.600">
                                                    {estadisticasMembresias.vencidas}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">Vencidas</Text>
                                            </Box>
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>
                            )}
                        </VStack>
                    </TabPanel>

                    {/* Pestaña: Renovar Membresías */}
                    <TabPanel>
                        <VStack spacing={6} align="stretch">
                            <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                <Box>
                                    <Text fontWeight="bold">Renovación de Membresías</Text>
                                    <Text fontSize="sm">Selecciona un cliente para renovar su membresía automáticamente</Text>
                                </Box>
                            </Alert>

                            <Card>
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        <Heading size="md">Clientes con Membresías Activas</Heading>
                                        
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Cliente</Th>
                                                    <Th>Email</Th>
                                                    <Th>Última Membresía</Th>
                                                    <Th>Fecha Vencimiento</Th>
                                                    <Th>Acción</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {usuarios.filter(u => u.membresia_activa).map((usuario) => {
                                                    const ultimoPago = pagos
                                                        .filter(p => p.usuario_id === usuario.id && p.tipo_pago === 'membresia')
                                                        .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))[0]
                                                    
                                                    return (
                                                        <Tr key={usuario.id}>
                                                            <Td>
                                                                <Text fontWeight="medium">{usuario.nombre} {usuario.apellido}</Text>
                                                            </Td>
                                                            <Td>{usuario.email}</Td>
                                                            <Td>
                                                                {ultimoPago ? (
                                                                    <Badge colorScheme="purple">
                                                                        ${parseFloat(ultimoPago.monto || 0).toLocaleString('es-CO')}
                                                                    </Badge>
                                                                ) : '-'}
                                                            </Td>
                                                            <Td>
                                                                <Text fontSize="sm">
                                                                    {usuario.fecha_vencimiento_membresia || 'N/A'}
                                                                </Text>
                                                            </Td>
                                                            <Td>
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="green"
                                                                    leftIcon={<FiRefreshCw />}
                                                                    onClick={() => handleRenovarMembresia(usuario)}
                                                                >
                                                                    Renovar
                                                                </Button>
                                                            </Td>
                                                        </Tr>
                                                    )
                                                })}
                                                {usuarios.filter(u => u.membresia_activa).length === 0 && (
                                                    <Tr>
                                                        <Td colSpan={5} textAlign="center" py={10}>
                                                            <Text color="gray.500">No hay clientes con membresías activas</Text>
                                                        </Td>
                                                    </Tr>
                                                )}
                                            </Tbody>
                                        </Table>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Modal Nuevo Pago */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>💰 Registrar Nuevo Pago</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Usuario</FormLabel>
                                <Select
                                    value={nuevoPago.usuario_id}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, usuario_id: e.target.value })}
                                    placeholder="Selecciona un usuario"
                                >
                                    {usuarios.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.nombre} {u.apellido} - {u.email}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Monto</FormLabel>
                                <NumberInput
                                    value={nuevoPago.monto}
                                    onChange={(value) => setNuevoPago({ ...nuevoPago, monto: value })}
                                    min={0}
                                >
                                    <NumberInputField placeholder="Ingrese el monto" />
                                </NumberInput>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Tipo de Pago</FormLabel>
                                <Select
                                    value={nuevoPago.tipo_pago}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, tipo_pago: e.target.value })}
                                >
                                    <option value="membresia">Membresía</option>
                                    <option value="producto">Producto</option>
                                    <option value="sesion">Sesión</option>
                                    <option value="otro">Otro</option>
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Método de Pago</FormLabel>
                                <Select
                                    value={nuevoPago.metodo_pago}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, metodo_pago: e.target.value })}
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="nequi">Nequi</option>
                                    <option value="daviplata">Daviplata</option>
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Concepto</FormLabel>
                                <Input
                                    value={nuevoPago.concepto}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, concepto: e.target.value })}
                                    placeholder="Descripción del pago"
                                />
                            </FormControl>

                            {(nuevoPago.tipo_pago === 'membresia') && (
                                <FormControl>
                                    <FormLabel>Fecha de Vencimiento</FormLabel>
                                    <Input
                                        type="date"
                                        value={nuevoPago.fecha_vencimiento}
                                        onChange={(e) => setNuevoPago({ ...nuevoPago, fecha_vencimiento: e.target.value })}
                                    />
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        Solo para membresías - Fecha en que expira la membresía
                                    </Text>
                                </FormControl>
                            )}

                            <FormControl>
                                <FormLabel>Comprobante</FormLabel>
                                <Input
                                    value={nuevoPago.comprobante}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, comprobante: e.target.value })}
                                    placeholder="Número de comprobante o referencia"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    Opcional - Número de transacción, factura o comprobante
                                </Text>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Notas</FormLabel>
                                <Input
                                    value={nuevoPago.notas}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, notas: e.target.value })}
                                    placeholder="Observaciones adicionales"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    Opcional - Información adicional sobre el pago
                                </Text>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={handleCrearPago} leftIcon={<FiDollarSign />}>
                            Registrar Pago
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal Detalles del Pago */}
            <Modal isOpen={isDetallesOpen} onClose={onDetallesClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <HStack>
                            <FiFileText />
                            <Text>Detalles del Pago #{pagoSeleccionado?.id}</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {pagoSeleccionado && (
                            <VStack spacing={4} align="stretch">
                                <Card variant="outline">
                                    <CardBody>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <Box>
                                                <Text fontSize="sm" color="gray.600" fontWeight="bold">Cliente</Text>
                                                <Text fontSize="md" mt={1}>
                                                    {usuarios.find(u => u.id === pagoSeleccionado.usuario_id)?.nombre} {usuarios.find(u => u.id === pagoSeleccionado.usuario_id)?.apellido}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {usuarios.find(u => u.id === pagoSeleccionado.usuario_id)?.email}
                                                </Text>
                                            </Box>

                                            <Box>
                                                <Text fontSize="sm" color="gray.600" fontWeight="bold">Estado</Text>
                                                <Badge colorScheme={getEstadoColor(formatearEstado(pagoSeleccionado.estado))} mt={1} fontSize="md">
                                                    {formatearEstado(pagoSeleccionado.estado).toUpperCase()}
                                                </Badge>
                                            </Box>

                                            <Box>
                                                <Text fontSize="sm" color="gray.600" fontWeight="bold">Monto</Text>
                                                <Text fontSize="2xl" fontWeight="bold" color="green.600" mt={1}>
                                                    {formatearMonto(pagoSeleccionado.monto)}
                                                </Text>
                                            </Box>

                                            <Box>
                                                <Text fontSize="sm" color="gray.600" fontWeight="bold">Tipo de Pago</Text>
                                                <Badge colorScheme={getTipoPagoColor(pagoSeleccionado.tipo_pago)} mt={1} fontSize="md">
                                                    {pagoSeleccionado.tipo_pago?.toUpperCase() || 'N/A'}
                                                </Badge>
                                            </Box>

                                            <Box>
                                                <Text fontSize="sm" color="gray.600" fontWeight="bold">Método de Pago</Text>
                                                <HStack mt={1}>
                                                    <FiCreditCard />
                                                    <Text fontSize="md">{pagoSeleccionado.metodo_pago}</Text>
                                                </HStack>
                                            </Box>

                                            <Box>
                                                <Text fontSize="sm" color="gray.600" fontWeight="bold">Fecha de Pago</Text>
                                                <HStack mt={1}>
                                                    <FiCalendar />
                                                    <Text fontSize="md">
                                                        {formatearFecha(pagoSeleccionado.fecha_pago) || 'Sin fecha registrada'}
                                                    </Text>
                                                </HStack>
                                            </Box>

                                            {formatearFecha(pagoSeleccionado.fecha_vencimiento) && (
                                                <Box>
                                                    <Text fontSize="sm" color="gray.600" fontWeight="bold">Fecha de Vencimiento</Text>
                                                    <HStack mt={1}>
                                                        <FiCalendar />
                                                        <Text 
                                                            fontSize="md"
                                                            color={new Date(formatearFecha(pagoSeleccionado.fecha_vencimiento)) < new Date() ? 'red.500' : 'green.600'}
                                                            fontWeight="bold"
                                                        >
                                                            {formatearFecha(pagoSeleccionado.fecha_vencimiento)}
                                                        </Text>
                                                    </HStack>
                                                    {new Date(formatearFecha(pagoSeleccionado.fecha_vencimiento)) < new Date() && (
                                                        <Badge colorScheme="red" mt={1} fontSize="xs">VENCIDO</Badge>
                                                    )}
                                                </Box>
                                            )}

                                            {pagoSeleccionado.comprobante && (
                                                <Box gridColumn="span 2">
                                                    <Text fontSize="sm" color="gray.600" fontWeight="bold">Comprobante</Text>
                                                    <HStack mt={1}>
                                                        <FiPaperclip />
                                                        <Text fontSize="md" fontFamily="mono">{pagoSeleccionado.comprobante}</Text>
                                                    </HStack>
                                                </Box>
                                            )}

                                            <Box gridColumn="span 2">
                                                <Text fontSize="sm" color="gray.600" fontWeight="bold">Concepto</Text>
                                                <Text fontSize="md" mt={1}>
                                                    {pagoSeleccionado.concepto || pagoSeleccionado.descripcion || 'Sin descripción'}
                                                </Text>
                                            </Box>

                                            {pagoSeleccionado.notas && (
                                                <Box gridColumn="span 2">
                                                    <Text fontSize="sm" color="gray.600" fontWeight="bold">Notas</Text>
                                                    <HStack mt={1} align="start">
                                                        <FiEdit3 />
                                                        <Text fontSize="md">{pagoSeleccionado.notas}</Text>
                                                    </HStack>
                                                </Box>
                                            )}

                                            {pagoSeleccionado.created_at && (
                                                <Box gridColumn="span 2">
                                                    <Text fontSize="xs" color="gray.500">
                                                        Registrado el: {pagoSeleccionado.created_at}
                                                    </Text>
                                                </Box>
                                            )}
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onDetallesClose}>Cerrar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
