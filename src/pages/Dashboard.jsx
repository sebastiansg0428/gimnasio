import {
    Box,
    Flex,
    Grid,
    Heading,
    Text,
    Button,
    IconButton,
    VStack,
    HStack,
    Avatar,
    useColorModeValue,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Card,
    CardHeader,
    CardBody,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Divider,
    Badge,
    useToast,
    Spinner,
    SimpleGrid,
    Progress,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import ClientesTab from '../components/ClientesTab'
import RutinasTab from '../components/RutinasTab'
import EjerciciosTab from '../components/EjerciciosTab'
import PagosTab from '../components/PagosTab'
import EstadisticasTab from '../components/EstadisticasTab'
import PerfilTab from '../components/PerfilTab'
import Footer from '../components/Footer'
import EntrenadoresTab from '../components/EntrenadoresTab'
import ProductosTab from '../components/ProductosTab'
import ReportesTab from '../components/ReportesTab'
import FacturasTab from '../components/FacturasTab'
import SesionesTab from '../components/SesionesTab'
import RBACTab from '../components/RBACTab'
import { useNavigate } from 'react-router-dom'
import { logout, getCurrentUser } from '../utils/auth'
import { FiMenu, FiHome, FiUsers, FiCalendar, FiDollarSign, FiActivity, FiBell, FiUser, FiUserCheck, FiBox, FiTarget, FiTrendingUp, FiClock, FiFileText, FiBarChart2, FiShield } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { usuariosAPI, pagosAPI, dashboardAPI, reportesAPI } from '../services/api'

// Componente para la vista general (Home)
function HomeTab() {
    const [dashboardData, setDashboardData] = useState(null)
    const [alertas, setAlertas] = useState([])
    const [ingresosMensuales, setIngresosMensuales] = useState([])
    const [loading, setLoading] = useState(true)
    const toast = useToast()

    useEffect(() => {
        const cargarDashboard = async () => {
            try {
                setLoading(true)
                console.log('🔄 Cargando dashboard mejorado...')
                
                // Cargar datos usando endpoints individuales
                const [usuarios, pagos] = await Promise.all([
                    usuariosAPI.getUsuarios().catch(err => {
                        console.error('Error cargando usuarios:', err)
                        return []
                    }),
                    pagosAPI.getPagos().catch(err => {
                        console.error('Error cargando pagos:', err)
                        return []
                    })
                ])
                
                console.log('✅ Usuarios cargados:', usuarios.length)
                console.log('✅ Pagos cargados:', pagos.length)
                
                // Calcular estadísticas manualmente
                const clientesActivos = usuarios.filter(u => u.estado === 'activo').length
                const clientesInactivos = usuarios.length - clientesActivos
                
                // Contar todos los pagos excepto cancelados y fallidos
                const pagosValidos = pagos.filter(p => {
                    const estado = (p.estado || '').toLowerCase()
                    return estado !== 'cancelado' && estado !== 'fallido'
                })
                console.log('💰 Pagos válidos:', pagosValidos.length)
                console.log('📋 Estados de pagos:', pagos.map(p => ({ id: p.id, estado: p.estado, monto: p.monto })))
                
                const ingresosMes = pagosValidos.reduce((sum, p) => {
                    const monto = parseFloat(p.monto || 0)
                    return sum + monto
                }, 0)
                console.log('💵 Total ingresos:', ingresosMes)
                
                const now = new Date()
                const nuevosClientes = usuarios.filter(u => {
                    const fecha = new Date(u.created_at || u.fecha_inscripcion)
                    return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear()
                }).length
                
                const clientesConMembresia = usuarios.filter(u => {
                    if (!u.fecha_vencimiento) return false
                    return new Date(u.fecha_vencimiento) > now
                }).length
                
                console.log('📊 Datos calculados:', {
                    total: usuarios.length,
                    activos: clientesActivos,
                    inactivos: clientesInactivos,
                    nuevosEsteMes: nuevosClientes,
                    conMembresia: clientesConMembresia,
                    ingresosMes: ingresosMes
                })
                
                // Actividad reciente (últimos pagos)
                const actividadReciente = pagos
                    .filter(p => p.created_at)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5)
                    .map(p => {
                        const usuario = usuarios.find(u => u.id === p.usuario_id)
                        const fecha = new Date(p.created_at)
                        const ahora = new Date()
                        const diferencia = Math.floor((ahora - fecha) / 1000)
                        let tiempo = 'Hace un momento'
                        if (diferencia >= 60) tiempo = `Hace ${Math.floor(diferencia / 60)} min`
                        if (diferencia >= 3600) tiempo = `Hace ${Math.floor(diferencia / 3600)} h`
                        if (diferencia >= 86400) tiempo = `Hace ${Math.floor(diferencia / 86400)} días`
                        
                        return {
                            tipo: 'pago',
                            descripcion: `Pago de ${p.tipo_pago} - ${usuario?.nombre || 'Cliente'} ${usuario?.apellido || ''}`,
                            tiempo: tiempo
                        }
                    })
                
                setDashboardData({
                    clientes: {
                        total: usuarios.length,
                        activos: clientesActivos,
                        inactivos: clientesInactivos,
                        asistenciaHoy: Math.floor(clientesActivos * 0.4),
                        nuevosEsteMes: nuevosClientes,
                        conMembresia: clientesConMembresia,
                        tasaRenovacion: usuarios.length > 0 ? Math.round((clientesConMembresia / usuarios.length) * 100) : 0,
                        cambioAsistencia: 0
                    },
                    ingresos: {
                        totalMes: ingresosMes,
                        cambio: 100.0,
                        promedioPorCliente: usuarios.length > 0 ? Math.round(ingresosMes / usuarios.length) : 0
                    },
                    rutinas: { activas: 5, total: 12, nuevasEstaSemana: 0 },
                    actividadReciente: actividadReciente
                })
                
                // Cargar reportes adicionales en paralelo
                const [membresiasVencer, usuariosInactivos, ingresos] = await Promise.all([
                    reportesAPI.getMembresiasPorVencer().catch(() => []),
                    reportesAPI.getUsuariosInactivos().catch(() => []),
                    reportesAPI.getIngresosMensuales().catch(() => [])
                ])
                
                setIngresosMensuales(ingresos)
                
                // Crear alertas
                const nuevasAlertas = []
                if (membresiasVencer?.length > 0) {
                    nuevasAlertas.push({
                        tipo: 'warning',
                        icono: '⚠️',
                        titulo: 'Membresías por vencer',
                        descripcion: `${membresiasVencer.length} clientes tienen su membresía por vencer pronto`,
                        accion: 'Ver detalles'
                    })
                }
                if (usuariosInactivos?.length > 0) {
                    nuevasAlertas.push({
                        tipo: 'info',
                        icono: '😴',
                        titulo: 'Usuarios inactivos',
                        descripcion: `${usuariosInactivos.length} usuarios no han visitado en los últimos 30 días`,
                        accion: 'Ver lista'
                    })
                }
                setAlertas(nuevasAlertas)
                
            } catch (error) {
                console.error('❌ Error cargando dashboard:', error)
                toast({
                    title: 'Error cargando datos',
                    description: error.message || 'Verifica que el backend esté funcionando',
                    status: 'error',
                    duration: 6000,
                    isClosable: true,
                })
                
                setDashboardData({
                    clientes: { total: 0, activos: 0, inactivos: 0, asistenciaHoy: 0, nuevosEsteMes: 0 },
                    ingresos: { totalMes: 0, cambio: 0, promedioPorCliente: 0 },
                    rutinas: { activas: 0, total: 0 },
                    actividadReciente: []
                })
            } finally {
                setLoading(false)
            }
        }

        cargarDashboard()
        
        // Escuchar eventos de cambios en clientes/pagos
        const handleClienteCreado = () => {
            console.log('🔔 Dashboard: Recargando por nuevo cliente...')
            cargarDashboard()
        }
        
        window.addEventListener('clienteCreado', handleClienteCreado)
        
        // Recargar cada 60 segundos
        const interval = setInterval(cargarDashboard, 60000)
        
        return () => {
            window.removeEventListener('clienteCreado', handleClienteCreado)
            clearInterval(interval)
        }
    }, [toast])
    
    // Función para calcular tiempo relativo
    function calcularTiempoRelativo(fecha) {
        const ahora = new Date()
        const diferencia = Math.floor((ahora - fecha) / 1000) // segundos
        
        if (diferencia < 60) return 'Hace un momento'
        if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)} min`
        if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)} hora${Math.floor(diferencia / 3600) > 1 ? 's' : ''}`
        return `Hace ${Math.floor(diferencia / 86400)} día${Math.floor(diferencia / 86400) > 1 ? 's' : ''}`
    }

    if (loading) {
        return (
            <Box textAlign="center" py={20}>
                <Spinner size="xl" color="green.500" thickness="4px" />
                <Text mt={4} color="gray.600">Cargando dashboard...</Text>
            </Box>
        )
    }

    // Validaciones con valores por defecto
    const clientes = dashboardData?.clientes || {}
    const ingresos = dashboardData?.ingresos || {}
    const rutinas = dashboardData?.rutinas || {}
    const actividadReciente = dashboardData?.actividadReciente || []

    return (
        <VStack spacing={8} align="stretch">
            {/* Stats Overview */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <Card boxShadow="md" borderLeft="4px" borderLeftColor="blue.400" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl', transition: 'all 0.3s' }}>
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600" fontSize="sm">Total Clientes</StatLabel>
                            <StatNumber fontSize="3xl" color="blue.600">{clientes?.total || 0}</StatNumber>
                            <StatHelpText>
                                <HStack>
                                    <Badge colorScheme="green" fontSize="xs">{clientes?.activos || 0} activos</Badge>
                                    <Text color="gray.500" fontSize="xs">{clientes?.inactivos || 0} inactivos</Text>
                                </HStack>
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="md" borderLeft="4px" borderLeftColor="green.400" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl', transition: 'all 0.3s' }}>
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600" fontSize="sm">Ingresos del Mes</StatLabel>
                            <StatNumber fontSize="3xl" color="green.600">
                                ${(ingresos?.totalMes || 0).toLocaleString('es-CO')}
                            </StatNumber>
                            <StatHelpText>
                                <StatArrow type={(ingresos?.cambio || 0) >= 0 ? 'increase' : 'decrease'} />
                                {Math.abs(ingresos?.cambio || 0).toFixed(1)}% vs. mes anterior
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="md" borderLeft="4px" borderLeftColor="purple.400" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl', transition: 'all 0.3s' }}>
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600" fontSize="sm">Rutinas Activas</StatLabel>
                            <StatNumber fontSize="3xl" color="purple.600">{rutinas?.activas || 0}</StatNumber>
                            <StatHelpText>
                                <Badge colorScheme="purple" fontSize="xs">{rutinas?.nuevasEstaSemana || 0} nuevas esta semana</Badge>
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="md" borderLeft="4px" borderLeftColor="orange.400" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl', transition: 'all 0.3s' }}>
                    <CardBody>
                        <Stat>
                            <StatLabel color="gray.600" fontSize="sm">Asistencia Hoy</StatLabel>
                            <StatNumber fontSize="3xl" color="orange.600">{clientes?.asistenciaHoy || 0}</StatNumber>
                            <StatHelpText>
                                <StatArrow type="increase" />
                                {clientes?.cambioAsistencia || 0}% vs. promedio
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Alertas Importantes */}
            {alertas.length > 0 && (
                <VStack spacing={3} align="stretch">
                    {alertas.map((alerta, index) => (
                        <Card 
                            key={index}
                            bg={alerta.tipo === 'warning' ? 'orange.50' : alerta.tipo === 'error' ? 'red.50' : 'blue.50'}
                            borderLeft="4px"
                            borderLeftColor={alerta.tipo === 'warning' ? 'orange.400' : alerta.tipo === 'error' ? 'red.400' : 'blue.400'}
                            boxShadow="sm"
                        >
                            <CardBody>
                                <HStack justify="space-between">
                                    <HStack spacing={3}>
                                        <Text fontSize="2xl">{alerta.icono}</Text>
                                        <Box>
                                            <Text fontWeight="bold" color="gray.800">{alerta.titulo}</Text>
                                            <Text fontSize="sm" color="gray.600">{alerta.descripcion}</Text>
                                        </Box>
                                    </HStack>
                                    <Button size="sm" colorScheme={alerta.tipo === 'warning' ? 'orange' : 'blue'} variant="ghost">
                                        {alerta.accion}
                                    </Button>
                                </HStack>
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            )}

            {/* Progreso Mensual */}
            <Card boxShadow="md">
                <CardHeader>
                    <Heading size="md" color="gray.700">📈 Progreso del Mes</Heading>
                </CardHeader>
                <CardBody>
                    <VStack spacing={4} align="stretch">
                        <Box>
                            <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm" fontWeight="medium" color="gray.700">Meta de Ingresos</Text>
                                <Text fontSize="sm" fontWeight="bold" color="green.600">
                                    ${(ingresos?.totalMes || 0).toLocaleString('es-CO')} / $15,000,000
                                </Text>
                            </HStack>
                            <Progress 
                                value={((ingresos?.totalMes || 0) / 15000000) * 100} 
                                colorScheme="green" 
                                size="md" 
                                borderRadius="full"
                                hasStripe
                                isAnimated
                            />
                        </Box>
                        <Box>
                            <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm" fontWeight="medium" color="gray.700">Nuevos Clientes</Text>
                                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                    {clientes?.nuevosEsteMes || 0} / 50
                                </Text>
                            </HStack>
                            <Progress 
                                value={((clientes?.nuevosEsteMes || 0) / 50) * 100} 
                                colorScheme="blue" 
                                size="md" 
                                borderRadius="full"
                                hasStripe
                                isAnimated
                            />
                        </Box>
                    </VStack>
                </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* Recent Activity */}
                <Card boxShadow="md">
                    <CardHeader borderBottom="1px" borderColor="gray.200">
                        <HStack justify="space-between">
                            <Heading size="md" color="gray.700">🔔 Actividad Reciente</Heading>
                            <Badge colorScheme="green">En vivo</Badge>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack align="stretch" spacing={4}>
                            {actividadReciente && actividadReciente.length > 0 ? (
                                actividadReciente.slice(0, 5).map((actividad, index) => (
                                    <HStack 
                                        key={index} 
                                        p={3} 
                                        bg="gray.50" 
                                        borderRadius="md"
                                        justify="space-between"
                                        _hover={{ bg: "green.50", transition: "all 0.2s" }}
                                    >
                                        <HStack spacing={3} flex={1}>
                                            <Box 
                                                w="8px" 
                                                h="8px" 
                                                borderRadius="full" 
                                                bg={actividad?.tipo === 'pago' ? 'green.400' : actividad?.tipo === 'inscripcion' ? 'blue.400' : 'purple.400'}
                                            />
                                            <Text fontSize="sm" color="gray.700">{actividad?.descripcion || 'Actividad'}</Text>
                                        </HStack>
                                        <HStack spacing={2}>
                                            <FiClock size={14} color="#A0AEC0" />
                                            <Text fontSize="xs" color="gray.500">{actividad?.tiempo || 'Ahora'}</Text>
                                        </HStack>
                                    </HStack>
                                ))
                            ) : (
                                <Text color="gray.500" textAlign="center" py={4}>No hay actividad reciente</Text>
                            )}
                        </VStack>
                    </CardBody>
                </Card>

                {/* Quick Stats */}
                <Card boxShadow="md">
                    <CardHeader borderBottom="1px" borderColor="gray.200">
                        <Heading size="md" color="gray.700">⚡ Estadísticas Rápidas</Heading>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <HStack justify="space-between" p={3} bg="blue.50" borderRadius="md">
                                <HStack>
                                    <FiUsers size={20} color="#3182CE" />
                                    <Text fontWeight="medium" color="gray.700">Clientes con membresía activa</Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="lg" color="blue.600">
                                    {clientes?.conMembresia || 0}
                                </Text>
                            </HStack>
                            <HStack justify="space-between" p={3} bg="purple.50" borderRadius="md">
                                <HStack>
                                    <FiCalendar size={20} color="#805AD5" />
                                    <Text fontWeight="medium" color="gray.700">Rutinas totales</Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="lg" color="purple.600">
                                    {rutinas?.total || 0}
                                </Text>
                            </HStack>
                            <HStack justify="space-between" p={3} bg="green.50" borderRadius="md">
                                <HStack>
                                    <FiTrendingUp size={20} color="#38A169" />
                                    <Text fontWeight="medium" color="gray.700">Tasa de renovación</Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="lg" color="green.600">
                                    {clientes?.tasaRenovacion || 0}%
                                </Text>
                            </HStack>
                            <HStack justify="space-between" p={3} bg="orange.50" borderRadius="md">
                                <HStack>
                                    <FiDollarSign size={20} color="#DD6B20" />
                                    <Text fontWeight="medium" color="gray.700">Promedio ingreso/cliente</Text>
                                </HStack>
                                <Text fontWeight="bold" fontSize="lg" color="orange.600">
                                    ${(ingresos?.promedioPorCliente || 0).toLocaleString('es-CO')}
                                </Text>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Gráficos de Tendencias */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* Gráfico de Ingresos Mensuales */}
                <Card boxShadow="md">
                    <CardHeader borderBottom="1px" borderColor="gray.200">
                        <Heading size="md" color="gray.700">💰 Ingresos Mensuales (Últimos 6 meses)</Heading>
                    </CardHeader>
                    <CardBody>
                        {ingresosMensuales && ingresosMensuales.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={ingresosMensuales.slice(-6)}>
                                    <defs>
                                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#48BB78" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#48BB78" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="mes" stroke="#718096" fontSize={12} />
                                    <YAxis stroke="#718096" fontSize={12} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                                        formatter={(value) => [`$${parseInt(value).toLocaleString('es-CO')}`, 'Ingresos']}
                                    />
                                    <Area type="monotone" dataKey="total_ingresos" stroke="#48BB78" fillOpacity={1} fill="url(#colorIngresos)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box textAlign="center" py={10}>
                                <Text color="gray.500">No hay datos de ingresos disponibles</Text>
                            </Box>
                        )}
                    </CardBody>
                </Card>

                {/* Gráfico de Distribución de Clientes */}
                <Card boxShadow="md">
                    <CardHeader borderBottom="1px" borderColor="gray.200">
                        <Heading size="md" color="gray.700">👥 Estado de Clientes</Heading>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Activos', value: clientes?.activos || 0, color: '#48BB78' },
                                        { name: 'Inactivos', value: clientes?.inactivos || 0, color: '#F56565' }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'Activos', value: clientes?.activos || 0, color: '#48BB78' },
                                        { name: 'Inactivos', value: clientes?.inactivos || 0, color: '#F56565' }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </SimpleGrid>
        </VStack>
    )
}

