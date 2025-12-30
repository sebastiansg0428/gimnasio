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
    NumberInput,
    NumberInputField,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Divider,
    Badge,
} from '@chakra-ui/react'
import { FiPlus, FiSearch, FiEye, FiTrash2, FiDollarSign, FiTrendingUp, FiCreditCard, FiFileText } from 'react-icons/fi'
import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API_BASE = 'http://localhost:3001'

export default function PagosTab() {
    const [pagos, setPagos] = useState([])
    const [facturas, setFacturas] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [nuevoPago, setNuevoPago] = useState({
        usuario_id: '',
        monto: '',
        tipo_pago: 'membresia',
        metodo_pago: 'efectivo',
        estado: 'completado',
        descripcion: ''
    })
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()

    useEffect(() => {
        cargarDatos()
        
        // Escuchar evento de cliente creado con pago
        const handleClienteCreado = (event) => {
            console.log('🔔 EVENTO: Cliente creado con pago, recargando datos de pagos...')
            cargarDatos()
        }
        
        window.addEventListener('clienteCreado', handleClienteCreado)
        
        // Recargar datos cada 10 segundos
        const interval = setInterval(cargarDatos, 10000)
        
        return () => {
            window.removeEventListener('clienteCreado', handleClienteCreado)
            clearInterval(interval)
        }
    }, [])

    async function cargarDatos() {
        setLoading(true)
        try {
            const [pagosRes, facturasRes, usuariosRes] = await Promise.all([
                fetch(`${API_BASE}/pagos`),
                fetch(`${API_BASE}/facturas`),
                fetch(`${API_BASE}/usuarios`)
            ])

            if (pagosRes.ok) setPagos(await pagosRes.json())
            if (facturasRes.ok) setFacturas(await facturasRes.json())
            if (usuariosRes.ok) setUsuarios(await usuariosRes.json())
        } catch (error) {
            console.error('Error cargando datos:', error)
            toast({
                title: 'Error al cargar datos',
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

        setTimeout(async () => {
            try {
                const res = await fetch(`${API_BASE}/pagos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoPago)
                })

                if (res.ok) {
                    toast({
                        title: 'Pago registrado exitosamente',
                        status: 'success',
                        duration: 2000
                    })
                    await cargarDatos()
                    onClose()
                    setNuevoPago({
                        usuario_id: '',
                        monto: '',
                        tipo_pago: 'membresia',
                        metodo_pago: 'efectivo',
                        estado: 'completado',
                        descripcion: ''
                    })
                } else {
                    throw new Error('Error al crear pago')
                }
            } catch (error) {
                toast({
                    title: 'Error al registrar pago',
                    description: error.message,
                    status: 'error',
                    duration: 3000
                })
            }
        }, 0)
    }

    async function handleEliminarPago(id) {
        if (!window.confirm('¿Cancelar este pago?')) return

        setTimeout(async () => {
            try {
                const res = await fetch(`${API_BASE}/pagos/${id}`, {
                    method: 'DELETE'
                })

                if (res.ok) {
                    toast({
                        title: 'Pago cancelado',
                        status: 'info',
                        duration: 2000
                    })
                    await cargarDatos()
                }
            } catch (error) {
                toast({
                    title: 'Error al cancelar pago',
                    status: 'error',
                    duration: 3000
                })
            }
        }, 0)
    }

    // Estadísticas
    const estadisticas = useMemo(() => {
        const totalPagos = pagos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)
        const totalFacturas = facturas.reduce((sum, f) => sum + parseFloat(f.total || 0), 0)
        const pagosPendientes = pagos.filter(p => p.estado === 'pendiente').length
        const pagosCompletados = pagos.filter(p => p.estado === 'completado').length

        // Datos por método de pago
        const metodosPago = {}
        pagos.forEach(p => {
            const metodo = p.metodo_pago || 'efectivo'
            metodosPago[metodo] = (metodosPago[metodo] || 0) + parseFloat(p.monto || 0)
        })
        const datosMetodos = Object.entries(metodosPago).map(([metodo, total]) => ({
            metodo: metodo.charAt(0).toUpperCase() + metodo.slice(1),
            total
        }))

        // Datos por tipo de pago
        const tiposPago = {}
        pagos.forEach(p => {
            const tipo = p.tipo_pago || 'otros'
            tiposPago[tipo] = (tiposPago[tipo] || 0) + 1
        })
        const datosTipos = Object.entries(tiposPago).map(([tipo, cantidad]) => ({
            name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            value: cantidad,
            color: tipo === 'membresia' ? '#48BB78' : tipo === 'producto' ? '#4299E1' : '#ED8936'
        }))

        return {
            totalPagos,
            totalFacturas,
            pagosPendientes,
            pagosCompletados,
            datosMetodos,
            datosTipos
        }
    }, [pagos, facturas])

    const pagosFiltrados = pagos.filter(p => {
        const usuario = usuarios.find(u => u.id === p.usuario_id)
        const nombreUsuario = usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}` : ''
        
        const matchBusqueda = nombreUsuario.toLowerCase().includes(busqueda.toLowerCase()) ||
                             (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
        const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado
        const matchTipo = filtroTipo === 'todos' || p.tipo_pago === filtroTipo
        
        return matchBusqueda && matchEstado && matchTipo
    })

    const getEstadoColor = (estado) => {
        const colores = {
            completado: 'green',
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

    return (
        <Box>
            {/* Estadísticas */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="green.400">
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600">Total Pagos</StatLabel>
                            <FiDollarSign size={24} color="#48BB78" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="green.600">
                            ${estadisticas.totalPagos.toLocaleString('es-CO')}
                        </StatNumber>
                        <StatHelpText>{pagos.length} transacciones</StatHelpText>
                    </Stat>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="blue.400">
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600">Facturas</StatLabel>
                            <FiFileText size={24} color="#4299E1" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="blue.600">
                            ${estadisticas.totalFacturas.toLocaleString('es-CO')}
                        </StatNumber>
                        <StatHelpText>{facturas.length} facturas</StatHelpText>
                    </Stat>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="orange.400">
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600">Pendientes</StatLabel>
                            <FiTrendingUp size={24} color="#DD6B20" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="orange.600">
                            {estadisticas.pagosPendientes}
                        </StatNumber>
                        <StatHelpText>Por cobrar</StatHelpText>
                    </Stat>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="purple.400">
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600">Completados</StatLabel>
                            <FiCreditCard size={24} color="#805AD5" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="purple.600">
                            {estadisticas.pagosCompletados}
                        </StatNumber>
                        <StatHelpText>Pagos exitosos</StatHelpText>
                    </Stat>
                </Box>
            </SimpleGrid>

            {/* Gráficas */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm">
                    <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                        Ingresos por Método de Pago
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={estadisticas.datosMetodos}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="metodo" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toLocaleString('es-CO')}`} />
                            <Legend />
                            <Bar dataKey="total" fill="#48BB78" name="Total ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm">
                    <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                        Distribución por Tipo de Pago
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={estadisticas.datosTipos}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {estadisticas.datosTipos.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </SimpleGrid>

            <Divider mb={6} />

            {/* Controles */}
            <HStack mb={6} spacing={4} flexWrap="wrap">
                <Button leftIcon={<FiPlus />} colorScheme="green" onClick={onOpen}>
                    💰 Nuevo Pago
                </Button>
                <InputGroup maxW="320px">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="#48BB78" />
                    </InputLeftElement>
                    <Input
                        placeholder="Buscar pagos..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        bg="white"
                    />
                </InputGroup>
                <Select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    maxW="180px"
                    bg="white"
                >
                    <option value="todos">Todos los estados</option>
                    <option value="completado">Completado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelado">Cancelado</option>
                </Select>
                <Select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    maxW="180px"
                    bg="white"
                >
                    <option value="todos">Todos los tipos</option>
                    <option value="membresia">Membresía</option>
                    <option value="producto">Producto</option>
                    <option value="sesion">Sesión</option>
                </Select>
            </HStack>

            {/* Tabla */}
            <Box bg="white" borderRadius="lg" overflow="hidden" boxShadow="sm">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>ID</Th>
                            <Th>Usuario</Th>
                            <Th>Monto</Th>
                            <Th>Tipo</Th>
                            <Th>Método</Th>
                            <Th>Estado</Th>
                            <Th>Fecha</Th>
                            <Th>Acciones</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={8} textAlign="center">Cargando...</Td>
                            </Tr>
                        ) : pagosFiltrados.length === 0 ? (
                            <Tr>
                                <Td colSpan={8} textAlign="center">No hay pagos registrados</Td>
                            </Tr>
                        ) : (
                            pagosFiltrados.map((pago) => {
                                const usuario = usuarios.find(u => u.id === pago.usuario_id)
                                return (
                                    <Tr key={pago.id}>
                                        <Td>{pago.id}</Td>
                                        <Td>
                                            {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario eliminado'}
                                        </Td>
                                        <Td fontWeight="bold" color="green.600">
                                            ${parseFloat(pago.monto || 0).toLocaleString('es-CO')}
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getTipoPagoColor(pago.tipo_pago)}>
                                                {pago.tipo_pago}
                                            </Badge>
                                        </Td>
                                        <Td>{pago.metodo_pago}</Td>
                                        <Td>
                                            <Badge colorScheme={getEstadoColor(pago.estado)}>
                                                {pago.estado}
                                            </Badge>
                                        </Td>
                                        <Td>{new Date(pago.fecha_pago).toLocaleDateString('es-ES')}</Td>
                                        <Td>
                                            <HStack spacing={2}>
                                                <IconButton
                                                    aria-label="Ver"
                                                    icon={<FiEye />}
                                                    size="sm"
                                                    colorScheme="blue"
                                                    variant="ghost"
                                                />
                                                <IconButton
                                                    aria-label="Cancelar"
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleEliminarPago(pago.id)}
                                                />
                                            </HStack>
                                        </Td>
                                    </Tr>
                                )
                            })
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* Modal Nuevo Pago */}
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>💰 Registrar Nuevo Pago</ModalHeader>
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
                                            {u.nombre} {u.apellido}
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
                                    <NumberInputField placeholder="0" />
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

                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Input
                                    value={nuevoPago.descripcion}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, descripcion: e.target.value })}
                                    placeholder="Descripción del pago"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={handleCrearPago}>
                            Registrar Pago
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
