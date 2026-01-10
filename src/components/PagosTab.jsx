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
    const [usuariosMembresiasActivas, setUsuariosMembresiasActivas] = useState([])
    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [filtroMetodo, setFiltroMetodo] = useState('todos')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')
    const [aplicandoFiltros, setAplicandoFiltros] = useState(false)
    const [nuevoPago, setNuevoPago] = useState({
        usuario_id: '',
        monto: '',
        tipo_pago: 'membresia',
        tipo_membresia: '',
        metodo_pago: 'efectivo',
        estado: 'completado',
        concepto: '',
        fecha_vencimiento: '',
        comprobante: '',
        notas: '',
        producto_id: ''
    })
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isDetallesOpen, onOpen: onDetallesOpen, onClose: onDetallesClose } = useDisclosure()
    const { isOpen: isRenovarOpen, onOpen: onRenovarOpen, onClose: onRenovarClose } = useDisclosure()
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null)
    const [usuarioRenovar, setUsuarioRenovar] = useState(null)
    const [renovacionData, setRenovacionData] = useState({
        tipo_membresia: '',
        monto: '',
        metodo_pago: 'efectivo'
    })
    const toast = useToast()

    // Opciones de membresías con precios
    const opcionesMembresias = [
        { tipo: 'DIARIA', precio: 6000, duracion: '1 día' },
        { tipo: 'SEMANAL', precio: 25000, duracion: '7 días' },
        { tipo: 'QUINCENAL', precio: 40000, duracion: '15 días' },
        { tipo: 'MENSUAL', precio: 60000, duracion: '30 días' },
        { tipo: 'ANUAL', precio: 600000, duracion: '365 días' }
    ]

    useEffect(() => {
        let isMounted = true
        
        const loadInitialData = async () => {
            if (isMounted) {
                await cargarDatos()
            }
        }
        
        loadInitialData()
        
        // Escuchar evento de cliente creado con pago
        const handleClienteCreado = (event) => {
            if (isMounted) {
                console.log('🔔 EVENTO: Cliente creado con pago, recargando datos de pagos...')
                cargarDatos()
            }
        }
        
        window.addEventListener('clienteCreado', handleClienteCreado)
        
        // Recargar datos cada 30 segundos solo si está montado
        const interval = setInterval(() => {
            if (isMounted) {
                cargarDatos()
            }
        }, 30000)
        
        return () => {
            isMounted = false
            window.removeEventListener('clienteCreado', handleClienteCreado)
            clearInterval(interval)
        }
    }, [])

    async function cargarDatos() {
        try {
            // Solo mostrar loading en la carga inicial
            if (pagos.length === 0) {
                setLoading(true)
            }
            
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
            
            // Cargar usuarios con membresías activas
            const usuariosMembresiasActivasData = await fetch('http://localhost:3001/usuarios/membresias/activas')
                .then(r => r.ok ? r.json() : { usuarios: [] })
                .then(data => data.usuarios || [])
                .catch(err => {
                    console.error('❌ Error cargando usuarios con membresías activas:', err)
                    return []
                })
            
            // Cargar productos
            const productosData = await fetch('http://localhost:3001/productos')
                .then(r => r.ok ? r.json() : [])
                .catch(err => {
                    console.error('❌ Error cargando productos:', err)
                    return []
                })

            setPagos(pagosData)
            setEstadisticas(estadisticasData)
            setEstadisticasMembresias(estadisticasMembresiasData)
            setUsuarios(usuariosData)
            setUsuariosMembresiasActivas(usuariosMembresiasActivasData)
            setProductos(productosData)
            
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
                notas: '',
                producto_id: ''
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

    function handleRenovarMembresia(usuario) {
        if (!usuario) return
        setUsuarioRenovar(usuario)
        setRenovacionData({
            tipo_membresia: usuario.membresia || 'MENSUAL',
            monto: usuario.precio_membresia || 100000,
            metodo_pago: 'efectivo'
        })
        onRenovarOpen()
    }

    async function confirmarRenovacion() {
        if (!usuarioRenovar || !renovacionData.tipo_membresia) {
            toast({
                title: 'Selecciona un tipo de membresía',
                status: 'warning',
                duration: 2000
            })
            return
        }
        
        try {
            console.log('🔄 RENOVANDO MEMBRESÍA PARA:', usuarioRenovar.nombre)
            
            const response = await fetch('http://localhost:3001/pagos/renovar-membresia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: usuarioRenovar.id,
                    tipo_membresia: renovacionData.tipo_membresia,
                    monto: renovacionData.monto,
                    metodo_pago: renovacionData.metodo_pago
                })
            })

            if (!response.ok) {
                throw new Error('Error al renovar membresía')
            }

            const resultado = await response.json()
            
            toast({
                title: '✅ Membresía renovada',
                description: `${usuarioRenovar.nombre} ${usuarioRenovar.apellido} - ${renovacionData.tipo_membresia}`,
                status: 'success',
                duration: 4000,
                isClosable: true
            })
            
            await cargarDatos()
            window.dispatchEvent(new CustomEvent('clienteCreado'))
            onRenovarClose()
            
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

    function handleProductoChange(productoId) {
        const producto = productos.find(p => p.id === parseInt(productoId))
        if (producto) {
            setNuevoPago({
                ...nuevoPago,
                producto_id: productoId,
                monto: producto.precio_venta || producto.precio_compra,
                concepto: `Venta de ${producto.nombre}`
            })
        }
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

    async function aplicarFiltrosFecha() {
        if (!fechaDesde && !fechaHasta) {
            toast({
                title: 'Selecciona al menos una fecha',
                status: 'warning',
                duration: 2000
            })
            return
        }
        
        setAplicandoFiltros(true)
        try {
            await cargarDatos()
            toast({
                title: 'Filtros aplicados',
                status: 'success',
                duration: 2000
            })
        } catch (error) {
            toast({
                title: 'Error al aplicar filtros',
                status: 'error',
                duration: 2000
            })
        } finally {
            setAplicandoFiltros(false)
        }
    }

    function limpiarFiltros() {
        setFechaDesde('')
        setFechaHasta('')
        setFiltroEstado('todos')
        setFiltroTipo('todos')
        setFiltroMetodo('todos')
        setBusqueda('')
    }

    const pagosFiltrados = useMemo(() => {
        if (!Array.isArray(pagos) || pagos.length === 0) return []
        
        return pagos.filter(p => {
            // Filtro de búsqueda
            if (busqueda) {
                const usuario = usuarios.find(u => u.id === p.usuario_id)
                const nombreUsuario = usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase() : ''
                const concepto = (p.concepto || p.descripcion || '').toLowerCase()
                const busquedaLower = busqueda.toLowerCase()
                
                if (!nombreUsuario.includes(busquedaLower) && !concepto.includes(busquedaLower)) {
                    return false
                }
            }
            
            // Otros filtros
            if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false
            if (filtroTipo !== 'todos' && p.tipo_pago !== filtroTipo) return false
            if (filtroMetodo !== 'todos' && p.metodo_pago !== filtroMetodo) return false
            
            return true
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
        // Manejar valores null, undefined o vacíos
        if (!monto && monto !== 0) return '$0'
        
        // Convertir a string y limpiar caracteres extraños
        let montoLimpio = String(monto).replace(/[^0-9.-]/g, '')
        
        // Convertir a número
        const valor = parseFloat(montoLimpio)
        
        // Validar que sea un número válido
        if (isNaN(valor)) return '$0'
        
        // Formatear manualmente para pesos colombianos
        // Esto asegura que el símbolo $ esté al inicio
        const montoFormateado = Math.round(valor).toLocaleString('es-CO')
        return `$${montoFormateado}`
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
                                    <VStack spacing={3} align="stretch">
                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none">
                                                    <FiSearch color="gray" />
                                                </InputLeftElement>
                                                <Input
                                                    placeholder="Buscar cliente o concepto..."
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
                                                <option value="nequi">Nequi</option>
                                                <option value="daviplata">Daviplata</option>
                                            </Select>
                                        </SimpleGrid>

                                        <Divider />

                                        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={3}>
                                            <FormControl>
                                                <FormLabel fontSize="sm">Fecha Desde</FormLabel>
                                                <Input
                                                    type="date"
                                                    size="sm"
                                                    value={fechaDesde}
                                                    onChange={(e) => setFechaDesde(e.target.value)}
                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="sm">Fecha Hasta</FormLabel>
                                                <Input
                                                    type="date"
                                                    size="sm"
                                                    value={fechaHasta}
                                                    onChange={(e) => setFechaHasta(e.target.value)}
                                                />
                                            </FormControl>

                                            <Button
                                                leftIcon={<FiFilter />}
                                                onClick={aplicarFiltrosFecha}
                                                colorScheme="blue"
                                                size="sm"
                                                mt={6}
                                                isLoading={aplicandoFiltros}
                                            >
                                                Aplicar Filtros
                                            </Button>

                                            <Button
                                                onClick={limpiarFiltros}
                                                variant="outline"
                                                colorScheme="gray"
                                                size="sm"
                                                mt={6}
                                            >
                                                Limpiar
                                            </Button>

                                            <Button
                                                leftIcon={<FiRefreshCw />}
                                                onClick={cargarDatos}
                                                variant="outline"
                                                colorScheme="green"
                                                size="sm"
                                                mt={6}
                                            >
                                                Actualizar
                                            </Button>
                                        </SimpleGrid>

                                        <HStack justifyContent="space-between">
                                            <Button
                                                leftIcon={<FiPlus />}
                                                colorScheme="green"
                                                onClick={onOpen}
                                                size="md"
                                            >
                                                Nuevo Pago
                                            </Button>
                                            
                                            {(fechaDesde || fechaHasta || filtroEstado !== 'todos' || filtroTipo !== 'todos' || filtroMetodo !== 'todos' || busqueda) && (
                                                <Badge colorScheme="blue" fontSize="sm" p={2}>
                                                    Filtros activos
                                                </Badge>
                                            )}
                                        </HStack>
                                    </VStack>
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
                                        <Box w="100%" h="300px" minH="300px">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Efectivo', value: pagos.filter(p => p.metodo_pago === 'efectivo' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) },
                                                            { name: 'Tarjeta', value: pagos.filter(p => p.metodo_pago === 'tarjeta' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) },
                                                            { name: 'Transferencia', value: pagos.filter(p => p.metodo_pago === 'transferencia' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) },
                                                            { name: 'Nequi', value: pagos.filter(p => p.metodo_pago === 'nequi' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) },
                                                            { name: 'Daviplata', value: pagos.filter(p => p.metodo_pago === 'daviplata' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0) }
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
                                                        <Cell fill="#9F7AEA" />
                                                        <Cell fill="#F56565" />
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
                                        <Box w="100%" h="300px" minH="300px">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={[
                                                        { 
                                                            tipo: 'Membresías', 
                                                            monto: pagos.filter(p => p.tipo_pago === 'membresia' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0),
                                                            cantidad: pagos.filter(p => p.tipo_pago === 'membresia' && (p.estado === 'completado' || p.estado === 'pagado')).length
                                                        },
                                                        { 
                                                            tipo: 'Productos', 
                                                            monto: pagos.filter(p => p.tipo_pago === 'producto' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0),
                                                            cantidad: pagos.filter(p => p.tipo_pago === 'producto' && (p.estado === 'completado' || p.estado === 'pagado')).length
                                                        }
                                                    ]}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="tipo" />
                                                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                                    <RechartsTooltip 
                                                        formatter={(value, name) => {
                                                            if (name === 'monto') return `$${value.toLocaleString('es-CO')}`
                                                            return value
                                                        }}
                                                        labelFormatter={(label) => label}
                                                    />
                                                    <Bar dataKey="monto" fill="#805AD5" name="Ingresos" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        
                                        {/* Resumen de tipos */}
                                        <SimpleGrid columns={2} spacing={3} mt={4}>
                                            <Box p={3} bg="purple.50" borderRadius="md" borderWidth="1px" borderColor="purple.200">
                                                <HStack justify="space-between">
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" color="gray.600" fontWeight="bold">💪 Membresías</Text>
                                                        <Text fontSize="sm" color="purple.700" fontWeight="bold">
                                                            {pagos.filter(p => p.tipo_pago === 'membresia' && (p.estado === 'completado' || p.estado === 'pagado')).length} pagos
                                                        </Text>
                                                    </VStack>
                                                    <Text fontSize="lg" fontWeight="bold" color="purple.600">
                                                        ${pagos.filter(p => p.tipo_pago === 'membresia' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0).toLocaleString('es-CO')}
                                                    </Text>
                                                </HStack>
                                            </Box>
                                            
                                            <Box p={3} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                                                <HStack justify="space-between">
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" color="gray.600" fontWeight="bold">🛒 Productos</Text>
                                                        <Text fontSize="sm" color="blue.700" fontWeight="bold">
                                                            {pagos.filter(p => p.tipo_pago === 'producto' && (p.estado === 'completado' || p.estado === 'pagado')).length} ventas
                                                        </Text>
                                                    </VStack>
                                                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                                                        ${pagos.filter(p => p.tipo_pago === 'producto' && (p.estado === 'completado' || p.estado === 'pagado')).reduce((sum, p) => sum + parseFloat(p.monto || 0), 0).toLocaleString('es-CO')}
                                                    </Text>
                                                </HStack>
                                            </Box>
                                        </SimpleGrid>
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
                                                {usuariosMembresiasActivas.map((usuario) => {
                                                    const diasRestantes = usuario.dias_restantes || 0
                                                    const estadoColor = 
                                                        usuario.estado_membresia === 'vencida' ? 'red' :
                                                        usuario.estado_membresia === 'por_vencer' ? 'orange' :
                                                        'green'
                                                    
                                                    return (
                                                        <Tr key={usuario.id}>
                                                            <Td>
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontWeight="medium">{usuario.nombre} {usuario.apellido}</Text>
                                                                    <Badge colorScheme="purple" fontSize="xs">
                                                                        {usuario.membresia}
                                                                    </Badge>
                                                                </VStack>
                                                            </Td>
                                                            <Td>{usuario.email}</Td>
                                                            <Td>
                                                                <Badge colorScheme="green">
                                                                    ${parseFloat(usuario.precio_membresia || 0).toLocaleString('es-CO')}
                                                                </Badge>
                                                            </Td>
                                                            <Td>
                                                                <VStack align="start" spacing={1}>
                                                                    <Text fontSize="sm" fontWeight="medium">
                                                                        {usuario.fecha_vencimiento}
                                                                    </Text>
                                                                    <Badge colorScheme={estadoColor} fontSize="xs">
                                                                        {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vencida'}
                                                                    </Badge>
                                                                </VStack>
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
                                                {usuariosMembresiasActivas.length === 0 && (
                                                    <Tr>
                                                        <Td colSpan={5} textAlign="center" py={10}>
                                                            <VStack spacing={2}>
                                                                <Text color="gray.500">No hay clientes con membresías activas</Text>
                                                                <Text fontSize="sm" color="gray.400">
                                                                    Los clientes aparecerán aquí cuando tengan una membresía vigente
                                                                </Text>
                                                            </VStack>
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
                    <ModalHeader>Registrar Nuevo Pago</ModalHeader>
                    <ModalCloseButton />
                    
                    <ModalBody>
                        <VStack spacing={3} align="stretch">
                            {/* Cliente */}
                            <FormControl isRequired>
                                <FormLabel>Cliente</FormLabel>
                                <Select
                                    value={nuevoPago.usuario_id}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, usuario_id: e.target.value })}
                                    placeholder="Selecciona un cliente"
                                >
                                    {usuarios.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.nombre} {u.apellido} - {u.email}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Tipo de Pago */}
                            <FormControl isRequired>
                                <FormLabel>Tipo de Pago</FormLabel>
                                <Select
                                    value={nuevoPago.tipo_pago}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, tipo_pago: e.target.value, producto_id: '', monto: '', concepto: '', tipo_membresia: '' })}
                                >
                                    <option value="membresia">Membresía</option>
                                    <option value="producto">Producto</option>
                                </Select>
                            </FormControl>

                            {/* Selector de Tipo de Membresía - Solo cuando es membresía */}
                            {nuevoPago.tipo_pago === 'membresia' && (
                                <FormControl isRequired>
                                    <FormLabel>Tipo de Membresía</FormLabel>
                                    <Select
                                        value={nuevoPago.tipo_membresia}
                                        onChange={(e) => {
                                            const tipoSeleccionado = e.target.value
                                            const membresia = opcionesMembresias.find(m => m.tipo === tipoSeleccionado)
                                            if (membresia) {
                                                setNuevoPago({
                                                    ...nuevoPago,
                                                    tipo_membresia: tipoSeleccionado,
                                                    monto: membresia.precio,
                                                    concepto: `Membresía ${tipoSeleccionado} - ${membresia.duracion}`
                                                })
                                            }
                                        }}
                                        placeholder="Selecciona tipo de membresía"
                                    >
                                        {opcionesMembresias.map(m => (
                                            <option key={m.tipo} value={m.tipo}>
                                                {m.tipo} - ${m.precio.toLocaleString('es-CO')} ({m.duracion})
                                            </option>
                                        ))}
                                    </Select>
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        El monto se ajustará automáticamente
                                    </Text>
                                </FormControl>
                            )}

                            {/* Selector de Productos */}
                            {nuevoPago.tipo_pago === 'producto' && (
                                <FormControl isRequired>
                                    <FormLabel>Seleccionar Producto</FormLabel>
                                    <Select
                                        value={nuevoPago.producto_id}
                                        onChange={(e) => handleProductoChange(e.target.value)}
                                        placeholder="Selecciona un producto"
                                    >
                                        {productos
                                            .filter(p => p.estado === 'activo' && p.stock > 0)
                                            .map(producto => (
                                                <option key={producto.id} value={producto.id}>
                                                    {producto.nombre} - ${(producto.precio_venta || producto.precio_compra).toLocaleString('es-CO')} (Stock: {producto.stock})
                                                </option>
                                            ))}
                                    </Select>
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        El monto y concepto se completarán automáticamente
                                    </Text>
                                </FormControl>
                            )}

                            {/* Método de Pago */}
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

                            {/* Monto y Concepto */}
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl isRequired>
                                    <FormLabel>Monto</FormLabel>
                                    <NumberInput
                                        value={nuevoPago.monto}
                                        onChange={(value) => setNuevoPago({ ...nuevoPago, monto: value })}
                                        min={0}
                                    >
                                        <NumberInputField placeholder="0" />
                                    </NumberInput>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Estado</FormLabel>
                                    <Select
                                        value={nuevoPago.estado}
                                        onChange={(e) => setNuevoPago({ ...nuevoPago, estado: e.target.value })}
                                    >
                                        <option value="completado">Completado</option>
                                        <option value="pendiente">Pendiente</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            {/* Concepto */}
                            <FormControl isRequired>
                                <FormLabel>Concepto</FormLabel>
                                <Input
                                    value={nuevoPago.concepto}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, concepto: e.target.value })}
                                    placeholder="Descripción del pago"
                                />
                            </FormControl>

                            {/* Información del cliente - Solo para membresías */}
                            {nuevoPago.tipo_pago === 'membresia' && nuevoPago.usuario_id && (
                                <Box p={3} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                                    <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>Información del Cliente</Text>
                                    <VStack align="stretch" spacing={1}>
                                        {(() => {
                                            const cliente = usuarios.find(u => u.id === parseInt(nuevoPago.usuario_id))
                                            if (!cliente) return <Text fontSize="xs" color="gray.600">Cliente no encontrado</Text>
                                            return (
                                                <>
                                                    <HStack justify="space-between">
                                                        <Text fontSize="xs" color="gray.600">Membresía actual:</Text>
                                                        <Badge colorScheme="blue">{cliente.membresia || 'Sin membresía'}</Badge>
                                                    </HStack>
                                                    {cliente.fecha_vencimiento && (
                                                        <HStack justify="space-between">
                                                            <Text fontSize="xs" color="gray.600">Vence:</Text>
                                                            <Text fontSize="xs" fontWeight="semibold">
                                                                {new Date(cliente.fecha_vencimiento).toLocaleDateString('es-ES')}
                                                            </Text>
                                                        </HStack>
                                                    )}
                                                </>
                                            )
                                        })()}
                                    </VStack>
                                    <Text fontSize="xs" color="blue.600" mt={2} fontStyle="italic">
                                        La fecha de vencimiento se calculará automáticamente según el tipo de membresía
                                    </Text>
                                </Box>
                            )}

                            {/* Campos Opcionales */}
                            <SimpleGrid columns={2} spacing={3}>
                                <FormControl>
                                    <FormLabel>Comprobante</FormLabel>
                                    <Input
                                        value={nuevoPago.comprobante}
                                        onChange={(e) => setNuevoPago({ ...nuevoPago, comprobante: e.target.value })}
                                        placeholder="Número de comprobante"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Notas</FormLabel>
                                    <Input
                                        value={nuevoPago.notas}
                                        onChange={(e) => setNuevoPago({ ...nuevoPago, notas: e.target.value })}
                                        placeholder="Observaciones"
                                    />
                                </FormControl>
                            </SimpleGrid>

                            {/* Resumen del Pago */}
                            {nuevoPago.monto && (
                                <Box p={4} bg="green.50" borderRadius="md" borderWidth="2px" borderColor="green.200">
                                    <HStack justify="space-between" align="center">
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" color="gray.600">Total a Registrar</Text>
                                            {nuevoPago.tipo_membresia && (
                                                <Text fontSize="xs" color="gray.500">
                                                    {opcionesMembresias.find(m => m.tipo === nuevoPago.tipo_membresia)?.duracion}
                                                </Text>
                                            )}
                                        </VStack>
                                        <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                            ${parseInt(nuevoPago.monto || 0).toLocaleString('es-CO')}
                                        </Text>
                                    </HStack>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>
                    
                    <ModalFooter>
                        <Button variant="ghost" onClick={onClose} mr={3}>
                            Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={handleCrearPago}>
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

            {/* Modal Renovar Membresía */}
            <Modal isOpen={isRenovarOpen} onClose={onRenovarClose} size="xl">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent maxW="700px">
                    <ModalHeader bg="green.500" color="white" borderTopRadius="md">
                        <HStack spacing={3}>
                            <Box bg="white" p={2} borderRadius="md">
                                <FiRefreshCw size={24} color="#38A169" />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xl" fontWeight="bold">Renovar Membresía</Text>
                                {usuarioRenovar && (
                                    <Text fontSize="sm" fontWeight="normal" opacity={0.9}>
                                        {usuarioRenovar.nombre} {usuarioRenovar.apellido}
                                    </Text>
                                )}
                            </VStack>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    
                    <ModalBody py={6}>
                        {usuarioRenovar && (
                            <VStack spacing={6} align="stretch">
                                <Card bg="blue.50" borderColor="blue.200" borderWidth={1}>
                                    <CardBody>
                                        <VStack spacing={2} align="stretch">
                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">Membresía Actual:</Text>
                                                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                                                    {usuarioRenovar.membresia}
                                                </Badge>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">Fecha de Vencimiento:</Text>
                                                <Text fontSize="sm" fontWeight="bold" color="orange.600">
                                                    {usuarioRenovar.fecha_vencimiento}
                                                </Text>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.600">Días Restantes:</Text>
                                                <Badge colorScheme={usuarioRenovar.dias_restantes > 7 ? 'green' : 'orange'}>
                                                    {usuarioRenovar.dias_restantes} días
                                                </Badge>
                                            </HStack>
                                        </VStack>
                                    </CardBody>
                                </Card>

                                <Divider />

                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold" color="gray.700">
                                        Selecciona el Nuevo Tipo de Membresía
                                    </FormLabel>
                                    <VStack spacing={3} align="stretch">
                                        {opcionesMembresias.map((opcion) => (
                                            <Card
                                                key={opcion.tipo}
                                                cursor="pointer"
                                                borderWidth={2}
                                                borderColor={renovacionData.tipo_membresia === opcion.tipo ? 'green.500' : 'gray.200'}
                                                bg={renovacionData.tipo_membresia === opcion.tipo ? 'green.50' : 'white'}
                                                _hover={{ 
                                                    borderColor: 'green.400',
                                                    transform: 'scale(1.02)',
                                                    shadow: 'md'
                                                }}
                                                transition="all 0.2s"
                                                onClick={() => {
                                                    setRenovacionData({
                                                        ...renovacionData,
                                                        tipo_membresia: opcion.tipo,
                                                        monto: opcion.precio
                                                    })
                                                }}
                                            >
                                                <CardBody py={4}>
                                                    <HStack justify="space-between">
                                                        <HStack spacing={4}>
                                                            <Box
                                                                w="40px"
                                                                h="40px"
                                                                bg={renovacionData.tipo_membresia === opcion.tipo ? 'green.500' : 'gray.300'}
                                                                borderRadius="md"
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                            >
                                                                {renovacionData.tipo_membresia === opcion.tipo ? (
                                                                    <Text fontSize="xl" color="white">✓</Text>
                                                                ) : (
                                                                    <FiCalendar color="white" size={20} />
                                                                )}
                                                            </Box>
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                                                    {opcion.tipo}
                                                                </Text>
                                                                <Text fontSize="sm" color="gray.600">
                                                                    Duración: {opcion.duracion}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                        <VStack align="end" spacing={0}>
                                                            <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                                                ${opcion.precio.toLocaleString('es-CO')}
                                                            </Text>
                                                            {opcion.tipo === 'ANUAL' && (
                                                                <Badge colorScheme="orange" fontSize="xs">
                                                                    ¡MEJOR PRECIO!
                                                                </Badge>
                                                            )}
                                                        </VStack>
                                                    </HStack>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </VStack>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold" color="gray.700">Método de Pago</FormLabel>
                                    <Select
                                        value={renovacionData.metodo_pago}
                                        onChange={(e) => setRenovacionData({
                                            ...renovacionData,
                                            metodo_pago: e.target.value
                                        })}
                                        size="lg"
                                    >
                                        <option value="efectivo">💵 Efectivo</option>
                                        <option value="tarjeta">💳 Tarjeta</option>
                                        <option value="transferencia">🏦 Transferencia</option>
                                        <option value="nequi">📱 Nequi</option>
                                        <option value="daviplata">📱 Daviplata</option>
                                    </Select>
                                </FormControl>

                                <Card bg="green.50" borderColor="green.300" borderWidth={2}>
                                    <CardBody>
                                        <VStack spacing={2}>
                                            <HStack justify="space-between" w="100%">
                                                <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                                    Total a Pagar:
                                                </Text>
                                                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                                    ${renovacionData.monto.toLocaleString('es-CO')}
                                                </Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.600">
                                                La nueva membresía se activará inmediatamente
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter bg="gray.50" borderBottomRadius="md">
                        <HStack spacing={3}>
                            <Button variant="ghost" onClick={onRenovarClose}>
                                Cancelar
                            </Button>
                            <Button
                                colorScheme="green"
                                leftIcon={<FiRefreshCw />}
                                onClick={confirmarRenovacion}
                                size="lg"
                                isDisabled={!renovacionData.tipo_membresia}
                            >
                                Confirmar Renovación
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
