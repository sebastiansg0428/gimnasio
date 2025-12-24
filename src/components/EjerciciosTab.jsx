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
    Textarea,
    Tag,
    Text,
    useToast,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Badge,
} from '@chakra-ui/react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX } from 'react-icons/fi'
import { useState, useRef, useEffect } from 'react'
import { getEjercicios, createEjercicio, updateEjercicio, deleteEjercicio } from '../utils/api'

export default function EjerciciosTab() {
    const [ejercicios, setEjercicios] = useState([])
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [filtroGrupo, setFiltroGrupo] = useState('todos')
    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [filtroNivel, setFiltroNivel] = useState('todos')
    const [selected, setSelected] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const nombreRef = useRef(null)

    useEffect(() => {
        if (isOpen && nombreRef.current) nombreRef.current.focus()
    }, [isOpen])

    useEffect(() => {
        cargarEjercicios()
    }, [])

    async function cargarEjercicios() {
        setLoading(true)
        try {
            const data = await getEjercicios()
            setEjercicios(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error cargando ejercicios', err)
            toast({ title: 'No se pudieron cargar los ejercicios', status: 'error', duration: 3000 })
        } finally {
            setLoading(false)
        }
    }

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

    const ejerciciosFiltrados = ejercicios.filter(e => {
        const nombre = (e.nombre || '').toString().toLowerCase()
        const descripcion = (e.descripcion || '').toString().toLowerCase()
        const grupo = (e.grupo_muscular || '').toString().toLowerCase()
        const tipo = (e.tipo || '').toString().toLowerCase()
        const nivel = (e.nivel || '').toString().toLowerCase()
        
        const matchBusqueda = nombre.includes(busqueda.toLowerCase()) || descripcion.includes(busqueda.toLowerCase())
        const matchGrupo = filtroGrupo === 'todos' || grupo === filtroGrupo.toLowerCase()
        const matchTipo = filtroTipo === 'todos' || tipo === filtroTipo.toLowerCase()
        const matchNivel = filtroNivel === 'todos' || nivel === filtroNivel.toLowerCase()
        
        return matchBusqueda && matchGrupo && matchTipo && matchNivel
    })

    function handleNuevo() {
        setSelected({ 
            id: null, 
            nombre: '', 
            descripcion: '', 
            grupo_muscular: 'pecho',
            tipo: 'fuerza',
            nivel: 'principiante',
            equipo_necesario: '',
            instrucciones: ''
        })
        onOpen()
    }

    function handleEditar(e) {
        setSelected({
            ...e,
            grupo_muscular: e.grupo_muscular || 'pecho',
            tipo: e.tipo || 'fuerza',
            nivel: e.nivel || 'principiante',
            equipo_necesario: e.equipo_necesario || '',
            instrucciones: e.instrucciones || ''
        })
        onOpen()
    }

    async function handleEliminar(id) {
        if (!window.confirm('¿Eliminar este ejercicio?')) return
        
        try {
            await deleteEjercicio(id)
            setEjercicios(prev => prev.filter(x => x.id !== id))
            toast({ title: 'Ejercicio eliminado', status: 'info', duration: 2000 })
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al eliminar ejercicio', status: 'error', duration: 3000 })
        }
    }

    async function handleSave() {
        if (!selected.nombre.trim()) {
            toast({ title: 'Nombre requerido', status: 'warning', duration: 2000 })
            return
        }
        
        try {
            const payload = {
                nombre: selected.nombre,
                descripcion: selected.descripcion,
                grupo_muscular: selected.grupo_muscular,
                tipo: selected.tipo,
                nivel: selected.nivel,
                equipo_necesario: selected.equipo_necesario,
                instrucciones: selected.instrucciones
            }
            
            if (selected.id == null) {
                const created = await createEjercicio(payload)
                await cargarEjercicios()
                toast({ title: 'Ejercicio creado', status: 'success', duration: 2000 })
            } else {
                await updateEjercicio(selected.id, payload)
                await cargarEjercicios()
                toast({ title: 'Ejercicio actualizado', status: 'success', duration: 2000 })
            }
            onClose()
        } catch (err) {
            console.error(err)
            toast({ title: 'Error al guardar ejercicio', status: 'error', duration: 3000 })
        }
    }

    const getNivelColor = (nivel) => {
        const n = (nivel || '').toLowerCase()
        if (n === 'principiante') return 'green'
        if (n === 'intermedio') return 'yellow'
        if (n === 'avanzado') return 'red'
        return 'gray'
    }

    return (
        <Box>
            <HStack mb={6} spacing={4} flexWrap="wrap">
                <Button leftIcon={<FiPlus />} colorScheme="green" onClick={handleNuevo} minW="fit-content" px={4}>
                    Nuevo Ejercicio
                </Button>
                <InputGroup maxW="320px" position="relative">
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="#24A148" />
                    </InputLeftElement>
                    <Input
                        placeholder="Buscar ejercicios..."
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

                <Select value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)} maxW="200px" bg="white" color="gray.800">
                    <option value="todos">Todos los grupos</option>
                    <option value="pecho">Pecho</option>
                    <option value="espalda">Espalda</option>
                    <option value="hombros">Hombros</option>
                    <option value="brazos">Brazos</option>
                    <option value="piernas">Piernas</option>
                    <option value="abdominales">Abdominales</option>
                    <option value="gluteos">Glúteos</option>
                    <option value="cardio">Cardio</option>
                </Select>

                <Select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} maxW="180px" bg="white" color="gray.800">
                    <option value="todos">Todos los tipos</option>
                    <option value="fuerza">Fuerza</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibilidad">Flexibilidad</option>
                    <option value="funcional">Funcional</option>
                </Select>

                <Select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)} maxW="180px" bg="white" color="gray.800">
                    <option value="todos">Todos los niveles</option>
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                </Select>
            </HStack>

            <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
                <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th color="gray.700">Nombre</Th>
                            <Th color="gray.700">Grupo Muscular</Th>
                            <Th color="gray.700">Tipo</Th>
                            <Th color="gray.700">Nivel</Th>
                            <Th color="gray.700">Equipo</Th>
                            <Th color="gray.700">Acciones</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={6} textAlign="center" color="gray.600">Cargando...</Td>
                            </Tr>
                        ) : ejerciciosFiltrados.length === 0 ? (
                            <Tr>
                                <Td colSpan={6} textAlign="center" color="gray.600">
                                    {busqueda || filtroGrupo !== 'todos' || filtroTipo !== 'todos' || filtroNivel !== 'todos' 
                                        ? 'No se encontraron ejercicios con los filtros aplicados' 
                                        : 'No hay ejercicios registrados'}
                                </Td>
                            </Tr>
                        ) : (
                            ejerciciosFiltrados.map((e) => (
                                <Tr key={e.id} _hover={{ bg: 'gray.50' }}>
                                    <Td color="gray.800" fontWeight="medium">{e.nombre}</Td>
                                    <Td color="gray.700">
                                        <Badge colorScheme="blue">{e.grupo_muscular}</Badge>
                                    </Td>
                                    <Td color="gray.700">
                                        <Badge colorScheme="purple">{e.tipo}</Badge>
                                    </Td>
                                    <Td>
                                        <Tag size="sm" colorScheme={getNivelColor(e.nivel)}>
                                            {e.nivel}
                                        </Tag>
                                    </Td>
                                    <Td color="gray.600" fontSize="sm">{e.equipo_necesario || 'N/A'}</Td>
                                    <Td>
                                        <HStack spacing={2}>
                                            <IconButton
                                                aria-label="Editar"
                                                icon={<FiEdit />}
                                                size="sm"
                                                colorScheme="blue"
                                                variant="ghost"
                                                onClick={() => handleEditar(e)}
                                            />
                                            <IconButton
                                                aria-label="Eliminar"
                                                icon={<FiTrash2 />}
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleEliminar(e.id)}
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* Modal para crear/editar ejercicio */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent bg="white" color="gray.800">
                    <ModalHeader>{selected?.id ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Nombre</FormLabel>
                                <Input
                                    ref={nombreRef}
                                    value={selected?.nombre || ''}
                                    onChange={(e) => setSelected({ ...selected, nombre: e.target.value })}
                                    placeholder="Ej: Press de banca"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Textarea
                                    value={selected?.descripcion || ''}
                                    onChange={(e) => setSelected({ ...selected, descripcion: e.target.value })}
                                    placeholder="Descripción breve del ejercicio"
                                    rows={3}
                                />
                            </FormControl>

                            <HStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Grupo Muscular</FormLabel>
                                    <Select
                                        value={selected?.grupo_muscular || 'pecho'}
                                        onChange={(e) => setSelected({ ...selected, grupo_muscular: e.target.value })}
                                    >
                                        <option value="pecho">Pecho</option>
                                        <option value="espalda">Espalda</option>
                                        <option value="hombros">Hombros</option>
                                        <option value="brazos">Brazos</option>
                                        <option value="piernas">Piernas</option>
                                        <option value="abdominales">Abdominales</option>
                                        <option value="gluteos">Glúteos</option>
                                        <option value="cardio">Cardio</option>
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select
                                        value={selected?.tipo || 'fuerza'}
                                        onChange={(e) => setSelected({ ...selected, tipo: e.target.value })}
                                    >
                                        <option value="fuerza">Fuerza</option>
                                        <option value="cardio">Cardio</option>
                                        <option value="flexibilidad">Flexibilidad</option>
                                        <option value="funcional">Funcional</option>
                                    </Select>
                                </FormControl>
                            </HStack>

                            <HStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Nivel</FormLabel>
                                    <Select
                                        value={selected?.nivel || 'principiante'}
                                        onChange={(e) => setSelected({ ...selected, nivel: e.target.value })}
                                    >
                                        <option value="principiante">Principiante</option>
                                        <option value="intermedio">Intermedio</option>
                                        <option value="avanzado">Avanzado</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Equipo Necesario</FormLabel>
                                    <Input
                                        value={selected?.equipo_necesario || ''}
                                        onChange={(e) => setSelected({ ...selected, equipo_necesario: e.target.value })}
                                        placeholder="Ej: Barra, mancuernas"
                                    />
                                </FormControl>
                            </HStack>

                            <FormControl>
                                <FormLabel>Instrucciones</FormLabel>
                                <Textarea
                                    value={selected?.instrucciones || ''}
                                    onChange={(e) => setSelected({ ...selected, instrucciones: e.target.value })}
                                    placeholder="Instrucciones paso a paso"
                                    rows={4}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={handleSave}>
                            {selected?.id ? 'Actualizar' : 'Crear'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
