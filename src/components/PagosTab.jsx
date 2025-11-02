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
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from '@chakra-ui/react'
import { FiPlus, FiSearch, FiEye, FiTrash2, FiCheck, FiX } from 'react-icons/fi'
import { useState, useEffect } from 'react'

const pagosIniciales = [
    { id: 1, cliente: 'Ana María Rodríguez', correo: 'ana.rodriguez@email.com', monto: 50, fecha: '2025-10-28', estado: 'Pagado', metodo: 'Tarjeta' },
    { id: 2, cliente: 'Carlos Mendoza', correo: 'carlos.m@email.com', monto: 35, fecha: '2025-10-25', estado: 'Pendiente', metodo: 'Efectivo' },
    { id: 3, cliente: 'Laura Pérez', correo: 'laura.p@email.com', monto: 75, fecha: '2025-10-10', estado: 'Vencido', metodo: 'Transferencia' },
    { id: 4, cliente: 'Jacob Sanchez', correo: 'jacob@email.com', monto: 100, fecha: '2025-10-29', estado: 'Pagado', metodo: 'Tarjeta' },
    { id: 5, cliente: 'Sebastian Sanchez', correo: 'sebastian@email.com', monto: 60, fecha: '2025-10-27', estado: 'Pendiente', metodo: 'Efectivo' }
]

