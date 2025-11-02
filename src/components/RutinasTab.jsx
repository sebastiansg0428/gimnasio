import {
    Box,
    Heading,
    VStack,
    HStack,
    Input,
    Select,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
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
    Textarea,
    Tag,
    Text,
    useToast,
    InputGroup,
    InputLeftElement,
    InputRightElement,
} from '@chakra-ui/react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi'
import { useState, useRef, useEffect } from 'react'

const initialRutinas = [
    { id: 1, nombre: 'Full Body Básico', duracionMin: 45, nivel: 'Principiante', descripcion: 'Rutina enfocada en fuerza global.' },
    { id: 2, nombre: 'HIIT Cardio', duracionMin: 30, nivel: 'Intermedio', descripcion: 'Intervalos de alta intensidad para cardio.' },
    { id: 3, nombre: 'Fuerza Piernas', duracionMin: 50, nivel: 'Avanzado', descripcion: 'Enfocada en cuádriceps, glúteos y femorales.' },
]

export default function RutinasTab() {
    const STORAGE_KEY = 'rg_rutinas'
    const [rutinas, setRutinas] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            return raw ? JSON.parse(raw) : initialRutinas
        } catch (e) {
            return initialRutinas
        }
    })
    const [busqueda, setBusqueda] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [filtroNivel, setFiltroNivel] = useState('todos')
    const [selected, setSelected] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const nombreRef = useRef(null)

    useEffect(() => {
        if (isOpen && nombreRef.current) nombreRef.current.focus()
    }, [isOpen])

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rutinas))
        } catch (e) {
            // ignore
        }
    }, [rutinas])

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

    const rutinasFiltradas = rutinas.filter(r => {
        const matchBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || r.descripcion.toLowerCase().includes(busqueda.toLowerCase())
        const matchNivel = filtroNivel === 'todos' || r.nivel.toLowerCase() === filtroNivel.toLowerCase()
        return matchBusqueda && matchNivel
    })

    function handleNuevo() {
        setSelected({ id: null, nombre: '', duracionMin: 30, nivel: 'Principiante', descripcion: '' })
        onOpen()
    }

    function handleEditar(r) {
        setSelected(r)
        onOpen()
    }

    function handleEliminar(id) {
        setRutinas(prev => prev.filter(x => x.id !== id))
        toast({ title: 'Rutina eliminada', status: 'info', duration: 2000 })
    }

    function handleSave() {
        if (!selected.nombre.trim()) {
            toast({ title: 'Nombre requerido', status: 'warning', duration: 2000 })
            return
        }
        if (selected.id == null) {
            const nuevo = { ...selected, id: Date.now() }
            setRutinas(prev => [nuevo, ...prev])
            toast({ title: 'Rutina creada', status: 'success', duration: 2000 })
        } else {
            setRutinas(prev => prev.map(r => (r.id === selected.id ? selected : r)))
            toast({ title: 'Rutina actualizada', status: 'success', duration: 2000 })
        }
        onClose()
    }

    return (
        <Box>
            <HStack mb={6} spacing={4}>
                <Button leftIcon={<FiPlus />} colorScheme="green" _hover={{ borderColor: "green.400" }} onClick={handleNuevo} minW="fit-content" px={4}>
                    Nueva Rutina
                </Button>
                <InputGroup maxW="320px" position="relative">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="#24A148" />
                    </InputLeftElement>
                    <Input
                        placeholder="Buscar rutinas..."
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
                    value={filtroNivel}
                    onChange={(e) => setFiltroNivel(e.target.value)}
                    maxW="200px"
                    bg="white"
                    color="gray.800"
                    borderColor="gray.300"
                    _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #48bb78" }}
                    _hover={{ borderColor: "green.400" }}
                >
                    <option value="todos">Todos los niveles</option>
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                </Select>
            </HStack>

            <Box overflowX="auto">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Nombre</Th>
                            <Th>Duración (min)</Th>
                            <Th>Nivel</Th>
                            <Th>Descripción</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {rutinasFiltradas.map(r => (
                            <Tr key={r.id}>
                                <Td>
                                    <Text fontWeight="medium">{r.nombre}</Text>
                                </Td>
                                <Td>{r.duracionMin}</Td>
                                <Td>
                                    <Tag colorScheme={r.nivel === 'Avanzado' ? 'red' : r.nivel === 'Intermedio' ? 'yellow' : 'green'}>
                                        {r.nivel}
                                    </Tag>
                                </Td>
                                <Td>
                                    <Text noOfLines={2} maxW="40ch">{r.descripcion}</Text>
                                </Td>
                                <Td>
                                    <HStack>
                                        <IconButton aria-label="Editar" icon={<FiEdit />} size="sm" variant="ghost" onClick={() => handleEditar(r)} />
                                        <IconButton aria-label="Eliminar" icon={<FiTrash2 />} size="sm" variant="ghost" onClick={() => handleEliminar(r.id)} />
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
                    <ModalHeader>{selected?.id ? 'Editar Rutina' : 'Nueva Rutina'}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Nombre</FormLabel>
                                <Input ref={nombreRef} value={selected?.nombre || ''} onChange={(e) => setSelected(s => ({ ...s, nombre: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Duración (min)</FormLabel>
                                <NumberInput min={5} value={selected?.duracionMin || 30} onChange={(val) => setSelected(s => ({ ...s, duracionMin: Number(val) }))}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Nivel</FormLabel>
                                <Select value={selected?.nivel || 'Principiante'} onChange={(e) => setSelected(s => ({ ...s, nivel: e.target.value }))}>
                                    <option>Principiante</option>
                                    <option>Intermedio</option>
                                    <option>Avanzado</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Textarea value={selected?.descripcion || ''} onChange={(e) => setSelected(s => ({ ...s, descripcion: e.target.value }))} />
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
