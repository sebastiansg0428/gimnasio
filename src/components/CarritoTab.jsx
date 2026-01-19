import {
    Box,
    HStack,
    VStack,
    Button,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
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
    Select,
    NumberInput,
    NumberInputField,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Badge,
    Divider,
    Image,
    InputGroup,
    InputLeftElement,
    Input,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from '@chakra-ui/react'
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiCreditCard, FiPackage, FiDollarSign, FiShoppingBag, FiSearch } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { ventasAPI, productosAPI, usuariosAPI } from '../services/api'
import { getCurrentUser } from '../utils/auth'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function CarritoTab() {
    const [carrito, setCarrito] = useState([])
    const [productos, setProductos] = useState([])
    const [historialVentas, setHistorialVentas] = useState([])
    const [estadisticas, setEstadisticas] = useState(null)
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
    const toast = useToast()
    const { isOpen: isCheckoutOpen, onOpen: onCheckoutOpen, onClose: onCheckoutClose } = useDisclosure()

    // Formulario de pago
    const [metodoPago, setMetodoPago] = useState('efectivo')

    useEffect(() => {
        cargarProductos()
        cargarHistorial()
        cargarEstadisticas()
        cargarCarritoGuardado()
    }, [])

    // Cargar carrito del localStorage
    const cargarCarritoGuardado = () => {
        try {
            const carritoGuardado = localStorage.getItem('carrito')
            if (carritoGuardado) {
                setCarrito(JSON.parse(carritoGuardado))
            }
        } catch (error) {
            console.error('Error al cargar carrito:', error)
        }
    }

    // Guardar carrito en localStorage
    const guardarCarrito = (nuevoCarrito) => {
        setCarrito(nuevoCarrito)
        localStorage.setItem('carrito', JSON.stringify(nuevoCarrito))
    }

    const cargarProductos = async () => {
        try {
            setLoading(true)
            const data = await productosAPI.getProductos()
            setProductos(data?.data || data || [])
        } catch (error) {
            toast({
                title: 'Error al cargar productos',
                description: error.message,
                status: 'error',
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }

    const cargarHistorial = async () => {
        try {
            const usuario = getCurrentUser()
            const usuarioId = usuario?.id
            if (usuarioId) {
                const data = await ventasAPI.getHistorialUsuario(usuarioId)
                // Asegurar que siempre sea un array
                const ventas = Array.isArray(data) ? data : 
                              Array.isArray(data?.data) ? data.data : 
                              Array.isArray(data?.ventas) ? data.ventas : []
                setHistorialVentas(ventas)
            }
        } catch (error) {
            console.error('Error al cargar historial:', error)
            setHistorialVentas([])
        }
    }

    const cargarEstadisticas = async () => {
        try {
            const data = await ventasAPI.getEstadisticas()
            setEstadisticas(data?.data || data)
        } catch (error) {
            console.error('Error al cargar estadísticas:', error)
        }
    }

    // Agregar producto al carrito
    const agregarAlCarrito = (producto) => {
        // Validar que el producto tenga stock disponible
        if (!producto.stock || producto.stock < 1) {
            toast({
                title: 'Sin stock',
                description: 'Este producto no está disponible',
                status: 'error',
                duration: 3000,
            })
            return
        }

        const existente = carrito.find(item => item.id === producto.id)
        
        if (existente) {
            // Validar que no supere el stock disponible
            const nuevaCantidad = existente.cantidad + 1
            if (nuevaCantidad > producto.stock) {
                toast({
                    title: 'Stock insuficiente',
                    description: `Solo hay ${producto.stock} unidades disponibles. Ya tienes ${existente.cantidad} en el carrito.`,
                    status: 'warning',
                    duration: 4000,
                })
                return
            }
            const nuevoCarrito = carrito.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: nuevaCantidad, stock: producto.stock }
                    : item
            )
            guardarCarrito(nuevoCarrito)
        } else {
            // Agregar nuevo producto con stock actualizado
            guardarCarrito([...carrito, { ...producto, cantidad: 1 }])
        }

        toast({
            title: 'Producto agregado',
            description: `${producto.nombre} agregado al carrito`,
            status: 'success',
            duration: 2000,
        })
    }

    // Quitar producto del carrito
    const quitarDelCarrito = (productoId) => {
        const nuevoCarrito = carrito.filter(item => item.id !== productoId)
        guardarCarrito(nuevoCarrito)
        toast({
            title: 'Producto eliminado',
            status: 'info',
            duration: 2000,
        })
    }

    // Actualizar cantidad
    const actualizarCantidad = (productoId, nuevaCantidad) => {
        // Validar cantidad mínima
        if (nuevaCantidad < 1) {
            toast({
                title: 'Cantidad inválida',
                description: 'La cantidad mínima es 1',
                status: 'warning',
                duration: 2000,
            })
            return
        }

        // Buscar el producto en la lista para validar stock
        const producto = productos.find(p => p.id === productoId)
        const itemCarrito = carrito.find(item => item.id === productoId)

        if (!producto) {
            toast({
                title: 'Error',
                description: 'Producto no encontrado',
                status: 'error',
                duration: 3000,
            })
            return
        }

        // Validar que no supere el stock disponible
        if (nuevaCantidad > producto.stock) {
            toast({
                title: 'Stock insuficiente',
                description: `Solo hay ${producto.stock} unidades disponibles`,
                status: 'warning',
                duration: 3000,
            })
            return
        }

        const nuevoCarrito = carrito.map(item =>
            item.id === productoId
                ? { ...item, cantidad: nuevaCantidad, stock: producto.stock }
                : item
        )
        guardarCarrito(nuevoCarrito)
    }

    // Calcular totales
    const calcularSubtotal = () => {
        return carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0)
    }

    const calcularTotal = () => {
        return calcularSubtotal()
    }

    // Procesar compra
    const procesarCompra = async () => {
        if (carrito.length === 0) {
            toast({
                title: 'Carrito vacío',
                description: 'Agrega productos antes de comprar',
                status: 'warning',
                duration: 3000,
            })
            return
        }

        // Validar stock antes de procesar la compra
        const productosActualizados = await productosAPI.getProductos()
        const productosData = productosActualizados?.data || productosActualizados || []
        
        let stockInsuficiente = false
        const errores = []

        for (const item of carrito) {
            const productoActual = productosData.find(p => p.id === item.id)
            if (!productoActual) {
                errores.push(`${item.nombre} ya no está disponible`)
                stockInsuficiente = true
            } else if (productoActual.stock < item.cantidad) {
                errores.push(`${item.nombre}: solo quedan ${productoActual.stock} unidades (tienes ${item.cantidad} en el carrito)`)
                stockInsuficiente = true
            }
        }

        if (stockInsuficiente) {
            toast({
                title: 'Stock insuficiente',
                description: errores.join('. '),
                status: 'error',
                duration: 6000,
                isClosable: true,
            })
            // Recargar productos para actualizar el stock
            cargarProductos()
            return
        }

        try {
            setLoading(true)
            
            // Obtener usuario actual
            const usuario = getCurrentUser()
            const usuarioId = usuario?.id
            
            if (!usuarioId) {
                toast({
                    title: 'Error',
                    description: 'Debes iniciar sesión para realizar una compra',
                    status: 'error',
                    duration: 4000,
                })
                return
            }

            // Crear ventas individuales por cada producto
            for (const item of carrito) {
                await ventasAPI.createVenta({
                    usuario_id: usuarioId,
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_venta,
                    total: item.precio_venta * item.cantidad,
                    metodo_pago: metodoPago
                })
            }

            toast({
                title: '¡Compra exitosa!',
                description: `Se procesaron ${carrito.length} productos correctamente`,
                status: 'success',
                duration: 4000,
            })

            // Limpiar carrito
            guardarCarrito([])
            onCheckoutClose()
            cargarHistorial()
            cargarEstadisticas()
            cargarProductos()

        } catch (error) {
            toast({
                title: 'Error al procesar compra',
                description: error.message,
                status: 'error',
                duration: 4000,
            })
        } finally {
            setLoading(false)
        }
    }

    // Filtrar productos
    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                             p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
        const matchCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro
        return matchBusqueda && matchCategoria
    })

    // Obtener categorías únicas
    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))]

    return (
        <Box>
            <Tabs colorScheme="blue" variant="enclosed">
                <TabList>
                    <Tab><HStack><FiShoppingCart /><Text>Tienda</Text></HStack></Tab>
                    <Tab><HStack><FiShoppingBag /><Text>Mi Carrito ({carrito.length})</Text></HStack></Tab>
                    <Tab><HStack><FiPackage /><Text>Mis Compras</Text></HStack></Tab>
                </TabList>

                <TabPanels>
                    {/* TAB 1: Tienda */}
                    <TabPanel>
                        <VStack align="stretch" spacing={4}>
                            {/* Filtros */}
                            <HStack>
                                <InputGroup maxW="300px">
                                    <InputLeftElement pointerEvents="none">
                                        <FiSearch color="gray" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Buscar productos..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                </InputGroup>
                                <Select
                                    maxW="200px"
                                    value={categoriaFiltro}
                                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                                >
                                    <option value="todos">Todas las categorías</option>
                                    {categorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Select>
                            </HStack>

                            {/* Productos */}
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                                {productosFiltrados.map(producto => {
                                    const enCarrito = carrito.find(item => item.id === producto.id)
                                    const cantidadEnCarrito = enCarrito?.cantidad || 0
                                    const stockDisponible = producto.stock - cantidadEnCarrito
                                    const stockBajo = producto.stock > 0 && producto.stock <= 5
                                    
                                    return (
                                    <Box
                                        key={producto.id}
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        p={4}
                                        _hover={{ shadow: 'md' }}
                                        transition="all 0.2s"
                                        borderColor={producto.stock < 1 ? 'red.200' : stockBajo ? 'orange.200' : 'gray.200'}
                                    >
                                        <VStack align="stretch" spacing={2}>
                                            <HStack justify="space-between">
                                                <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                                                    {producto.nombre}
                                                </Text>
                                                {producto.stock > 5 ? (
                                                    <Badge colorScheme="green">Disponible</Badge>
                                                ) : producto.stock > 0 ? (
                                                    <Badge colorScheme="orange">Stock bajo</Badge>
                                                ) : (
                                                    <Badge colorScheme="red">Sin stock</Badge>
                                                )}
                                            </HStack>
                                            
                                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                {producto.descripcion}
                                            </Text>
                                            
                                            {producto.categoria && (
                                                <Badge colorScheme="blue" w="fit-content">
                                                    {producto.categoria}
                                                </Badge>
                                            )}
                                            
                                            <HStack justify="space-between" mt={2}>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="sm" color="gray.500">
                                                        Stock: {producto.stock}
                                                    </Text>
                                                    {cantidadEnCarrito > 0 && (
                                                        <Text fontSize="xs" color="blue.500">
                                                            {cantidadEnCarrito} en carrito
                                                        </Text>
                                                    )}
                                                </VStack>
                                                <Text fontWeight="bold" fontSize="xl" color="blue.600">
                                                    ${producto.precio_venta?.toLocaleString()}
                                                </Text>
                                            </HStack>
                                            
                                            <Button
                                                leftIcon={<FiShoppingCart />}
                                                colorScheme="blue"
                                                size="sm"
                                                onClick={() => agregarAlCarrito(producto)}
                                                isDisabled={stockDisponible < 1}
                                            >
                                                {stockDisponible < 1 ? 'Sin stock disponible' : 'Agregar al carrito'}
                                            </Button>
                                        </VStack>
                                    </Box>
                                    )
                                })}
                            </SimpleGrid>

                            {productosFiltrados.length === 0 && (
                                <Box textAlign="center" py={10}>
                                    <Text color="gray.500">No se encontraron productos</Text>
                                </Box>
                            )}
                        </VStack>
                    </TabPanel>

                    {/* TAB 2: Carrito */}
                    <TabPanel>
                        <VStack align="stretch" spacing={4}>
                            {carrito.length === 0 ? (
                                <Box textAlign="center" py={10}>
                                    <FiShoppingCart size={60} color="gray" />
                                    <Text mt={4} fontSize="lg" color="gray.500">
                                        Tu carrito está vacío
                                    </Text>
                                </Box>
                            ) : (
                                <>
                                    <Box overflowX="auto">
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Producto</Th>
                                                    <Th>Precio</Th>
                                                    <Th>Cantidad</Th>
                                                    <Th>Subtotal</Th>
                                                    <Th></Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {carrito.map(item => {
                                                    const productoActual = productos.find(p => p.id === item.id)
                                                    const stockActual = productoActual?.stock || item.stock
                                                    const stockInsuficiente = item.cantidad > stockActual
                                                    
                                                    return (
                                                    <Tr key={item.id} bg={stockInsuficiente ? 'red.50' : 'transparent'}>
                                                        <Td>
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontWeight="bold">{item.nombre}</Text>
                                                                {item.categoria && (
                                                                    <Badge colorScheme="blue" size="sm">
                                                                        {item.categoria}
                                                                    </Badge>
                                                                )}
                                                                {stockInsuficiente && (
                                                                    <Badge colorScheme="red" size="sm">
                                                                        ⚠️ Stock insuficiente ({stockActual} disponibles)
                                                                    </Badge>
                                                                )}
                                                                {!stockInsuficiente && stockActual <= 5 && (
                                                                    <Badge colorScheme="orange" size="sm">
                                                                        Solo quedan {stockActual} unidades
                                                                    </Badge>
                                                                )}
                                                            </VStack>
                                                        </Td>
                                                        <Td>${item.precio_venta?.toLocaleString()}</Td>
                                                        <Td>
                                                            <HStack maxW="150px">
                                                                <IconButton
                                                                    size="sm"
                                                                    icon={<FiMinus />}
                                                                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                                                    isDisabled={item.cantidad <= 1}
                                                                />
                                                                <NumberInput
                                                                    size="sm"
                                                                    maxW="60px"
                                                                    value={item.cantidad}
                                                                    min={1}
                                                                    max={stockActual}
                                                                    onChange={(_, val) => actualizarCantidad(item.id, val)}
                                                                >
                                                                    <NumberInputField />
                                                                </NumberInput>
                                                                <IconButton
                                                                    size="sm"
                                                                    icon={<FiPlus />}
                                                                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                                                    isDisabled={item.cantidad >= stockActual}
                                                                />
                                                            </HStack>
                                                        </Td>
                                                        <Td fontWeight="bold">
                                                            ${(item.precio_venta * item.cantidad).toLocaleString()}
                                                        </Td>
                                                        <Td>
                                                            <IconButton
                                                                icon={<FiTrash2 />}
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => quitarDelCarrito(item.id)}
                                                            />
                                                        </Td>
                                                    </Tr>
                                                    )
                                                })}
                                            </Tbody>
                                        </Table>
                                    </Box>

                                    <Divider />

                                    <Box p={4} bg="gray.50" borderRadius="md">
                                        <VStack align="stretch" spacing={2}>
                                            <HStack justify="space-between">
                                                <Text>Subtotal:</Text>
                                                <Text fontWeight="bold">${calcularSubtotal().toLocaleString()}</Text>
                                            </HStack>
                                            <HStack justify="space-between" fontSize="xl">
                                                <Text fontWeight="bold">Total:</Text>
                                                <Text fontWeight="bold" color="blue.600">
                                                    ${calcularTotal().toLocaleString()}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </Box>

                                    <HStack justify="flex-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => guardarCarrito([])}
                                        >
                                            Vaciar carrito
                                        </Button>
                                        <Button
                                            colorScheme="blue"
                                            leftIcon={<FiCreditCard />}
                                            onClick={onCheckoutOpen}
                                            isLoading={loading}
                                        >
                                            Proceder al pago
                                        </Button>
                                    </HStack>
                                </>
                            )}
                        </VStack>
                    </TabPanel>

                    {/* TAB 3: Historial de Compras */}
                    <TabPanel>
                        <VStack align="stretch" spacing={4}>
                            {/* Estadísticas */}
                            {estadisticas && (
                                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                                    <Stat p={4} borderWidth="1px" borderRadius="lg">
                                        <StatLabel>Total Ventas</StatLabel>
                                        <StatNumber>{estadisticas.total_ventas || 0}</StatNumber>
                                        <StatHelpText>Transacciones</StatHelpText>
                                    </Stat>
                                    <Stat p={4} borderWidth="1px" borderRadius="lg">
                                        <StatLabel>Ingresos Totales</StatLabel>
                                        <StatNumber>${(estadisticas.ingresos_totales || 0).toLocaleString()}</StatNumber>
                                        <StatHelpText>COP</StatHelpText>
                                    </Stat>
                                    <Stat p={4} borderWidth="1px" borderRadius="lg">
                                        <StatLabel>Productos Vendidos</StatLabel>
                                        <StatNumber>{estadisticas.productos_vendidos || 0}</StatNumber>
                                        <StatHelpText>Unidades</StatHelpText>
                                    </Stat>
                                    <Stat p={4} borderWidth="1px" borderRadius="lg">
                                        <StatLabel>Ticket Promedio</StatLabel>
                                        <StatNumber>${(estadisticas.ticket_promedio || 0).toLocaleString()}</StatNumber>
                                        <StatHelpText>Por venta</StatHelpText>
                                    </Stat>
                                </SimpleGrid>
                            )}

                            {/* Historial */}
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Fecha</Th>
                                            <Th>Producto</Th>
                                            <Th>Cantidad</Th>
                                            <Th>Precio Unit.</Th>
                                            <Th>Total</Th>
                                            <Th>Método Pago</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {Array.isArray(historialVentas) && historialVentas.map((venta) => (
                                            <Tr key={venta.id}>
                                                <Td>{new Date(venta.created_at).toLocaleDateString()}</Td>
                                                <Td>{venta.producto_nombre || `Producto #${venta.producto_id}`}</Td>
                                                <Td>{venta.cantidad}</Td>
                                                <Td>${venta.precio_unitario?.toLocaleString()}</Td>
                                                <Td fontWeight="bold">${venta.total?.toLocaleString()}</Td>
                                                <Td>
                                                    <Badge colorScheme={
                                                        venta.metodo_pago === 'efectivo' ? 'green' :
                                                        venta.metodo_pago === 'tarjeta' ? 'blue' : 'purple'
                                                    }>
                                                        {venta.metodo_pago}
                                                    </Badge>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>

                            {(!historialVentas || historialVentas.length === 0) && (
                                <Box textAlign="center" py={10}>
                                    <Text color="gray.500">No hay compras registradas</Text>
                                </Box>
                            )}
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Modal de Checkout */}
            <Modal isOpen={isCheckoutOpen} onClose={onCheckoutClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirmar Compra</ModalHeader>
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Box>
                                <Text fontWeight="bold" mb={2}>Resumen de la compra:</Text>
                                {carrito.map(item => (
                                    <HStack key={item.id} justify="space-between" py={1}>
                                        <Text>{item.nombre} x {item.cantidad}</Text>
                                        <Text fontWeight="bold">
                                            ${(item.precio_venta * item.cantidad).toLocaleString()}
                                        </Text>
                                    </HStack>
                                ))}
                            </Box>

                            <Divider />

                            <HStack justify="space-between" fontSize="xl">
                                <Text fontWeight="bold">Total a pagar:</Text>
                                <Text fontWeight="bold" color="blue.600">
                                    ${calcularTotal().toLocaleString()}
                                </Text>
                            </HStack>

                            <FormControl>
                                <FormLabel>Método de pago</FormLabel>
                                <Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="nequi">Nequi</option>
                                    <option value="daviplata">Daviplata</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCheckoutClose}>
                            Cancelar
                        </Button>
                        <Button
                            colorScheme="blue"
                            leftIcon={<FiCreditCard />}
                            onClick={procesarCompra}
                            isLoading={loading}
                        >
                            Confirmar compra
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