export default function PagosTab() {
    const STORAGE_KEY = 'rg_pagos'
    const [pagos, setPagos] = useState(() => {
        try {
            // Obtener usuarios registrados y clientes
            const usuarios = JSON.parse(localStorage.getItem('rg_users') || '[]')
            const clientes = JSON.parse(localStorage.getItem('rg_clients') || '[]')
            
            // Crear pagos desde usuarios registrados
            const pagosDeUsuarios = usuarios.map((user, index) => ({
                id: `user_${user.id || index}`,
                cliente: user.name,
                correo: user.email,
                monto: 50,
                fecha: '2025-10-29',
                estado: 'Pagado',
                metodo: 'Tarjeta'
            }))
            
            // Combinar con pagos iniciales
            const todosPagos = [...pagosIniciales, ...pagosDeUsuarios]
            
            // Actualizar estados según clientes
            const pagosActualizados = todosPagos.map(pago => {
                const cliente = clientes.find(c => c.nombre === pago.cliente || c.correo === pago.correo)
                if (cliente) {
                    return {
                        ...pago,
                        estado: cliente.estado === 'Activo' ? 'Pagado' : 'Vencido'
                    }
                }
                return pago
            })
            
            return pagosActualizados
        } catch (e) {
            return pagosIniciales
        }
    })
    const [busqueda, setBusqueda] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('todos')
    const [selected, setSelected] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pagos))
        } catch (e) {
            // ignore
        }
    }, [pagos])



    useEffect(() => {
        const t = setTimeout(() => {
            setBusqueda(inputValue)
        }, 350)
        return () => clearTimeout(t)
    }, [inputValue])

    // Actualizar pagos con usuarios registrados y estados
    useEffect(() => {
        const actualizarPagos = () => {
            try {
                const usuarios = JSON.parse(localStorage.getItem('rg_users') || '[]')
                const clientes = JSON.parse(localStorage.getItem('rg_clients') || '[]')
                
                // Crear pagos desde usuarios
                const pagosDeUsuarios = usuarios.map((user, index) => ({
                    id: `user_${user.id || index}`,
                    cliente: user.name,
                    correo: user.email,
                    monto: 50,
                    fecha: '2025-10-29',
                    estado: 'Pagado',
                    metodo: 'Tarjeta'
                }))
                
                // Combinar todos los pagos
                const todosPagos = [...pagosIniciales, ...pagosDeUsuarios]
                
                // Actualizar estados
                const pagosActualizados = todosPagos.map(pago => {
                    const cliente = clientes.find(c => c.nombre === pago.cliente || c.correo === pago.correo)
                    if (cliente) {
                        return {
                            ...pago,
                            estado: cliente.estado === 'Activo' ? 'Pagado' : 'Vencido'
                        }
                    }
                    return pago
                })
                
                setPagos(pagosActualizados)
            } catch (e) {
                // ignore
            }
        }
        
        actualizarPagos()
        const interval = setInterval(actualizarPagos, 2000)
        return () => clearInterval(interval)
    }, [])

    const pagosFiltrados = pagos.filter(p => {
        const matchBusqueda = p.cliente.toLowerCase().includes(busqueda.toLowerCase()) || p.correo.toLowerCase().includes(busqueda.toLowerCase())
        const matchEstado = filtroEstado === 'todos' || p.estado.toLowerCase() === filtroEstado.toLowerCase()
        return matchBusqueda && matchEstado
    })

    function handleNuevo() {
        setSelected({ id: null, cliente: '', correo: '', monto: 0, fecha: new Date().toISOString().slice(0, 10), estado: 'Pendiente', metodo: 'Efectivo' })
        onOpen()
    }

    function handleVer(p) {
        toast({ title: 'Pago seleccionado', description: `${p.cliente} — $${p.monto}`, status: 'info', duration: 2000 })
    }

    function handleEliminar(id) {
        setPagos(prev => prev.filter(x => x.id !== id))
        toast({ title: 'Pago eliminado', status: 'info', duration: 2000 })
    }

    function handleMarcarPagado(id) {
        setPagos(prev => prev.map(p => p.id === id ? { ...p, estado: 'Pagado' } : p))
        toast({ title: 'Marcado como pagado', status: 'success', duration: 2000 })
    }

    const limpiarBusqueda = () => {
        setInputValue('')
        setBusqueda('')
    }

    function handleSave() {
        if (!selected.cliente.trim() || !selected.monto) {
            toast({ title: 'Cliente y monto son requeridos', status: 'warning', duration: 2000 })
            return
        }
        if (selected.id == null) {
            const nuevo = { ...selected, id: Date.now() }
            setPagos(prev => [nuevo, ...prev])
            toast({ title: 'Pago agregado', status: 'success', duration: 2000 })
        } else {
            setPagos(prev => prev.map(p => p.id === selected.id ? selected : p))
            toast({ title: 'Pago actualizado', status: 'success', duration: 2000 })
        }
        onClose()
    }

    return (
        <Box>
            <HStack mb={6} spacing={4}>
                <Button leftIcon={<FiPlus />} colorScheme="green" onClick={handleNuevo}>Nuevo Pago</Button>
                <InputGroup maxW="320px" position="relative">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="#24A148" />
                    </InputLeftElement>
                    <Input
                        placeholder="Buscar pagos..."
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
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    maxW="200px"
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                    _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #48bb78" }}
                    _hover={{ borderColor: "green.400" }}
                >
                    <option value="todos">Todos los estados</option>
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="vencido">Vencido</option>
                </Select>
            </HStack>

            <Box overflowX="auto">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Cliente</Th>
                            <Th>Monto</Th>
                            <Th>Fecha</Th>
                            <Th>Estado</Th>
                            <Th>Método</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {pagosFiltrados.map(p => (
                            <Tr key={p.id}>
                                <Td>
                                    <Text fontWeight="medium">{p.cliente}</Text>
                                    <Text fontSize="sm" color="gray.500">{p.correo}</Text>
                                </Td>
                                <Td>${p.monto}</Td>
                                <Td>{p.fecha}</Td>
                                <Td>
                                    <Tag colorScheme={p.estado === 'Pagado' ? 'green' : p.estado === 'Pendiente' ? 'yellow' : 'red'}>{p.estado}</Tag>
                                </Td>
                                <Td>{p.metodo}</Td>
                                <Td>
                                    <HStack>
                                        <IconButton aria-label="Ver" icon={<FiEye />} size="sm" variant="ghost" onClick={() => handleVer(p)} />
                                        {p.estado !== 'Pagado' && (
                                            <IconButton aria-label="Marcar pagado" icon={<FiCheck />} size="sm" variant="ghost" onClick={() => handleMarcarPagado(p.id)} />
                                        )}
                                        <IconButton aria-label="Eliminar" icon={<FiTrash2 />} size="sm" variant="ghost" onClick={() => handleEliminar(p.id)} />
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selected?.id ? 'Editar Pago' : 'Nuevo Pago'}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Cliente</FormLabel>
                                <Input value={selected?.cliente || ''} onChange={(e) => setSelected(s => ({ ...s, cliente: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Correo</FormLabel>
                                <Input type="email" value={selected?.correo || ''} onChange={(e) => setSelected(s => ({ ...s, correo: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Monto</FormLabel>
                                <NumberInput min={0} value={selected?.monto || 0} onChange={(val) => setSelected(s => ({ ...s, monto: Number(val) }))}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Fecha</FormLabel>
                                <Input type="date" value={selected?.fecha || ''} onChange={(e) => setSelected(s => ({ ...s, fecha: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Estado</FormLabel>
                                <Select value={selected?.estado || 'Pendiente'} onChange={(e) => setSelected(s => ({ ...s, estado: e.target.value }))}>
                                    <option>Pagado</option>
                                    <option>Pendiente</option>
                                    <option>Vencido</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Método</FormLabel>
                                <Select value={selected?.metodo || 'Efectivo'} onChange={(e) => setSelected(s => ({ ...s, metodo: e.target.value }))}>
                                    <option>Efectivo</option>
                                    <option>Tarjeta</option>
                                    <option>Transferencia</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
                        <Button colorScheme="purple" onClick={handleSave}>Guardar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
