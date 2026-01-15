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
    Select,
    VStack,
    HStack,
    Text,
    Heading,
    Card,
    CardHeader,
    CardBody,
    Divider,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Spinner,
    Center,
    Alert,
    AlertIcon
} from '@chakra-ui/react'
import { FiPlus, FiEye, FiTrash2, FiFileText, FiRefreshCw, FiDollarSign, FiCalendar } from 'react-icons/fi'
import { facturasAPI, usuariosAPI } from '../services/api'

export default function FacturasTab() {
    const [facturas, setFacturas] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null)
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')
    const toast = useToast()

    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()

    const [nuevaFactura, setNuevaFactura] = useState({
        usuario_id: '',
        descripcion: '',
        subtotal: '',
        impuestos: '',
        descuento: '',
        total: '',
        estado: 'pendiente',
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: ''
    })

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setLoading(true)
        try {
            const [facturasData, usuariosData] = await Promise.all([
                facturasAPI.getFacturas(),
                usuariosAPI.getUsuarios()
            ])
            setFacturas(facturasData || [])
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
            if (filtroEstado !== 'todos') filtros.estado = filtroEstado
            if (fechaDesde) filtros.fecha_desde = fechaDesde
            if (fechaHasta) filtros.fecha_hasta = fechaHasta

            const data = await facturasAPI.getFacturas(filtros)
            setFacturas(data || [])
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

    const handleCrearFactura = async () => {
        if (!nuevaFactura.usuario_id || !nuevaFactura.total) {
            toast({
                title: 'Completa los campos requeridos',
                status: 'warning',
                duration: 2000
            })
            return
        }

        try {
            await facturasAPI.createFactura({
                ...nuevaFactura,
                subtotal: parseFloat(nuevaFactura.subtotal) || 0,
                impuestos: parseFloat(nuevaFactura.impuestos) || 0,
                descuento: parseFloat(nuevaFactura.descuento) || 0,
                total: parseFloat(nuevaFactura.total)
            })

            toast({
                title: '✅ Factura creada',
                status: 'success',
                duration: 2000
            })
            onCreateClose()
            cargarDatos()
            setNuevaFactura({
                usuario_id: '',
                descripcion: '',
                subtotal: '',
                impuestos: '',
                descuento: '',
                total: '',
                estado: 'pendiente',
                fecha_emision: new Date().toISOString().split('T')[0],
                fecha_vencimiento: ''
            })
        } catch (error) {
            console.error('Error creando factura:', error)
            toast({
                title: 'Error al crear factura',
                description: error.message,
                status: 'error',
                duration: 4000
            })
        }
    }

    const handleVerDetalles = async (id) => {
        try {
            const data = await facturasAPI.getFactura(id)
            setFacturaSeleccionada(data)
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

    const handleEliminarFactura = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta factura?')) return

        try {
            await facturasAPI.deleteFactura(id)
            toast({
                title: '✅ Factura eliminada',
                status: 'success',
                duration: 2000
            })
            cargarDatos()
        } catch (error) {
            console.error('Error eliminando factura:', error)
            toast({
                title: 'Error al eliminar factura',
                description: error.message,
                status: 'error',
                duration: 4000
            })
        }
    }

    const calcularTotal = () => {
        const subtotal = parseFloat(nuevaFactura.subtotal) || 0
        const impuestos = parseFloat(nuevaFactura.impuestos) || 0
        const descuento = parseFloat(nuevaFactura.descuento) || 0
        const total = subtotal + impuestos - descuento
        setNuevaFactura(prev => ({ ...prev, total: total.toFixed(2) }))
    }

    const getEstadoBadge = (estado) => {
        const colores = {
            'pendiente': 'yellow',
            'pagada': 'green',
            'vencida': 'red',
            'cancelada': 'gray'
        }
        return <Badge colorScheme={colores[estado] || 'gray'}>{estado.toUpperCase()}</Badge>
    }

    // Calcular estadísticas
    const totalFacturas = facturas.length
    const totalPagadas = facturas.filter(f => f.estado === 'pagada').length
    const totalPendientes = facturas.filter(f => f.estado === 'pendiente').length
    const montoTotal = facturas
        .filter(f => f.estado === 'pagada')
        .reduce((sum, f) => sum + parseFloat(f.total || 0), 0)

    if (loading) {
        return (
            <Center h="400px">
                <VStack spacing={4}>
                    <Spinner size="xl" color="green.500" thickness="4px" />
                    <Text color="gray.600">Cargando facturas...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <Box>
            {/* Header */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="green.600">
                    🧾 Gestión de Facturas
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
                        Nueva Factura
                    </Button>
                </HStack>
            </HStack>

            {/* Estadísticas */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
                <Card borderTop="4px solid" borderColor="blue.500">
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Facturas</StatLabel>
                            <StatNumber>{totalFacturas}</StatNumber>
                            <StatHelpText>
                                <FiFileText style={{ display: 'inline', marginRight: '4px' }} />
                                Todas
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card borderTop="4px solid" borderColor="green.500">
                    <CardBody>
                        <Stat>
                            <StatLabel>Facturas Pagadas</StatLabel>
                            <StatNumber color="green.600">{totalPagadas}</StatNumber>
                            <StatHelpText>Completadas</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card borderTop="4px solid" borderColor="yellow.500">
                    <CardBody>
                        <Stat>
                            <StatLabel>Facturas Pendientes</StatLabel>
                            <StatNumber color="yellow.600">{totalPendientes}</StatNumber>
                            <StatHelpText>Por cobrar</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card borderTop="4px solid" borderColor="purple.500">
                    <CardBody>
                        <Stat>
                            <StatLabel>Monto Total</StatLabel>
                            <StatNumber color="purple.600">
                                ${montoTotal.toLocaleString('es-CO')}
                            </StatNumber>
                            <StatHelpText>
                                <FiDollarSign style={{ display: 'inline', marginRight: '4px' }} />
                                Recaudado
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filtros */}
            <Card mb={6}>
                <CardBody>
                    <HStack spacing={4} flexWrap="wrap">
                        <FormControl maxW="200px">
                            <FormLabel fontSize="sm">Estado</FormLabel>
                            <Select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                size="sm"
                            >
                                <option value="todos">Todos</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="pagada">Pagada</option>
                                <option value="vencida">Vencida</option>
                                <option value="cancelada">Cancelada</option>
                            </Select>
                        </FormControl>

                        <FormControl maxW="200px">
                            <FormLabel fontSize="sm">Desde</FormLabel>
                            <Input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                size="sm"
                            />
                        </FormControl>

                        <FormControl maxW="200px">
                            <FormLabel fontSize="sm">Hasta</FormLabel>
                            <Input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
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

            {/* Tabla de facturas */}
            <Card>
                <CardBody>
                    {facturas.length === 0 ? (
                        <Alert status="info">
                            <AlertIcon />
                            No hay facturas registradas
                        </Alert>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Usuario</Th>
                                    <Th>Descripción</Th>
                                    <Th>Fecha Emisión</Th>
                                    <Th>Fecha Vencimiento</Th>
                                    <Th isNumeric>Total</Th>
                                    <Th>Estado</Th>
                                    <Th>Acciones</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {facturas.map((factura) => (
                                    <Tr key={factura.id}>
                                        <Td fontWeight="bold">#{factura.id}</Td>
                                        <Td>{factura.usuario_nombre || `Usuario ${factura.usuario_id}`}</Td>
                                        <Td>{factura.descripcion || '-'}</Td>
                                        <Td>{factura.fecha_emision}</Td>
                                        <Td>{factura.fecha_vencimiento || '-'}</Td>
                                        <Td isNumeric fontWeight="bold" color="green.600">
                                            ${parseFloat(factura.total || 0).toLocaleString('es-CO')}
                                        </Td>
                                        <Td>{getEstadoBadge(factura.estado)}</Td>
                                        <Td>
                                            <HStack spacing={2}>
                                                <IconButton
                                                    icon={<FiEye />}
                                                    size="sm"
                                                    colorScheme="blue"
                                                    variant="ghost"
                                                    onClick={() => handleVerDetalles(factura.id)}
                                                />
                                                <IconButton
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleEliminarFactura(factura.id)}
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

            {/* Modal: Crear Factura */}
            <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>🧾 Nueva Factura</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Usuario</FormLabel>
                                <Select
                                    value={nuevaFactura.usuario_id}
                                    onChange={(e) => setNuevaFactura({ ...nuevaFactura, usuario_id: e.target.value })}
                                    placeholder="Selecciona un usuario"
                                >
                                    {usuarios.map((usuario) => (
                                        <option key={usuario.id} value={usuario.id}>
                                            {usuario.nombre} {usuario.apellido} - {usuario.email}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Input
                                    value={nuevaFactura.descripcion}
                                    onChange={(e) => setNuevaFactura({ ...nuevaFactura, descripcion: e.target.value })}
                                    placeholder="Concepto de la factura"
                                />
                            </FormControl>

                            <SimpleGrid columns={2} spacing={4} w="100%">
                                <FormControl>
                                    <FormLabel>Subtotal</FormLabel>
                                    <Input
                                        type="number"
                                        value={nuevaFactura.subtotal}
                                        onChange={(e) => setNuevaFactura({ ...nuevaFactura, subtotal: e.target.value })}
                                        onBlur={calcularTotal}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Impuestos</FormLabel>
                                    <Input
                                        type="number"
                                        value={nuevaFactura.impuestos}
                                        onChange={(e) => setNuevaFactura({ ...nuevaFactura, impuestos: e.target.value })}
                                        onBlur={calcularTotal}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Descuento</FormLabel>
                                    <Input
                                        type="number"
                                        value={nuevaFactura.descuento}
                                        onChange={(e) => setNuevaFactura({ ...nuevaFactura, descuento: e.target.value })}
                                        onBlur={calcularTotal}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Total</FormLabel>
                                    <Input
                                        type="number"
                                        value={nuevaFactura.total}
                                        onChange={(e) => setNuevaFactura({ ...nuevaFactura, total: e.target.value })}
                                        fontWeight="bold"
                                        readOnly
                                        bg="gray.50"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Fecha Emisión</FormLabel>
                                    <Input
                                        type="date"
                                        value={nuevaFactura.fecha_emision}
                                        onChange={(e) => setNuevaFactura({ ...nuevaFactura, fecha_emision: e.target.value })}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Fecha Vencimiento</FormLabel>
                                    <Input
                                        type="date"
                                        value={nuevaFactura.fecha_vencimiento}
                                        onChange={(e) => setNuevaFactura({ ...nuevaFactura, fecha_vencimiento: e.target.value })}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <FormControl>
                                <FormLabel>Estado</FormLabel>
                                <Select
                                    value={nuevaFactura.estado}
                                    onChange={(e) => setNuevaFactura({ ...nuevaFactura, estado: e.target.value })}
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="pagada">Pagada</option>
                                    <option value="vencida">Vencida</option>
                                    <option value="cancelada">Cancelada</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCreateClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={handleCrearFactura}>
                            Crear Factura
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal: Detalles de Factura */}
            <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>📄 Detalles de Factura</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {facturaSeleccionada && (
                            <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                    <Text fontWeight="bold" fontSize="lg">Factura #{facturaSeleccionada.id}</Text>
                                    {getEstadoBadge(facturaSeleccionada.estado)}
                                </HStack>

                                <Divider />

                                <Box>
                                    <Text fontWeight="bold" mb={2}>Información del Cliente</Text>
                                    <Text>Usuario ID: {facturaSeleccionada.usuario_id}</Text>
                                    <Text>Nombre: {facturaSeleccionada.usuario_nombre || 'N/A'}</Text>
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontWeight="bold" mb={2}>Descripción</Text>
                                    <Text>{facturaSeleccionada.descripcion || 'Sin descripción'}</Text>
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontWeight="bold" mb={2}>Desglose</Text>
                                    <HStack justify="space-between">
                                        <Text>Subtotal:</Text>
                                        <Text>${parseFloat(facturaSeleccionada.subtotal || 0).toLocaleString('es-CO')}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Impuestos:</Text>
                                        <Text>${parseFloat(facturaSeleccionada.impuestos || 0).toLocaleString('es-CO')}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Descuento:</Text>
                                        <Text color="red.500">-${parseFloat(facturaSeleccionada.descuento || 0).toLocaleString('es-CO')}</Text>
                                    </HStack>
                                    <Divider my={2} />
                                    <HStack justify="space-between">
                                        <Text fontWeight="bold" fontSize="lg">Total:</Text>
                                        <Text fontWeight="bold" fontSize="lg" color="green.600">
                                            ${parseFloat(facturaSeleccionada.total || 0).toLocaleString('es-CO')}
                                        </Text>
                                    </HStack>
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontWeight="bold" mb={2}>Fechas</Text>
                                    <HStack justify="space-between">
                                        <Text>Emisión:</Text>
                                        <Text>{facturaSeleccionada.fecha_emision}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Vencimiento:</Text>
                                        <Text>{facturaSeleccionada.fecha_vencimiento || 'Sin vencimiento'}</Text>
                                    </HStack>
                                </Box>
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
