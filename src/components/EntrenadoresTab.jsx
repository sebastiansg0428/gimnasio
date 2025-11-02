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
    Textarea,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Avatar,
} from '@chakra-ui/react'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX } from 'react-icons/fi'
import { useState, useRef, useEffect } from 'react'

const initialEntrenadores = [
    { id: 1, nombre: 'Carlos Fitness', email: 'carlos@gym.com', especialidad: 'Fuerza', experiencia: 5, telefono: '555-0101', estado: 'Activo', certificaciones: 'NSCA, ACSM' },
    { id: 2, nombre: 'Ana Cardio', email: 'ana@gym.com', especialidad: 'Cardio', experiencia: 3, telefono: '555-0102', estado: 'Activo', certificaciones: 'ACE, NASM' },
    { id: 3, nombre: 'Luis Crossfit', email: 'luis@gym.com', especialidad: 'CrossFit', experiencia: 7, telefono: '555-0103', estado: 'Inactivo', certificaciones: 'CrossFit Level 2' },
    { id: 4, nombre: 'María Fitness', email: 'maria@gym.com', especialidad: 'Subir Masa muscular', experiencia: 4, telefono: '555-0104', estado: 'Activo', certificaciones: 'NASM, ACE' }
]

export default function EntrenadoresTab() {
    const STORAGE_KEY = 'rg_entrenadores'
    const [entrenadores, setEntrenadores] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            return raw ? JSON.parse(raw) : initialEntrenadores
        } catch (e) {
            return initialEntrenadores
        }
    })
    const [busqueda, setBusqueda] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [filtroEspecialidad, setFiltroEspecialidad] = useState('todos')
    const [selected, setSelected] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const nombreRef = useRef(null)

    useEffect(() => {
        if (isOpen && nombreRef.current) nombreRef.current.focus()
    }, [isOpen])

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entrenadores))
        } catch (e) {
            // ignore
        }
    }, [entrenadores])

    useEffect(() => {
        const t = setTimeout(() => {
            setBusqueda(inputValue)
        }, 350)
        return () => clearTimeout(t)
    }, [inputValue])

    const limpiarBusqueda = () => {
        setInputValue('')
        setBusqueda('')
    }

    const entrenadoresFiltrados = entrenadores.filter(e => {
        const matchBusqueda = e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.email.toLowerCase().includes(busqueda.toLowerCase())
        const matchEspecialidad = filtroEspecialidad === 'todos' || e.especialidad.toLowerCase() === filtroEspecialidad.toLowerCase()
        return matchBusqueda && matchEspecialidad
    })

    function handleNuevo() {
        setSelected({ id: null, nombre: '', email: '', especialidad: 'Fuerza', experiencia: 1, telefono: '', estado: 'Activo', certificaciones: '' })
        onOpen()
    }

    function handleEditar(e) {
        setSelected(e)
        onOpen()
    }

    function handleEliminar(id) {
        setEntrenadores(prev => prev.filter(x => x.id !== id))
        toast({ title: 'Entrenador eliminado', status: 'info', duration: 2000 })
    }

    function handleSave() {
        if (!selected.nombre.trim() || !selected.email.trim()) {
            toast({ title: 'Nombre y email son requeridos', status: 'warning', duration: 2000 })
            return
        }
        if (selected.id == null) {
            const nuevo = { ...selected, id: Date.now() }
            setEntrenadores(prev => [nuevo, ...prev])
            toast({ title: 'Entrenador agregado', status: 'success', duration: 2000 })
        } else {
            setEntrenadores(prev => prev.map(e => (e.id === selected.id ? selected : e)))
            toast({ title: 'Entrenador actualizado', status: 'success', duration: 2000 })
        }
        onClose()
    }

    return (
        <Box>
            <HStack mb={6} spacing={4}>
                <Button leftIcon={<FiPlus />} colorScheme="green" onClick={handleNuevo} minW="fit-content" px={4}>
                    Nuevo Entrenador
                </Button>
                <InputGroup maxW="320px" position="relative">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="#24A148" />
                    </InputLeftElement>
                    <Input
                        placeholder="Buscar entrenadores..."
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
                    value={filtroEspecialidad}
                    onChange={(e) => setFiltroEspecialidad(e.target.value)}
                    maxW="200px"
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                    _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #48bb78" }}
                    _hover={{ borderColor: "green.400" }}
                >
                    <option value="todos">Todas las especialidades</option>
                    <option value="fuerza">Fuerza</option>
                    <option value="cardio">Cardio</option>
                    <option value="crossfit">CrossFit</option>
                    <option value="subir masa muscular">Subir Masa muscular</option>
                    <option value="bajar de peso">Bajar de peso</option>
                </Select>
            </HStack>

            <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th color="gray.700">Entrenador</Th>
                            <Th color="gray.700">Especialidad</Th>
                            <Th color="gray.700">Experiencia</Th>
                            <Th color="gray.700">Estado</Th>
                            <Th color="gray.700">Certificaciones</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {entrenadoresFiltrados.map(e => (
                            <Tr key={e.id} _hover={{ bg: "gray.50" }}>
                                <Td>
                                    <HStack spacing={3}>
                                        <Avatar size="sm" bg="green.400" name={e.nombre} />
                                        <Box>
                                            <Text fontWeight="medium" color="gray.800">{e.nombre}</Text>
                                            <Text fontSize="sm" color="gray.500">{e.email}</Text>
                                        </Box>
                                    </HStack>
                                </Td>
                                <Td>
                                    <Tag colorScheme="blue">{e.especialidad}</Tag>
                                </Td>
                                <Td color="gray.700">{e.experiencia} años</Td>
                                <Td>
                                    <Tag colorScheme={e.estado === 'Activo' ? 'green' : 'red'}>
                                        {e.estado}
                                    </Tag>
                                </Td>
                                <Td>
                                    <Text noOfLines={1} maxW="30ch" color="gray.600">{e.certificaciones}</Text>
                                </Td>
                                <Td>
                                    <HStack>
                                        <IconButton
                                            aria-label="Editar"
                                            icon={<FiEdit />}
                                            size="sm"
                                            variant="ghost"
                                            color="green.500"
                                            _hover={{ bg: "green.50", color: "green.600" }}
                                            onClick={() => handleEditar(e)}
                                        />
                                        <IconButton
                                            aria-label="Eliminar"
                                            icon={<FiTrash2 />}
                                            size="sm"
                                            variant="ghost"
                                            color="red.500"
                                            _hover={{ bg: "red.50", color: "red.600" }}
                                            onClick={() => handleEliminar(e.id)}
                                        />
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
                    <ModalHeader>{selected?.id ? 'Editar Entrenador' : 'Nuevo Entrenador'}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Nombre</FormLabel>
                                <Input ref={nombreRef} value={selected?.nombre || ''} onChange={(e) => setSelected(s => ({ ...s, nombre: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input type="email" value={selected?.email || ''} onChange={(e) => setSelected(s => ({ ...s, email: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Teléfono</FormLabel>
                                <Input value={selected?.telefono || ''} onChange={(e) => setSelected(s => ({ ...s, telefono: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Especialidad</FormLabel>
                                <Select value={selected?.especialidad || 'Fuerza'} onChange={(e) => setSelected(s => ({ ...s, especialidad: e.target.value }))}>
                                    <option>Fuerza</option>
                                    <option>Cardio</option>
                                    <option>CrossFit</option>
                                    <option>Subir Masa muscular</option>
                                    <option>Bajar de peso</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Años de experiencia</FormLabel>
                                <Input type="number" min="0" value={selected?.experiencia || 1} onChange={(e) => setSelected(s => ({ ...s, experiencia: Number(e.target.value) }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Estado</FormLabel>
                                <Select value={selected?.estado || 'Activo'} onChange={(e) => setSelected(s => ({ ...s, estado: e.target.value }))}>
                                    <option>Activo</option>
                                    <option>Inactivo</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Certificaciones</FormLabel>
                                <Textarea value={selected?.certificaciones || ''} onChange={(e) => setSelected(s => ({ ...s, certificaciones: e.target.value }))} />
                            </FormControl>
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