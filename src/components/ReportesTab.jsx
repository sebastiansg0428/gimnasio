import { useState, useEffect } from 'react'
import {
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Heading,
    Text,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Card,
    CardHeader,
    CardBody,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    HStack,
    VStack,
    Button,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useToast
} from '@chakra-ui/react'
import { FiDollarSign, FiUsers, FiShoppingCart, FiActivity, FiTrendingUp, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { reportesAPI } from '../services/api'

const COLORS = ['#48BB78', '#4299E1', '#9F7AEA', '#ED8936', '#F56565', '#38B2AC', '#D69E2E']

export default function ReportesTab() {
    const [loading, setLoading] = useState(true)
    const [ingresosMensuales, setIngresosMensuales] = useState([])
    const [usuariosNuevos, setUsuariosNuevos] = useState([])
    const [productosMasVendidos, setProductosMasVendidos] = useState([])
    const [rutinasPopulares, setRutinasPopulares] = useState([])
    const [membresiasPorVencer, setMembresiasPorVencer] = useState([])
    const [usuariosInactivos, setUsuariosInactivos] = useState([])
    const [ventasPorUsuario, setVentasPorUsuario] = useState([])
    const [ventasPorProducto, setVentasPorProducto] = useState([])
    const toast = useToast()

    useEffect(() => {
        cargarReportes()
    }, [])

    const cargarReportes = async () => {
        setLoading(true)
        try {
            const [
                ingresos,
                nuevosUsuarios,
                topProductos,
                topRutinas,
                membresias,
                inactivos,
                ventasUsuarios,
                ventasProductos
            ] = await Promise.allSettled([
                reportesAPI.getIngresosMensuales(),
                reportesAPI.getUsuariosNuevos(),
                reportesAPI.getProductosMasVendidos(),
                reportesAPI.getRutinasPopulares(),
                reportesAPI.getMembresiasPorVencer(),
                reportesAPI.getUsuariosInactivos(),
                reportesAPI.getVentasPorUsuario(),
                reportesAPI.getVentasPorProducto()
            ])

            // Extraer datos con manejo de diferentes estructuras de respuesta
            const extractData = (result, propertyName = null) => {
                if (result.status !== 'fulfilled') return []
                const value = result.value
                
                // Si se especifica un nombre de propiedad, intentar extraerlo
                if (propertyName && value && value[propertyName]) {
                    return Array.isArray(value[propertyName]) ? value[propertyName] : []
                }
                
                // Manejar diferentes estructuras: array directo, {data: array}, {reportes: array}
                return Array.isArray(value) ? value : 
                       Array.isArray(value?.data) ? value.data :
                       Array.isArray(value?.reportes) ? value.reportes : []
            }

            console.log('📊 Datos de reportes recibidos:', {
                ingresos: ingresos.value,
                usuarios: nuevosUsuarios.value,
                productos: topProductos.value,
                rutinas: topRutinas.value,
                ventasUsuarios: ventasUsuarios.value
            })

            // Mapear ingresos (total -> total_ingresos)
            const ingresosData = extractData(ingresos, 'ingresos').map(item => ({
                ...item,
                mes: item.nombre_mes || item.mes,
                total_ingresos: parseFloat(item.total || item.total_ingresos || 0)
            }))

            // Mapear usuarios (total -> total_usuarios)
            const usuariosData = extractData(nuevosUsuarios, 'usuarios').map(item => ({
                ...item,
                mes: item.nombre_mes || item.mes,
                total_usuarios: parseInt(item.total || item.total_usuarios || 0)
            }))

            // Mapear productos (nombre -> producto_nombre, cantidad_vendida -> total_vendido)
            const productosData = extractData(topProductos, 'productos').map(item => ({
                ...item,
                nombre: item.nombre || item.producto_nombre, // Mantener 'nombre' para los gráficos
                producto_nombre: item.nombre || item.producto_nombre,
                total_vendido: parseInt(item.numero_ventas || item.unidades_vendidas || item.cantidad_vendida || item.total_vendido || 0),
                total_ingresos: parseFloat(item.ingresos_totales || item.total_ventas || item.total_ingresos || 0)
            }))

            // Mapear rutinas
            const rutinasData = extractData(topRutinas, 'rutinas').map(item => ({
                ...item,
                nombre_rutina: item.nombre || item.nombre_rutina,
                total_asignaciones: parseInt(item.total_asignaciones || item.asignaciones || 0)
            }))

            // Mapear ventas por usuario
            const ventasUsuariosData = extractData(ventasUsuarios, 'ventas').map(item => ({
                ...item,
                nombre: item.nombre || item.usuario?.nombre || item.nombre_usuario,
                apellido: item.apellido || item.usuario?.apellido || item.apellido_usuario,
                email: item.email || item.usuario?.email || item.email_usuario || 'No disponible',
                total_productos_comprados: parseInt(item.total_compras || item.total_productos || item.productos_comprados || item.total_productos_comprados || 0),
                total_gastado: parseFloat(item.total_gastado || item.total || 0)
            }))

            console.log('👥 Ventas por usuario mapeadas:', ventasUsuariosData)

            setIngresosMensuales(ingresosData)
            setUsuariosNuevos(usuariosData)
            setProductosMasVendidos(productosData)
            setRutinasPopulares(rutinasData)
            setMembresiasPorVencer(extractData(membresias, 'membresias'))
            setUsuariosInactivos(extractData(inactivos, 'usuarios'))
            setVentasPorUsuario(ventasUsuariosData)
            setVentasPorProducto(productosData) // Usar los mismos datos de productos

            toast({
                title: '✅ Reportes cargados',
                status: 'success',
                duration: 2000
            })
        } catch (error) {
            console.error('Error cargando reportes:', error)
            toast({
                title: 'Error al cargar reportes',
                description: error.message,
                status: 'error',
                duration: 4000
            })
        } finally {
            setLoading(false)
        }
    }

    // Calcular totales para cards de resumen
    const totalIngresos = ingresosMensuales.reduce((sum, item) => sum + (parseFloat(item.total_ingresos) || 0), 0)
    const totalUsuariosNuevos = usuariosNuevos.reduce((sum, item) => sum + (parseInt(item.total_usuarios) || 0), 0)
    const totalVentas = productosMasVendidos.reduce((sum, item) => sum + (parseInt(item.total_vendido) || 0), 0)

    if (loading) {
        return (
            <Center h="400px">
                <VStack spacing={4}>
                    <Spinner size="xl" color="green.500" thickness="4px" />
                    <Text color="gray.600">Cargando reportes...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <Box>
            {/* Header con botón de actualizar */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="green.600">
                    📊 Reportes y Analíticas
                </Heading>
                <Button
                    leftIcon={<FiRefreshCw />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={cargarReportes}
                    isLoading={loading}
                >
                    Actualizar
                </Button>
            </HStack>

            {/* Cards de resumen */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                <Card bg="white" borderTop="4px solid" borderColor="green.500">
                    <CardBody>
                        <Stat>
                            <HStack>
                                <Box p={3} bg="green.100" borderRadius="lg">
                                    <FiDollarSign size={24} color="#38A169" />
                                </Box>
                                <Box>
                                    <StatLabel color="gray.600">Ingresos del Año</StatLabel>
                                    <StatNumber color="green.600" fontSize="2xl">
                                        ${totalIngresos.toLocaleString('es-CO')}
                                    </StatNumber>
                                    <StatHelpText>{ingresosMensuales.length} meses</StatHelpText>
                                </Box>
                            </HStack>
                        </Stat>
                    </CardBody>
                </Card>

                <Card bg="white" borderTop="4px solid" borderColor="blue.500">
                    <CardBody>
                        <Stat>
                            <HStack>
                                <Box p={3} bg="blue.100" borderRadius="lg">
                                    <FiUsers size={24} color="#3182CE" />
                                </Box>
                                <Box>
                                    <StatLabel color="gray.600">Usuarios Nuevos</StatLabel>
                                    <StatNumber color="blue.600" fontSize="2xl">
                                        {totalUsuariosNuevos}
                                    </StatNumber>
                                    <StatHelpText>Este año</StatHelpText>
                                </Box>
                            </HStack>
                        </Stat>
                    </CardBody>
                </Card>

                <Card bg="white" borderTop="4px solid" borderColor="purple.500">
                    <CardBody>
                        <Stat>
                            <HStack>
                                <Box p={3} bg="purple.100" borderRadius="lg">
                                    <FiShoppingCart size={24} color="#805AD5" />
                                </Box>
                                <Box>
                                    <StatLabel color="gray.600">Productos Vendidos</StatLabel>
                                    <StatNumber color="purple.600" fontSize="2xl">
                                        {totalVentas}
                                    </StatNumber>
                                    <StatHelpText>Total</StatHelpText>
                                </Box>
                            </HStack>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Tabs de reportes */}
            <Tabs colorScheme="green" variant="enclosed">
                <TabList>
                    <Tab _selected={{ color: 'white', bg: 'green.500' }}>📈 Ingresos</Tab>
                    <Tab _selected={{ color: 'white', bg: 'green.500' }}>👥 Usuarios</Tab>
                    <Tab _selected={{ color: 'white', bg: 'green.500' }}>🛒 Productos</Tab>
                    <Tab _selected={{ color: 'white', bg: 'green.500' }}>💪 Rutinas</Tab>
                    <Tab _selected={{ color: 'white', bg: 'green.500' }}>⚠️ Alertas</Tab>
                </TabList>

                <TabPanels>
                    {/* Tab: Ingresos */}
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                            {/* Gráfico de línea de ingresos mensuales */}
                            <Card minH="400px">
                                <CardHeader>
                                    <Heading size="md">Ingresos Mensuales</Heading>
                                </CardHeader>
                                <CardBody>
                                    {ingresosMensuales.length > 0 ? (
                                        <Box h="300px" w="100%">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <AreaChart data={ingresosMensuales}>
                                                <defs>
                                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#48BB78" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#48BB78" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="mes" />
                                                <YAxis />
                                                <Tooltip formatter={(value) => `$${parseFloat(value).toLocaleString('es-CO')}`} />
                                                <Area type="monotone" dataKey="total_ingresos" stroke="#48BB78" fillOpacity={1} fill="url(#colorIngresos)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    ) : (
                                        <Center h="200px">
                                            <Text color="gray.500">No hay datos de ingresos</Text>
                                        </Center>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Ventas por producto */}
                            <Card minH="400px">
                                <CardHeader>
                                    <Heading size="md">Ventas por Producto</Heading>
                                </CardHeader>
                                <CardBody>
                                    {ventasPorProducto.length > 0 ? (
                                        <Box h="300px" w="100%">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                <Pie
                                                    data={ventasPorProducto.slice(0, 6)}
                                                    dataKey="total_vendido"
                                                    nameKey="nombre"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={90}
                                                    label={({nombre, total_vendido, percent}) => 
                                                        `${nombre}: ${total_vendido} (${(percent * 100).toFixed(0)}%)`
                                                    }
                                                    labelLine={true}
                                                >
                                                    {ventasPorProducto.slice(0, 6).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    formatter={(value, name) => [
                                                        `${value} unidades`,
                                                        name
                                                    ]}
                                                />
                                                <Legend 
                                                    verticalAlign="bottom" 
                                                    height={36}
                                                    formatter={(value, entry) => 
                                                        `${value} (${entry.payload.total_vendido})`
                                                    }
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        </Box>
                                    ) : (
                                        <Center h="200px">
                                            <Text color="gray.500">No hay datos de ventas</Text>
                                        </Center>
                                    )}
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        {/* Tabla de ventas por usuario */}
                        {ventasPorUsuario.length > 0 && (
                            <Card mt={6}>
                                <CardHeader>
                                    <Heading size="md">Top Compradores</Heading>
                                </CardHeader>
                                <CardBody>
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Usuario</Th>
                                                <Th>Email</Th>
                                                <Th isNumeric>Productos Comprados</Th>
                                                <Th isNumeric>Total Gastado</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {ventasPorUsuario.slice(0, 10).map((venta, idx) => (
                                                <Tr key={idx}>
                                                    <Td fontWeight="medium">{venta.nombre} {venta.apellido}</Td>
                                                    <Td color="gray.600">{venta.email}</Td>
                                                    <Td isNumeric>
                                                        <Badge colorScheme="purple">{venta.total_productos_comprados}</Badge>
                                                    </Td>
                                                    <Td isNumeric fontWeight="bold" color="green.600">
                                                        ${parseFloat(venta.total_gastado || 0).toLocaleString('es-CO')}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        )}
                    </TabPanel>

                    {/* Tab: Usuarios */}
                    <TabPanel>
                        <Card minH="500px">
                            <CardHeader>
                                <Heading size="md">Usuarios Nuevos por Mes</Heading>
                            </CardHeader>
                            <CardBody>
                                {usuariosNuevos.length > 0 ? (
                                    <Box h="400px" w="100%">
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={usuariosNuevos}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="mes" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="total_usuarios" name="Usuarios Nuevos" fill="#4299E1" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <Center h="300px">
                                        <Text color="gray.500">No hay datos de usuarios nuevos</Text>
                                    </Center>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Tab: Productos */}
                    <TabPanel>
                        <Card minH="500px">
                            <CardHeader>
                                <Heading size="md">Productos Más Vendidos</Heading>
                            </CardHeader>
                            <CardBody>
                                {productosMasVendidos.length > 0 ? (
                                    <>
                                        <Box h="400px" w="100%">
                                            <ResponsiveContainer width="100%" height={400}>
                                                <BarChart data={productosMasVendidos} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="nombre" type="category" width={150} />
                                                <Tooltip />
                                                <Bar dataKey="total_vendido" fill="#9F7AEA" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>

                                        <Table variant="simple" mt={6}>
                                            <Thead>
                                                <Tr>
                                                    <Th>Posición</Th>
                                                    <Th>Producto</Th>
                                                    <Th isNumeric>Unidades Vendidas</Th>
                                                    <Th isNumeric>Ingresos Totales</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {productosMasVendidos.map((producto, idx) => (
                                                    <Tr key={idx}>
                                                        <Td>
                                                            <Badge colorScheme={idx < 3 ? 'yellow' : 'gray'}>
                                                                #{idx + 1}
                                                            </Badge>
                                                        </Td>
                                                        <Td fontWeight="medium">{producto.nombre}</Td>
                                                        <Td isNumeric>
                                                            <Badge colorScheme="purple">{producto.total_vendido}</Badge>
                                                        </Td>
                                                        <Td isNumeric fontWeight="bold" color="green.600">
                                                            ${parseFloat(producto.ingresos_totales || 0).toLocaleString('es-CO')}
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </>
                                ) : (
                                    <Center h="300px">
                                        <Text color="gray.500">No hay datos de productos vendidos</Text>
                                    </Center>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Tab: Rutinas */}
                    <TabPanel>
                        <Card>
                            <CardHeader>
                                <Heading size="md">Rutinas Más Populares</Heading>
                            </CardHeader>
                            <CardBody>
                                {rutinasPopulares.length > 0 ? (
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Posición</Th>
                                                <Th>Rutina</Th>
                                                <Th>Objetivo</Th>
                                                <Th>Nivel</Th>
                                                <Th isNumeric>Usuarios Asignados</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {rutinasPopulares.map((rutina, idx) => (
                                                <Tr key={idx}>
                                                    <Td>
                                                        <Badge colorScheme={idx < 3 ? 'green' : 'gray'} fontSize="md">
                                                            #{idx + 1}
                                                        </Badge>
                                                    </Td>
                                                    <Td fontWeight="bold">{rutina.nombre}</Td>
                                                    <Td>
                                                        <Badge colorScheme="blue">{rutina.objetivo}</Badge>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme="purple">{rutina.nivel}</Badge>
                                                    </Td>
                                                    <Td isNumeric>
                                                        <HStack justify="flex-end">
                                                            <FiActivity color="#48BB78" />
                                                            <Text fontWeight="bold" color="green.600">
                                                                {rutina.usuarios_asignados}
                                                            </Text>
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                ) : (
                                    <Center h="300px">
                                        <Text color="gray.500">No hay datos de rutinas populares</Text>
                                    </Center>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Tab: Alertas */}
                    <TabPanel>
                        <VStack spacing={6} align="stretch">
                            {/* Membresías por vencer */}
                            <Card borderLeft="4px solid" borderColor="orange.500">
                                <CardHeader>
                                    <HStack>
                                        <FiAlertCircle size={24} color="#DD6B20" />
                                        <Heading size="md">Membresías por Vencer (Próximos 5 días)</Heading>
                                    </HStack>
                                </CardHeader>
                                <CardBody>
                                    {membresiasPorVencer.length > 0 ? (
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Usuario</Th>
                                                    <Th>Email</Th>
                                                    <Th>Tipo Membresía</Th>
                                                    <Th>Vence el</Th>
                                                    <Th>Días Restantes</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {membresiasPorVencer.map((usuario, idx) => {
                                                    const diasRestantes = usuario.dias_restantes || 0
                                                    return (
                                                        <Tr key={idx}>
                                                            <Td fontWeight="medium">{usuario.nombre} {usuario.apellido}</Td>
                                                            <Td color="gray.600">{usuario.email}</Td>
                                                            <Td>
                                                                <Badge colorScheme="purple">{usuario.membresia}</Badge>
                                                            </Td>
                                                            <Td>{usuario.fecha_vencimiento}</Td>
                                                            <Td>
                                                                <Badge colorScheme={diasRestantes <= 3 ? 'red' : 'orange'}>
                                                                    {diasRestantes} días
                                                                </Badge>
                                                            </Td>
                                                        </Tr>
                                                    )
                                                })}
                                            </Tbody>
                                        </Table>
                                    ) : (
                                        <Alert status="success">
                                            <AlertIcon />
                                            <AlertTitle>¡Todo bien!</AlertTitle>
                                            <AlertDescription>
                                                No hay membresías por vencer en los próximos 5 días
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Usuarios inactivos */}
                            <Card borderLeft="4px solid" borderColor="red.500">
                                <CardHeader>
                                    <HStack>
                                        <FiAlertCircle size={24} color="#E53E3E" />
                                        <Heading size="md">Usuarios Inactivos (Más de 30 días)</Heading>
                                    </HStack>
                                </CardHeader>
                                <CardBody>
                                    {usuariosInactivos.length > 0 ? (
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Usuario</Th>
                                                    <Th>Email</Th>
                                                    <Th>Última Visita</Th>
                                                    <Th>Días Inactivo</Th>
                                                    <Th>Membresía</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {usuariosInactivos.map((usuario, idx) => (
                                                    <Tr key={idx}>
                                                        <Td fontWeight="medium">{usuario.nombre} {usuario.apellido}</Td>
                                                        <Td color="gray.600">{usuario.email}</Td>
                                                        <Td>{usuario.ultima_visita || 'Nunca'}</Td>
                                                        <Td>
                                                            <Badge colorScheme="red">
                                                                {usuario.dias_inactivo} días
                                                            </Badge>
                                                        </Td>
                                                        <Td>
                                                            <Badge colorScheme="gray">{usuario.membresia}</Badge>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    ) : (
                                        <Alert status="success">
                                            <AlertIcon />
                                            <AlertTitle>¡Excelente!</AlertTitle>
                                            <AlertDescription>
                                                Todos los usuarios han visitado el gimnasio recientemente
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardBody>
                            </Card>
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}
