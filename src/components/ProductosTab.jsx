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
} from '@chakra-ui/react'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiShoppingCart } from 'react-icons/fi'
import { useState, useRef, useEffect } from 'react'
import { productosAPI } from '../services/api'

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
                setProductos(data)
            } catch (error) {
                console.error('Error cargando productos:', error)
                toast({ title: 'Error cargando productos', status: 'error', duration: 3000 })
            } finally {
                setLoading(false)
            }
        }
        
        cargarProductos()
    }, [])

    const limpiarBusqueda = () => {
        setInputValue('')
        setBusqueda('')
    }

    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
        const matchCategoria = filtroCategoria === 'todos' || 
                              p.categoria.toLowerCase() === filtroCategoria.toLowerCase()
        return matchBusqueda && matchCategoria
    })

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
        } catch (error) {
            toast({ title: 'Error guardando producto', status: 'error', duration: 2000 })
        }
    }

    return (
        <Box>
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
                                            <Text fontWeight="medium" color="gray.800">{p.nombre}</Text>
                                            <Text fontSize="sm" color="gray.500">{p.descripcion}</Text>
                                        </VStack>
                                    </Td>
                                    <Td>
                                        <Tag colorScheme="blue">{p.categoria}</Tag>
                                    </Td>
                                    <Td color="gray.700">{p.stock} unidades</Td>
                                    <Td color="gray.700">${p.precio_venta}</Td>
                                    <Td>
                                        <Tag colorScheme={p.stock <= p.stock_minimo ? 'red' : 'green'}>
                                            {p.stock <= p.stock_minimo ? 'Stock Bajo' : 'Disponible'}
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
                                    <FormLabel>Precio Compra</FormLabel>
                                    <NumberInput min={0} value={selected?.precio_compra || 0} onChange={(val) => setSelected(s => ({ ...s, precio_compra: Number(val) }))}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Precio Venta</FormLabel>
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