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
} from '@chakra-ui/react'
import ClientesTab from '../components/ClientesTab'
import RutinasTab from '../components/RutinasTab'
import EjerciciosTab from '../components/EjerciciosTab'
import PagosTab from '../components/PagosTab'
import EstadisticasTab from '../components/EstadisticasTab'
import PerfilTab from '../components/PerfilTab'
import Footer from '../components/Footer'
import EntrenadoresTab from '../components/EntrenadoresTab'
import ProductosTab from '../components/ProductosTab'
import { useNavigate } from 'react-router-dom'
import { logout, getCurrentUser } from '../utils/auth'
import { FiMenu, FiHome, FiUsers, FiCalendar, FiDollarSign, FiActivity, FiBell, FiUser, FiUserCheck, FiBox, FiTarget, FiTrendingUp, FiClock } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { usuariosAPI, pagosAPI } from '../services/api'

// Componente para la vista general (Home)
function HomeTab() {
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)
    const toast = useToast()

    useEffect(() => {
        const cargarDashboard = async () => {
            try {
                setLoading(true)
                console.log('🔄 Cargando dashboard...')
                
                // Usar endpoints individuales disponibles
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
                
                // Ver todos los pagos con detalles
                pagos.forEach((p, i) => {
                    console.log(`Pago ${i+1}:`, {
                        id: p.id,
                        monto: p.monto,
                        estado: p.estado,
                        fecha_pago: p.fecha_pago,
                        created_at: p.created_at
                    })
                })
                
                // Calcular estadísticas desde los datos
                const clientesActivos = usuarios.filter(u => u.estado === 'activo').length
                const clientesInactivos = usuarios.length - clientesActivos
                const clientesConMembresia = usuarios.filter(u => {
                    if (!u.fecha_vencimiento) return false
                    return new Date(u.fecha_vencimiento) > new Date()
                }).length
                
                // Calcular ingresos - SIMPLIFICADO (todos los pagos con estado pagado o completado)
                const pagosValidos = pagos.filter(p => p.estado === 'pagado' || p.estado === 'completado')
                console.log('💰 Pagos válidos (pagado/completado):', pagosValidos.length)
                
                const ingresosMes = pagosValidos.reduce((sum, p) => {
                    const monto = parseFloat(p.monto) || 0
                    console.log(`  - Sumando pago: $${monto}`)
                    return sum + monto
                }, 0)
                console.log('💵 Total ingresos:', ingresosMes)
                
                // Nuevos clientes del mes
                const now = new Date()
                const nuevosClientes = usuarios.filter(u => {
                    const fechaCreacion = new Date(u.created_at || u.fecha_inscripcion)
                    return fechaCreacion.getMonth() === now.getMonth() && 
                           fechaCreacion.getFullYear() === now.getFullYear()
                }).length
                
                console.log('📊 Datos calculados:', {
                    totalClientes: usuarios.length,
                    activos: clientesActivos,
                    inactivos: clientesInactivos,
                    ingresosMes: ingresosMes,
                    nuevosClientes: nuevosClientes
                })
                
                // Actividad reciente (últimos pagos)
                const actividadReciente = pagos
                    .filter(p => p.created_at)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5)
                    .map(p => {
                        const usuario = usuarios.find(u => u.id === p.usuario_id)
                        const tiempo = calcularTiempoRelativo(new Date(p.created_at))
                        return {
                            tipo: p.tipo_pago === 'membresia' ? 'pago' : 'pago',
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
                        cambioAsistencia: 15,
                        conMembresia: clientesConMembresia,
                        nuevosEsteMes: nuevosClientes,
                        tasaRenovacion: clientesConMembresia > 0 ? Math.round((clientesConMembresia / usuarios.length) * 100) : 0
                    },
                    ingresos: {
                        totalMes: ingresosMes,
                        cambio: 8.5,
                        promedioPorCliente: usuarios.length > 0 ? Math.round(ingresosMes / usuarios.length) : 0
                    },
                    rutinas: {
                        activas: Math.floor(clientesActivos * 0.7),
                        total: Math.floor(usuarios.length * 1.2),
                        nuevasEstaSemana: Math.floor(nuevosClientes * 1.5)
                    },
                    actividadReciente: actividadReciente
                })
            } catch (error) {
                console.error('❌ Error cargando dashboard:', error)
                
                // Detectar si es error de CORS
                const esCORS = error.message.includes('conexión') || error.message.includes('CORS')
                
                toast({
                    title: esCORS ? '🚫 Error de Conexión' : 'Error cargando datos',
                    description: esCORS 
                        ? 'No se puede conectar con el backend. Verifica que esté corriendo en http://localhost:3001 y tenga CORS habilitado.'
                        : error.message || 'Verifica que el backend esté funcionando',
                    status: 'error',
                    duration: 6000,
                    isClosable: true,
                })
                
                // Mostrar instrucciones en consola
                if (esCORS) {
                    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: red; font-weight: bold')
                    console.log('%c🚫 ERROR DE CORS DETECTADO', 'color: red; font-weight: bold; font-size: 16px')
                    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: red; font-weight: bold')
                    console.log('%c📋 SOLUCIONES:', 'color: orange; font-weight: bold; font-size: 14px')
                    console.log('%c1️⃣ Verifica que el backend esté corriendo:', 'color: yellow')
                    console.log('   node index.js (en la carpeta del backend)')
                    console.log('%c2️⃣ Verifica que el backend tenga CORS habilitado:', 'color: yellow')
                    console.log('   app.use(cors()) en el archivo index.js del backend')
                    console.log('%c3️⃣ URL del backend debe ser:', 'color: yellow')
                    console.log('   http://localhost:3001')
                    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: red; font-weight: bold')
                }
                
                // Datos de ejemplo en caso de error
                setDashboardData({
                    clientes: { total: 0, activos: 0, inactivos: 0, asistenciaHoy: 0, cambioAsistencia: 0, conMembresia: 0, nuevosEsteMes: 0, tasaRenovacion: 0 },
                    ingresos: { totalMes: 0, cambio: 0, promedioPorCliente: 0 },
                    rutinas: { activas: 0, total: 0, nuevasEstaSemana: 0 },
                    actividadReciente: []
                })
            } finally {
                setLoading(false)
            }
        }

        cargarDashboard()
        // Recargar cada 30 segundos
        const interval = setInterval(cargarDashboard, 30000)
        return () => clearInterval(interval)
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
                    {currentTab === 'perfil' && <PerfilTab />}
                </Box>
            </Flex>
            <Footer />
        </Box>
    )
}
