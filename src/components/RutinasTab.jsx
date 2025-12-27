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
import { getRutinas, createRutina, updateRutina, deleteRutina } from '../utils/api'

const initialRutinas = [
    { id: 1, nombre: 'Full Body Básico', duracionMin: 45, nivel: 'Principiante', descripcion: 'Rutina enfocada en fuerza global.' },
    { id: 2, nombre: 'HIIT Cardio', duracionMin: 30, nivel: 'Intermedio', descripcion: 'Intervalos de alta intensidad para cardio.' },
    { id: 3, nombre: 'Fuerza Piernas', duracionMin: 50, nivel: 'Avanzado', descripcion: 'Enfocada en cuádriceps, glúteos y femorales.' },
    { id: 5, nombre: 'Crossfit', duracionMin: 60, nivel: 'Avanzado', descripcion: 'Enfocada en cardio, fuerza y resistencia.' },
    { id: 6, nombre: 'Full Body / Upper-Lower (4 días)', duracionMin: 60, nivel: 'Avanzado', descripcion: 'Enfocada en cardio, fuerza y resistencia.' },
    { id: 7, nombre: 'Rutina para Hipertrofia (5 días / Bosu dividido)', duracionMin: 60, nivel: 'Intermedio', descripcion: 'Ideal para ganar masa muscular estética.' },
]

