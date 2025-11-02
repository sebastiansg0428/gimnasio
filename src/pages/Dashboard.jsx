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
    Card,
    CardHeader,
    CardBody,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Divider,
} from '@chakra-ui/react'
import ClientesTab from '../components/ClientesTab'
import RutinasTab from '../components/RutinasTab'
import PagosTab from '../components/PagosTab'
import EstadisticasTab from '../components/EstadisticasTab'
import PerfilTab from '../components/PerfilTab'
import { useNavigate } from 'react-router-dom'
import { logout, getCurrentUser } from '../utils/auth'
import { FiMenu, FiHome, FiUsers, FiCalendar, FiDollarSign, FiActivity, FiBell, FiUser } from 'react-icons/fi'
import { useState } from 'react'

// Datos de ejemplo
const mockData = {
    totalClientes: 145,
    clientesActivos: 128,
    ingresosMes: 8750,
    rutinasActivas: 89
}

// Componente para la vista general (Home)
function HomeTab() {
    return (
        <VStack spacing={8} align="stretch">
            {/* Stats Overview */}
            <Grid
                templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
                gap={6}
            >
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Clientes</StatLabel>
                            <StatNumber>{mockData.totalClientes}</StatNumber>
                            <StatHelpText>{mockData.clientesActivos} activos</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Ingresos del Mes</StatLabel>
                            <StatNumber>${mockData.ingresosMes}</StatNumber>
                            <StatHelpText>+8% vs. mes anterior</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Rutinas Activas</StatLabel>
                            <StatNumber>{mockData.rutinasActivas}</StatNumber>
                            <StatHelpText>12 nuevas esta semana</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Asistencia Hoy</StatLabel>
                            <StatNumber>67</StatNumber>
                            <StatHelpText>↑ 15% vs. promedio</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </Grid>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <Heading size="md">Actividad Reciente</Heading>
                </CardHeader>
                <CardBody>
                    <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                            <Text>Carlos Mendoza completó su rutina</Text>
                            <Text color="gray.500">Hace 5 min</Text>
                        </HStack>
                        <HStack justify="space-between">
                            <Text>Nueva inscripción: María González</Text>
                            <Text color="gray.500">Hace 15 min</Text>
                        </HStack>
                        <HStack justify="space-between">
                            <Text>Pago recibido de Juan Pérez</Text>
                            <Text color="gray.500">Hace 1 hora</Text>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>
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
                    <Heading size="lg">Reynal-GYM</Heading>
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
                    {currentTab === 'pagos' && <PagosTab />}
                    {currentTab === 'estadisticas' && <EstadisticasTab />}
                    {currentTab === 'perfil' && <PerfilTab />}
                </Box>
            </Flex>
        </Box>
    )
}
