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
        const cargarProductos = async () => {
            try {
                setLoading(true)
                const data = await productosAPI.getProductos()
                setProductos(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Error cargando productos:', error)
                toast({ title: 'Error cargando productos', status: 'error', duration: 3000 })
                setProductos([])
            } finally {
                setLoading(false)
            }
        }
        
        cargarProductos()
        // Recargar cada 10 segundos para mantener sincronizado
        const interval = setInterval(cargarProductos, 10000)
        return () => clearInterval(interval)
    }, [])

    const limpiarBusqueda = () => {
        setInputValue('')
        setBusqueda('')
    }

    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                             (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
        const matchCategoria = filtroCategoria === 'todos' || 
                              (p.categoria || '').toLowerCase() === filtroCategoria.toLowerCase()
        return matchBusqueda && matchCategoria
    })

    // Estadísticas calculadas
    const estadisticas = useMemo(() => {
        const totalProductos = productos.length
        const totalStock = productos.reduce((sum, p) => sum + (p.stock || 0), 0)
        const valorInventario = productos.reduce((sum, p) => sum + ((p.precio || 0) * (p.stock || 0)), 0)
        const productosAgotados = productos.filter(p => (p.stock || 0) === 0).length
        const productosBajoStock = productos.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length

        // Datos por categoría para gráfica de barras
        const categorias = {}
        productos.forEach(p => {
            const cat = p.categoria || 'sin categoría'
            if (!categorias[cat]) {
                categorias[cat] = { nombre: cat, cantidad: 0, valor: 0 }
            }
            categorias[cat].cantidad++
            categorias[cat].valor += (p.precio || 0) * (p.stock || 0)
        })
        const datosCategorias = Object.values(categorias)

        // Datos para gráfica de pie (stock)
        const datosStock = [
            { name: 'En Stock', value: totalStock - productosAgotados, color: '#48BB78' },
            { name: 'Bajo Stock', value: productosBajoStock, color: '#ED8936' },
            { name: 'Agotados', value: productosAgotados, color: '#F56565' }
        ]

        return {
            totalProductos,
            totalStock,
            valorInventario,
            productosAgotados,
            productosBajoStock,
            datosCategorias,
            datosStock
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
                setProductos(prev => [nuevo, ...prev])
                toast({ title: 'Producto creado', status: 'success', duration: 2000 })
            } else {
                const actualizado = await productosAPI.updateProducto(selected.id, selected)
                setProductos(prev => prev.map(p => (p.id === selected.id ? actualizado : p)))
                toast({ title: 'Producto actualizado', status: 'success', duration: 2000 })
            }
            onClose()
            // Recargar productos para sincronizar con backend
            const data = await productosAPI.getProductos()
            setProductos(data)
        } catch (error) {
            console.error('Error guardando producto:', error)
            toast({ title: 'Error guardando producto', status: 'error', duration: 2000 })
        }
    }

    return (
        <Box>
            {/* Tarjetas de Estadísticas */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="green.400">
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600">Total Productos</StatLabel>
                            <FiPackage size={24} color="#48BB78" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="green.600">{estadisticas.totalProductos}</StatNumber>
                        <StatHelpText>En catálogo</StatHelpText>
                    </Stat>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="blue.400">
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600">Stock Total</StatLabel>
                            <FiShoppingCart size={24} color="#4299E1" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="blue.600">{estadisticas.totalStock}</StatNumber>
                        <StatHelpText>Unidades disponibles</StatHelpText>
                    </Stat>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="purple.400">
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600">Valor Inventario</StatLabel>
                            <FiDollarSign size={24} color="#805AD5" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="purple.600">
                            ${estadisticas.valorInventario.toLocaleString('es-CO')}
                        </StatNumber>
                        <StatHelpText>Valor total en stock</StatHelpText>
                    </Stat>
                </Box>

                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm" borderLeft="4px solid" borderLeftColor="orange.400">
                    <Stat>
                        <HStack justify="space-between" mb={2}>
                            <StatLabel color="gray.600">Alertas Stock</StatLabel>
                            <FiTrendingUp size={24} color="#DD6B20" />
                        </HStack>
                        <StatNumber fontSize="3xl" color="orange.600">{estadisticas.productosBajoStock}</StatNumber>
                        <StatHelpText>{estadisticas.productosAgotados} agotados</StatHelpText>
                    </Stat>
                </Box>
            </SimpleGrid>

            {/* Gráficas */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                {/* Gráfica de Barras - Productos por Categoría */}
                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm">
                    <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                        Productos por Categoría
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={estadisticas.datosCategorias}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip 
                                formatter={(value, name) => {
                                    if (name === 'valor') return [`$${value.toLocaleString('es-CO')}`, 'Valor']
                                    return [value, 'Cantidad']
                                }}
                            />
                            <Legend />
                            <Bar dataKey="cantidad" fill="#48BB78" name="Cantidad" />
                            <Bar dataKey="valor" fill="#4299E1" name="Valor ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* Gráfica de Pie - Estado del Stock */}
                <Box bg="white" p={5} borderRadius="lg" boxShadow="sm">
                    <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
                        Estado del Inventario
                    </Text>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={estadisticas.datosStock}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {estadisticas.datosStock.map((entry, index) => (
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

            {/* Controles y tabla existentes */}
            <HStack mb={6} spacing={4}>
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
                </Select>
            </HStack>

            {loading ? (
                <Box textAlign="center" py={10}>
                    <Text>Cargando productos...</Text>
                </Box>
            ) : (
                <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th color="gray.700">Producto</Th>
                                <Th color="gray.700">Categoría</Th>
                                <Th color="gray.700">Stock</Th>
                                <Th color="gray.700">Precio Venta</Th>
                                <Th color="gray.700">Estado</Th>
                                <Th></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {productosFiltrados.map(p => (
                                <Tr key={p.id} _hover={{ bg: "gray.50" }}>
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
                                    <Td color="gray.700">COP ${(p.precio_venta || 0).toLocaleString('es-CO')}</Td>
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