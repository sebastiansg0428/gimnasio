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
    InputRightElement,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Divider,
} from '@chakra-ui/react'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiShoppingCart, FiTrendingUp, FiPackage, FiDollarSign } from 'react-icons/fi'
import { useState, useRef, useEffect, useMemo } from 'react'
import { productosAPI } from '../services/api'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ProductosTab() {
    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('todos')
    const [selected, setSelected] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const nombreRef = useRef(null)

    useEffect(() => {
        if (isOpen && nombreRef.current) nombreRef.current.focus()
    }, [isOpen])

    useEffect(() => {
        const t = setTimeout(() => {
            setBusqueda(inputValue)
        }, 350)
        return () => clearTimeout(t)
    }, [inputValue])

    // Cargar productos del backend
    useEffect(() => {
        const cargarProductos = async (esRecarga = false) => {
            try {
                // Solo mostrar loading en la carga inicial, no en recargas automáticas
                if (!esRecarga) {
                    setLoading(true)
                }
                const response = await productosAPI.getProductos()
                
                // Manejar diferentes estructuras de respuesta
                let productosData = []
                if (Array.isArray(response)) {
                    productosData = response
                } else if (response && Array.isArray(response.productos)) {
                    productosData = response.productos
                } else if (response && Array.isArray(response.data)) {
                    productosData = response.data
                } else {
                    console.warn('Estructura de respuesta inesperada:', response)
                }
                
                setProductos(productosData)
            } catch (error) {
                console.error('Error cargando productos:', error)
                if (!esRecarga) {
                    toast({ title: 'Error cargando productos', status: 'error', duration: 3000 })
                }
                setProductos([])
            } finally {
                if (!esRecarga) {
                    setLoading(false)
                }
            }
        }
        
        cargarProductos(false) // Carga inicial
        // Recargar cada 30 segundos en lugar de 10 (reduce parpadeo y carga del servidor)
        const interval = setInterval(() => cargarProductos(true), 30000)
        return () => clearInterval(interval)
    }, [])

    const limpiarBusqueda = () => {
        setInputValue('')
        setBusqueda('')
    }

    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                             (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
        
        // Filtro de categoría más robusto
        const categoria = (p.categoria || '').trim().toLowerCase()
        const filtro = filtroCategoria.trim().toLowerCase()
        const matchCategoria = filtro === 'todos' || categoria === filtro
        
        return matchBusqueda && matchCategoria
    })

    // Estadísticas calculadas
    const estadisticas = useMemo(() => {
        const totalProductos = productos.length
        const totalStock = productos.reduce((sum, p) => sum + (p.stock || 0), 0)
        const valorInventario = productos.reduce((sum, p) => sum + ((p.precio_venta || 0) * (p.stock || 0)), 0)
        const costoInventario = productos.reduce((sum, p) => sum + ((p.precio_compra || 0) * (p.stock || 0)), 0)
        const margenGanancia = valorInventario - costoInventario
        const productosAgotados = productos.filter(p => (p.stock || 0) === 0).length
        const productosBajoStock = productos.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.stock_minimo || 5)).length

        // Datos por categoría para gráfica de barras
        const categorias = {}
        productos.forEach(p => {
            const cat = (p.categoria || 'sin categoría').toLowerCase()
            const catCapitalizada = cat.charAt(0).toUpperCase() + cat.slice(1)
            if (!categorias[cat]) {
                categorias[cat] = { nombre: catCapitalizada, cantidad: 0, valor: 0, stock: 0 }
            }
            categorias[cat].cantidad++
            categorias[cat].valor += (p.precio_venta || 0) * (p.stock || 0)
            categorias[cat].stock += (p.stock || 0)
        })
        const datosCategorias = Object.values(categorias).sort((a, b) => b.valor - a.valor)

        // Datos para gráfica de pie (stock) con productos reales
        const stockDisponible = totalStock - productosAgotados
        const datosStock = [
            { name: 'En Stock', value: stockDisponible, color: '#48BB78', porcentaje: ((stockDisponible / totalStock) * 100).toFixed(1) },
            { name: 'Bajo Stock', value: productosBajoStock, color: '#ED8936', porcentaje: ((productosBajoStock / totalProductos) * 100).toFixed(1) },
            { name: 'Agotados', value: productosAgotados, color: '#F56565', porcentaje: ((productosAgotados / totalProductos) * 100).toFixed(1) }
        ].filter(d => d.value > 0)

        // Top 5 productos por valor en stock
        const topProductos = [...productos]
            .map(p => ({
                ...p,
                valorTotal: (p.precio_venta || 0) * (p.stock || 0)
            }))
            .sort((a, b) => b.valorTotal - a.valorTotal)
            .slice(0, 5)

        // Productos con stock crítico
        const productosCriticos = productos
            .filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.stock_minimo || 5))
            .sort((a, b) => (a.stock || 0) - (b.stock || 0))
            .slice(0, 5)

        return {
            totalProductos,
            totalStock,
            valorInventario,
            costoInventario,
            margenGanancia,
            productosAgotados,
            productosBajoStock,
            datosCategorias,
            datosStock,
            topProductos,
            productosCriticos
        }
    }, [productos])

    function handleNuevo() {
        setSelected({ 
            id: null, 
            nombre: '', 
            descripcion: '', 
            categoria: 'suplementos', 
            stock: 0, 
            stock_minimo: 5, 
            precio_compra: 0, 
            precio_venta: 0 
        })
        onOpen()
    }

    function handleEditar(p) {
        setSelected(p)
        onOpen()
    }

    async function handleEliminar(id) {
        try {
            await productosAPI.deleteProducto(id)
            setProductos(prev => prev.filter(x => x.id !== id))
            toast({ title: 'Producto eliminado', status: 'info', duration: 2000 })
        } catch (error) {
            toast({ title: 'Error eliminando producto', status: 'error', duration: 2000 })
        }
    }

    async function handleVender(producto) {
        try {
            await productosAPI.venderProducto(producto.id, 1)
            setProductos(prev => prev.map(p => 
                p.id === producto.id ? { ...p, stock: p.stock - 1 } : p
            ))
            toast({ title: 'Venta registrada', status: 'success', duration: 2000 })
        } catch (error) {
            toast({ title: 'Error en la venta', status: 'error', duration: 2000 })
        }
    }

    async function handleSave() {
        if (!selected.nombre.trim()) {
            toast({ title: 'Nombre requerido', status: 'warning', duration: 2000 })
            return
        }
        
        try {
            if (selected.id == null) {
                const nuevo = await productosAPI.createProducto(selected)
                // Agregar el nuevo producto sin recargar toda la lista
                setProductos(prev => [nuevo, ...prev])
                toast({ title: 'Producto creado', status: 'success', duration: 2000 })
            } else {
                const actualizado = await productosAPI.updateProducto(selected.id, selected)
                // Actualizar solo el producto modificado sin recargar toda la lista
                setProductos(prev => prev.map(p => (p.id === selected.id ? actualizado : p)))
                toast({ title: 'Producto actualizado', status: 'success', duration: 2000 })
            }
            onClose()
        } catch (error) {
            console.error('Error guardando producto:', error)
            toast({ title: 'Error guardando producto', status: 'error', duration: 2000 })
        }
    }

    return (
        <Box>
            {/* Tarjetas de Estadísticas */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                <Box bg="white" p={5} borderRadius="lg" boxShadow="md" borderLeft="4px solid" borderLeftColor="green.400" _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.2s" }}>
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600" fontSize="sm">Total Productos</StatLabel>
                            <FiPackage size={24} color="#48BB78" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="green.600">{estadisticas.totalProductos}</StatNumber>
                        <StatHelpText color="gray.500">En catálogo</StatHelpText>
                    </Stat>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="md" borderLeft="4px solid" borderLeftColor="blue.400" _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.2s" }}>
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600" fontSize="sm">Stock Total</StatLabel>
                            <FiShoppingCart size={24} color="#4299E1" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="blue.600">{estadisticas.totalStock}</StatNumber>
                        <StatHelpText color="gray.500">Unidades disponibles</StatHelpText>
                    </Stat>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="md" borderLeft="4px solid" borderLeftColor="purple.400" _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.2s" }}>
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600" fontSize="sm">Valor Inventario</StatLabel>
                            <FiDollarSign size={24} color="#805AD5" />
                        </HStack>
                        <StatNumber fontSize="2xl" color="purple.600">
                            ${estadisticas.valorInventario.toLocaleString('es-CO')}
                        </StatNumber>
                        <StatHelpText color="green.500" fontWeight="medium">
                            +${estadisticas.margenGanancia.toLocaleString('es-CO')} margen
                        </StatHelpText>
                    </Stat>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="md" borderLeft="4px solid" borderLeftColor="orange.400" _hover={{ boxShadow: "lg", transform: "translateY(-2px)", transition: "all 0.2s" }}>
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600" fontSize="sm">Alertas Stock</StatLabel>
                            <FiTrendingUp size={24} color="#DD6B20" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="orange.600">{estadisticas.productosBajoStock}</StatNumber>
                        <StatHelpText color={estadisticas.productosAgotados > 0 ? "red.500" : "gray.500"} fontWeight={estadisticas.productosAgotados > 0 ? "medium" : "normal"}>
                            {estadisticas.productosAgotados} agotados
                        </StatHelpText>
                    </Stat>
                </Box>
            </SimpleGrid>

            {/* Gráficas */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                {/* Gráfica de Barras - Productos por Categoría */}
                <Box bg="white" p={5} borderRadius="lg" boxShadow="md" border="1px" borderColor="gray.200">
                    <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                        📊 Productos por Categoría
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={estadisticas.datosCategorias}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis 
                                dataKey="nombre" 
                                tick={{ fontSize: 12 }}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}
                                formatter={(value, name, props) => {
                                    if (name === 'valor') {
                                        return [`$${value.toLocaleString('es-CO')}`, 'Valor Total']
                                    }
                                    if (name === 'cantidad') {
                                        return [value, 'Productos']
                                    }
                                    if (name === 'stock') {
                                        return [`${value} unidades`, 'Stock Total']
                                    }
                                    return [value, name]
                                }}
                                labelFormatter={(label) => `Categoría: ${label}`}
                            />
                            <Legend 
                                wrapperStyle={{ fontSize: '14px' }}
                                iconType="circle"
                            />
                            <Bar dataKey="cantidad" fill="#48BB78" name="Productos" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="stock" fill="#4299E1" name="Stock" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* Gráfica de Pie - Estado del Stock */}
                <Box bg="white" p={5} borderRadius="lg" boxShadow="md" border="1px" borderColor="gray.200">
                    <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                        📈 Estado del Inventario
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={estadisticas.datosStock}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, value, porcentaje }) => `${name}: ${value} (${porcentaje}%)`}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {estadisticas.datosStock.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}
                                formatter={(value, name, props) => {
                                    const porcentaje = props.payload.porcentaje
                                    return [`${value} productos (${porcentaje}%)`, name]
                                }}
                            />
                            <Legend 
                                wrapperStyle={{ fontSize: '14px' }}
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </SimpleGrid>

            {/* Nueva sección: Top Productos y Alertas de Stock */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                {/* Top 5 Productos por Valor */}
                <Box bg="white" p={5} borderRadius="lg" boxShadow="md" border="1px" borderColor="gray.200">
                    <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                        🏆 Top 5 Productos por Valor en Stock
                    </Text>
                    <VStack spacing={3} align="stretch">
                        {estadisticas.topProductos.length > 0 ? (
                            estadisticas.topProductos.map((producto, index) => (
                                <HStack 
                                    key={producto.id} 
                                    p={3} 
                                    bg="gray.50" 
                                    borderRadius="md"
                                    justify="space-between"
                                    _hover={{ bg: "green.50", transform: "translateX(4px)", transition: "all 0.2s" }}
                                >
                                    <HStack spacing={3} flex={1}>
                                        <Box
                                            w="30px"
                                            h="30px"
                                            borderRadius="full"
                                            bg={index === 0 ? "yellow.400" : index === 1 ? "gray.300" : index === 2 ? "orange.400" : "blue.100"}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontWeight="bold"
                                            fontSize="sm"
                                            color={index < 3 ? "white" : "gray.700"}
                                        >
                                            {index + 1}
                                        </Box>
                                        <VStack align="start" spacing={0} flex={1}>
                                            <Text fontWeight="semibold" fontSize="sm" color="gray.800" noOfLines={1}>
                                                {producto.nombre}
                                            </Text>
                                            <HStack spacing={2} fontSize="xs" color="gray.500">
                                                <Tag size="sm" colorScheme="blue">{producto.categoria}</Tag>
                                                <Text>{producto.stock} unidades</Text>
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                    <Text fontWeight="bold" color="green.600" fontSize="md">
                                        ${producto.valorTotal.toLocaleString('es-CO')}
                                    </Text>
                                </HStack>
                            ))
                        ) : (
                            <Text color="gray.500" textAlign="center" py={4}>No hay productos disponibles</Text>
                        )}
                    </VStack>
                </Box>

                {/* Productos con Stock Crítico */}
                <Box bg="white" p={5} borderRadius="lg" boxShadow="md" border="1px" borderColor="gray.200">
                    <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                        ⚠️ Productos con Stock Crítico
                    </Text>
                    <VStack spacing={3} align="stretch">
                        {estadisticas.productosCriticos.length > 0 ? (
                            estadisticas.productosCriticos.map((producto) => (
                                <HStack 
                                    key={producto.id} 
                                    p={3} 
                                    bg="red.50" 
                                    borderRadius="md"
                                    justify="space-between"
                                    borderLeft="4px solid"
                                    borderLeftColor="red.400"
                                    _hover={{ bg: "red.100", transition: "all 0.2s" }}
                                >
                                    <VStack align="start" spacing={1} flex={1}>
                                        <Text fontWeight="semibold" fontSize="sm" color="gray.800" noOfLines={1}>
                                            {producto.nombre}
                                        </Text>
                                        <HStack spacing={2} fontSize="xs">
                                            <Tag size="sm" colorScheme="blue">{producto.categoria}</Tag>
                                            <Text color="gray.600">Stock mínimo: {producto.stock_minimo || 5}</Text>
                                        </HStack>
                                    </VStack>
                                    <VStack spacing={0}>
                                        <Text fontWeight="bold" color="red.600" fontSize="lg">
                                            {producto.stock}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">unidades</Text>
                                    </VStack>
                                </HStack>
                            ))
                        ) : (
                            <Box textAlign="center" py={4}>
                                <Text color="green.600" fontWeight="medium">✓ Todos los productos tienen stock adecuado</Text>
                            </Box>
                        )}
                    </VStack>
                </Box>
            </SimpleGrid>

            <Divider mb={6} />

            {/* Controles y tabla existentes */}
            <HStack mb={6} spacing={4} justify="space-between" wrap="wrap">
                <HStack spacing={4}>
                    <Button leftIcon={<FiPlus />} colorScheme="green" onClick={handleNuevo} minW="fit-content" px={4}>
                        Nuevo Producto
                    </Button>
                    <InputGroup maxW="320px" position="relative">
                        <InputLeftElement pointerEvents="none">
                            <FiSearch color="#24A148" />
                        </InputLeftElement>
                        <Input
                            placeholder="Buscar productos..."
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
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    maxW="200px"
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                    _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #48bb78" }}
                    _hover={{ borderColor: "green.400" }}
                >
                    <option value="todos">Todas las categorías</option>
                    <option value="suplementos">Suplementos</option>
                    <option value="equipos">Equipos</option>
                    <option value="accesorios">Accesorios</option>
                    <option value="ropa">Ropa</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="aperitivos">Aperitivos</option>
                    <option value="snacks">Snacks</option>
                </Select>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                    Mostrando <Text as="span" fontWeight="bold" color="green.600">{productosFiltrados.length}</Text> de <Text as="span" fontWeight="bold">{productos.length}</Text> productos
                </Text>
            </HStack>

            {loading ? (
                <Box textAlign="center" py={10} bg="white" borderRadius="lg" boxShadow="sm">
                    <Text color="gray.600">Cargando productos...</Text>
                </Box>
            ) : productosFiltrados.length === 0 ? (
                <Box textAlign="center" py={10} bg="white" borderRadius="lg" boxShadow="sm">
                    <Text color="gray.600" fontSize="lg">No se encontraron productos</Text>
                    <Text color="gray.500" fontSize="sm" mt={2}>
                        {productos.length === 0 ? 'No hay productos registrados' : 'Intenta cambiar los filtros de búsqueda'}
                    </Text>
                </Box>
            ) : (
                <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th color="gray.700">ID</Th>
                                <Th color="gray.700">Producto</Th>
                                <Th color="gray.700">Categoría</Th>
                                <Th color="gray.700">Stock</Th>
                                <Th color="gray.700" isNumeric>Precio Compra</Th>
                                <Th color="gray.700" isNumeric>Precio Venta</Th>
                                <Th color="gray.700">Estado</Th>
                                <Th></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {productosFiltrados.map(p => (
                                <Tr key={p.id} _hover={{ bg: "gray.50" }}>
                                    <Td color="gray.600" fontWeight="medium">#{p.id}</Td>
                                    <Td>
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="medium" color="gray.800">{p.nombre || 'Sin nombre'}</Text>
                                            <Text fontSize="sm" color="gray.500">{p.descripcion || 'Sin descripción'}</Text>
                                        </VStack>
                                    </Td>
                                    <Td>
                                        <Tag colorScheme="blue">{p.categoria || 'Sin categoría'}</Tag>
                                    </Td>
                                    <Td color="gray.700">{p.stock || 0} unidades</Td>
                                    <Td color="gray.700" isNumeric>COP ${(p.precio_compra || 0).toLocaleString('es-CO')}</Td>
                                    <Td color="gray.700" isNumeric fontWeight="semibold">COP ${(p.precio_venta || 0).toLocaleString('es-CO')}</Td>
                                    <Td>
                                        <Tag colorScheme={(p.stock || 0) <= (p.stock_minimo || 0) ? 'red' : 'green'}>
                                            {(p.stock || 0) <= (p.stock_minimo || 0) ? 'Stock Bajo' : 'Disponible'}
                                        </Tag>
                                    </Td>
                                    <Td>
                                        <HStack>
                                            <IconButton 
                                                aria-label="Vender" 
                                                icon={<FiShoppingCart />} 
                                                size="sm" 
                                                variant="ghost" 
                                                color="blue.500"
                                                _hover={{ bg: "blue.50", color: "blue.600" }}
                                                onClick={() => handleVender(p)}
                                                isDisabled={p.stock === 0}
                                            />
                                            <IconButton 
                                                aria-label="Editar" 
                                                icon={<FiEdit />} 
                                                size="sm" 
                                                variant="ghost" 
                                                color="green.500"
                                                _hover={{ bg: "green.50", color: "green.600" }}
                                                onClick={() => handleEditar(p)} 
                                            />
                                            <IconButton 
                                                aria-label="Eliminar" 
                                                icon={<FiTrash2 />} 
                                                size="sm" 
                                                variant="ghost" 
                                                color="red.500"
                                                _hover={{ bg: "red.50", color: "red.600" }}
                                                onClick={() => handleEliminar(p.id)} 
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selected?.id ? 'Editar Producto' : 'Nuevo Producto'}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Nombre</FormLabel>
                                <Input ref={nombreRef} value={selected?.nombre || ''} onChange={(e) => setSelected(s => ({ ...s, nombre: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Input value={selected?.descripcion || ''} onChange={(e) => setSelected(s => ({ ...s, descripcion: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Categoría</FormLabel>
                                <Select value={selected?.categoria || 'suplementos'} onChange={(e) => setSelected(s => ({ ...s, categoria: e.target.value }))}>
                                    <option value="suplementos">Suplementos</option>
                                    <option value="equipos">Equipos</option>
                                    <option value="accesorios">Accesorios</option>
                                    <option value="ropa">Ropa</option>
                                    <option value="bebidas">Bebidas</option>
                                    <option value="aperitivos">Aperitivos</option>
                                </Select>
                            </FormControl>
                            <HStack>
                                <FormControl>
                                    <FormLabel>Stock</FormLabel>
                                    <NumberInput min={0} value={selected?.stock || 0} onChange={(val) => setSelected(s => ({ ...s, stock: Number(val) }))}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Stock Mínimo</FormLabel>
                                    <NumberInput min={0} value={selected?.stock_minimo || 5} onChange={(val) => setSelected(s => ({ ...s, stock_minimo: Number(val) }))}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                            </HStack>
                            <HStack>
                                <FormControl>
                                    <FormLabel>Precio Compra (COP)</FormLabel>
                                    <NumberInput min={0} value={selected?.precio_compra || 0} onChange={(val) => setSelected(s => ({ ...s, precio_compra: Number(val) }))}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Precio Venta (COP)</FormLabel>
                                    <NumberInput min={0} value={selected?.precio_venta || 0} onChange={(val) => setSelected(s => ({ ...s, precio_venta: Number(val) }))}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
                        <Button colorScheme="green" onClick={handleSave}>Guardar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}