export default function RutinasTab() {
    const [rutinas, setRutinas] = useState([])
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [filtroNivel, setFiltroNivel] = useState('todos')
    const [selected, setSelected] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const nombreRef = useRef(null)

    const normalizeRutina = (r = {}) => ({
        ...r,
        id: r.id ?? r._id ?? r.insertId ?? r.id_rutina ?? null,
        nombre: r.nombre ?? r.name ?? '',
        descripcion: r.descripcion ?? r.description ?? r.desc ?? '',
        objetivo: r.objetivo ?? '',
        nivel: r.nivel ?? '',
        duracion_estimada: r.duracion_estimada ?? r.duracion_semanas ?? r.duracionMin ?? 60,
        frecuencia_semanal: r.frecuencia_semanal ?? r.frecuencia_por_semana ?? r.frecuencia ?? 3,
        usuario_id: r.usuario_id ?? null,
        tipo: r.tipo ?? 'publica',
        imagen_url: r.imagen_url ?? '',
        popularidad: r.popularidad ?? 0,
        estado: r.estado ?? 'activo',
    })

    useEffect(() => {
        if (isOpen && nombreRef.current) nombreRef.current.focus()
    }, [isOpen])

    useEffect(() => {
        let mounted = true
        async function load() {
            setLoading(true)
            try {
                const data = await getRutinas()
                const normalize = (r) => ({
                    ...r,
                    objetivo: r.objetivo ?? r.objetivo_presupuestado ?? '',
                    duracion_semanas: r.duracion_semanas ?? r.duracionSemanas ?? r.duracion_min ?? r.duracionMin ?? null,
                    frecuencia_por_semana: r.frecuencia_por_semana ?? r.frecuencia ?? null,
                    nivel: (r.nivel ?? '').toString(),
                })
                if (mounted) setRutinas(Array.isArray(data) ? data.map(normalize) : [])
            } catch (err) {
                console.error('Error cargando rutinas', err)
                toast({ title: 'No se pudieron cargar las rutinas', status: 'error', duration: 3000 })
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

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
        const nombre = (r.nombre || '').toString().toLowerCase()
        const descripcion = (r.descripcion || '').toString().toLowerCase()
        const nivelVal = (r.nivel || '').toString().toLowerCase()
        const matchBusqueda = nombre.includes(busqueda.toLowerCase()) || descripcion.includes(busqueda.toLowerCase())
        const matchNivel = filtroNivel === 'todos' || nivelVal === filtroNivel.toLowerCase()
        return matchBusqueda && matchNivel
    })

    function handleNuevo() {
        setSelected({ 
            id: null, 
            nombre: '', 
            nivel: 'intermedio', 
            descripcion: '', 
            objetivo: 'tonificacion', 
            duracion_estimada: 60, 
            frecuencia_semanal: 3,
            tipo: 'publica',
            imagen_url: '',
            estado: 'activo'
        })
        onOpen()
    }

    function handleEditar(r) {
        const normalized = {
            ...r,
            objetivo: r.objetivo ?? '',
            duracion_semanas: r.duracion_semanas ?? r.duracionSemanas ?? r.duracionMin ?? null,
            frecuencia_por_semana: r.frecuencia_por_semana ?? r.frecuencia ?? null,
            nivel: r.nivel ?? 'principiante',
        }
        setSelected(normalized)
        onOpen()
    }

    function handleEliminar(id) {
        async function eliminar() {
            try {
                await deleteRutina(id)
                setRutinas(prev => prev.filter(x => x.id !== id))
                toast({ title: 'Rutina eliminada', status: 'info', duration: 2000 })
            } catch (err) {
                console.error(err)
                toast({ title: 'Error al eliminar rutina', status: 'error', duration: 3000 })
            }
        }
        eliminar()
    }

    function handleSave() {
        if (!selected.nombre.trim()) {
            toast({ title: 'Nombre requerido', status: 'warning', duration: 2000 })
            return
        }
        async function guardar() {
            try {
                        if (selected.id == null) {
                            const payload = {
                                nombre: selected.nombre,
                                descripcion: selected.descripcion,
                                nivel: selected.nivel,
                                objetivo: selected.objetivo,
                                duracion_estimada: selected.duracion_estimada,
                                frecuencia_semanal: selected.frecuencia_semanal,
                                tipo: selected.tipo || 'publica',
                                imagen_url: selected.imagen_url || '',
                                estado: selected.estado || 'activo'
                            }
                            const created = await createRutina(payload)
                            const newItem = normalizeRutina(
                                (created && typeof created === 'object' && (created.id || created._id || created.insertId))
                                    ? { ...selected, ...created }
                                    : { ...selected, id: (created && created.id) || (created && created.insertId) || Date.now() }
                            )
                            setRutinas(prev => [newItem, ...prev])
                            toast({ title: 'Rutina creada', status: 'success', duration: 2000 })
                        } else {
                            const payload = {
                                nombre: selected.nombre,
                                descripcion: selected.descripcion,
                                nivel: selected.nivel,
                                objetivo: selected.objetivo,
                                duracion_estimada: selected.duracion_estimada,
                                frecuencia_semanal: selected.frecuencia_semanal,
                                tipo: selected.tipo || 'publica',
                                imagen_url: selected.imagen_url || '',
                                estado: selected.estado || 'activo'
                            }
                            const updated = await updateRutina(selected.id, payload)
                            
                            // Conservar todos los datos de selected y actualizar con la respuesta del backend
                            const updatedItem = normalizeRutina({
                                ...selected,
                                ...(updated || {}),
                                id: selected.id // Asegurar que mantenemos el ID original
                            })
                            
                            setRutinas(prev => prev.map(r => (r.id === selected.id ? updatedItem : r)))
                            toast({ title: 'Rutina actualizada', status: 'success', duration: 2000 })
                        }
                onClose()
            } catch (err) {
                console.error(err)
                toast({ title: 'Error al guardar rutina', status: 'error', duration: 3000 })
            }
        }
        guardar()
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

                <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="sm">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th color="gray.700">Nombre</Th>
                            <Th color="gray.700">Nivel</Th>
                            <Th color="gray.700">Objetivo</Th>
                            <Th color="gray.700">Duración (min)</Th>
                            <Th color="gray.700">Frecuencia / semana</Th>
                            <Th color="gray.700">Tipo</Th>
                            <Th color="gray.700">Estado</Th>
                            <Th color="gray.700">Descripción</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {rutinasFiltradas.map(r => (
                            <Tr key={r.id} _hover={{ bg: "gray.50" }}>
                                <Td>
                                    <Text fontWeight="medium" color="gray.800">{r.nombre}</Text>
                                </Td>
                                <Td>
                                    <Tag colorScheme={(r.nivel || '').toLowerCase() === 'avanzado' ? 'red' : (r.nivel || '').toLowerCase() === 'intermedio' ? 'yellow' : 'green'}>
                                        {r.nivel}
                                    </Tag>
                                </Td>
                                <Td color="gray.700">{r.objetivo || '-'}</Td>
                                <Td color="gray.700">{r.duracion_estimada ?? '-'} min</Td>
                                <Td color="gray.700">{r.frecuencia_semanal || '-'} días</Td>
                                <Td>
                                    <Tag colorScheme={r.tipo === 'publica' ? 'blue' : 'purple'}>
                                        {r.tipo}
                                    </Tag>
                                </Td>
                                <Td>
                                    <Tag colorScheme={r.estado === 'activo' ? 'green' : 'gray'}>
                                        {r.estado}
                                    </Tag>
                                </Td>
                                <Td>
                                    <Text noOfLines={2} maxW="30ch" color="gray.600">{r.descripcion}</Text>
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
                                            onClick={() => handleEditar(r)} 
                                        />
                                        <IconButton 
                                            aria-label="Eliminar" 
                                            icon={<FiTrash2 />} 
                                            size="sm" 
                                            variant="ghost" 
                                            color="red.500"
                                            _hover={{ bg: "red.50", color: "red.600" }}
                                            onClick={() => handleEliminar(r.id)} 
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
                    <ModalHeader>{selected?.id ? 'Editar Rutina' : 'Nueva Rutina'}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Nombre</FormLabel>
                                <Input ref={nombreRef} value={selected?.nombre || ''} onChange={(e) => setSelected(s => ({ ...s, nombre: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Nivel</FormLabel>
                                <Select value={selected?.nivel || 'intermedio'} onChange={(e) => setSelected(s => ({ ...s, nivel: e.target.value }))}>
                                    <option value="principiante">Principiante</option>
                                    <option value="intermedio">Intermedio</option>
                                    <option value="avanzado">Avanzado</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Objetivo</FormLabel>
                                <Select value={selected?.objetivo || 'tonificacion'} onChange={(e) => setSelected(s => ({ ...s, objetivo: e.target.value }))}>
                                    <option value="tonificacion">Tonificación</option>
                                    <option value="hipertrofia">Hipertrofia</option>
                                    <option value="fuerza">Fuerza</option>
                                    <option value="perdida_peso">Pérdida de Peso</option>
                                    <option value="cardio">Cardio</option>
                                </Select>
                            </FormControl>
                            <HStack>
                                <FormControl>
                                    <FormLabel>Duración Estimada (min)</FormLabel>
                                    <NumberInput min={15} max={180} value={selected?.duracion_estimada ?? 60} onChange={(val) => setSelected(s => ({ ...s, duracion_estimada: Number(val) }))}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Frecuencia Semanal (días)</FormLabel>
                                    <NumberInput min={1} max={7} value={selected?.frecuencia_semanal ?? 3} onChange={(val) => setSelected(s => ({ ...s, frecuencia_semanal: Number(val) }))}>
                                        <NumberInputField />
                                    </NumberInput>
                                </FormControl>
                            </HStack>
                            <FormControl>
                                <FormLabel>Tipo</FormLabel>
                                <Select value={selected?.tipo || 'publica'} onChange={(e) => setSelected(s => ({ ...s, tipo: e.target.value }))}>
                                    <option value="publica">Pública</option>
                                    <option value="privada">Privada</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Estado</FormLabel>
                                <Select value={selected?.estado || 'activo'} onChange={(e) => setSelected(s => ({ ...s, estado: e.target.value }))}>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Descripción</FormLabel>
                                <Textarea 
                                    value={selected?.descripcion || ''} 
                                    onChange={(e) => setSelected(s => ({ ...s, descripcion: e.target.value }))} 
                                    placeholder="Describe los beneficios y características de esta rutina..."
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
                        <Button colorScheme="purple" onClick={handleSave}>💾 Guardar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}