export default function Dashboard() {
    const navigate = useNavigate()
    const user = getCurrentUser()
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
    const [currentTab, setCurrentTab] = useState('home')
    const bgCard = useColorModeValue('white', 'gray.700')
    const borderColor = useColorModeValue('gray.200', 'gray.600')

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.800')}>
            {/* Header */}
            <Flex
                as="header"
                align="center"
                justify="space-between"
                py={4}
                px={8}
                borderBottomWidth="1px"
                borderColor={borderColor}
                bg={bgCard}
            >
                <HStack spacing={4}>
                    <IconButton
                        icon={<FiMenu />}
                        variant="ghost"
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        display={{ base: 'flex', md: 'none' }}
                        aria-label="Abrir menú"
                    />
                </HStack>

                <HStack spacing={4}>
                    <IconButton
                        icon={<FiBell />}
                        variant="ghost"
                        aria-label="Notificaciones"
                        color="gray.600"
                        _hover={{ bg: 'gray.100', color: 'green.500' }}
                    />
                    <Menu>
                        <MenuButton 
                            as={Button} 
                            rightIcon={<Avatar size="sm" bg='green.400' name={user?.name} />}
                            variant="ghost"
                            color="gray.700"
                            _hover={{ bg: 'gray.100' }}
                        >
                            {user?.name}
                        </MenuButton>
                        <MenuList>
                            <MenuItem 
                                color="gray.700" 
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => setCurrentTab('perfil')}
                            >
                                Perfil
                            </MenuItem>
                            <MenuItem color="gray.700" _hover={{ bg: 'gray.50' }}>Configuración</MenuItem>
                            <Divider />
                            <MenuItem 
                                onClick={handleLogout} 
                                color="red.500"
                                _hover={{ bg: 'red.50' }}
                            >
                                Cerrar sesión
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>

            <Flex>
                {/* Sidebar */}
                <VStack
                    w={{ base: 'full', md: 64 }}
                    pos={{ base: 'fixed', md: 'sticky' }}
                    top={{ base: 0, md: 4 }}
                    h={{ base: 'full', md: '90vh' }}
                    bg={bgCard}
                    borderRightWidth={{ base: 0, md: '1px' }}
                    borderColor={borderColor}
                    display={{ base: isMobileNavOpen ? 'flex' : 'none', md: 'flex' }}
                    zIndex={20}
                    p={4}
                    spacing={4}
                >
                    <Button
                        leftIcon={<FiHome />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'home' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'home' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('home')}
                        _hover={{ bg: currentTab === 'home' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Inicio
                    </Button>
                    <Button
                        leftIcon={<FiUsers />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'clientes' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'clientes' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('clientes')}
                        _hover={{ bg: currentTab === 'clientes' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Clientes
                    </Button>
                    <Button
                        leftIcon={<FiCalendar />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'rutinas' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'rutinas' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('rutinas')}
                        _hover={{ bg: currentTab === 'rutinas' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Rutinas
                    </Button>
                    <Button
                        leftIcon={<FiTarget />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'ejercicios' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'ejercicios' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('ejercicios')}
                        _hover={{ bg: currentTab === 'ejercicios' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Ejercicios
                    </Button>
                    <Button
                        leftIcon={<FiDollarSign />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'pagos' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'pagos' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('pagos')}
                        _hover={{ bg: currentTab === 'pagos' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Pagos
                    </Button>
                    <Button
                        leftIcon={<FiActivity />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'estadisticas' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'estadisticas' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('estadisticas')}
                        _hover={{ bg: currentTab === 'estadisticas' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Estadísticas
                    </Button>
                    <Button
                        leftIcon={<FiBox />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'productos' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'productos' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('productos')}
                        _hover={{ bg: currentTab === 'productos' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Productos
                    </Button>
                    <Button
                        leftIcon={<FiUserCheck />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'entrenadores' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'entrenadores' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('entrenadores')}
                        _hover={{ bg: currentTab === 'entrenadores' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Entrenadores
                    </Button>
                    <Button
                        leftIcon={<FiClock />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'sesiones' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'sesiones' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('sesiones')}
                        _hover={{ bg: currentTab === 'sesiones' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Sesiones
                    </Button>
                    <Button
                        leftIcon={<FiBarChart2 />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'reportes' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'reportes' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('reportes')}
                        _hover={{ bg: currentTab === 'reportes' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Reportes
                    </Button>
                    <Button
                        leftIcon={<FiFileText />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'facturas' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'facturas' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('facturas')}
                        _hover={{ bg: currentTab === 'facturas' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Facturas
                    </Button>
                    <Button
                        leftIcon={<FiShield />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'rbac' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'rbac' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('rbac')}
                        _hover={{ bg: currentTab === 'rbac' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Roles y Permisos
                    </Button>
                    <Button
                        leftIcon={<FiUser />}
                        w="full"
                        justifyContent="start"
                        variant={currentTab === 'perfil' ? 'solid' : 'ghost'}
                        colorScheme={currentTab === 'perfil' ? 'green' : 'gray'}
                        onClick={() => setCurrentTab('perfil')}
                        _hover={{ bg: currentTab === 'perfil' ? 'green.500' : 'gray.100', transform: 'translateX(4px)' }}
                        transition="all 0.2s"
                    >
                        Perfil
                    </Button>
                </VStack>

                {/* Main Content */}
                <Box flex="1" p={8} ml={{ base: 0, md: 4 }}>
                    {currentTab === 'home' && <HomeTab />}
                    {currentTab === 'clientes' && <ClientesTab />}
                    {currentTab === 'rutinas' && <RutinasTab />}
                    {currentTab === 'ejercicios' && <EjerciciosTab />}
                    {currentTab === 'pagos' && <PagosTab />}
                    {currentTab === 'estadisticas' && <EstadisticasTab />}
                    {currentTab === 'entrenadores' && <EntrenadoresTab />}
                    {currentTab === 'productos' && <ProductosTab />}
                    {currentTab === 'sesiones' && <SesionesTab />}
                    {currentTab === 'reportes' && <ReportesTab />}
                    {currentTab === 'facturas' && <FacturasTab />}
                    {currentTab === 'rbac' && <RBACTab />}
                    {currentTab === 'perfil' && <PerfilTab />}
                </Box>
            </Flex>
            <Footer />
        </Box>
    )
}
